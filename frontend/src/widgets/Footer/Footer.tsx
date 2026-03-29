/**
 * Footer.tsx — bl4ck404.dev.br · Design System v2.0
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
import {
    AUTHOR_EMAIL,
    GITHUB_URL,
    LINKEDIN_URL,
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
    { id: "hero", key: "nav.home" },
    { id: "about", key: "nav.about" },
    { id: "timeline", key: "nav.career" },
    { id: "featured", key: "nav.featured" },
    { id: "work", key: "nav.work" },
    { id: "contact", key: "nav.contact" },
];

const PROJECT_ITEMS: ProjectItem[] = [
    { label: "HomeMade Gourmet", href: "#featured", external: false },
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
        label: "Auth Service",
        href: "https://github.com/https-shini/AuthService",
        external: true,
    },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Utilitário — mailto: com assunto e corpo pré-preenchidos adaptados ao idioma
───────────────────────────────────────────────────────────────────────────── */

function buildMailtoHref(lang: string): string {
    const isPt = lang === "pt";
    const subject = encodeURIComponent(
        isPt
            ? "Contato via Portfólio — Guilherme Cruz"
            : "Contact via Portfolio — Guilherme Cruz",
    );
    const body = encodeURIComponent(
        isPt
            ? "Olá, Guilherme!\n\nEntrei em contato pelo seu portfólio e gostaria de conversar sobre..."
            : "Hi, Guilherme!\n\nI found you through your portfolio and would love to chat about...",
    );
    return `mailto:${AUTHOR_EMAIL}?subject=${subject}&body=${body}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTE — FooterBrand
   Logo tipográfico · tagline i18n · ícones de redes sociais.
═══════════════════════════════════════════════════════════════════════════ */

interface FooterBrandProps {
    tagline: string;
    onLogoClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const FooterBrand = memo<FooterBrandProps>(({ tagline, onLogoClick }) => (
    <div className="footer__brand">
        {/* Logo — mesma identidade visual do Header */}
        <a
            href="#hero"
            className="footer__logo"
            aria-label="Guilherme Cruz — voltar ao início da página"
            onClick={onLogoClick}
        >
            <span className="footer__logo-dot" aria-hidden="true" />
            <span className="footer__logo-name" aria-hidden="true">
                <span className="footer__logo-prefix">GCruz</span>
                <span className="footer__logo-suffix">.dev</span>
            </span>
        </a>

        {/* Tagline */}
        <p className="footer__brand-tagline">{tagline}</p>

        {/* Redes sociais */}
        <nav aria-label="Redes sociais de Guilherme Cruz">
            <ul className="footer__social" role="list">
                <li>
                    <a
                        href={GITHUB_URL}
                        className="social-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub de Guilherme Cruz (abre em nova aba)"
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
                        aria-label="LinkedIn de Guilherme Cruz (abre em nova aba)"
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
                <ul className="footer__links" role="list">
                    {children}
                </ul>
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
}

const FooterContact = memo<FooterContactProps>(
    ({ colTitle, mailtoHref, ctaLabel, location }) => (
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
                    <IconGmail width={14} height={14} aria-hidden="true" />
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
                    aria-label="LinkedIn de Guilherme Cruz (abre em nova aba)"
                >
                    linkedin.com/in/oguilherme-cruz
                </a>

                {/* Localização */}
                <span className="footer__contact-location">
                    <IconLocation width={12} height={12} aria-hidden="true" />
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
}

const FooterBottom = memo<FooterBottomProps>(
    ({ year, rights, made, coffee, cvLabel }) => (
        <div className="footer__bottom">
            {/* Copyright com <time> semântico */}
            <p className="footer__copyright">
                <span aria-hidden="true">©</span>{" "}
                <time dateTime={String(year)}>{year}</time> Guilherme Cruz.{" "}
                {rights}
            </p>

            {/* Ações secundárias: CV + made with */}
            <div className="footer__bottom-end">
                <a
                    href="/curriculo.pdf"
                    className="footer__cv-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download do currículo em PDF (abre em nova aba)"
                >
                    <IconDownload width={12} height={12} aria-hidden="true" />
                    {cvLabel}
                </a>

                <p
                    className="footer__made"
                    aria-label={`${made} React e muito café`}
                >
                    {made}
                    <IconHeart
                        width={11}
                        height={11}
                        className="footer__heart"
                        aria-hidden="true"
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

    return (
        <footer
            className="footer"
            aria-label="Rodapé do portfólio de Guilherme Cruz"
        >
            {/* ── 1. Grid principal ────────────────────────────────────────────── */}
            <div className="footer__main">
                <div className="container">
                    <div className="footer__grid">
                        {/* Coluna 1 — Brand */}
                        <FooterBrand
                            tagline={t("footer.tagline")}
                            onLogoClick={(e) => handleInternalNav(e, "hero")}
                        />

                        {/* Coluna 2 — Navegação */}
                        <FooterNavCol
                            title={t("footer.nav")}
                            navLabel="Links de navegação do rodapé"
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
                            navLabel="Links de projetos em destaque"
                        >
                            {PROJECT_ITEMS.map((item) => (
                                <li key={item.href}>
                                    {item.external ? (
                                        <a
                                            href={item.href}
                                            className="footer__link"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`${item.label} (abre em nova aba)`}
                                        >
                                            {item.label}
                                        </a>
                                    ) : (
                                        <a
                                            href={item.href}
                                            className="footer__link"
                                            onClick={(e) =>
                                                handleInternalNav(e, "featured")
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
                        />
                    </div>
                </div>
            </div>

            {/* ── 2. Divisor decorativo ────────────────────────────────────────── */}
            <div
                className="footer__divider"
                role="separator"
                aria-hidden="true"
            />

            {/* ── 3. Barra inferior ────────────────────────────────────────────── */}
            <div className="footer__bottom-bar">
                <div className="container">
                    <FooterBottom
                        year={year}
                        rights={t("footer.rights")}
                        made={t("footer.made")}
                        coffee={t("footer.coffee")}
                        cvLabel={cvLabel}
                    />
                </div>
            </div>
        </footer>
    );
};

export default Footer;
