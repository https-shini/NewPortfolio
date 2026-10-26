import data from "./releaseNotes.json" with { type: "json" };
import type { ReleaseEntry, ReleaseTag } from "./releaseNotesModel.ts";
export * from "./releaseNotesModel.ts";

/** Fonte completa para scripts, geração de documentos e testes. */
export const RELEASE_NOTES = data as ReleaseEntry[];

/**
 * Versão corrente do site — a primeira entrada da lista.
 * O `package.json` continua sendo a fonte oficial (via __APP_VERSION__);
 * um teste garante que as duas não divergem.
 */
export function getCurrentVersion(): string {
    return RELEASE_NOTES[0]!.version;
}

/** Tags presentes nas entradas, na ordem em que aparecem. */
export function getUsedTags(entries: ReleaseEntry[] = RELEASE_NOTES) {
    const seen: ReleaseTag[] = [];
    entries.forEach((e) =>
        e.tags?.forEach((tag) => {
            if (!seen.includes(tag)) seen.push(tag);
        }),
    );
    return seen;
}
