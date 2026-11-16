import { useState } from "react";
import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { Accordion } from "@/shared/ui/Accordion/Accordion";
import {
    IconCode,
    IconCPU,
    IconDatabase,
    IconGitBranch,
    IconLayers,
    IconTerminal,
} from "@/shared/ui/Icons";
import { useLang } from "@/shared/hooks/useLang";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import { ROUTES } from "@/shared/config/routes";
import { SERVICE_META } from "@/shared/config/services";
import {
    CATEGORIES,
    WEB_PLANS,
    TECH_SERVICES,
    BUSINESS_PACKAGES,
    ADDONS,
    REFERRALS,
    COMMERCIAL_CONFIG,
    EMPTY_SELECTION,
    money,
    type CommercialOffer,
    type Selection,
    type Interest,
} from "@/shared/config/serviceCatalog";
import { useServicesMeta } from "./useServicesMeta";
import { COPY, FAQ_ITEMS, PROJECT_COPY } from "./content";
import { QuoteForm } from "./QuoteForm";
import { Estimate } from "./Estimate";
import { BUSINESS_CONTACT } from "./contact";
import "./Services.css";
const ICONS = [
    IconCode,
    IconCPU,
    IconDatabase,
    IconGitBranch,
    IconLayers,
    IconTerminal,
];
const NAV_IDS = [
    "catalogo",
    "web",
    "avulsos",
    "simulador",
    "indicacoes",
    "orcamento",
];
const GROUP_CATEGORIES = [
    ["support"],
    ["data", "automation"],
    ["business"],
    ["training"],
];
function OfferCard({
    offer,
    onSelect,
    recommended = false,
}: {
    offer: CommercialOffer;
    onSelect: () => void;
    recommended?: boolean;
}) {
    const { lang } = useLang();
    const c = COPY[lang];
    return (
        <article
            className={`services-card services-plan ${recommended ? "services-plan--featured" : ""}`}
        >
            <div className="services-plan-heading">
                <h3>{offer.name[lang]}</h3>
                {recommended && (
                    <span className="services-tag">{c.recommended}</span>
                )}
            </div>
            <p className="services-price">
                <span>{c.from}</span>
                <strong>
                    {offer.price === undefined ? c.onQuote : money(offer.price)}
                </strong>
                {offer.billing === "hour" && c.perHour}
            </p>
            <ul>
                {offer.scope[lang].map((s) => (
                    <li key={s}>{s}</li>
                ))}
            </ul>
            <a
                href="#simulador"
                className={`btn ${recommended ? "btn--primary" : "btn--outline"}`}
                onClick={onSelect}
            >
                {c.choose}
                <span className="sr-only">: {offer.name[lang]}</span>
            </a>
        </article>
    );
}
export function ServicesPage() {
    const { lang } = useLang();
    const c = COPY[lang];
    useReducedMotion();
    useServicesMeta(lang);
    useDocumentMeta({ ...SERVICE_META[lang], path: ROUTES.SERVICES });
    const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION);
    const [interest, setInterest] = useState<Interest>("quote");
    const codex = useLinkProps(ROUTES.CODEX);
    function choose(id: string) {
        setSelection({ offerId: id, addonIds: [], hours: 1 });
        setInterest("quote");
    }
    const contactLabel = BUSINESS_CONTACT.startsWith("https://wa.me/")
        ? c.whatsapp
        : c.email;
    return (
        <>
            <a className="skip-link" href="#main-content">
                {c.skip}
            </a>
            <Header />
            <main
                id="main-content"
                className="services-page container"
                tabIndex={-1}
            >
                <section
                    className="services-hero"
                    aria-labelledby="services-title"
                >
                    <div>
                        <p className="services-eyebrow">{c.eyebrow}</p>
                        <h1 id="services-title">{c.title}</h1>
                        <p className="services-lead">{c.intro}</p>
                        <div className="services-actions">
                            <a
                                className="btn btn--primary"
                                href="#orcamento"
                                onClick={() => setInterest("quote")}
                            >
                                {c.quote}
                            </a>
                            <a className="btn btn--outline" href="#catalogo">
                                {c.explore}
                            </a>
                        </div>
                        <ul className="services-qualities">
                            {c.qualities.map((q) => (
                                <li key={q}>{q}</li>
                            ))}
                        </ul>
                    </div>
                    <aside className="services-visual">
                        <div className="services-orbit" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                            <IconTerminal />
                        </div>
                        <p className="services-eyebrow">{c.visualLabel}</p>
                        <h2>{c.visualTitle}</h2>
                        <p>{c.visualText}</p>
                    </aside>
                </section>
                <nav className="services-nav" aria-label={c.nav}>
                    {NAV_IDS.map((id, i) => (
                        <a key={id} href={`#${id}`}>
                            {c.navLabels[i]}
                        </a>
                    ))}
                </nav>
                <section
                    id="catalogo"
                    className="services-section"
                    aria-labelledby="catalog-title"
                >
                    <h2 id="catalog-title">{c.titles[0]}</h2>
                    <p className="services-section-intro">{c.catalogIntro}</p>
                    <div className="services-grid services-grid--three">
                        {CATEGORIES.map((category, i) => {
                            const Icon = ICONS[i];
                            return (
                                <article
                                    key={category.id}
                                    className="services-card services-category"
                                >
                                    <Icon aria-hidden="true" />
                                    <h3>{category.name[lang]}</h3>
                                    <p>{category.description[lang]}</p>
                                    <Accordion
                                        classPrefix="services-question"
                                        trigger={c.examples}
                                        triggerLabel={`${c.examples}: ${category.name[lang]}`}
                                    >
                                        <ul>
                                            {category.examples[lang].map(
                                                (e) => (
                                                    <li key={e}>{e}</li>
                                                ),
                                            )}
                                        </ul>
                                        <p className="services-fineprint">
                                            {category.limit[lang]}
                                        </p>
                                    </Accordion>
                                    <a
                                        href={
                                            category.id === "web"
                                                ? "#web"
                                                : "#avulsos"
                                        }
                                    >
                                        {c.explore}
                                        <span className="sr-only">
                                            : {category.name[lang]}
                                        </span>{" "}
                                        <span aria-hidden="true">↗</span>
                                    </a>
                                </article>
                            );
                        })}
                    </div>
                </section>
                <section
                    id="web"
                    className="services-section"
                    aria-labelledby="web-title"
                >
                    <h2 id="web-title">{c.titles[1]}</h2>
                    <p className="services-section-intro">{c.webIntro}</p>
                    <div className="services-grid services-grid--three">
                        {WEB_PLANS.map((p, i) => (
                            <div className="services-plan-wrap" key={p.id}>
                                <p>{c.webAudience[i]}</p>
                                <OfferCard
                                    offer={p}
                                    onSelect={() => choose(p.id)}
                                    recommended={i === 1}
                                />
                            </div>
                        ))}
                    </div>
                    <p className="services-notice">
                        {COMMERCIAL_CONFIG.depositPercent}% /{" "}
                        {COMMERCIAL_CONFIG.balancePercent}% —{" "}
                        {COMMERCIAL_CONFIG.depositPercent}% {c.payment}
                    </p>
                    <p className="services-fineprint">{c.excluded}</p>
                </section>
                <section
                    id="avulsos"
                    className="services-section"
                    aria-labelledby="tech-title"
                >
                    <h2 id="tech-title">{c.titles[2]}</h2>
                    <p className="services-section-intro">{c.serviceNote}</p>
                    <div className="services-grid">
                        {GROUP_CATEGORIES.map((categories, i) => (
                            <div
                                className="services-rate-group"
                                key={c.groups[i]}
                            >
                                <h3>{c.groups[i]}</h3>
                                <ul>
                                    {TECH_SERVICES.filter((s) =>
                                        categories.includes(s.category),
                                    ).map((s) => (
                                        <li key={s.id}>
                                            <div>
                                                <a
                                                    href="#simulador"
                                                    onClick={() => choose(s.id)}
                                                >
                                                    {s.name[lang]}
                                                </a>
                                                {s.unit[lang] && (
                                                    <small>
                                                        {s.unit[lang]}
                                                    </small>
                                                )}
                                            </div>
                                            <span>
                                                {c.from}{" "}
                                                <strong>
                                                    {money(s.price!)}
                                                    {s.billing === "hour"
                                                        ? c.perHour
                                                        : ""}
                                                </strong>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <p className="services-fineprint">
                        {CATEGORIES.find((c) => c.id === "data")!.limit[lang]}
                    </p>
                    <p className="services-fineprint">
                        {
                            CATEGORIES.find((c) => c.id === "business")!.limit[
                                lang
                            ]
                        }
                    </p>
                </section>
                <section
                    id="empresas"
                    className="services-section"
                    aria-labelledby="business-title"
                >
                    <h2 id="business-title">{c.titles[3]}</h2>
                    <p className="services-section-intro">{c.packageNote}</p>
                    <div className="services-grid services-packages">
                        {BUSINESS_PACKAGES.map((p) => (
                            <OfferCard
                                key={p.id}
                                offer={p}
                                onSelect={() => choose(p.id)}
                            />
                        ))}
                    </div>
                </section>
                <section
                    id="personalizar"
                    className="services-section"
                    aria-labelledby="customize-title"
                >
                    <h2 id="customize-title">{c.titles[4]}</h2>
                    <div className="services-grid">
                        {(["web", "technical"] as const).map((group, i) => (
                            <Accordion
                                key={group}
                                classPrefix="services-question"
                                trigger={<h3>{c.addonGroups[i]}</h3>}
                            >
                                <ul className="services-addon-list">
                                    {ADDONS.filter(
                                        (a) => a.group === group,
                                    ).map((a) => (
                                        <li key={a.id}>
                                            <span>{a.name[lang]}</span>
                                            <strong>
                                                {c.from} {money(a.price)}
                                                {a.billing === "month"
                                                    ? c.perMonth
                                                    : ""}
                                            </strong>
                                        </li>
                                    ))}
                                </ul>
                            </Accordion>
                        ))}
                    </div>
                    <p className="services-fineprint">{c.maintenance}</p>
                    <Estimate
                        selection={selection}
                        onChange={setSelection}
                        onRequest={() => setInterest("quote")}
                    />
                </section>
                <section
                    id="experiencia"
                    className="services-section"
                    aria-labelledby="experience-title"
                >
                    <h2 id="experience-title">{c.titles[5]}</h2>
                    <p className="services-section-intro">{c.projectNote}</p>
                    <div className="services-grid">
                        <article className="services-card services-project">
                            <img
                                src="/projects/codex/overview.webp"
                                width={1920}
                                height={1080}
                                loading="lazy"
                                alt={PROJECT_COPY.codexAlt[lang]}
                            />
                            <p className="services-eyebrow">{c.projectType}</p>
                            <h3>Codex — Code Validator</h3>
                            <p>{PROJECT_COPY.codexDescription[lang]}</p>
                            <a {...codex.anchorProps}>{c.viewProject}</a>
                        </article>
                        <div className="services-experience">
                            <h3>{c.experience}</h3>
                            <p>{c.experienceText}</p>
                            <article>
                                <p className="services-eyebrow">
                                    {c.projectType}
                                </p>
                                <h3>Web Chat</h3>
                                <p>{PROJECT_COPY.chatDescription[lang]}</p>
                                <a
                                    href={
                                        lang === "en"
                                            ? "/?lang=en#projetos"
                                            : "/#projetos"
                                    }
                                >
                                    {c.viewProject}
                                </a>
                            </article>
                        </div>
                    </div>
                </section>
                <section
                    id="indicacoes"
                    className="services-section"
                    aria-labelledby="referral-title"
                >
                    <p className="services-eyebrow">{c.titles[6]}</p>
                    <h2 id="referral-title">{c.referralTitle}</h2>
                    <p className="services-section-intro">{c.referralIntro}</p>
                    <div className="services-grid">
                        <article className="services-card">
                            <h3>{c.customer}</h3>
                            <p>{c.customerText}</p>
                            <table className="services-referral-table">
                                <thead>
                                    <tr>
                                        <th scope="col">{c.serviceValue}</th>
                                        <th scope="col">{c.credit}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {REFERRALS.credits.map((r) => (
                                        <tr key={r.minimum}>
                                            <td>
                                                {r.maximum === null
                                                    ? `${c.above} ${money(r.minimum)}`
                                                    : `${money(r.minimum)} – ${money(r.maximum)}`}
                                            </td>
                                            <td>{money(r.credit)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <a
                                href="#orcamento"
                                className="btn btn--outline"
                                onClick={() => setInterest("referral")}
                            >
                                {c.referCta}
                            </a>
                        </article>
                        <article className="services-card">
                            <h3>{c.partner}</h3>
                            <p>{c.partnerText}</p>
                            <p className="services-price">
                                <strong>
                                    {REFERRALS.commission.minimum}% –{" "}
                                    {REFERRALS.commission.maximum}%
                                </strong>
                            </p>
                            <p>{c.commission}</p>
                            <a
                                href="#orcamento"
                                className="btn btn--outline"
                                onClick={() => setInterest("partner")}
                            >
                                {c.partnerCta}
                            </a>
                        </article>
                    </div>
                    <Accordion
                        classPrefix="services-question"
                        trigger={c.rulesTitle}
                        defaultOpen
                    >
                        <ul className="services-terms">
                            {c.rules.map((r) => (
                                <li key={r}>{r}</li>
                            ))}
                        </ul>
                    </Accordion>
                </section>
                <section
                    id="processo"
                    className="services-section"
                    aria-labelledby="process-title"
                >
                    <h2 id="process-title">{c.titles[7]}</h2>
                    <ol className="services-process">
                        {c.steps.map((s, i) => (
                            <li key={s.title}>
                                <span
                                    className="services-number"
                                    aria-hidden="true"
                                >
                                    0{i + 1}
                                </span>
                                <h3>{s.title}</h3>
                                <p>{s.text}</p>
                            </li>
                        ))}
                    </ol>
                    <p className="services-notice">{c.timing}</p>
                </section>
                <section
                    id="duvidas"
                    className="services-section services-faq"
                    aria-labelledby="faq-title"
                >
                    <h2 id="faq-title">{c.titles[8]}</h2>
                    <div>
                        {FAQ_ITEMS.map((f) => (
                            <Accordion
                                key={f.id}
                                classPrefix="services-question"
                                trigger={
                                    <>
                                        <span>{f.q[lang]}</span>
                                        <span aria-hidden="true">+</span>
                                    </>
                                }
                            >
                                <p>{f.a[lang]}</p>
                            </Accordion>
                        ))}
                    </div>
                </section>
                <section
                    id="orcamento"
                    className="services-section services-contact"
                    aria-labelledby="quote-title"
                >
                    <div>
                        <p className="services-eyebrow">
                            {c.interests[interest]}
                        </p>
                        <h2 id="quote-title">{c.titles[9]}</h2>
                        <p>{c.contactIntro}</p>
                        <a className="btn btn--outline" href={BUSINESS_CONTACT}>
                            {contactLabel}
                        </a>
                    </div>
                    <QuoteForm
                        selection={selection}
                        onSelection={setSelection}
                        interest={interest}
                        onInterest={setInterest}
                    />
                </section>
                <section
                    className="services-section services-final"
                    aria-labelledby="final-title"
                >
                    <h2 id="final-title">{c.titles[10]}</h2>
                    <p>{c.finalText}</p>
                    <div className="services-actions">
                        <a
                            className="btn btn--primary"
                            href="#orcamento"
                            onClick={() => setInterest("quote")}
                        >
                            {c.quote}
                        </a>
                        <a className="btn btn--outline" href={BUSINESS_CONTACT}>
                            {contactLabel}
                        </a>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
