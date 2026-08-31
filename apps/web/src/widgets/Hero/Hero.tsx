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
/* Variantes geradas por `scripts/imagens.mjs`. O avatar mede 200px no
   celular e 380px a partir de 1440px; 480, 620 e 760 cobrem as combinações
   reais de tamanho × densidade. É imagem `eager` com prioridade alta — os bytes dela estão
   no caminho da LCP. */
import avatar480 from "@/assets/gerado/avatar-480.webp";
import avatar620 from "@/assets/gerado/avatar-620.webp";
import avatar760 from "@/assets/gerado/avatar-760.webp";

/* Stack em destaque no hero — nomes próprios, não traduzidos. */
const HERO_STACK = ["React", "Node.js", "Python", "SQL", "Docker", "Git"];

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

                    <ul
                        className="hero__stack"
                        aria-label={
                            lang === "pt"
                                ? "Principais tecnologias"
                                : "Core technologies"
                        }
                    >
                        {HERO_STACK.map((tech) => (
                            <li key={tech} className="hero__stack-item">
                                {tech}
                            </li>
                        ))}
                    </ul>

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
                            src={avatar760}
                            srcSet={`${avatar480} 480w, ${avatar620} 620w, ${avatar760} 760w`}
                            sizes="(min-width: 1440px) 380px, (min-width: 768px) 240px, 200px"
                            alt="Guilherme Cruz"
                            className="hero__avatar"
                            width={380}
                            height={420}
                            loading="eager"
                            /* Espalhado em minúsculo, que é o nome do
                               atributo em HTML. Os tipos do React trazem a
                               forma camelCase, mas o react-dom 18.3.1 em uso
                               não a reconhece e avisa no console a cada
                               carregamento — em produção, hoje, antes desta
                               mudança. Assim o atributo chega ao DOM e o
                               aviso some. */
                            {...{ fetchpriority: "high" }}
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
