import React from "react";
import "./Contact.css";
import { useLang } from "@/shared/hooks/useLang";
import {
    IconEmail,
    IconLinkedIn,
    IconGitHub,
    IconLocation,
    IconBolt,
    IconDev,
    IconShare,
} from "@/shared/ui/Icons";
import {
    AUTHOR_EMAIL,
    GITHUB_URL,
    LINKEDIN_URL,
} from "@/shared/config/constants";

/* ═══════════════════════════════════════════════════════════════════════════
   DADOS ESTÁTICOS
═══════════════════════════════════════════════════════════════════════════ */

/* Skills ATS-friendly — keywords relevantes para recrutadores */
const SKILLS_BRAND = ["React", "TypeScript", "JavaScript", "HTML5", "CSS3"];
const SKILLS_ACCENT = ["Node.js", "MySQL", "REST APIs", "Git", "Python"];
const SKILLS_NEUTRAL = ["Clean Code", "Responsive Design", "Figma", "Vite"];

/* Dados de perfil estruturados (ATS-friendly) */
const PROFILE_DATA = [
    {
        icon: <IconEmail />,
        label: "E-mail",
        value: AUTHOR_EMAIL,
        href: `mailto:${AUTHOR_EMAIL}`,
        note: "Respondo em até 24h",
    },
    {
        icon: <IconLinkedIn />,
        label: "LinkedIn",
        value: "/in/oguilherme-cruz",
        href: LINKEDIN_URL,
        note: "Aberto a networking e oportunidades",
    },
    {
        icon: <IconGitHub />,
        label: "GitHub",
        value: "/https-shini",
        href: GITHUB_URL,
        note: "Projetos reais e código limpo",
    },
    {
        icon: <IconDev />,
        label: "Social Links",
        value: "DevLinks",
        href: "https://devlinks-rocketseat-five.vercel.app/",
        note: "Confira meus links sociais e projetos",
    },
    {
        icon: <IconLocation />,
        label: "Localização",
        value: "São Paulo, Brasil",
        href: null,
        note: "Disponível presencial e remoto",
    },
];

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════════════════ */
export const Contact: React.FC = () => {
    const { t } = useLang();

    /* Subject e body pré-preenchidos no mailto */
    const mailtoHref = [
        `mailto:${AUTHOR_EMAIL}`,
        `?subject=${encodeURIComponent("Oportunidade — Desenvolvedor Júnior")}`,
        `&body=${encodeURIComponent(
            "Olá, Guilherme!\n\nVi seu portfólio e gostaria de conversar sobre uma oportunidade.\n\n",
        )}`,
    ].join("");

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
                    <span className="section-eyebrow">Contato</span>

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

                    <p className="section-subtitle">{t("contact.sub")}</p>
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
                            Vamos <span>construir algo</span> juntos?
                        </h3>

                        <p className="contact__cta-desc">
                            Estou pronto para iniciar minha trajetória como{" "}
                            <strong>Desenvolvedor Júnior</strong> ou{" "}
                            <strong>Estagiário</strong>, contribuindo com{" "}
                            <strong>aplicações modernas</strong>,{" "}
                            <strong>bem estruturadas</strong> e voltadas para{" "}
                            <strong>performance</strong> e{" "}
                            <strong>experiência do usuário</strong>.
                        </p>

                        <p className="contact__cta-desc">
                            Se você procura alguém <strong>dedicado</strong>,
                            com <strong>vontade de evoluir</strong> e{" "}
                            <strong>
                                contribuir de forma prática em projetos reais
                            </strong>
                            , vamos conversar e construir{" "}
                            <strong>soluções juntos</strong>!
                        </p>

                        {/* ── Botão principal de email ──────────────── */}
                        <a
                            href={mailtoHref}
                            className="contact__email-btn"
                            aria-label={`Enviar e-mail para ${AUTHOR_EMAIL} (abre cliente de e-mail)`}
                        >
                            <div
                                className="contact__email-btn-icon"
                                aria-hidden="true"
                            >
                                <IconEmail />
                            </div>

                            <div className="contact__email-btn-body">
                                <span className="contact__email-btn-label">
                                    Enviar e-mail agora
                                </span>
                                <span className="contact__email-btn-value">
                                    {AUTHOR_EMAIL}
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
                            ou
                        </div>

                        {/* ── Links alternativos ────────────────────── */}
                        <div
                            className="contact__alt-links"
                            role="list"
                            aria-label="Outras formas de contato"
                        >
                            <a
                                href={LINKEDIN_URL}
                                className="contact__alt-link"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Acessar LinkedIn de Guilherme Cruz (abre em nova aba)"
                                role="listitem"
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
                                        /in/oguilherme-cruz
                                    </span>
                                </div>
                            </a>

                            <a
                                href={GITHUB_URL}
                                className="contact__alt-link"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Acessar GitHub de Guilherme Cruz (abre em nova aba)"
                                role="listitem"
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
                                        /https-shini
                                    </span>
                                </div>
                            </a>
                        </div>
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
                                        key={item.label}
                                    >
                                        <div
                                            className="contact__data-icon"
                                            aria-hidden="true"
                                        >
                                            {item.icon}
                                        </div>

                                        <div className="contact__data-content">
                                            <dt className="contact__data-label">
                                                {item.label}
                                            </dt>

                                            <dd className="contact__data-value">
                                                {item.href ? (
                                                    <a
                                                        href={item.href}
                                                        target={
                                                            item.href.startsWith(
                                                                "mailto",
                                                            )
                                                                ? undefined
                                                                : "_blank"
                                                        }
                                                        rel="noopener noreferrer"
                                                    >
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    item.value
                                                )}
                                            </dd>

                                            {item.note && (
                                                <small className="contact__data-note">
                                                    {item.note}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </dl>
                        </section>

                        {/* ── Disponibilidade ───────── */}
                        <aside
                            className="contact__response"
                            aria-label="Disponibilidade para contato"
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
