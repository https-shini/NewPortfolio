import React from "react";
import "./Hero.css";
import { useLang } from "@/shared/hooks/useLang";
import { renderRichParagraphs } from "@/shared/lib/richText";
import { scrollToSection } from "@/shared/lib/smoothScroll";
import {
    GITHUB_URL,
    LINKEDIN_URL,
    AUTHOR_EMAIL,
    getCvUrl,
    SECTION_IDS,
} from "@/shared/config/constants";
import {
    IconCode,
    IconDownload,
    IconGitHub,
    IconLinkedIn,
    IconGmail,
} from "@/shared/ui/Icons";
import avatarImg from "@/assets/avatar.webp";

export const Hero: React.FC = () => {
    const { t, lang } = useLang();
    const cvUrl = getCvUrl(lang);

    const handleScroll = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        scrollToSection(id);
    };

    return (
        <section
            id={SECTION_IDS.HOME}
            className="hero"
            aria-labelledby="hero-name"
        >
            <div className="hero__grid-bg" aria-hidden="true" />
            <div className="hero__glow" aria-hidden="true" />

            <div className="hero__inner">
                {/* ── Texto ── */}
                <div className="hero__content">
                    <div className="hero__status" role="status">
                        <span className="hero__status-dot" aria-hidden="true" />
                        <span>{t("hero.status")}</span>
                    </div>

                    <div className="hero__headline">
                        <p className="hero__greeting">{t("hero.greeting")}</p>
                        <h1 className="hero__name" id="hero-name">
                            Guilherme Cruz
                        </h1>
                        <p className="hero__role">{t("hero.role")}</p>
                    </div>
                    <div className="hero__desc">
                        {renderRichParagraphs(
                            t("hero.desc"),
                            "hero__desc-text",
                        )}
                    </div>

                    <div className="hero__actions">
                        <button
                            type="button"
                            className="btn btn--primary btn--lg"
                            onClick={(e) =>
                                handleScroll(
                                    e as unknown as React.MouseEvent,
                                    SECTION_IDS.WORK,
                                )
                            }
                        >
                            <IconCode />
                            <span>{t("hero.cta.work")}</span>
                        </button>
                        <a
                            href={cvUrl}
                            className="btn btn--outline btn--lg"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <IconDownload />
                            <span>{t("hero.cta.cv")}</span>
                        </a>
                    </div>

                    <div className="hero__social">
                        <span className="hero__social-label">Social</span>
                        <div
                            className="hero__social-divider"
                            aria-hidden="true"
                        />
                        <a
                            href={GITHUB_URL}
                            className="social-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={
                                lang === "pt"
                                    ? "GitHub de Guilherme Cruz"
                                    : "Guilherme Cruz on GitHub"
                            }
                        >
                            <IconGitHub />
                        </a>
                        <a
                            href={LINKEDIN_URL}
                            className="social-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={
                                lang === "pt"
                                    ? "LinkedIn de Guilherme Cruz"
                                    : "Guilherme Cruz on LinkedIn"
                            }
                        >
                            <IconLinkedIn />
                        </a>
                        <a
                            href={`mailto:${AUTHOR_EMAIL}`}
                            className="social-link"
                            aria-label={
                                lang === "pt"
                                    ? "Enviar e-mail para Guilherme Cruz"
                                    : "Email Guilherme Cruz"
                            }
                        >
                            <IconGmail />
                        </a>
                    </div>
                </div>

                {/* ── Foto ── */}
                <div className="hero__visual" aria-hidden="true">
                    <div className="hero__avatar-wrap">
                        <div className="hero__avatar-glow" />
                        <div className="hero__avatar-frame" />

                        <img
                            src={avatarImg}
                            alt="Guilherme Cruz"
                            className="hero__avatar"
                            width={380}
                            height={420}
                            loading="eager"
                            fetchPriority="high"
                            decoding="async"
                        />

                        <div className="hero__avatar-overlay" />
                        <div className="hero__avatar-shadow" />
                    </div>
                </div>
            </div>

            {/* ── Scroll ── */}
            <button
                type="button"
                className="hero__scroll"
                aria-label={
                    lang === "pt"
                        ? "Rolar para a próxima seção"
                        : "Scroll to the next section"
                }
                onClick={(e) => handleScroll(e, SECTION_IDS.ABOUT)}
            >
                <span className="hero__scroll-text">{t("hero.scroll")}</span>

                <div className="hero__scroll-line" aria-hidden="true">
                    <span className="hero__scroll-dot" />
                </div>
            </button>
        </section>
    );
};
