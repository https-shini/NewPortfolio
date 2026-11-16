import {
    ADDONS,
    OFFERS as CATALOG,
    compatibleAddons as catalogAddons,
    estimate as catalogEstimate,
    EMPTY_SELECTION,
    type CommercialOffer,
    type Interest,
    type Selection,
} from "./serviceCatalog.ts";
import { ROUTES, withLang } from "./routes.ts";

/** Request mode, not a new priced package. Standalone work requires assessment. */
const standalone: CommercialOffer = {
    id: "addons-only",
    kind: "service",
    category: "support",
    billing: "quote",
    name: {
        pt: "Somente adicionais — sob avaliação",
        en: "Add-ons only — subject to assessment",
    },
    description: {
        pt: "Solicitação avulsa, sujeita à compatibilidade técnica.",
        en: "Standalone request, subject to technical compatibility.",
    },
    unit: { pt: "", en: "" },
    scope: { pt: [], en: [] },
    exclusions: { pt: [], en: [] },
    cta: { pt: "Solicitar avaliação", en: "Request assessment" },
    addonIds: ADDONS.map((a) => a.id),
    included: [],
};
export const QUOTE_OFFERS = [...CATALOG, standalone];
export const quoteAddons = (id: string) =>
    id === standalone.id ? ADDONS : catalogAddons(id);
export function quoteEstimate(selection: Selection) {
    if (selection.offerId !== standalone.id) return catalogEstimate(selection);
    const addons = ADDONS.filter((a) => selection.addonIds.includes(a.id));
    // No assumed compatibility or base price for standalone work.
    return {
        ...catalogEstimate(EMPTY_SELECTION),
        offer: standalone,
        addons,
        monthly: addons
            .filter((a) => a.billing === "month")
            .reduce((sum, a) => sum + a.price, 0),
    };
}
export function readQuote(search: string): {
    selection: Selection;
    interest: Interest;
} {
    const params = new URLSearchParams(search);
    const requested =
        params.get("service") || (params.has("addon") ? standalone.id : "");
    const offerId = QUOTE_OFFERS.some((o) => o.id === requested)
        ? requested
        : "";
    const valid = quoteAddons(offerId);
    return {
        selection: {
            offerId,
            addonIds: valid
                .filter((a) => params.getAll("addon").includes(a.id))
                .map((a) => a.id),
            hours: 1,
        },
        interest:
            params.get("interest") === "referral"
                ? "referral"
                : params.get("interest") === "partner"
                  ? "partner"
                  : "quote",
    };
}
export function quoteUrl(
    options: { offerId?: string; addonId?: string; interest?: Interest } = {},
    lang: "pt" | "en" = "pt",
) {
    const params = new URLSearchParams();
    if (options.offerId && QUOTE_OFFERS.some((o) => o.id === options.offerId))
        params.set("service", options.offerId);
    if (options.addonId && ADDONS.some((a) => a.id === options.addonId))
        params.set("addon", options.addonId);
    if (options.interest && options.interest !== "quote")
        params.set("interest", options.interest);
    return withLang(ROUTES.QUOTE + (params.size ? `?${params}` : ""), lang);
}
export const QUOTE_META = {
    pt: {
        title: "Solicitar orçamento | GCRUZ",
        description:
            "Organize os serviços e adicionais de que precisa e prepare sua solicitação de proposta ao GCRUZ.",
    },
    en: {
        title: "Request a quote | GCRUZ",
        description:
            "Choose the services and add-ons you need and prepare your proposal request for GCRUZ.",
    },
};
