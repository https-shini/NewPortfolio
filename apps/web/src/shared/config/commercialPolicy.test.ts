import { it, expect } from "vitest";
import baseline from "./fixtures/commercial-policy.json";
import { OFFERS, ADDONS, REFERRALS, COMMERCIAL_CONFIG } from "./serviceCatalog";

// Captured before the visual redesign. Changes require explicit commercial approval.
it("preserva integralmente preços, escopos, exclusões e regras comerciais anteriores", () => {
    const originalIds = new Set(baseline.OFFERS.map((o) => o.id));
    expect(
        JSON.parse(JSON.stringify(OFFERS.filter((o) => originalIds.has(o.id)))),
    ).toEqual(baseline.OFFERS);
    expect(ADDONS).toEqual(baseline.ADDONS);
    expect(REFERRALS).toEqual(baseline.REFERRALS);
    expect(COMMERCIAL_CONFIG).toEqual(baseline.COMMERCIAL_CONFIG);
});
