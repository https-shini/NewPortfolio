import data from "../apps/web/src/shared/config/releaseNotes.json" with { type: "json" };
import type { ReleaseEntry } from "../apps/web/src/shared/config/releaseNotesModel.js";

/** As funções usam os mesmos dados editoriais, sem carregar os reexports
 * TypeScript usados pelos scripts de geração no ambiente de desenvolvimento. */
export const RELEASE_NOTES = data as ReleaseEntry[];
