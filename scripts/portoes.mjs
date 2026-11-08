/**
 * Portões de qualidade — a lista única.
 *
 * `npm run verify` executa estas listas, e o teste
 * `apps/web/src/shared/config/portoes.test.ts` confere que cada uma
 * delas também está no `.github/workflows/ci.yml`.
 *
 * Por que existe: três portões (`lint:api`, `type-check:api`,
 * `audit:contato`) chegaram a rodar só no `verify` local. O fluxo do
 * projeto vai direto para a `main`, então o CI é a única barreira
 * compartilhada — e uma regressão em /contato voltou sem que nada
 * reprovasse. Acrescentar um portão aqui sem pô-lo no CI agora falha
 * nos testes.
 */

/** Portões sem navegador, na ordem em que o `verify` os executa. */
export const PORTOES_ESTATICOS = [
    "lint",
    "lint:api",
    "type-check",
    "type-check:api",
    "format:check",
    "test",
    "icones:check",
    "imagens:check",
    "changelog:check",
    "build",
    "csp:check",
    "audit:bundle",
];

/** Auditorias que rodam no navegador contra o build (`verify --browser`). */
export const PORTOES_NAVEGADOR = [
    "audit:a11y",
    "audit:overflow",
    "audit:layers",
    "audit:identity",
    "audit:release-notes",
    "audit:not-found",
    "audit:linkedin",
    "audit:codex",
    "audit:contato",
    "audit:modals",
];

/**
 * Fora dos dois de propósito, e por isso fora do CI:
 * `audit:perf` mede tempo e varia com a máquina; `scripts/geometry.mjs`
 * compara contra uma base que precisa ser regravada a cada mudança
 * visual intencional (ver scripts/README.md).
 */
export const FERRAMENTAS_MANUAIS = ["audit:perf"];
