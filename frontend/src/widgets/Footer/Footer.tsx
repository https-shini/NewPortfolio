/**
 * Footer.tsx — gcruz.dev.br · Design System v4.0
 *
 * Arquitetura:
 * ① Sub-componentes memoizados — evita re-renders quando lang/theme mudam.
 * ② buildMailtoHref() — gera mailto: com subject + body i18n pré-preenchidos.
 * ③ <address> semântico no bloco de contato — ATS-friendly.
 * ④ Zero dados hardcoded: e-mail/urls via constants, textos via t() (i18n).
 * ⑤ Ícones exclusivamente do design system Icons.tsx — sem SVG inline.
 */

import React, { memo, useCallback } from "react";
import "./Footer.css";

import { useLang } from "@/shared/hooks/useLang";
import { scrollToSection } from "@/shared/lib/smoothScroll";
import { buildMailtoHref } from "@/shared/lib/mailto";
import {
    AUTHOR_EMAIL,
    GITHUB_URL,
    LINKEDIN_URL,
    getCvUrl,
    SECTION_IDS,
} from "@/shared/config/constants";
import {
    IconGitHub,
    IconLinkedIn,
    IconGmail,
    IconHeart,
    IconLocation,
    IconDownload,
} from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────────────────────────
   Tipos locais
───────────────────────────────────────────────────────────────────────────── */

type TranslationKey = Parameters<ReturnType<typeof useLang>["t"]>[0];

interface NavItem {
    id: string; // id da section para scrollToSection
    key: TranslationKey; // chave i18n
}

interface ProjectItem {
    label: string;
    href: string;
    external: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Dados estáticos — centralizados para fácil manutenção
───────────────────────────────────────────────────────────────────────────── */

const NAV_ITEMS: NavItem[] = [
    { id: SECTION_IDS.HOME, key: "nav.home" },
    { id: SECTION_IDS.ABOUT, key: "nav.about" },
    { id: SECTION_IDS.CAREER, key: "nav.career" },
    { id: SECTION_IDS.EDUCATION, key: "nav.education" },
    { id: SECTION_IDS.FEATURED, key: "nav.featured" },
    { id: SECTION_IDS.WORK, key: "nav.work" },
    { id: SECTION_IDS.RECOMMENDATIONS, key: "nav.recommendations" },
    { id: SECTION_IDS.CONTACT, key: "nav.contact" },
];

const PROJECT_ITEMS: ProjectItem[] = [
    /* AuthService é o projeto da seção Destaque — link interno */
    { label: "AuthService", href: `#${SECTION_IDS.FEATURED}`, external: false },
    {
        label: "Web Chat",
        href: "https://chat-frontend-g42t.onrender.com",
        external: true,
    },
    {
        label: "Controle Financeiro",
        href: "https://financas-reactjs.vercel.app",
        external: true,
    },
    {
        label: "HomeMade Gourmet",
        href: "https://https-shini.github.io/homemade-gourmet/",
        external: true,
    },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTE — FooterBrand
   Logo tipográfico · tagline i18n · ícones de redes sociais.
═══════════════════════════════════════════════════════════════════════════ */

interface FooterBrandProps {
    tagline: string;
    onLogoClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    lang: "pt" | "en";
}

const FooterBrand = memo<FooterBrandProps>(({ tagline, onLogoClick, lang }) => (
    <div className="footer__brand">
        {/* Logo — mesma identidade visual do Header */}
        <a
            href={`#${SECTION_IDS.HOME}`}
            className="footer__logo"
            aria-label={
                lang === "pt"
                    ? "Guilherme Cruz — voltar ao início da página"
                    : "Guilherme Cruz — back to top"
            }
            onClick={onLogoClick}
        >
            <span className="footer__logo-dot" />
            <span className="footer__logo-name">
                <span className="footer__logo-prefix">GCruz</span>
                <span className="footer__logo-suffix">.dev</span>
            </span>
        </a>

        {/* Tagline */}
        <p className="footer__brand-tagline">{tagline}</p>

        {/* Redes sociais */}
        <nav
            aria-label={
                lang === "pt"
                    ? "Redes sociais de Guilherme Cruz"
                    : "Guilherme Cruz's social media"
            }
        >
            <ul className="footer__social">
                <li>
                    <a
                        href={GITHUB_URL}
                        className="social-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={
                            lang === "pt"
                                ? "GitHub de Guilherme Cruz (abre em nova aba)"
                                : "Guilherme Cruz on GitHub (opens in new tab)"
                        }
                    >
                        <IconGitHub width={16} height={16} />
                    </a>
                </li>
                <li>
                    <a
                        href={LINKEDIN_URL}
                        className="social-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={
                            lang === "pt"
                                ? "LinkedIn de Guilherme Cruz (abre em nova aba)"
                                : "Guilherme Cruz on LinkedIn (opens in new tab)"
                        }
                    >
                        <IconLinkedIn width={16} height={16} />
                    </a>
                </li>
                <li>
                    <a
                        href={`mailto:${AUTHOR_EMAIL}`}
                        className="social-link"
                        aria-label={`Enviar e-mail para ${AUTHOR_EMAIL}`}
                    >
                        <IconGmail width={16} height={16} />
                    </a>
                </li>
            </ul>
        </nav>
    </div>
));
FooterBrand.displayName = "FooterBrand";

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTE — FooterNavCol
   Coluna genérica reutilizável: título eyebrow + lista de links.
   Usada tanto para "Navegação" quanto para "Projetos".
═══════════════════════════════════════════════════════════════════════════ */

interface FooterNavColProps {
    title: string;
    navLabel: string;
    children: React.ReactNode;
}

const FooterNavCol = memo<FooterNavColProps>(
    ({ title, navLabel, children }) => (
        <div className="footer__col">
            <h3 className="footer__col-title">{title}</h3>
            <nav aria-label={navLabel}>
                <ul className="footer__links">{children}</ul>
            </nav>
        </div>
    ),
);
FooterNavCol.displayName = "FooterNavCol";

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTE — FooterContact
   Coluna de contato com <address> semântico (ATS-friendly).
   Inclui: CTA compacto · e-mail legível · LinkedIn · localização.
═══════════════════════════════════════════════════════════════════════════ */

interface FooterContactProps {
    colTitle: string;
    mailtoHref: string;
    ctaLabel: string;
    location: string;
    lang: "pt" | "en";
}

const FooterContact = memo<FooterContactProps>(
    ({ colTitle, mailtoHref, ctaLabel, location, lang }) => (
        <div className="footer__col footer__col--contact">
            <h3 className="footer__col-title">{colTitle}</h3>

            {/*
                <address> é semanticamente correto para dados de contato do autor.
                Sistemas ATS reconhecem o elemento e indexam e-mail/LinkedIn
                com maior precisão do que um <div> genérico.
            */}
            <address className="footer__address">
                {/* CTA compacto de e-mail */}
                <a
                    href={mailtoHref}
                    className="footer__contact-cta btn btn--primary btn--sm"
                    aria-label={`${ctaLabel} — ${AUTHOR_EMAIL}`}
                >
                    <IconGmail width={14} height={14} />
                    <span>{ctaLabel}</span>
                </a>

                {/* E-mail visível em texto — ATS indexa o endereço */}
                <a
                    href={`mailto:${AUTHOR_EMAIL}`}
                    className="footer__contact-item"
                    aria-label={`Enviar e-mail para ${AUTHOR_EMAIL}`}
                >
                    {AUTHOR_EMAIL}
                </a>

                {/* LinkedIn */}
                <a
                    href={LINKEDIN_URL}
                    className="footer__contact-item"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={
                        lang === "pt"
                            ? "LinkedIn de Guilherme Cruz (abre em nova aba)"
                            : "Guilherme Cruz on LinkedIn (opens in new tab)"
                    }
                >
                    linkedin.com/in/oguilherme-cruz
                </a>

                {/* Localização */}
                <span className="footer__contact-location">
                    <IconLocation width={12} height={12} />
                    <span>{location}</span>
                </span>
            </address>
        </div>
    ),
);
FooterContact.displayName = "FooterContact";

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTE — FooterBottom
   Barra inferior: copyright · download CV · "made with".
═══════════════════════════════════════════════════════════════════════════ */

interface FooterBottomProps {
    year: number;
    rights: string;
    made: string;
    coffee: string;
    cvLabel: string;
    cvUrl: string;
    lang: "pt" | "en";
}

const FooterBottom = memo<FooterBottomProps>(
    ({ year, rights, made, coffee, cvLabel, cvUrl, lang }) => (
        <div className="footer__bottom">
            {/* Copyright com <time> semântico */}
            <p className="footer__copyright">
                <span>©</span> <time dateTime={String(year)}>{year}</time>{" "}
                Guilherme Cruz. {rights}
            </p>

            {/* Ações secundárias: CV + made with */}
            <div className="footer__bottom-end">
                <a
                    href={cvUrl}
                    className="footer__cv-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={
                        lang === "pt"
                            ? "Download do currículo em PDF (abre em nova aba)"
                            : "Download résumé as PDF (opens in new tab)"
                    }
                >
                    <IconDownload width={12} height={12} />
                    {cvLabel}
                </a>

                <p
                    className="footer__made"
                    aria-label={`${made} React & ${coffee}`}
                >
                    {made}
                    <IconHeart
                        width={11}
                        height={11}
                        className="footer__heart"
                    />
                    React &amp; {coffee}
                </p>
            </div>
        </div>
    ),
);
FooterBottom.displayName = "FooterBottom";

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — Footer
═══════════════════════════════════════════════════════════════════════════ */

export const Footer: React.FC = () => {
    const { lang, t } = useLang();
    const year = new Date().getFullYear();
    const mailtoHref = buildMailtoHref(lang);

    /* Estável entre renders — não recria a função desnecessariamente */
    const handleInternalNav = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
            e.preventDefault();
            scrollToSection(id);
        },
        [],
    );

    const ctaLabel = lang === "pt" ? "Fale comigo" : "Get in touch";
    const cvLabel = lang === "pt" ? "Download CV" : "Download CV";
    const cvUrl = getCvUrl(lang);

    return (
        <footer
            className="footer"
            aria-label={
                lang === "pt"
                    ? "Rodapé do portfólio de Guilherme Cruz"
                    : "Guilherme Cruz's portfolio footer"
            }
        >
            {/* ── 1. Grid principal ────────────────────────────────────────────── */}
            <div className="footer__main">
                <div className="container">
                    <div className="footer__grid">
                        {/* Coluna 1 — Brand */}
                        <FooterBrand
                            tagline={t("footer.tagline")}
                            onLogoClick={(e) =>
                                handleInternalNav(e, SECTION_IDS.HOME)
                            }
                            lang={lang}
                        />

                        {/* Coluna 2 — Navegação */}
                        <FooterNavCol
                            title={t("footer.nav")}
                            navLabel={
                                lang === "pt"
                                    ? "Links de navegação do rodapé"
                                    : "Footer navigation links"
                            }
                        >
                            {NAV_ITEMS.map(({ id, key }) => (
                                <li key={id}>
                                    <a
                                        href={`#${id}`}
                                        className="footer__link"
                                        onClick={(e) =>
                                            handleInternalNav(e, id)
                                        }
                                    >
                                        {t(key)}
                                    </a>
                                </li>
                            ))}
                        </FooterNavCol>

                        {/* Coluna 3 — Projetos */}
                        <FooterNavCol
                            title={t("footer.projects")}
                            navLabel={
                                lang === "pt"
                                    ? "Links de projetos em destaque"
                                    : "Featured project links"
                            }
                        >
                            {PROJECT_ITEMS.map((item) => (
                                <li key={item.href}>
                                    {item.external ? (
                                        <a
                                            href={item.href}
                                            className="footer__link"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`${item.label}${lang === "pt" ? " (abre em nova aba)" : " (opens in new tab)"}`}
                                        >
                                            {item.label}
                                        </a>
                                    ) : (
                                        <a
                                            href={item.href}
                                            className="footer__link"
                                            onClick={(e) =>
                                                handleInternalNav(
                                                    e,
                                                    SECTION_IDS.FEATURED,
                                                )
                                            }
                                        >
                                            {item.label}
                                        </a>
                                    )}
                                </li>
                            ))}
                        </FooterNavCol>

                        {/* Coluna 4 — Contato */}
                        <FooterContact
                            colTitle={t("footer.contact")}
                            mailtoHref={mailtoHref}
                            ctaLabel={ctaLabel}
                            location={t("footer.location")}
                            lang={lang}
                        />
                    </div>
                </div>
            </div>

            {/* ── 2. Divisor decorativo ────────────────────────────────────────── */}
            <div className="footer__divider" role="separator" />

            {/* ── 3. Barra inferior ────────────────────────────────────────────── */}
            <div className="footer__bottom-bar">
                <div className="container">
                    <FooterBottom
                        year={year}
                        rights={t("footer.rights")}
                        made={t("footer.made")}
                        coffee={t("footer.coffee")}
                        cvLabel={cvLabel}
                        cvUrl={cvUrl}
                        lang={lang}
                    />
                </div>
            </div>
        </footer>
    );
};

export default Footer;
