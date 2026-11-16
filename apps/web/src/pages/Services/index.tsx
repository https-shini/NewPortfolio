import type { MouseEvent, ReactNode } from "react";
import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { Accordion } from "@/shared/ui/Accordion/Accordion";
import {
    IconCode,
    IconCPU,
    IconTerminal,
    IconLayers,
    IconGitBranch,
} from "@/shared/ui/Icons";
import { useLang } from "@/shared/hooks/useLang";
import { useRoute } from "@/shared/hooks/useRoute";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import { ROUTES } from "@/shared/config/routes";
import { SERVICE_META } from "@/shared/config/services";
import {
    CATEGORIES,
    WEB_PLANS,
    TECH_SERVICES,
    BUSINESS_PACKAGES,
    ADDONS,
    OFFERS,
    REFERRALS,
    COMMERCIAL_CONFIG,
    compatibleAddons,
    money,
    type CommercialOffer,
} from "@/shared/config/serviceCatalog";
import { quoteUrl } from "@/shared/config/quote";
import { useCommercialMeta } from "@/shared/hooks/useCommercialMeta";
import { COPY, FAQ_ITEMS, PROJECT_COPY } from "./content";
import { SOLUTIONS, PRESENTATION } from "./presentation";
import "@/shared/ui/Commercial/Commercial.css";
import "./Services.css";
const ICONS = [IconCode, IconGitBranch, IconCPU, IconLayers, IconTerminal];
const GROUP_CATEGORIES = [
    ["support"],
    ["data", "automation"],
    ["business"],
    ["training"],
];
function QuoteLink({
    offerId,
    addonId,
    children,
    className = "btn btn--outline",
}: {
    offerId?: string;
    addonId?: string;
    children: ReactNode;
    className?: string;
}) {
    const { lang } = useLang();
    const link = useLinkProps(quoteUrl({ offerId, addonId }, lang));
    return (
        <a className={className} {...link.anchorProps}>
            {children}
        </a>
    );
}
function OfferCard({ offer }: { offer: CommercialOffer }) {
    const { lang } = useLang();
    const c = COPY[lang],
        t = PRESENTATION[lang];
    const addons = compatibleAddons(offer.id);
    return (
        <article className="services-card services-plan">
            <h3>{offer.name[lang]}</h3>
            <p className="services-price">
                <span>{c.from}</span>
                <strong>
                    {offer.price === undefined ? c.onQuote : money(offer.price)}
                </strong>
            </p>
            <ul>
                {offer.scope[lang].map((s) => (
                    <li key={s}>{s}</li>
                ))}
            </ul>
            <Accordion
                classPrefix="services-question"
                trigger={t.details}
                triggerLabel={`${t.details}: ${offer.name[lang]}`}
            >
                <p>
                    {t.exclusions}:{" "}
                    {offer.exclusions[lang].join("; ") || c.excluded}
                </p>
                {addons.length > 0 && (
                    <p>
                        {t.extras}: {addons.map((a) => a.name[lang]).join(", ")}
                        .
                    </p>
                )}
            </Accordion>
            <QuoteLink offerId={offer.id}>
                {t.proposal}
                <span className="sr-only">: {offer.name[lang]}</span>
            </QuoteLink>
        </article>
    );
}
export function ServicesPage() {
    const { lang } = useLang();
    const c = COPY[lang],
        t = PRESENTATION[lang];
    const { navigate } = useRoute();
    useCommercialMeta(lang);
    useDocumentMeta({ ...SERVICE_META[lang], path: ROUTES.SERVICES });
    const codex = useLinkProps(ROUTES.CODEX);
    const maintenance = ADDONS.find((a) => a.id === "maintenance")!;
    function follow(e: MouseEvent<HTMLAnchorElement>) {
        if (e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)
            return;
        e.preventDefault();
        navigate(e.currentTarget.pathname + e.currentTarget.search);
    }
    return (
        <>
            <a className="skip-link" href="#main-content">
                {c.skip}
            </a>
            <Header />
            <main
                id="main-content"
                tabIndex={-1}
                className="services-page services-strategy container"
            >
                <section
                    className="services-hero"
                    aria-labelledby="services-title"
                >
                    <div>
                        <p className="services-eyebrow">{t.eyebrow}</p>
                        <h1 id="services-title">{t.title}</h1>
                        <p className="services-lead">{t.intro}</p>
                        <div className="services-actions">
                            <a href="#catalogo" className="btn btn--primary">
                                {c.explore}
                            </a>
                            <QuoteLink>{c.quote}</QuoteLink>
                        </div>
                        <ul className="services-qualities">
                            {c.qualities.map((q) => (
                                <li key={q}>{q}</li>
                            ))}
                        </ul>
                    </div>
                    <aside className="services-blueprint">
                        <div
                            className="services-blueprint-top"
                            aria-hidden="true"
                        >
                            <IconCode />
                            <span>GCRUZ / DEV</span>
                            <i />
                        </div>
                        <p className="services-eyebrow">{t.heroLabel}</p>
                        <ol>
                            {t.heroSteps.map((s, i) => (
                                <li key={s}>
                                    <span aria-hidden="true">0{i + 1}</span>
                                    {s}
                                </li>
                            ))}
                        </ol>
                        <p>{t.heroNote}</p>
                    </aside>
                </section>
                <nav className="services-nav" aria-label={c.nav}>
                    {[
                        "catalogo",
                        "web",
                        "personalizar",
                        "processo",
                        "duvidas",
                    ].map((id, i) => (
                        <a key={id} href={`#${id}`}>
                            {t.nav[i]}
                        </a>
                    ))}
                </nav>
                <section
                    id="catalogo"
                    className="services-section"
                    aria-labelledby="catalog-title"
                >
                    <p className="services-eyebrow">01 / {t.nav[0]}</p>
                    <h2 id="catalog-title">{t.solutions}</h2>
                    <p className="services-section-intro">{t.solutionsIntro}</p>
                    <div className="services-solutions">
                        {SOLUTIONS.map((s, i) => {
                            const Icon = ICONS[i];
                            const offer = OFFERS.find((o) => o.id === s.offer)!;
                            return (
                                <article
                                    key={s.id}
                                    className="services-card services-category"
                                >
                                    <Icon aria-hidden="true" />
                                    <h3>{s.title[lang]}</h3>
                                    <p>{s.text[lang]}</p>
                                    <p className="services-fineprint">
                                        {s.examples[lang]}
                                    </p>
                                    <p className="services-solution-price">
                                        {offer.price === undefined
                                            ? c.onQuote
                                            : `${c.from} ${money(offer.price)}`}
                                    </p>
                                    {s.href ? (
                                        <a href={s.href}>
                                            {t.see}{" "}
                                            <span aria-hidden="true">↗</span>
                                            <span className="sr-only">
                                                : {s.title[lang]}
                                            </span>
                                        </a>
                                    ) : (
                                        <QuoteLink
                                            offerId={s.offer}
                                            className="services-text-link"
                                        >
                                            {c.quote}
                                        </QuoteLink>
                                    )}
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
                    <p className="services-eyebrow">02 / {t.nav[1]}</p>
                    <h2 id="web-title">{t.compare}</h2>
                    <p className="services-section-intro">{t.compareIntro}</p>
                    <div className="services-grid services-grid--three">
                        {WEB_PLANS.map((p, i) => (
                            <div key={p.id} className="services-plan-wrap">
                                <p>{c.webAudience[i]}</p>
                                <OfferCard offer={p} />
                            </div>
                        ))}
                    </div>
                    <p className="services-notice">
                        {COMMERCIAL_CONFIG.depositPercent}% /{" "}
                        {COMMERCIAL_CONFIG.balancePercent}% —{" "}
                        {COMMERCIAL_CONFIG.depositPercent}% {c.payment}
                    </p>
                    <p className="services-fineprint">{c.excluded}</p>
                    <div className="services-inline-callout">
                        <div>
                            <h3>{t.redesign}</h3>
                            <p>{t.redesignText}</p>
                        </div>
                        <QuoteLink offerId="custom-web">
                            {t.redesignCta}
                        </QuoteLink>
                    </div>
                </section>
                <section
                    id="site-personalizado"
                    className="services-section services-custom"
                    aria-labelledby="bespoke-title"
                >
                    <div>
                        <p className="services-eyebrow">03 / {c.onQuote}</p>
                        <h2 id="bespoke-title">{t.customSite}</h2>
                        <p>{t.customSiteIntro}</p>
                        <QuoteLink
                            offerId="bespoke-website"
                            className="btn btn--primary"
                        >
                            {t.customSiteCta}
                        </QuoteLink>
                    </div>
                    <div>
                        <IconCode aria-hidden="true" />
                        <ul>
                            {t.customSitePoints.map((p) => (
                                <li key={p}>{p}</li>
                            ))}
                        </ul>
                        <p className="services-fineprint">{t.emailTerms}</p>
                    </div>
                </section>
                <section
                    id="personalizar"
                    className="services-section"
                    aria-labelledby="customize-title"
                >
                    <p className="services-eyebrow">04 / {t.nav[2]}</p>
                    <h2 id="customize-title">{t.addons}</h2>
                    <p className="services-section-intro">{t.addonsIntro}</p>
                    <Accordion
                        classPrefix="services-question"
                        trigger={t.oneOff}
                        defaultOpen
                    >
                        <ul className="services-addon-list">
                            {ADDONS.filter((a) => a.billing !== "month").map(
                                (a) => (
                                    <li key={a.id}>
                                        <QuoteLink
                                            addonId={a.id}
                                            className="services-text-link"
                                        >
                                            {a.name[lang]}
                                        </QuoteLink>
                                        <strong>
                                            {c.from} {money(a.price)}
                                        </strong>
                                    </li>
                                ),
                            )}
                        </ul>
                        <QuoteLink offerId="addons-only">
                            {t.standalone}
                        </QuoteLink>
                    </Accordion>
                    <div id="avulsos" className="services-subsection">
                        <Accordion
                            classPrefix="services-question"
                            trigger={t.technical}
                        >
                            <p className="services-fineprint">
                                {c.serviceNote}
                            </p>
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
                                                            href={quoteUrl(
                                                                {
                                                                    offerId:
                                                                        s.id,
                                                                },
                                                                lang,
                                                            )}
                                                            onClick={follow}
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
                                                            {s.billing ===
                                                            "hour"
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
                                {
                                    CATEGORIES.find((c) => c.id === "data")!
                                        .limit[lang]
                                }
                            </p>
                            <p className="services-fineprint">
                                {
                                    CATEGORIES.find((c) => c.id === "business")!
                                        .limit[lang]
                                }
                            </p>
                        </Accordion>
                    </div>
                    <Accordion
                        classPrefix="services-question"
                        trigger={t.packages}
                    >
                        {" "}
                        <p className="services-fineprint">{c.packageNote}</p>
                        <div className="services-grid services-packages">
                            {BUSINESS_PACKAGES.map((p) => (
                                <OfferCard key={p.id} offer={p} />
                            ))}
                        </div>
                    </Accordion>
                </section>
                <section
                    id="ti-personalizada"
                    className="services-section services-custom services-custom--quiet"
                    aria-labelledby="custom-it-title"
                >
                    <div>
                        <p className="services-eyebrow">05 / {c.onQuote}</p>
                        <h2 id="custom-it-title">{t.customIT}</h2>
                        <p>{t.customITIntro}</p>
                    </div>
                    <div>
                        <IconTerminal aria-hidden="true" />
                        <p>{t.emailTerms}</p>
                        <QuoteLink offerId="custom-it">
                            {t.customITCta}
                        </QuoteLink>
                    </div>
                </section>
                <section
                    id="manutencao"
                    className="services-section services-maintenance"
                    aria-labelledby="maintenance-title"
                >
                    <div>
                        <p className="services-eyebrow">
                            06 / {maintenance.name[lang]}
                        </p>
                        <h2 id="maintenance-title">{t.maintenance}</h2>
                        <p>{t.maintenanceIntro}</p>
                        <ul>
                            {t.maintenancePoints.map((p) => (
                                <li key={p}>{p}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="services-card">
                        <h3>{maintenance.name[lang]}</h3>
                        <p className="services-price">
                            <span>{c.from}</span>
                            <strong>{money(maintenance.price)}</strong>
                            {c.perMonth}
                        </p>
                        <QuoteLink addonId="maintenance">
                            {t.maintenanceCta}
                        </QuoteLink>
                        <p className="services-fineprint">{c.maintenance}</p>
                    </div>
                </section>
                <section
                    id="experiencia"
                    className="services-section"
                    aria-labelledby="experience-title"
                >
                    <p className="services-eyebrow">07 / GCRUZ</p>
                    <h2 id="experience-title">{t.why}</h2>
                    <p className="services-section-intro">{t.whyIntro}</p>
                    <div className="services-benefits">
                        {t.benefits.map((b) => (
                            <article key={b.title}>
                                <h3>{b.title}</h3>
                                <p>{b.text}</p>
                            </article>
                        ))}
                    </div>
                    <Accordion
                        classPrefix="services-question"
                        trigger={t.evidence}
                    >
                        {" "}
                        <p className="services-fineprint">{c.projectNote}</p>
                        <div className="services-grid">
                            <article className="services-card services-project">
                                <img
                                    src="/projects/codex/overview.webp"
                                    width={1920}
                                    height={1080}
                                    loading="lazy"
                                    alt={PROJECT_COPY.codexAlt[lang]}
                                />
                                <p className="services-eyebrow">
                                    {c.projectType}
                                </p>
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
                    </Accordion>
                </section>
                <section
                    id="processo"
                    className="services-section"
                    aria-labelledby="process-title"
                >
                    <p className="services-eyebrow">08 / {t.nav[3]}</p>
                    <h2 id="process-title">{t.process}</h2>
                    <ol className="services-process">
                        {t.steps.map((s, i) => (
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
                    <p className="services-notice">{t.noContract}</p>
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
                                href={quoteUrl({ interest: "referral" }, lang)}
                                className="btn btn--outline"
                                onClick={follow}
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
                                href={quoteUrl({ interest: "partner" }, lang)}
                                className="btn btn--outline"
                                onClick={follow}
                            >
                                {c.partnerCta}
                            </a>
                        </article>
                    </div>
                    <Accordion
                        classPrefix="services-question"
                        trigger={c.rulesTitle}
                    >
                        <ul className="services-terms">
                            {c.rules.map((r) => (
                                <li key={r}>{r}</li>
                            ))}
                        </ul>
                    </Accordion>
                </section>{" "}
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
                                    </>
                                }
                            >
                                <p>{f.a[lang]}</p>
                            </Accordion>
                        ))}
                    </div>
                </section>
                <section
                    className="services-section services-final"
                    aria-labelledby="final-title"
                >
                    <p className="services-eyebrow">GCRUZ / {c.quote}</p>
                    <h2 id="final-title">{t.final}</h2>
                    <p>{t.finalText}</p>
                    <div className="services-actions">
                        <QuoteLink className="btn btn--primary">
                            {t.finalCta}
                        </QuoteLink>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
