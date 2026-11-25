import {
    QUOTE_OFFERS as OFFERS,
    quoteAddons as compatibleAddons,
    quoteEstimate as estimate,
} from "@/shared/config/quote";
import { useLang } from "@/shared/hooks/useLang";
import {
    money,
    COMMERCIAL_CONFIG,
    type Selection,
} from "@/shared/config/serviceCatalog";
import { COPY } from "@/shared/config/servicesContent";
export function EstimateSummary({ selection }: { selection: Selection }) {
    const { lang } = useLang();
    const c = COPY[lang];
    const e = estimate(selection);
    return (
        <div className="services-estimate-summary">
            <h3>{c.summary}</h3>
            <p>{e.offer?.name[lang] || c.noSelection}</p>
            {e.addons.length > 0 ? (
                <ul>
                    {e.addons.map((a) => (
                        <li key={a.id}>
                            {a.name[lang]} — {money(a.price)}
                            {a.billing === "month" ? c.perMonth : ""}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>{c.none}</p>
            )}
            <p className="services-price">
                <span>{c.subtotal}</span>
                <strong data-testid="estimate-subtotal">
                    {e.subtotal === null ? c.onQuote : money(e.subtotal)}
                </strong>
            </p>
            {e.monthly > 0 && (
                <p data-testid="estimate-monthly">
                    {c.monthly}:{" "}
                    <strong>
                        {money(e.monthly)}
                        {c.perMonth}
                    </strong>
                </p>
            )}
            <p className="services-fineprint">{c.estimateNote}</p>
        </div>
    );
}
export function Estimate({
    selection,
    onChange,
    onRequest,
}: {
    selection: Selection;
    onChange: (s: Selection) => void;
    onRequest: () => void;
}) {
    const { lang } = useLang();
    const c = COPY[lang];
    const e = estimate(selection);
    const available = compatibleAddons(selection.offerId);
    return (
        <div id="simulador" className="services-estimator">
            <div>
                <p className="services-eyebrow">{c.simulator}</p>
                <h3>{c.simulatorIntro}</h3>
                <div className="services-field">
                    <label htmlFor="estimate-service">{c.mainService}</label>
                    <select
                        id="estimate-service"
                        value={selection.offerId}
                        onChange={(event) =>
                            onChange({
                                offerId: event.target.value,
                                addonIds: [],
                                hours: 1,
                            })
                        }
                    >
                        <option value="">{c.select}</option>
                        {OFFERS.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.name[lang]} —{" "}
                                {o.price === undefined
                                    ? c.onQuote
                                    : money(o.price)}
                                {o.billing === "hour" ? c.perHour : ""}
                            </option>
                        ))}
                    </select>
                </div>
                {e.offer?.billing === "hour" && (
                    <div className="services-field">
                        <label htmlFor="estimate-hours">{c.hours}</label>
                        <input
                            id="estimate-hours"
                            type="number"
                            min={1}
                            max={COMMERCIAL_CONFIG.maxHours}
                            step={1}
                            value={selection.hours}
                            onChange={(event) =>
                                onChange({
                                    ...selection,
                                    hours: Math.min(
                                        COMMERCIAL_CONFIG.maxHours,
                                        Math.max(
                                            1,
                                            Math.floor(
                                                Number(event.target.value) || 1,
                                            ),
                                        ),
                                    ),
                                })
                            }
                        />
                    </div>
                )}
                <fieldset className="services-addon-options">
                    <legend>{c.addons}</legend>
                    {available.length ? (
                        available.map((a) => (
                            <label key={a.id}>
                                <input
                                    type="checkbox"
                                    checked={selection.addonIds.includes(a.id)}
                                    onChange={(event) =>
                                        onChange({
                                            ...selection,
                                            addonIds: event.target.checked
                                                ? [...selection.addonIds, a.id]
                                                : selection.addonIds.filter(
                                                      (id) => id !== a.id,
                                                  ),
                                        })
                                    }
                                />
                                <span>
                                    {a.name[lang]}{" "}
                                    <small>
                                        {c.from} {money(a.price)}
                                        {a.billing === "month"
                                            ? c.perMonth
                                            : ""}
                                    </small>
                                </span>
                            </label>
                        ))
                    ) : (
                        <p>
                            {selection.offerId ? c.noAddons : c.emptySelection}
                        </p>
                    )}
                </fieldset>
            </div>
            <div>
                <EstimateSummary selection={selection} />
                <a
                    className="btn btn--primary"
                    href="#orcamento"
                    onClick={onRequest}
                >
                    {c.proposal}
                </a>
            </div>
        </div>
    );
}
