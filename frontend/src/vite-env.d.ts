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
