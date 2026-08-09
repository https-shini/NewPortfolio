/**
 * Preload — a única ponte entre a página e o processo principal.
 *
 * Está aqui vazio de propósito, e isso é a decisão, não uma pendência.
 *
 * O site é estático: não lê arquivo, não abre porta, não pede permissão
 * de sistema. Expor uma API só porque "aplicativo desktop costuma ter"
 * seria abrir superfície sem ninguém do outro lado precisando dela — e
 * superfície aberta é o que transforma um XSS numa execução no host.
 *
 * O que existe é uma marca de leitura: o site pode querer saber que está
 * rodando dentro do app (para esconder o cartão de download da própria
 * plataforma, por exemplo). Um booleano não dá acesso a nada.
 *
 * Quando algo realmente precisar do sistema, entra aqui — um método por
 * necessidade, nomeado pelo que faz, nunca um `ipcRenderer` cru.
 */

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("portfolioDesktop", {
    versao: process.env.npm_package_version ?? null,
    plataforma: process.platform,
});
