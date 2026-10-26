/** Valores da home preservados do modelo anterior ao merge.
 * As demais entradas HTML, como a apresentação Codex, têm metadados próprios.
 */
const HOME_METADATA: Record<string, string> = {
    TITULO: "Guilherme Cruz — Desenvolvedor de Software | React, TypeScript & Node.js",
    TITULO_CURTO: "Guilherme Cruz — Desenvolvedor de Software",
    DESCRICAO:
        "Portfólio profissional de Guilherme Cruz — Desenvolvedor Full Stack especializado em React, TypeScript, Node.js e Python. Projetos reais, experiência e formação.",
    RESUMO: "Desenvolvedor Full Stack especializado em React, TypeScript, Node.js e interfaces de alta performance.",
    CAMINHO: "/",
};

export function fillHomeMetadata(html: string): string {
    return html.replace(/__ROTA_([A-Z_]+)__/g, (_, key: string) => {
        const value = HOME_METADATA[key];
        if (value === undefined)
            throw new Error(`Metadado de rota desconhecido: ${key}`);
        return value
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    });
}
