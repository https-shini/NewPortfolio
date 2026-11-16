import { quoteEstimate as estimate } from "@/shared/config/quote";
import { money, type Selection } from "@/shared/config/serviceCatalog";
import type { Lang } from "@/shared/lib/localized";
import { COPY } from "@/shared/config/servicesContent";
export function selectionText(selection: Selection, lang: Lang) {
    const c = COPY[lang];
    const e = estimate(selection);
    return [
        e.offer?.name[lang] || c.noSelection,
        ...e.addons.map(
            (a) =>
                `${a.name[lang]}: ${money(a.price)}${a.billing === "month" ? c.perMonth : ""}`,
        ),
        e.offer?.billing === "hour" ? `${c.hours}: ${e.hours}` : "",
        `${c.subtotal}: ${e.subtotal === null ? c.onQuote : money(e.subtotal)}`,
        e.monthly ? `${c.monthly}: ${money(e.monthly)}${c.perMonth}` : "",
        c.estimateNote,
    ]
        .filter(Boolean)
        .join("\n");
}
