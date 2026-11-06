import { ROUTES } from "@/shared/config/routes";

/* ─────────────────────────────────────────────────────────
   projectsRoute.ts — o casamento de `/projetos/*`
   ─────────────────────────────────────────────────────────
   Módulo sem React, pela mesma razão de `releaseNotesRoute.ts`:
   `routes.tsx` exporta um componente, e um arquivo que exporta
   componente MAIS função perde o Fast Refresh inteiro.
───────────────────────────────────────────────────────── */

export type ProjectsMatch =
    { kind: "index" } | { kind: "project"; name: string } | null;

/**
 * · `/projetos`              → métricas, recentes e galeria
 * · `/projetos/AuthService`  → o projeto AuthService
 *
 * Um segmento e nada mais: `/projetos/a/b` não é rota nossa e cai na
 * página não encontrada, como qualquer endereço desconhecido.
 */
export function matchProjects(path: string): ProjectsMatch {
    const limpo = path.length > 1 ? path.replace(/\/+$/, "") : path;
    if (limpo === ROUTES.PROJECTS) return { kind: "index" };
    if (!limpo.startsWith(`${ROUTES.PROJECTS}/`)) return null;

    const segments = limpo.slice(ROUTES.PROJECTS.length + 1).split("/");
    if (segments.length > 1) return null;

    /* `decodeURIComponent` lança em sequência malformada (`/projetos/%ZZ`);
       uma URL digitada à mão pode trazer uma. Sem o resguardo, o erro
       subiria no render em vez de virar página não encontrada. */
    let name: string;
    try {
        name = decodeURIComponent(segments[0] ?? "");
    } catch {
        return null;
    }

    /* Mesmo formato que o servidor aceita: o que não casa nem vai à rede. */
    return /^[A-Za-z0-9._-]{1,100}$/.test(name)
        ? { kind: "project", name }
        : null;
}
