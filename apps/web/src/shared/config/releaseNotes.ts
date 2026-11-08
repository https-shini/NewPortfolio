import data from "./releaseNotes.json" with { type: "json" };
import type { ReleaseEntry } from "./releaseNotesModel.ts";
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
