import { readdir } from "node:fs/promises";
import path from "node:path";

/** Pasta pública do projeto em destaque (Firecode, TCC). */
export const PROJECT_PUBLIC_DIR = "/projects/firecode/";

/**
 * Só a página gerada pelo build e as capturas são públicas. Markdown,
 * documentos e módulos originais do TCC nunca podem sair em /projects/firecode.
 */
export function isPrivateProjectDocument(url: string): boolean {
    let pathname: string;
    try {
        pathname = decodeURIComponent(url.split(/[?#]/, 1)[0] ?? "")
            .replace(/\\/g, "/")
            .toLowerCase();
    } catch {
        return true;
    }
    if (!pathname.startsWith(PROJECT_PUBLIC_DIR)) return false;
    /* A página do projeto: o build a escreve em index.html, servido pela
       URL limpa /projects/firecode (o arquivo em si nunca é linkado). */
    if (pathname === `${PROJECT_PUBLIC_DIR}index.html`) return false;
    const basename = path.posix.basename(pathname);
    return (
        basename.startsWith(".") ||
        /^(readme|about|apresentacao_tcc|resposta_avaliacao|deploy|limitacoes)(\.|$)/.test(
            basename,
        ) ||
        /\.(md|markdown|mdown|txt|pdf|docx?|zip|rar|py|[jt]sx?|sql|sh|env|ya?ml)$/.test(
            basename,
        ) ||
        /\/(backend|frontend|reviewers|validation)\//.test(pathname)
    );
}

/** Falha, em vez de publicar silenciosamente um original copiado para public/. */
export async function assertNoPrivateProjectDocuments(
    directory: string,
): Promise<void> {
    async function walk(root: string, relative = ""): Promise<void> {
        let entries;
        try {
            entries = await readdir(root, { withFileTypes: true });
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
            throw error;
        }
        for (const entry of entries) {
            const name = path.posix.join(relative, entry.name);
            if (isPrivateProjectDocument(`${PROJECT_PUBLIC_DIR}${name}`)) {
                throw new Error(
                    `[firecode] Documento interno não pode ser publicado: ${name}. Mantenha-o fora de public/ e do artefato de produção.`,
                );
            }
            if (entry.isSymbolicLink()) {
                throw new Error(
                    `[firecode] Link simbólico não permitido no artefato público: ${name}.`,
                );
            }
            if (entry.isDirectory())
                await walk(path.join(root, entry.name), name);
        }
    }
    await walk(directory);
}
