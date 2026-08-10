/**
 * Atualização automática — o lado do processo principal.
 *
 * ── O que esta camada resolve ────────────────────────────────────────
 *
 * O `electron-updater` já sabe verificar, baixar e instalar. O que ele
 * não faz é contar isso para a interface: os eventos dele vivem no
 * processo principal, e a página que precisa mostrar "há uma versão
 * nova" roda no renderer, do outro lado do isolamento de contexto.
 *
 * Aqui os eventos viram UM estado com nome, empurrado para a janela a
 * cada mudança. A página não conhece `electron-updater`; conhece um
 * estado e três ações. É o que permite a mesma página funcionar no
 * navegador, onde nada disto existe.
 *
 * ── Por que o estado é reenviado a quem chega depois ─────────────────
 *
 * A verificação começa quando o app abre. Se a pessoa navegar até
 * /downloads meio minuto depois, os eventos já passaram — e uma
 * interface que só escuta o futuro mostraria "nada aqui" tendo uma
 * atualização pronta. Por isso o último estado fica guardado e é
 * devolvido na primeira pergunta.
 */

const { ipcMain } = require("electron");

const CANAL_ESTADO = "atualizacao:estado";
const CANAL_LER = "atualizacao:ler";
const CANAL_VERIFICAR = "atualizacao:verificar";
const CANAL_BAIXAR = "atualizacao:baixar";
const CANAL_INSTALAR = "atualizacao:instalar";

/**
 * Estados possíveis, e o que cada um significa para quem olha a tela:
 *
 *   indisponivel — rodando fora do app empacotado; não há o que checar
 *   ocioso       — ainda não perguntamos
 *   verificando  — perguntando ao servidor
 *   atual        — esta é a versão mais nova
 *   disponivel   — existe versão nova, ainda não baixada
 *   baixando     — baixando, com percentual
 *   pronta       — baixada; falta reiniciar para aplicar
 *   erro         — não deu para verificar ou baixar
 *   naoSuportada — esta instalação não sabe se atualizar sozinha
 */
let estado = { situacao: "ocioso" };
let janelas = new Set();

function publicar(novo) {
    estado = novo;
    for (const wc of janelas) {
        if (!wc.isDestroyed()) wc.send(CANAL_ESTADO, estado);
    }
}

/**
 * @param {object} opcoes
 * @param {boolean} opcoes.empacotado  `app.isPackaged`
 * @param {string}  opcoes.versao      versão em execução
 */
/**
 * `checkForUpdates()` devolve `null` quando o updater se recusa a agir —
 * e ele NÃO emite erro nem rejeita nesse caso.
 *
 * Acontece de verdade: no Linux o electron-updater só se atualiza a
 * partir de um AppImage. Quem instalou pelo `.deb` (ou roda a pasta
 * descompactada) recebe "APPIMAGE env is not defined" num log que
 * ninguém lê, e a tela ficava em "ainda não verificamos" para sempre.
 *
 * Como o resultado nulo não distingue "não sei" de "não posso", o estado
 * diz o que a pessoa precisa saber: baixe a versão nova da lista que
 * está logo abaixo, nesta mesma página.
 */
function concluir(resultado, versao) {
    if (
        !resultado &&
        (estado.situacao === "ocioso" || estado.situacao === "verificando")
    ) {
        publicar({ situacao: "naoSuportada", versao });
    }
}

function iniciar({ empacotado, versao }) {
    ipcMain.handle(CANAL_LER, () => estado);

    if (!empacotado) {
        /* Em desenvolvimento não há versão publicada com que comparar, e
           o updater só registraria erro a cada abertura. A interface
           recebe um estado honesto em vez de um erro decorativo. */
        estado = { situacao: "indisponivel", versao };
        ipcMain.handle(CANAL_VERIFICAR, () => estado);
        ipcMain.handle(CANAL_BAIXAR, () => estado);
        ipcMain.on(CANAL_INSTALAR, () => {});
        return;
    }

    /* Import dinâmico porque este arquivo é CommonJS e o carregamento
       do updater não deve atrasar a abertura da janela.

       O `?? modulo.default?.autoUpdater` NÃO é defensividade decorativa:
       `electron-updater` é CommonJS, e um `import()` de CJS entrega os
       exports em `.default`. Desestruturar `{ autoUpdater }` direto
       devolvia `undefined`, e a primeira linha a usá-lo lançava
       `Cannot set properties of undefined`. Como o erro caía num
       `.catch` vazio, a atualização automática nunca funcionou — em
       nenhuma versão — e a interface seguia dizendo "ainda não
       verificamos". */
    const carregar = import("electron-updater").then((modulo) => {
        const autoUpdater = modulo.autoUpdater ?? modulo.default?.autoUpdater;
        if (!autoUpdater) {
            throw new Error(
                "electron-updater não expôs autoUpdater — pacote ausente ou incompatível",
            );
        }

        /* O download é decisão de quem usa, não do app. A página mostra
           que há versão nova e oferece o botão — baixar 100 MB sem
           perguntar é o tipo de coisa que se faz numa rede móvel sem
           querer. */
        autoUpdater.autoDownload = false;
        /* Instalar sozinho ao fechar surpreende: a pessoa fecha o app e
           encontra um instalador rodando. Quem manda é o botão. */
        autoUpdater.autoInstallOnAppQuit = false;

        autoUpdater.on("checking-for-update", () =>
            publicar({ situacao: "verificando", versao }),
        );
        autoUpdater.on("update-available", (info) =>
            publicar({
                situacao: "disponivel",
                versao,
                nova: info?.version ?? null,
            }),
        );
        autoUpdater.on("update-not-available", () =>
            publicar({ situacao: "atual", versao }),
        );
        autoUpdater.on("download-progress", (p) =>
            publicar({
                situacao: "baixando",
                versao,
                nova: estado.nova ?? null,
                progresso: Math.round(p?.percent ?? 0),
            }),
        );
        autoUpdater.on("update-downloaded", (info) =>
            publicar({
                situacao: "pronta",
                versao,
                nova: info?.version ?? null,
            }),
        );
        autoUpdater.on("error", (erro) =>
            /* A mensagem crua do updater cita URL e arquivo temporário;
               nada disso ajuda quem está olhando a tela. */
            publicar({
                situacao: "erro",
                versao,
                detalhe: String(erro?.message ?? erro),
            }),
        );

        return autoUpdater;
    });

    /* Um erro no carregamento não pode ficar mudo: sem isto a tela diz
       "ainda não verificamos" para sempre, que é falso e não dá a quem
       olha nenhuma pista do que houve. */
    carregar.catch((erro) =>
        publicar({
            situacao: "erro",
            versao,
            detalhe: String(erro?.message ?? erro),
        }),
    );

    ipcMain.handle(CANAL_VERIFICAR, async () => {
        const autoUpdater = await carregar;
        try {
            concluir(await autoUpdater.checkForUpdates(), versao);
        } catch (erro) {
            publicar({
                situacao: "erro",
                versao,
                detalhe: String(erro?.message ?? erro),
            });
        }
        return estado;
    });

    ipcMain.handle(CANAL_BAIXAR, async () => {
        const autoUpdater = await carregar;
        try {
            publicar({
                situacao: "baixando",
                versao,
                nova: estado.nova ?? null,
                progresso: 0,
            });
            await autoUpdater.downloadUpdate();
        } catch (erro) {
            publicar({
                situacao: "erro",
                versao,
                detalhe: String(erro?.message ?? erro),
            });
        }
        return estado;
    });

    ipcMain.on(CANAL_INSTALAR, async () => {
        const autoUpdater = await carregar;
        /* `false, true`: não silencioso no Windows (a pessoa vê o
           instalador que ela mandou rodar) e reinicia o app depois. */
        autoUpdater.quitAndInstall(false, true);
    });

    /* Uma verificação ao abrir, para a página já ter resposta quando a
       pessoa chegar nela. A falha vira estado, e não silêncio: foi um
       `.catch` vazio aqui que escondeu o bug do import por completo. */
    carregar
        .then(async (u) => concluir(await u.checkForUpdates(), versao))
        .catch((erro) =>
            publicar({
                situacao: "erro",
                versao,
                detalhe: String(erro?.message ?? erro),
            }),
        );
}

/** Passa a receber as mudanças de estado; some sozinha quando fecha. */
function registrarJanela(webContents) {
    janelas.add(webContents);
    webContents.once("destroyed", () => janelas.delete(webContents));
}

module.exports = { iniciar, registrarJanela };
