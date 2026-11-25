import { describe, it, expect } from "vitest";
import {
    CATEGORIES,
    OFFERS,
    WEB_PLANS,
    TECH_SERVICES,
    BUSINESS_PACKAGES,
    ADDONS,
    REFERRALS,
    estimate,
    compatibleAddons,
    referralCredit,
} from "./serviceCatalog";
describe("catálogo comercial", () => {
    it("mantém IDs únicos, preços válidos e traduções", () => {
        expect(CATEGORIES).toHaveLength(6);
        expect(TECH_SERVICES).toHaveLength(14);
        expect(BUSINESS_PACKAGES).toHaveLength(4);
        expect(ADDONS).toHaveLength(11);
        expect(WEB_PLANS.map((p) => p.price)).toEqual([990, 1500, 2200]);
        expect(new Set(OFFERS.map((o) => o.id)).size).toBe(OFFERS.length);
        for (const o of OFFERS) {
            expect(o.name.pt && o.name.en).toBeTruthy();
            expect(o.price === undefined || o.price >= 0).toBe(true);
            for (const id of o.addonIds)
                expect(ADDONS.some((a) => a.id === id)).toBe(true);
        }
    });
    it("filtra IDs inválidos, incompatíveis, incluídos e duplicados", () => {
        const r = estimate({
            offerId: "professional",
            addonIds: [
                "page",
                "page",
                "email-account",
                "standard-form",
                "invalid",
            ],
            hours: 1,
        });
        expect(r.subtotal).toBe(1850);
        expect(r.addons.map((a) => a.id)).toEqual(["page"]);
        expect(
            compatibleAddons("premium").some((a) =>
                ["page", "section", "advanced-form", "revision"].includes(a.id),
            ),
        ).toBe(false);
    });
    it("não soma manutenção mensal ao custo pontual", () => {
        const r = estimate({
            offerId: "express",
            addonIds: ["maintenance", "page"],
            hours: 1,
        });
        expect(r.subtotal).toBe(1340);
        expect(r.monthly).toBe(149);
    });
    it("aplica quantidade só a serviços por hora e limita entradas inválidas", () => {
        expect(
            estimate({ offerId: "support", addonIds: [], hours: 3 }).subtotal,
        ).toBe(360);
        for (const hours of [-2, 0, NaN, Infinity])
            expect(
                estimate({ offerId: "support", addonIds: [], hours }).subtotal,
            ).toBe(120);
        expect(
            estimate({ offerId: "express", addonIds: [], hours: 5 }).subtotal,
        ).toBe(990);
    });
    it("não inventa preço para serviço sob orçamento ou desconhecido", () => {
        for (const id of ["custom-web", "invalid", ""])
            expect(
                estimate({ offerId: id, addonIds: ["page"], hours: 1 })
                    .subtotal,
            ).toBeNull();
    });
    it.each([
        [149, 0],
        [150, 30],
        [499.99, 30],
        [500, 75],
        [999.99, 75],
        [1000, 150],
    ])("crédito em %s é %s, sem comissão automática", (value, credit) => {
        expect(referralCredit(value)).toBe(credit);
        expect(REFERRALS.commission).toEqual({ minimum: 10, maximum: 15 });
    });
});
