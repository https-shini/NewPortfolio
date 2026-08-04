/// <reference types="vite/client" />

interface ImportMetaEnv {
    /**
     * Endpoint do formulário de contato (ex.: https://formspree.io/f/XXXX).
     * Opcional — sem ele, a seção Contato mantém apenas o fluxo de mailto.
     */
    readonly VITE_FORM_ENDPOINT?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

/**
 * Versão da aplicação, injetada no build a partir do `package.json`
 * (ver `define` no vite.config.ts). É a fonte única: nenhum arquivo
 * deve digitar o número da versão.
 */
declare const __APP_VERSION__: string;
