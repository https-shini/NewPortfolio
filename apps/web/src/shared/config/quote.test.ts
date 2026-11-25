import { describe, it, expect } from "vitest";
import { readQuote, quoteUrl, quoteEstimate } from "./quote";
import { linkKind } from "./links";
describe("Seleções compartilháveis de orçamento", () => {
    it("preserva IDs e idioma sem incluir dados pessoais", () => {
        const url = quoteUrl({ offerId: "express", addonId: "page" }, "en");
        expect(url).toBe("/orcamento?service=express&addon=page&lang=en");
        expect(linkKind(url)).toBe("route");
        expect(readQuote(url.split("?")[1]).selection).toEqual({
            offerId: "express",
            addonIds: ["page"],
            hours: 1,
        });
    });
    it("ignora IDs inválidos, duplicados e adicionais incluídos no plano", () => {
        expect(readQuote("?service=unknown&addon=page").selection.offerId).toBe(
            "",
        );
        expect(
            readQuote(
                "?service=premium&addon=page&addon=dns&addon=dns&addon=unknown",
            ).selection.addonIds,
        ).toEqual(["dns"]);
        expect(readQuote("?interest=unknown").interest).toBe("quote");
    });
    it.each(["bespoke-website", "custom-it"])(
        "%s não recebe preço arbitrário",
        (id) => {
            const { selection } = readQuote(`?service=${id}`);
            expect(selection.offerId).toBe(id);
            expect(quoteEstimate(selection).subtotal).toBeNull();
        },
    );
    it("adicional avulso preserva referência sem presumir viabilidade", () => {
        const { selection } = readQuote("?addon=maintenance&addon=page");
        const result = quoteEstimate(selection);
        expect(selection.offerId).toBe("addons-only");
        expect(result.subtotal).toBeNull();
        expect(result.monthly).toBe(149);
        expect(result.addons.map((a) => a.id)).toEqual(["page", "maintenance"]);
    });
    it.each(["referral", "partner"])("preserva contexto %s", (interest) => {
        expect(readQuote(`?interest=${interest}`).interest).toBe(interest);
    });
    /* Regressão: o link era montado com `params.size`, ausente em navegadores
       anteriores a Safari 17 e Chrome 113. Sem a propriedade, todo link de
       orçamento saía sem parâmetros. */
    it("monta a query sem depender de URLSearchParams.size", () => {
        const original = Object.getOwnPropertyDescriptor(
            URLSearchParams.prototype,
            "size",
        );
        Object.defineProperty(URLSearchParams.prototype, "size", {
            configurable: true,
            get: () => undefined,
        });
        try {
            expect(quoteUrl({ offerId: "express" })).toBe(
                "/orcamento?service=express",
            );
            expect(quoteUrl()).toBe("/orcamento");
        } finally {
            if (original)
                Object.defineProperty(
                    URLSearchParams.prototype,
                    "size",
                    original,
                );
        }
    });
});
