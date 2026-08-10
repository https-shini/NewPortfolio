/**
 * Footer.tsx — gcruz.dev.br · Design System v4.0
 *
 * Arquitetura:
 * ① Sub-componentes memoizados — evita re-renders quando lang/theme mudam.
 * ② buildMailtoHref() — gera mailto: com subject + body i18n pré-preenchidos.
 * ③ <address> semântico no bloco de contato — ATS-friendly.
 * ④ Zero dados hardcoded: e-mail/urls via constants, textos via t() (i18n).
 * ⑤ Ícones exclusivamente do design system Icons.tsx — sem SVG inline.
 * ⑥ As âncoras da home e as páginas próprias ficam em colunas separadas:
 *   uma rola a página, a outra troca de página, e misturá-las numa lista
 *   só deixou de caber quando as rotas passaram de uma.
 * ⑦ A newsletter fica na coluna de contato e funciona com ou sem
 *   VITE_NEWSLETTER_ENDPOINT: com, envia por POST; sem, abre um e-mail
 *   pronto — ver components/NewsletterForm.tsx.
 */

import React, { memo, useCallback } from "react";
import "./Footer.css";
import { Logo } from "@/shared/ui/Logo/Logo";

import { useLang } from "@/shared/hooks/useLang";
import { useRoute } from "@/shared/hooks/useRoute";
import { scrollToSection } from "@/shared/lib/smoothScroll";
import { buildMailtoHref } from "@/shared/lib/mailto";
import {
    AUTHOR_EMAIL,
    LINKEDIN_URL,
    getCvUrl,
    SECTION_IDS,
    ROUTES,
} from "@/shared/config/constants";
import { PROJECT_URLS, TREE_LINKS, linkKind } from "@/shared/config/links";
import { NewsletterForm } from "./components/NewsletterForm";
import {
    IconGmail,
    IconHeart,
    IconLocation,
    IconDownload,
    IconGitBranch,
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

interface PageItem {
    to: (typeof ROUTES)[keyof typeof ROUTES];
    key: TranslationKey;
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

/* Os ícones sociais saem de TREE_LINKS, sem o item `portfolio`: um link
   para o próprio site, dentro do rodapé do próprio site, não leva a
   lugar nenhum. */
const SOCIAIS = TREE_LINKS.filter((l) => l.id !== "portfolio");

/** Rótulo acessível de um ícone social — o ícone sozinho não tem texto. */
function rotuloSocial(nome: string, href: string, lang: "pt" | "en"): string {
    if (linkKind(href) === "mailto") {
        const endereco = href.replace(/^mailto:/, "");
        return lang === "pt"
            ? `Enviar e-mail para ${endereco}`
            : `Send an email to ${endereco}`;
    }
    return lang === "pt"
        ? `${nome} de Guilherme Cruz (abre em nova aba)`
        : `Guilherme Cruz on ${nome} (opens in new tab)`;
}

/* Temporário: /downloads sai do rodapé enquanto a versão desktop está
   sendo melhorada — o link e o QR convidariam para instaladores que
   ainda vão mudar. A ROTA continua existindo e acessível por URL; o que
   some é o convite. Para trazer de volta, basta `true` aqui.

   Anotado como bandeira em vez de código apagado justamente por ser
   temporário: assim o caminho de volta é visível para quem ler o
   arquivo, e não algo a redescobrir no histórico. */
const MOSTRAR_DOWNLOADS: boolean = false;

/* Rotas próprias do site, na ordem em que o rodapé as lista. A home fica
   de fora: ela já é o logo da coluna Brand e a primeira âncora. */
const PAGE_ITEMS: PageItem[] = [
    { to: ROUTES.LINKS, key: "nav.links" },
    { to: ROUTES.RELEASE_NOTES, key: "releaseNotes.title" },
    ...(MOSTRAR_DOWNLOADS
        ? [{ to: ROUTES.DOWNLOADS, key: "footer.downloads" } as PageItem]
        : []),
];

/* URLs vêm de shared/config/links.ts — fonte única. Aqui só se decide
   quais projetos o rodapé lista e em que ordem. */
const PROJECT_ITEMS: ProjectItem[] = [
    /* AuthService é o projeto da seção Destaque — link interno */
    { label: "AuthService", href: `#${SECTION_IDS.FEATURED}`, external: false },
    {
        label: "Web Chat",
        href: PROJECT_URLS.webChat.live,
        external: true,
    },
    {
        label: "Controle Financeiro",
        href: PROJECT_URLS.finances.live,
        external: true,
    },
    {
        label: "HomeMade Gourmet",
        href: PROJECT_URLS.homemadeGourmet.live,
        external: true,
    },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTE — FooterBrand
   Logo tipográfico · tagline i18n · ícones de redes sociais · QR para
   a página de downloads.
═══════════════════════════════════════════════════════════════════════════ */

interface FooterBrandProps {
    tagline: string;
    onLogoClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    onQrClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    lang: "pt" | "en";
}

const FooterBrand = memo<FooterBrandProps>(
    ({ tagline, onLogoClick, onQrClick, lang }) => (
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
                <Logo />
            </a>

            {/* Tagline */}
            <p className="footer__brand-tagline">{tagline}</p>

            {/* Redes sociais — a lista vem de TREE_LINKS, a mesma que
            alimenta a /links. Antes eram três <a> escritos à mão, cada um
            repetindo a decisão de target e rel; um perfil novo entrava em
            dois lugares e saía torto de um deles. */}
            <nav
                aria-label={
                    lang === "pt"
                        ? "Redes sociais de Guilherme Cruz"
                        : "Guilherme Cruz's social media"
                }
            >
                <ul className="footer__social">
                    {SOCIAIS.map(({ id, label, href, icon: Icone }) => {
                        const externo = linkKind(href) === "external";
                        return (
                            <li key={id}>
                                <a
                                    href={href}
                                    className="social-link"
                                    target={externo ? "_blank" : undefined}
                                    rel={
                                        externo
                                            ? "noopener noreferrer"
                                            : undefined
                                    }
                                    aria-label={rotuloSocial(
                                        label[lang],
                                        href,
                                        lang,
                                    )}
                                >
                                    <Icone width={16} height={16} />
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* O QR leva a /downloads; enquanto a página está fora do
            rodapé, o desenho também sai — um código que aponta para algo
            que não estamos divulgando é ruído. Ver MOSTRAR_DOWNLOADS.

            Dentro de um link porque o mesmo desenho serve a duas
            situações: no celular a câmera aponta, no desktop o ponteiro
            clica — e um QR que não clica é um beco para quem está lendo
            isto na própria tela.

            O alt descreve o DESTINO, não a figura: "QR code" não diz
            nada a quem não vê a imagem, e o que interessa é para onde
            leva. */}
            {MOSTRAR_DOWNLOADS && (
                <a
                    href={ROUTES.DOWNLOADS}
                    className="footer__qr"
                    onClick={onQrClick}
                >
                    <img
                        src="/qr-downloads.svg"
                        width={96}
                        height={96}
                        loading="lazy"
                        decoding="async"
                        alt={
                            lang === "pt"
                                ? "Abrir a página de downloads — aponte a câmera ou clique"
                                : "Open the downloads page — point your camera or click"
                        }
                    />
                </a>
            )}
        </div>
    ),
);
FooterBrand.displayName = "FooterBrand";

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTE — FooterNavCol
   Coluna genérica reutilizável: título eyebrow + lista de links.
   Usada por "Navegação", "Páginas" e "Projetos".
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

            {/* Fica fora do <address>: uma caixa de inscrição não é dado
                de contato do autor, e um ATS que lê o elemento não deve
                confundir as duas coisas. */}
            <NewsletterForm />
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
    /** Badge de versão que abre as notas de versão. */
    versionBadge: React.ReactNode;
}

const FooterBottom = memo<FooterBottomProps>(
    ({ year, rights, made, coffee, cvLabel, cvUrl, lang, versionBadge }) => (
        <div className="footer__bottom">
            {/* Copyright com <time> semântico */}
            <p className="footer__copyright">
                <span>©</span> <time dateTime={String(year)}>{year}</time>{" "}
                Guilherme Cruz. {rights}
            </p>

            {versionBadge}

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
    const { isHome, navigate } = useRoute();
    const year = new Date().getFullYear();
    const mailtoHref = buildMailtoHref(lang);

    /* Estável entre renders — não recria a função desnecessariamente */
    const handleInternalNav = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
            e.preventDefault();

            /* Fora da home as seções não existem: volta para ela e rola
               no frame seguinte, já com a página montada. */
            if (!isHome) {
                navigate(ROUTES.HOME);
                requestAnimationFrame(() => scrollToSection(id));
                return;
            }

            scrollToSection(id);
        },
        [isHome, navigate],
    );

    /** Navegação entre páginas (rota), não entre seções da home. */
    const handleRouteNav = useCallback(
        (
            e: React.MouseEvent<HTMLAnchorElement>,
            to: (typeof ROUTES)[keyof typeof ROUTES],
        ) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey) return;
            e.preventDefault();
            navigate(to);
        },
        [navigate],
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
                            onQrClick={(e) =>
                                handleRouteNav(e, ROUTES.DOWNLOADS)
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

                        {/* Coluna 3 — Páginas
                            As páginas próprias saíram de dentro de
                            "Navegação". Ali elas apareciam misturadas às
                            oito âncoras da home, e as duas coisas não são
                            iguais: uma rola a página, a outra troca de
                            página. Com três rotas isso deixou de caber
                            numa lista só. */}
                        <FooterNavCol
                            title={t("footer.pages")}
                            navLabel={
                                lang === "pt"
                                    ? "Outras páginas do site"
                                    : "Other pages on this site"
                            }
                        >
                            {PAGE_ITEMS.map(({ to, key }) => (
                                <li key={to}>
                                    <a
                                        href={to}
                                        className="footer__link"
                                        onClick={(e) => handleRouteNav(e, to)}
                                    >
                                        {t(key)}
                                    </a>
                                </li>
                            ))}
                        </FooterNavCol>

                        {/* Coluna 4 — Projetos */}
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
                        versionBadge={
                            /* Link, não botão: as notas agora têm rota
                               própria, então o badge abre uma página — e
                               deve poder ir para nova aba e aparecer no
                               menu de contexto. */
                            <a
                                href={ROUTES.RELEASE_NOTES}
                                className="footer__version"
                                aria-label={t("releaseNotes.openLabel")}
                                onClick={(e) => {
                                    if (e.metaKey || e.ctrlKey || e.shiftKey)
                                        return;
                                    e.preventDefault();
                                    navigate(ROUTES.RELEASE_NOTES);
                                }}
                            >
                                <IconGitBranch
                                    width={12}
                                    height={12}
                                    aria-hidden="true"
                                />
                                <span className="footer__version-number">
                                    v{__APP_VERSION__}
                                </span>
                                <span className="footer__version-label">
                                    {t("releaseNotes.badge")}
                                </span>
                            </a>
                        }
                    />
                </div>
            </div>
        </footer>
    );
};

export default Footer;
