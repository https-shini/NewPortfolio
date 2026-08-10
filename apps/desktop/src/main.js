/**
 * Processo principal do aplicativo desktop.
 *
 * ── Por que um protocolo próprio, e não `file://` ────────────────────
 *
 * O site roteia pela History API: `/links`, `/release-notes`,
 * `/downloads`. Carregado por `file://`, isso quebra de duas formas ao
 * mesmo tempo — `location.pathname` passa a ser um caminho de disco, e o
 * roteador cai na home achando que está em `/home/.../index.html`; e um
 * `pushState` para `/links` tenta empurrar `file:///links`, que não
 * existe. O app abriria sempre na home e nenhum link interno funcionaria.
 *
 * A saída óbvia seria subir um servidor HTTP local, e é o que muita gente
 * faz. Custa uma porta aberta em 127.0.0.1 — que o firewall do Windows
 * pergunta sobre, que outro processo pode ocupar, e que é superfície de
 * rede que este app não precisa ter.
 *
 * `protocol.handle` resolve sem nada disso: um esquema próprio, servido
 * de dentro do processo, com o mesmo fallback para `index.html` que a
 * Vercel faz com as reescritas do `vercel.json`. Sem porta, sem servidor,
 * sem pergunta de firewall — e o roteador enxerga caminhos de verdade.
 */

const { app, BrowserWindow, shell, protocol, net } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { resolver } = require("./rota.js");
const atualizacao = require("./atualizacao.js");

const ESQUEMA = "app";
const ORIGEM = `${ESQUEMA}://local`;

/* De onde vêm as funções serverless. O app empacota o site, não o
   backend: `/api/downloads` e `/api/release-notes` continuam sendo
   servidos pela Vercel, e o processo principal repassa a chamada.

   A variável permite apontar para outro host — um `vercel dev` local, ou
   um servidor de teste — sem editar o código. Em produção ninguém a
   define e vale o padrão. */
const API_REMOTA = process.env.PORTFOLIO_API ?? "https://gcruz.dev.br";

/* O build do site. Em desenvolvimento vem do repositório; empacotado,
   electron-builder copia o dist para dentro dos recursos. */
const RAIZ_WEB = app.isPackaged
    ? path.join(process.resourcesPath, "web")
    : path.join(__dirname, "../../web/dist");

/* Privilégios pedidos ANTES do app ficar pronto — depois disso o
   registro é ignorado em silêncio. `standard` é o que faz o esquema ter
   origem e caminho como um http normal, que é do que a History API
   precisa; `secure` o coloca no mesmo patamar de https, sem o qual
   `localStorage` e `fetch` ficariam restritos. */
protocol.registerSchemesAsPrivileged([
    {
        scheme: ESQUEMA,
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            stream: true,
        },
    },
]);

/**
 * Serve um arquivo do dist, com fallback de SPA.
 *
 * A regra é a mesma do site: caminho que corresponde a arquivo existente
 * vira aquele arquivo; qualquer outro vira `index.html` e deixa o
 * roteador do React decidir. É por isso que `/downloads` funciona aqui
 * sem precisar de uma lista de rotas duplicada neste arquivo — duplicar
 * seria criar uma segunda fonte da verdade que um dia diverge.
 */
function servir(request) {
    const { pathname, search } = new URL(request.url);
    const destino = resolver(pathname, RAIZ_WEB);

    /* As chamadas de API atravessam para o site. Sem isto elas caíam no
       fallback e recebiam o index.html — HTML onde o hook espera JSON —,
       e a /downloads dentro do app mostrava o cartão de erro enquanto a
       mesma página no navegador funcionava. Vai do processo principal, e
       não do renderer, porque `app://` é outra origem e um fetch direto
       esbarraria no CORS. */
    if (destino.tipo === "api") {
        return net.fetch(`${API_REMOTA}${pathname}${search}`, {
            headers: { Accept: "application/json" },
            /* O /api/baixar responde 302 para uma URL assinada; seguir o
               redirecionamento aqui é o que faz o download começar. */
            redirect: "follow",
        });
    }

    return net.fetch(pathToFileURL(destino.caminho).toString());
}

function criarJanela() {
    const janela = new BrowserWindow({
        width: 1280,
        height: 860,
        minWidth: 360,
        minHeight: 560,
        /* A cor do tema escuro do site. Sem isto a janela pisca branco
           entre abrir e a primeira pintura. */
        backgroundColor: "#040710",
        title: "Guilherme Cruz — Portfólio",
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            /* Os dois que importam: a página não alcança o Node, e o
               contexto dela é isolado do preload. O site é estático e não
               precisa de nada do sistema — deixar aberto seria dar acesso
               ao disco a um conteúdo que não pede nada disso. */
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });

    /* Só aparece quando há o que mostrar. */
    janela.once("ready-to-show", () => janela.show());

    /* Link externo abre no navegador do sistema, não numa janela do app
       sem barra de endereço — de onde a pessoa não teria como saber para
       onde foi nem como voltar. */
    janela.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith("http:") || url.startsWith("https:")) {
            shell.openExternal(url);
        }
        return { action: "deny" };
    });

    /* Navegação para fora da origem do app também vai para o navegador. */
    janela.webContents.on("will-navigate", (evento, url) => {
        if (!url.startsWith(ORIGEM)) {
            evento.preventDefault();
            if (url.startsWith("http:") || url.startsWith("https:")) {
                shell.openExternal(url);
            }
        }
    });

    /* A janela passa a receber o estado da atualização; a inscrição se
       desfaz sozinha quando ela fecha. */
    atualizacao.registrarJanela(janela.webContents);

    janela.loadURL(`${ORIGEM}/`);
    return janela;
}

/* Uma instância só: abrir o atalho de novo foca a janela que já existe,
   em vez de subir um segundo app com o mesmo estado. */
if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    let janela = null;

    app.on("second-instance", () => {
        if (!janela) return;
        if (janela.isMinimized()) janela.restore();
        janela.focus();
    });

    app.whenReady().then(() => {
        protocol.handle(ESQUEMA, servir);

        /* Antes da janela: `iniciar` registra os canais de IPC, e a
           página pode perguntar pelo estado assim que montar.
           Verificar, baixar e instalar ficam em atualizacao.js — os
           eventos do updater viram um estado com nome, que a página lê
           por uma API nomeada em vez de conhecer o electron-updater. */
        atualizacao.iniciar({
            empacotado: app.isPackaged,
            versao: app.getVersion(),
        });

        janela = criarJanela();

        /* No macOS o app segue vivo sem janela; clicar no ícone do dock
           precisa recriar uma. */
        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                janela = criarJanela();
            }
        });
    });

    /* No macOS a convenção é o app continuar aberto sem janelas. */
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") app.quit();
    });
}
