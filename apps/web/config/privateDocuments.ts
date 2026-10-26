import { readdir } from "node:fs/promises";
import path from "node:path";

/** A apresentação readme.html é pública; Markdown e módulos originais não são. */
export function isPrivateCodexDocument(url: string): boolean {
    let pathname: string;
    try {
        pathname = decodeURIComponent(url.split(/[?#]/, 1)[0] ?? "")
            .replace(/\\/g, "/")
            .toLowerCase();
    } catch {
        return true;
    }
    if (!pathname.startsWith("/projects/codex/")) return false;
    if (
        ["/projects/codex/readme.html", "/projects/codex/index.html"].includes(
            pathname,
        )
    ) {
        return false;
    }
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
export async function assertNoPrivateCodexDocuments(
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
            if (isPrivateCodexDocument(`/projects/codex/${name}`)) {
                throw new Error(
                    `[codex] Documento interno não pode ser publicado: ${name}. Mantenha-o fora de public/ e do artefato de produção.`,
                );
            }
            if (entry.isSymbolicLink()) {
                throw new Error(
                    `[codex] Link simbólico não permitido no artefato público: ${name}.`,
                );
            }
            if (entry.isDirectory())
                await walk(path.join(root, entry.name), name);
        }
    }
    await walk(directory);
}
