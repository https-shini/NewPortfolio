import { describe, expect, it } from "vitest";
import handler, { COMERCIAL } from "./crawler";
import { SERVICE_META } from "../apps/web/src/shared/config/services";
import { QUOTE_META } from "../apps/web/src/shared/config/quote";

/* O crawler é compilado fora do build do frontend e repete os textos das
   páginas comerciais. Este teste é o que impede os dois de divergirem. */
describe("crawler · páginas comerciais", () => {
    it("usa os mesmos textos de SERVICE_META e QUOTE_META", () => {
        expect(COMERCIAL.servicos.titulo).toBe(SERVICE_META.pt.title);
        expect(COMERCIAL.servicos.descricao).toBe(SERVICE_META.pt.description);
        expect(COMERCIAL.orcamento.titulo).toBe(QUOTE_META.pt.title);
        expect(COMERCIAL.orcamento.descricao).toBe(QUOTE_META.pt.description);
    });

    it.each(["/servicos", "/orcamento/"])(
        "%s recebe cartão próprio com a imagem comercial",
        async (path) => {
            let corpo = "";
            const res = {
                setHeader: () => undefined,
                status() {
                    return res;
                },
                send(body: string) {
                    corpo = body;
                },
            };
            await handler({ query: { path }, headers: {} }, res);
            expect(corpo).toContain("/api/og?page=services");
            expect(corpo).toContain("GCRUZ");
        },
    );
});
