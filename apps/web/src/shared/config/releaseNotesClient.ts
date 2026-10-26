import dataUrl from "./releaseNotes.json?url";
import type { ReleaseEntry, ReleaseTag } from "./releaseNotesModel";
export * from "./releaseNotesModel";

export const RELEASE_NOTES: ReleaseEntry[] = [];
let ready = false;
let pending: Promise<void> | undefined;

export function initializeReleaseNotes(entries: ReleaseEntry[]): void {
    RELEASE_NOTES.splice(0, RELEASE_NOTES.length, ...entries);
    ready = true;
}

export async function loadLocalReleaseNotes(): Promise<void> {
    if (ready) return;
    pending ??= fetch(dataUrl)
        .then((response) => {
            if (!response.ok)
                throw new Error("Não foi possível carregar o histórico local.");
            return response.json() as Promise<ReleaseEntry[]>;
        })
        .then(initializeReleaseNotes)
        .catch((error: unknown) => {
            pending = undefined;
            throw error;
        });
    await pending;
}

export function getUsedTags(
    entries: ReleaseEntry[] = RELEASE_NOTES,
): ReleaseTag[] {
    return [...new Set(entries.flatMap((entry) => entry.tags ?? []))];
}
