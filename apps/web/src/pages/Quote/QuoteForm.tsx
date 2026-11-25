import { QUOTE_OFFERS as OFFERS } from "@/shared/config/quote";
import { useRef, useState, type FormEvent } from "react";
import { useLang } from "@/shared/hooks/useLang";
import { PROFILE } from "@/shared/config/profile";
import { type Selection, type Interest } from "@/shared/config/serviceCatalog";
import { EstimateSummary } from "./Estimate";
import { selectionText } from "./selectionSummary";
import { COPY } from "@/shared/config/servicesContent";
import { QUOTE_ENDPOINT } from "./contact";

type Field = keyof typeof COPY.pt.fields;
type Values = Record<Field, string>;
const EMPTY: Values = {
    name: "",
    email: "",
    phone: "",
    company: "",
    deadline: "",
    message: "",
};
const FIELDS: Field[] = [
    "name",
    "email",
    "phone",
    "company",
    "deadline",
    "message",
];
const REQUIRED: Field[] = ["name", "email", "message"];

export function QuoteForm({
    selection,
    onSelection,
    interest,
    onInterest,
}: {
    selection: Selection;
    onSelection: (s: Selection) => void;
    interest: Interest;
    onInterest: (i: Interest) => void;
}) {
    const { lang } = useLang();
    const c = COPY[lang];
    const [values, setValues] = useState<Values>({ ...EMPTY });
    const [errors, setErrors] = useState<
        Partial<Record<Field | "service" | "consent", string>>
    >({});
    const [consent, setConsent] = useState(false);
    const [status, setStatus] = useState<
        "idle" | "sending" | "success" | "error" | "ready"
    >("idle");
    const [draft, setDraft] = useState("");
    const [copyStatus, setCopyStatus] = useState<"copied" | "copyError" | null>(
        null,
    );
    const busy = useRef(false);
    const formRef = useRef<HTMLFormElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);
    function message(v: Values) {
        return [
            c.interests[interest],
            interest === "quote" ? selectionText(selection, lang) : "",
            ...FIELDS.filter((k) => v[k].trim()).map(
                (k) => `${c.fields[k]}: ${v[k].trim()}`,
            ),
            c.consent,
        ]
            .filter(Boolean)
            .join("\n\n");
    }
    async function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (busy.current) return;
        const next: typeof errors = {};
        for (const k of REQUIRED) if (!values[k].trim()) next[k] = c.required;
        if (
            values.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
        )
            next.email = c.invalidEmail;
        if (values.message.trim() && values.message.trim().length < 10)
            next.message = c.shortMessage;
        if (
            interest === "quote" &&
            (!OFFERS.some((o) => o.id === selection.offerId) ||
                (selection.offerId === "addons-only" &&
                    selection.addonIds.length === 0))
        )
            next.service = c.required;
        if (!consent) next.consent = c.consentError;
        setErrors(next);
        if (Object.keys(next).length) {
            formRef.current
                ?.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)
                ?.focus();
            return;
        }
        if (String(new FormData(e.currentTarget).get("_gotcha") || "")) {
            setStatus("error");
            return;
        }
        const body = message(values);
        setDraft(body);
        setCopyStatus(null);
        if (!QUOTE_ENDPOINT) {
            setStatus("ready");
            requestAnimationFrame(() => summaryRef.current?.focus());
            return;
        }
        busy.current = true;
        setStatus("sending");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            const response = await fetch(QUOTE_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name: values.name.trim(),
                    email: values.email.trim(),
                    message: body,
                    _gotcha: "",
                }),
                signal: controller.signal,
                credentials: "omit",
                redirect: "error",
            });
            if (!response.ok) throw new Error("Submission rejected");
            setStatus("success");
            setValues({ ...EMPTY });
            setConsent(false);
            setDraft("");
        } catch {
            setStatus("error");
        } finally {
            clearTimeout(timeout);
            busy.current = false;
        }
    }
    async function copy() {
        try {
            await navigator.clipboard.writeText(draft);
            setCopyStatus("copied");
        } catch {
            setCopyStatus("copyError");
        }
    }
    return (
        <form
            ref={formRef}
            className="services-form"
            noValidate
            onSubmit={submit}
            aria-busy={status === "sending"}
        >
            {!QUOTE_ENDPOINT && <p className="services-notice">{c.fallback}</p>}
            <div className="services-field">
                <label htmlFor="quote-interest">{c.interest}</label>
                <select
                    id="quote-interest"
                    value={interest}
                    disabled={status === "sending"}
                    onChange={(e) => {
                        onInterest(e.target.value as Interest);
                        setErrors({});
                        setStatus("idle");
                    }}
                >
                    {(Object.keys(c.interests) as Interest[]).map((i) => (
                        <option key={i} value={i}>
                            {c.interests[i]}
                        </option>
                    ))}
                </select>
            </div>
            {interest === "quote" && (
                <>
                    <div className="services-field">
                        <label htmlFor="quote-service">{c.mainService}</label>
                        <select
                            id="quote-service"
                            name="service"
                            required
                            value={selection.offerId}
                            disabled={status === "sending"}
                            aria-invalid={!!errors.service}
                            aria-describedby={
                                errors.service
                                    ? "quote-service-error"
                                    : undefined
                            }
                            onChange={(e) => {
                                onSelection({
                                    offerId: e.target.value,
                                    addonIds: [],
                                    hours: 1,
                                });
                                setErrors((v) => ({
                                    ...v,
                                    service: undefined,
                                }));
                                setStatus("idle");
                            }}
                        >
                            <option value="">{c.select}</option>
                            {OFFERS.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.name[lang]}
                                </option>
                            ))}
                        </select>
                        {errors.service && (
                            <span
                                id="quote-service-error"
                                className="services-error"
                            >
                                {errors.service}
                            </span>
                        )}
                    </div>
                    <EstimateSummary selection={selection} />
                </>
            )}
            <div className="services-fields">
                {FIELDS.map((key) => {
                    const required = REQUIRED.includes(key);
                    const common = {
                        id: `quote-${key}`,
                        name: key,
                        value: values[key],
                        required,
                        "aria-invalid": !!errors[key],
                        "aria-describedby": errors[key]
                            ? `quote-${key}-error`
                            : undefined,
                        disabled: status === "sending",
                        onChange: (
                            e: React.ChangeEvent<
                                | HTMLInputElement
                                | HTMLSelectElement
                                | HTMLTextAreaElement
                            >,
                        ) => {
                            setValues((v) => ({ ...v, [key]: e.target.value }));
                            setErrors((v) => ({ ...v, [key]: undefined }));
                            setStatus("idle");
                            setCopyStatus(null);
                        },
                    };
                    return (
                        <div
                            className={
                                key === "message"
                                    ? "services-field services-field--wide"
                                    : "services-field"
                            }
                            key={key}
                        >
                            <label htmlFor={common.id}>
                                {key === "message" && interest !== "quote"
                                    ? interest === "referral"
                                        ? c.referralMessage
                                        : c.partnerMessage
                                    : c.fields[key]}
                                {!required && <span> ({c.optional})</span>}
                            </label>
                            {key === "message" ? (
                                <textarea
                                    {...common}
                                    rows={5}
                                    maxLength={2500}
                                />
                            ) : (
                                <input
                                    {...common}
                                    type={
                                        key === "email"
                                            ? "email"
                                            : key === "phone"
                                              ? "tel"
                                              : "text"
                                    }
                                    autoComplete={
                                        (
                                            {
                                                name: "name",
                                                email: "email",
                                                phone: "tel",
                                                company: "organization",
                                            } as Partial<Record<Field, string>>
                                        )[key]
                                    }
                                    maxLength={key === "email" ? 254 : 120}
                                />
                            )}
                            {errors[key] && (
                                <span
                                    className="services-error"
                                    id={`quote-${key}-error`}
                                >
                                    {errors[key]}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            <div hidden aria-hidden="true">
                <label htmlFor="quote-honey">{c.fields.company}</label>
                <input
                    id="quote-honey"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                />
            </div>
            <p className="services-privacy">
                {c.privacy}{" "}
                <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>.{" "}
                {QUOTE_ENDPOINT ? c.providerPrivacy : c.emailPrivacy}{" "}
                {QUOTE_ENDPOINT && (
                    <a
                        href="https://formspree.io/legal/privacy-policy/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {c.providerPolicy}
                    </a>
                )}
            </p>
            <label className="services-consent" htmlFor="quote-consent">
                <input
                    id="quote-consent"
                    name="consent"
                    type="checkbox"
                    required
                    checked={consent}
                    disabled={status === "sending"}
                    aria-invalid={!!errors.consent}
                    aria-describedby={
                        errors.consent ? "quote-consent-error" : undefined
                    }
                    onChange={(e) => {
                        setConsent(e.target.checked);
                        setErrors((v) => ({ ...v, consent: undefined }));
                    }}
                />
                <span>{c.consent}</span>
            </label>
            {errors.consent && (
                <p id="quote-consent-error" className="services-error">
                    {errors.consent}
                </p>
            )}
            <button
                className="btn btn--primary"
                type="submit"
                disabled={status === "sending"}
            >
                {status === "sending"
                    ? c.sending
                    : QUOTE_ENDPOINT
                      ? c.submit
                      : c.prepare}
            </button>
            <div role="status" aria-live="polite">
                {status === "success" && <p>{c.success}</p>}
                {status === "error" && (
                    <p>
                        {c.error}{" "}
                        <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
                    </p>
                )}
            </div>
            {status === "ready" && draft === message(values) && (
                <div ref={summaryRef} className="services-draft" tabIndex={-1}>
                    <p role="status">{c.ready}</p>
                    <div className="services-actions">
                        <a
                            className="btn btn--primary"
                            href={`mailto:${PROFILE.email}?subject=${encodeURIComponent(c.subject)}&body=${encodeURIComponent(draft)}`}
                        >
                            {c.openEmail}
                        </a>
                        <button
                            type="button"
                            className="btn btn--outline"
                            onClick={copy}
                        >
                            {c.copy}
                        </button>
                    </div>
                    <p>{PROFILE.email}</p>
                    <pre>{draft}</pre>
                    <p role="status">
                        {copyStatus && c[copyStatus]}{" "}
                        {copyStatus === "copied" && PROFILE.email}
                    </p>
                </div>
            )}
        </form>
    );
}
