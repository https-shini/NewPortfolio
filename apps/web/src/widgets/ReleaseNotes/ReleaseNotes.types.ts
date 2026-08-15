import type { ChangeType, ReleaseTag } from "@/shared/config/releaseNotes";
import type { TranslationKey } from "@/shared/lib/translations";

/** Filtro ativo do histórico: uma tag ou todas. */
export type ReleaseFilter = ReleaseTag | "all";

/**
 * Cada categoria tem rótulo i18n e um glifo.
 *
 * O glifo existe porque cor sozinha não é informação acessível: quem não
 * distingue matizes — ou lê em monocromático — precisa de uma segunda
 * pista para separar "Adicionado" de "Aprimorado" antes de ler o rótulo.
 * Ele é decorativo na árvore de acessibilidade (o rótulo já está escrito
 * ao lado), mas carrega a distinção visual junto com a cor.
 *
 * A cor mora no CSS, em `--cat-{categoria}`, e não aqui: o valor muda
 * entre tema claro e escuro, e isso é assunto de folha de estilo.
 */
export interface CategoryMeta {
    label: TranslationKey;
    glyph: string;
}

export const CATEGORY_LABELS: Record<ChangeType, CategoryMeta> = {
    added: { label: "releaseNotes.category.added", glyph: "+" },
    improved: { label: "releaseNotes.category.improved", glyph: "~" },
    design: { label: "releaseNotes.category.design", glyph: "◆" },
    performance: { label: "releaseNotes.category.performance", glyph: "↑" },
    architecture: { label: "releaseNotes.category.architecture", glyph: "▣" },
    content: { label: "releaseNotes.category.content", glyph: "¶" },
};

/** Rótulo i18n de cada tag. */
export const TAG_LABELS: Record<ReleaseTag, TranslationKey> = {
    design: "releaseNotes.tag.design",
    feature: "releaseNotes.tag.feature",
    perf: "releaseNotes.tag.perf",
    a11y: "releaseNotes.tag.a11y",
    fix: "releaseNotes.tag.fix",
};

/**
 * Uma versão é pré-lançamento quando a SemVer traz um sufixo
 * (`2.0.0-beta.1`). São os marcos anteriores à primeira tag.
 */
export function isPrerelease(version: string): boolean {
    return version.includes("-");
}

/**
 * Identificador estável derivado da versão, seguro para `id` de DOM
 * e para a âncora de permalink da Fase 2 (`#v2-0-0`).
 */
export function versionSlug(version: string): string {
    return `v${version.replace(/[^\w]+/g, "-")}`;
}
