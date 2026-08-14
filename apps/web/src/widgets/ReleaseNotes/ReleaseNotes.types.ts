import type { ChangeType, ReleaseTag } from "@/shared/config/releaseNotes";
import type { TranslationKey } from "@/shared/lib/translations";

/** Filtro ativo do histórico: uma tag ou todas. */
export type ReleaseFilter = ReleaseTag | "all";

/** Rótulo i18n de cada categoria de mudança. */
export const CATEGORY_LABELS: Record<ChangeType, TranslationKey> = {
    added: "releaseNotes.category.added",
    improved: "releaseNotes.category.improved",
    design: "releaseNotes.category.design",
    performance: "releaseNotes.category.performance",
    architecture: "releaseNotes.category.architecture",
    content: "releaseNotes.category.content",
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
