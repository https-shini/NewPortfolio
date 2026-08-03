import React from "react";
import "./Contact.css";
import { useLang } from "@/shared/hooks/useLang";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import { renderRich, renderRichParagraphs } from "@/shared/lib/richText";
import {
    IconEmail,
    IconLinkedIn,
    IconGitHub,
    IconLocation,
    IconBolt,
    IconDev,
    IconShare,
} from "@/shared/ui/Icons";
import { PROFILE } from "@/shared/config/profile";
import { buildMailtoHref } from "@/shared/lib/mailto";
import { ContactForm } from "./components/ContactForm";
import type { Localized } from "@/shared/lib/localized";
import type { TranslationKey } from "@/shared/lib/translations";

/* ═══════════════════════════════════════════════════════════════════════════
   DADOS ESTÁTICOS
═══════════════════════════════════════════════════════════════════════════ */

/* Dados de perfil estruturados (ATS-friendly).
   Identidade vem de PROFILE (fonte única); textos via chaves i18n. */
interface ProfileRow {
    icon: React.ReactNode;
    /** Rótulo — nome próprio (string) ou traduzível (Localized). */
    label: string | Localized;
    value: string | Localized;
    href: string | null;
    noteKey: TranslationKey;
}

const PROFILE_DATA: ProfileRow[] = [
    {
        icon: <IconEmail />,
        label: "E-mail",
        value: PROFILE.email,
        href: `mailto:${PROFILE.email}`,
        noteKey: "contact.meta.response",
    },
    {
        icon: <IconLinkedIn />,
        label: PROFILE.social.linkedin.label,
        value: PROFILE.social.linkedin.handle,
        href: PROFILE.social.linkedin.url,
        noteKey: "contact.meta.linkedin",
    },
    {
        icon: <IconGitHub />,
        label: PROFILE.social.github.label,
        value: PROFILE.social.github.handle,
        href: PROFILE.social.github.url,
        noteKey: "contact.meta.github",
    },
    {
        icon: <IconDev />,
        label: { pt: "Redes Sociais", en: "Social Networks" },
        value: PROFILE.social.devlinks.handle,
        href: PROFILE.social.devlinks.url,
        noteKey: "contact.meta.devlinks",
    },
    {
        icon: <IconLocation />,
        label: { pt: "Localização", en: "Location" },
        value: PROFILE.location,
        href: null,
        noteKey: "contact.meta.location",
    },
];

/** Resolve string | Localized no idioma corrente. */
const resolve = (v: string | Localized, lang: "pt" | "en"): string =>
    typeof v === "string" ? v : v[lang];

/**
 * ProfileLink — âncora das linhas de perfil.
 * A lista mistura mailto, sites externos e rota interna (a página /links),
 * então quem decide como abrir é useLinkProps, não este componente.
 */
const ProfileLink: React.FC<React.PropsWithChildren<{ href: string }>> = ({
    href,
    children,
}) => {
    const { anchorProps } = useLinkProps(href);
    return <a {...anchorProps}>{children}</a>;
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════════════════ */
export const Contact: React.FC = () => {
    const { t, lang } = useLang();

    /* Subject e body pré-preenchidos no mailto, adaptados ao idioma */
    const mailtoHref = buildMailtoHref(lang);

    return (
        <section
            id="contato"
            className="contact section"
            aria-labelledby="contact-title"
            data-reveal
        >
            <div className="container">
                {/* ── Header ─────────────────────────────────────────── */}
                <header className="contact__header section-header">
                    <span className="section-eyebrow">{t("nav.contact")}</span>

                    {/* Badge de disponibilidade */}
                    <div
                        className="contact__availability"
                        role="status"
                        aria-live="polite"
                    >
                        <span
                            className="contact__availability-dot"
                            aria-hidden="true"
                        />
                        {t("hero.status")}
                    </div>

                    <h2 className="section-title" id="contact-title">
                        {t("contact.title")}
                    </h2>

                    <p className="section-subtitle" id="subtitle-contact">
                        {t("contact.sub")}
                    </p>
                </header>

                {/* ── Layout ─────────────────────────────────────────── */}
                <div className="contact__layout">
                    {/* ════════════════════════════════════════════════
                        COLUNA ESQUERDA — CTA principal
                    ════════════════════════════════════════════════ */}
                    <div
                        className="contact__cta-card"
                        data-reveal
                        data-delay="1"
                    >
                        {/* Eyebrow com ícone */}
                        <div className="contact__cta-eyebrow">
                            <div
                                className="contact__cta-icon"
                                aria-hidden="true"
                            >
                                <IconEmail />
                            </div>
                            <span className="contact__cta-label">
                                {t("contact.hook")}
                            </span>
                        </div>

                        {/* Heading principal */}
                        <h3 className="contact__cta-heading">
                            {renderRich(t("contact.cta.heading"))}
                        </h3>

                        {renderRichParagraphs(
                            t("contact.cta.lead"),
                            "contact__cta-desc",
                        )}

                        {/* ── Botão principal de email ──────────────── */}
                        <a
                            href={mailtoHref}
                            className="contact__email-btn"
                            aria-label={
                                lang === "pt"
                                    ? `Enviar e-mail para ${PROFILE.email} (abre cliente de e-mail)`
                                    : `Email ${PROFILE.email} (opens email client)`
                            }
                        >
                            <div
                                className="contact__email-btn-icon"
                                aria-hidden="true"
                            >
                                <IconEmail />
                            </div>

                            <div className="contact__email-btn-body">
                                <span className="contact__email-btn-label">
                                    {t("contact.email.now")}
                                </span>
                                <span className="contact__email-btn-value">
                                    {PROFILE.email}
                                </span>
                            </div>

                            <span
                                className="contact__email-btn-arrow"
                                aria-hidden="true"
                            >
                                ↗
                            </span>
                        </a>

                        {/* ── Separador ────────────────────────────── */}
                        <div className="contact__or" aria-hidden="true">
                            {lang === "pt" ? "ou" : "or"}
                        </div>

                        {/* ── Links alternativos ────────────────────── */}
                        <div className="contact__alt-links">
                            <a
                                href={PROFILE.social.linkedin.url}
                                className="contact__alt-link"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={
                                    lang === "pt"
                                        ? "Acessar LinkedIn de Guilherme Cruz (abre em nova aba)"
                                        : "Guilherme Cruz on LinkedIn (opens in new tab)"
                                }
                            >
                                <div
                                    className="contact__alt-link-icon"
                                    aria-hidden="true"
                                >
                                    <IconLinkedIn />
                                </div>
                                <div className="contact__alt-link-body">
                                    <span className="contact__alt-link-name">
                                        LinkedIn
                                    </span>
                                    <span className="contact__alt-link-handle">
                                        {PROFILE.social.linkedin.handle}
                                    </span>
                                </div>
                            </a>

                            <a
                                href={PROFILE.social.github.url}
                                className="contact__alt-link"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={
                                    lang === "pt"
                                        ? "Acessar GitHub de Guilherme Cruz (abre em nova aba)"
                                        : "Guilherme Cruz on GitHub (opens in new tab)"
                                }
                            >
                                <div
                                    className="contact__alt-link-icon"
                                    aria-hidden="true"
                                >
                                    <IconGitHub />
                                </div>
                                <div className="contact__alt-link-body">
                                    <span className="contact__alt-link-name">
                                        GitHub
                                    </span>
                                    <span className="contact__alt-link-handle">
                                        {PROFILE.social.github.handle}
                                    </span>
                                </div>
                            </a>
                        </div>

                        {/* ── Formulário direto (renderiza somente com
                               VITE_FORM_ENDPOINT configurado) ────────── */}
                        <ContactForm />
                    </div>

                    {/* ════════════════════════════════════════════════
                        COLUNA DIREITA — Perfil + Skills + Resposta
                    ════════════════════════════════════════════════ */}
                    <div
                        className="contact__info-card"
                        data-reveal
                        data-delay="2"
                    >
                        {/* ── Social / Contato ───────────────────────────── */}
                        <section
                            className="contact__profile"
                            aria-labelledby="profile-title"
                        >
                            {/* Header */}
                            <div className="contact__cta-eyebrow">
                                <div className="contact__cta-eyebrow">
                                    <div
                                        className="contact__cta-icon"
                                        aria-hidden="true"
                                    >
                                        <IconShare />
                                    </div>
                                    <span className="contact__cta-label">
                                        {t("contact.share")}
                                    </span>
                                </div>
                            </div>

                            {/* Links */}
                            <dl className="contact__profile-data">
                                {PROFILE_DATA.map((item) => (
                                    <div
                                        className="contact__data-row"
                                        key={resolve(item.label, "pt")}
                                    >
                                        <div
                                            className="contact__data-icon"
                                            aria-hidden="true"
                                        >
                                            {item.icon}
                                        </div>

                                        <div className="contact__data-content">
                                            <dt className="contact__data-label">
                                                {resolve(item.label, lang)}
                                            </dt>

                                            <dd className="contact__data-value">
                                                {item.href ? (
                                                    <ProfileLink
                                                        href={item.href}
                                                    >
                                                        {resolve(
                                                            item.value,
                                                            lang,
                                                        )}
                                                    </ProfileLink>
                                                ) : (
                                                    resolve(item.value, lang)
                                                )}
                                            </dd>

                                            <small className="contact__data-note">
                                                {t(item.noteKey)}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </dl>
                        </section>

                        {/* ── Disponibilidade ───────── */}
                        <aside
                            className="contact__response"
                            aria-label={
                                lang === "pt"
                                    ? "Disponibilidade para contato"
                                    : "Contact availability"
                            }
                        >
                            <div
                                className="contact__response-icon"
                                aria-hidden="true"
                            >
                                <IconBolt />
                            </div>

                            <div className="contact__response-text">
                                <p className="contact__response-title">
                                    {t("contact.meta.response")}
                                </p>
                                <p className="contact__response-sub">
                                    {t("contact.meta.location")}
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </section>
    );
};
