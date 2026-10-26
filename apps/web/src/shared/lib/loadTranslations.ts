import dataUrl from "./translations.json?url";
import {
    initializeTranslations,
    TRANSLATIONS,
    type Lang,
    type Translations,
} from "./translations";

let pending: Promise<void> | undefined;
export async function loadTranslations(): Promise<void> {
    if (Object.keys(TRANSLATIONS.pt).length) return;
    pending ??= fetch(dataUrl)
        .then((response) => {
            if (!response.ok)
                throw new Error(
                    "Não foi possível carregar os textos do portfólio.",
                );
            return response.json() as Promise<Record<Lang, Translations>>;
        })
        .then(initializeTranslations)
        .catch((error: unknown) => {
            pending = undefined;
            throw error;
        });
    await pending;
}
