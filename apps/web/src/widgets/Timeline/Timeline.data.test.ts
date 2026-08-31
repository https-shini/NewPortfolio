import { describe, it, expect } from "vitest";
import {
    ALL_TIMELINE_ITEMS,
    educationItems,
    certificationItems,
} from "./Timeline.data";

const fim = (i: { endDate?: string; startDate: string }) =>
    i.endDate ?? i.startDate;

describe("Timeline.data — listas derivadas", () => {
    /* A ordem era a do array, mantida à mão: um item novo no lugar
       errado deixaria a lista mentindo sobre a cronologia em silêncio. */
    it.each([
        ["formação", educationItems],
        ["certificações", certificationItems],
    ])("%s saem da mais recente para a mais antiga", (_, itens) => {
        const datas = itens.map(fim);
        expect(datas).toEqual([...datas].sort().reverse());
    });

    it("não perde nem duplica item ao derivar", () => {
        expect(educationItems.length + certificationItems.length).toBe(
            ALL_TIMELINE_ITEMS.length,
        );
        const ids = ALL_TIMELINE_ITEMS.map((i) => i.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    /* Todo certificado precisa de comprovação — sem link, a afirmação
       fica só na palavra do site. */
    it("todo certificado aponta para uma credencial", () => {
        const semLink = certificationItems
            .filter((i) => !i.certUrl)
            .map((i) => i.id);
        expect(semLink).toEqual([]);
    });
});
