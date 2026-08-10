/**
 * Preload — a única ponte entre a página e o processo principal.
 *
 * O site é estático: não lê arquivo, não abre porta, não pede permissão
 * de sistema. Expor uma API só porque "aplicativo desktop costuma ter"
 * seria abrir superfície sem ninguém do outro lado precisando dela — e
 * superfície aberta é o que transforma um XSS numa execução no host.
 *
 * Por isso o que atravessa é o mínimo: uma marca de leitura (a página
 * pode querer saber que está dentro do app) e a atualização, que é a
 * única coisa que a interface precisa pedir ao sistema.
 *
 * Nada de `ipcRenderer` cru do outro lado: cada método é nomeado pelo
 * que faz e fala num canal fixo. Uma página comprometida consegue
 * perguntar por atualização — e nada além disso.
 */

const { contextBridge, ipcRenderer } = require("electron");

const CANAL_ESTADO = "atualizacao:estado";

contextBridge.exposeInMainWorld("portfolioDesktop", {
    versao: process.env.npm_package_version ?? null,
    plataforma: process.platform,

    atualizacao: {
        /** Último estado conhecido — inclusive o que passou antes desta tela existir. */
        ler: () => ipcRenderer.invoke("atualizacao:ler"),
        verificar: () => ipcRenderer.invoke("atualizacao:verificar"),
        baixar: () => ipcRenderer.invoke("atualizacao:baixar"),
        instalar: () => ipcRenderer.send("atualizacao:instalar"),

        /**
         * Assina as mudanças e devolve como cancelar.
         *
         * O retorno não é cortesia: sem ele, cada montagem do componente
         * empilharia um ouvinte no mesmo canal e o React avisaria de
         * atualização em componente desmontado a cada navegação.
         */
        ouvir: (aoMudar) => {
            const ponte = (_evento, estado) => aoMudar(estado);
            ipcRenderer.on(CANAL_ESTADO, ponte);
            return () => ipcRenderer.removeListener(CANAL_ESTADO, ponte);
        },
    },
});
