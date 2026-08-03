import React, { useState, useCallback } from "react";
import "./Links.css";
import { LinkCard } from "./components/LinkCard";
import { ParticleField } from "./components/ParticleField";
import { useLang } from "@/shared/hooks/useLang";
import { useTheme } from "@/shared/hooks/useTheme";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import {
    IconSun,
    IconMoon,
    IconTranslate,
    IconShare,
    IconCheck,
    IconDownload,
    IconLink,
    IconGmail,
} from "@/shared/ui/Icons";
import { PROFILE } from "@/shared/config/profile";
import { ROUTES } from "@/shared/config/routes";
import { getCvUrl } from "@/shared/config/constants";
import { PRIMARY_LINKS, SOCIAL_LINKS, siteDomain } from "@/shared/config/links";
import avatarImg from "@/assets/hero.webp";

/* Ícones de tecnologia — skill-icons (tandpfun, MIT); sql-* criado no
   mesmo modelo. Variante por tema (dark/light); Docker e Git têm fundo
   de marca próprio e não variam. Ver src/assets/skills/CREDITS.md. */
import reactDark from "@/assets/skills/react-dark.svg";
import reactLight from "@/assets/skills/react-light.svg";
import nodejsDark from "@/assets/skills/nodejs-dark.svg";
import nodejsLight from "@/assets/skills/nodejs-light.svg";
import pythonDark from "@/assets/skills/python-dark.svg";
import pythonLight from "@/assets/skills/python-light.svg";
import sqlDark from "@/assets/skills/sql-dark.svg";
import sqlLight from "@/assets/skills/sql-light.svg";
import dockerIcon from "@/assets/skills/docker.svg";
import gitIcon from "@/assets/skills/git.svg";

/* Stack em destaque — ícones skill-icons, variante conforme o tema.
   `light`/`dark` apontam para o mesmo asset quando não há variante. */
interface Tech {
    label: string;
    dark: string;
    light: string;
}

const TECH_STACK: readonly Tech[] = [
    { label: "React", dark: reactDark, light: reactLight },
    { label: "Node.js", dark: nodejsDark, light: nodejsLight },
    { label: "Python", dark: pythonDark, light: pythonLight },
    { label: "SQL", dark: sqlDark, light: sqlLight },
    { label: "Docker", dark: dockerIcon, light: dockerIcon },
    { label: "Git", dark: gitIcon, light: gitIcon },
];

export const LinksPage: React.FC = () => {
    const { lang, toggleLang, t } = useLang();
    const { theme, toggleTheme } = useTheme();
    const [copied, setCopied] = useState(false);

    const isDark = theme === "dark";
    const shareUrl = `${PROFILE.siteUrl}${ROUTES.LINKS}`;
    const year = new Date().getFullYear();

    useDocumentMeta({
        title: `${t("links.pageTitle")} — ${PROFILE.fullName}`,
        description: t("links.meta.description"),
        path: ROUTES.LINKS,
    });

    const handleShare = useCallback(async () => {
        /* Share nativo quando existe: o próprio SO confirma a ação, então
           não há o que sinalizar aqui. Cancelar não é erro — e não pode
           acender o "Copiado!", que era o bug do protótipo. */
        if (navigator.share) {
            try {
                await navigator.share({
                    title: PROFILE.fullName,
                    url: shareUrl,
                });
            } catch {
                /* usuário cancelou o compartilhamento */
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            /* clipboard indisponível (contexto inseguro ou sem permissão) */
        }
    }, [shareUrl]);

    const themeLabel =
        theme === "dark"
            ? lang === "pt"
                ? "Alternar para modo claro"
                : "Switch to light mode"
            : lang === "pt"
              ? "Alternar para modo escuro"
              : "Switch to dark mode";

    return (
        <>
            <a href="#linktree-main" className="skip-link">
                {t("links.skip")}
            </a>

            {/* ── Fundos ambientes ── */}
            <div className="linktree__grid" aria-hidden="true" />
            <div className="linktree__overlay" aria-hidden="true" />
            <ParticleField />

            {/* ── Controles ── */}
            <div className="linktree__controls">
                <button
                    type="button"
                    className="linktree__ctrl linktree__ctrl--lang"
                    onClick={toggleLang}
                    aria-label={
                        lang === "pt"
                            ? "Switch to English"
                            : "Mudar para Português"
                    }
                >
                    <IconTranslate width={15} height={15} />
                    <span>{lang === "pt" ? "EN" : "PT"}</span>
                </button>

                {/* Mostra a AÇÃO, não o estado — mesma convenção do Header. */}
                <button
                    type="button"
                    className="linktree__ctrl linktree__ctrl--icon"
                    onClick={toggleTheme}
                    aria-pressed={isDark}
                    aria-label={themeLabel}
                >
                    {isDark ? (
                        <IconSun width={16} height={16} />
                    ) : (
                        <IconMoon width={16} height={16} />
                    )}
                </button>
            </div>

            <main id="linktree-main" className="linktree">
                {/* ── Perfil ── */}
                <div
                    className="linktree__avatar reveal-item"
                    style={{ "--reveal-i": 0 } as React.CSSProperties}
                >
                    <span
                        className="linktree__avatar-glow"
                        aria-hidden="true"
                    />
                    <span
                        className="linktree__avatar-ring"
                        aria-hidden="true"
                    />
                    <div className="linktree__avatar-frame">
                        <img
                            src={avatarImg}
                            alt={PROFILE.fullName}
                            className="linktree__avatar-img"
                            width={120}
                            height={120}
                            loading="eager"
                            decoding="async"
                        />
                    </div>
                    <span
                        className="linktree__status"
                        title={t("links.available")}
                        aria-hidden="true"
                    />
                </div>

                <h1
                    className="linktree__name reveal-item"
                    style={{ "--reveal-i": 1 } as React.CSSProperties}
                >
                    {PROFILE.fullName}
                </h1>

                <p
                    className="linktree__handle reveal-item"
                    style={{ "--reveal-i": 2 } as React.CSSProperties}
                >
                    {PROFILE.handle}
                </p>

                <p
                    className="linktree__roles reveal-item"
                    style={{ "--reveal-i": 3 } as React.CSSProperties}
                >
                    {PROFILE.roles.map((role, i) => (
                        <React.Fragment key={role}>
                            {i > 0 && (
                                <i
                                    className="linktree__roles-dot"
                                    aria-hidden="true"
                                />
                            )}
                            <span>{role}</span>
                        </React.Fragment>
                    ))}
                </p>

                <p
                    className="linktree__bio reveal-item"
                    style={{ "--reveal-i": 4 } as React.CSSProperties}
                >
                    {t("links.bio")}
                </p>

                <ul
                    className="linktree__chips reveal-item"
                    style={{ "--reveal-i": 5 } as React.CSSProperties}
                    aria-label={t("links.techLabel")}
                >
                    {TECH_STACK.map((tech) => (
                        <li key={tech.label} className="linktree__chip">
                            <img
                                className="linktree__chip-ic"
                                src={isDark ? tech.dark : tech.light}
                                alt=""
                                width={18}
                                height={18}
                                loading="lazy"
                                decoding="async"
                            />
                            {tech.label}
                        </li>
                    ))}
                </ul>

                {/* ── Links primários ── */}
                <nav
                    className="linktree__links"
                    aria-label={t("links.mainLinks")}
                >
                    {PRIMARY_LINKS.map((link, i) => (
                        <LinkCard key={link.id} link={link} index={i + 6} />
                    ))}
                </nav>

                {/* ── Redes secundárias ── */}
                {SOCIAL_LINKS.length > 0 && (
                    <nav
                        className="linktree__socials reveal-item"
                        style={
                            {
                                "--reveal-i": 6 + PRIMARY_LINKS.length,
                            } as React.CSSProperties
                        }
                        aria-label={t("links.socialLinks")}
                    >
                        {SOCIAL_LINKS.map((link) => {
                            const Icon = link.icon;
                            return (
                                <a
                                    key={link.id}
                                    className="social-link"
                                    href={link.href}
                                    aria-label={
                                        link.external
                                            ? `${link.label[lang]} (${t("links.newTab")})`
                                            : link.label[lang]
                                    }
                                    {...(link.external
                                        ? {
                                              target: "_blank",
                                              rel: "noopener noreferrer",
                                          }
                                        : {})}
                                >
                                    <Icon width={20} height={20} />
                                </a>
                            );
                        })}
                    </nav>
                )}

                {/* ── Ações ── */}
                <div
                    className="linktree__actions reveal-item"
                    style={
                        {
                            "--reveal-i": 7 + PRIMARY_LINKS.length,
                        } as React.CSSProperties
                    }
                >
                    <a
                        className="btn btn--primary"
                        href={getCvUrl(lang)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <IconDownload width={16} height={16} />
                        <span>{t("links.cv")}</span>
                    </a>

                    <button
                        type="button"
                        className={`btn btn--outline${copied ? " is-copied" : ""}`}
                        onClick={handleShare}
                    >
                        {copied ? (
                            <IconCheck width={16} height={16} />
                        ) : (
                            <IconShare width={16} height={16} />
                        )}
                        <span>
                            {copied ? t("links.copied") : t("links.share")}
                        </span>
                    </button>
                </div>

                {/* ── Footer ── */}
                <footer
                    className="linktree__foot reveal-item"
                    style={
                        {
                            "--reveal-i": 8 + PRIMARY_LINKS.length,
                        } as React.CSSProperties
                    }
                >
                    <div
                        className="linktree__foot-divider"
                        aria-hidden="true"
                    />

                    <div className="linktree__foot-links">
                        <a
                            className="linktree__foot-link"
                            href={PROFILE.siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <IconLink width={14} height={14} />
                            {siteDomain}
                        </a>
                        <span className="linktree__foot-sep" aria-hidden="true">
                            ·
                        </span>
                        <a
                            className="linktree__foot-link"
                            href={`mailto:${PROFILE.email}`}
                        >
                            <IconGmail width={14} height={14} />
                            {PROFILE.email}
                        </a>
                    </div>

                    <p className="linktree__foot-name">
                        {PROFILE.fullName} <span>· {PROFILE.handle}</span>
                    </p>

                    <p className="linktree__foot-text">
                        {t("links.madeWith")}{" "}
                        <span className="linktree__heart" aria-hidden="true">
                            ♥
                        </span>{" "}
                        {t("links.builtWith")}
                    </p>

                    <a
                        className="linktree__foot-brand"
                        href={PROFILE.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        © {year} {siteDomain.replace(/\.dev\.br$/, "")}
                        <b>.dev.br</b>
                    </a>
                </footer>
            </main>
        </>
    );
};
