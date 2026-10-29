import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/* ─────────────────────────────────────────────────────────
   lastModified — a data de `<lastmod>` do sitemap, vinda do git
   ─────────────────────────────────────────────────────────
   O sitemap nasce do build para que as datas não envelheçam sozinhas,
   e o `<lastmod>` vem do git porque é a única fonte que não depende de
   alguém lembrar de atualizar.

   ── Por que esta função saiu do vite.config.ts ────────────────────

   Ela morava lá e estava QUEBRADA desde que foi escrita, em silêncio.
   O `cwd` era `path.resolve(__dirname, "..")` e o `__dirname` do
   `vite.config.ts` é `apps/web`, então o comando rodava em `apps/` —
   um nível curto da raiz. Os caminhos consultados são relativos à raiz
   (`apps/web/src/pages/Home`), e de `apps/` o git responde VAZIO para
   todos eles. A validação por regex reprovava o vazio, a função
   devolvia `null`, e o `<lastmod>` simplesmente não era emitido.

   Medido no sitemap gerado: 7 de 20 URLs tinham data, e as 7 eram as
   páginas de versão, cuja data vem do `releaseNotes.json` e não do git.
   A home, a /links, a /release-notes, a apresentação do Codex e as oito
   âncoras — nenhuma tinha. Depois da correção, 20 de 20, com datas
   distintas entre caminhos.

   Aqui a raiz é deduzida da posição DESTE arquivo, e a contagem de
   saltos fica dita: `config/` → `web/` → `apps/` → raiz, três níveis.
   Mover o arquivo exige recontar, e é por isso que o número está
   escrito em vez de subentendido.
───────────────────────────────────────────────────────── */

/** Raiz do repositório: três níveis acima de `apps/web/config/`. */
export const RAIZ_DO_REPO = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../..",
);

/**
 * Data do último commit que tocou qualquer um dos caminhos, em
 * `YYYY-MM-DD`, ou `null` quando não há data confiável.
 *
 * `null` e não uma aproximação: `<lastmod>` é opcional na especificação
 * do sitemap, e omitir é honesto. Usar a data de hoje, ou o `mtime` do
 * arquivo, apresentaria a hora do clone como se fosse a data real da
 * última mudança — pior que não dizer nada, porque o buscador não tem
 * como saber que é palpite.
 *
 * Os casos que caem em `null`: git ausente, build fora de um clone,
 * tarball, caminho sem histórico, ou clone raso em que o commit que
 * tocou o caminho ficou fora da profundidade buscada.
 *
 * @param paths Caminhos relativos à raiz do repositório.
 * @param raiz  Onde rodar o git. O padrão é a raiz do repositório —
 *              o parâmetro existe para que o teste possa exercitar o
 *              caminho de falha sem depender do ambiente.
 */
export function lastModified(
    paths: string[],
    raiz: string = RAIZ_DO_REPO,
): string | null {
    try {
        const out = execFileSync(
            "git",
            ["log", "-1", "--format=%cs", "--", ...paths],
            {
                cwd: raiz,
                encoding: "utf8",
                /* Fora de um clone o git reclama no stderr; o build já
                   trata a ausência, então o aviso só polui o log. */
                stdio: ["ignore", "pipe", "ignore"],
            },
        ).trim();
        return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
    } catch {
        return null;
    }
}
