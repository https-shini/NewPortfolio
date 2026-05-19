import React from "react";
import "./Hero.css";
import { useLang } from "@/shared/hooks/useLang";
import { scrollToSection } from "@/shared/lib/smoothScroll";
import {
    GITHUB_URL,
    LINKEDIN_URL,
    AUTHOR_EMAIL,
    CV_URL,
    SECTION_IDS,
} from "@/shared/config/constants";
import {
    IconCode,
    IconDownload,
    IconGitHub,
    IconLinkedIn,
    IconGmail,
    IconSocial,
} from "@/shared/ui/Icons";

export const Hero: React.FC = () => {
    const { t } = useLang();

    const handleScroll = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        scrollToSection(id);
    };

    return (
        <section id={SECTION_IDS.HOME} className="hero" aria-labelledby="hero-name">
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
                        <p
                            className="hero__role"
                            aria-label="Desenvolvedor Junior"
                        >
                            {t("hero.role")}
                        </p>
                    </div>
                    <p className="hero__desc">
                        Estudante de Ciência da Computação em busca da primeira
                        oportunidade como <strong>Desenvolvedor Júnior</strong>{" "}
                        ou <strong>Estagiário</strong>.<br></br>
                        Experiência prática com{" "}
                        <strong>React, Node.js e MySQL</strong> no
                        desenvolvimento de aplicações web. Busco evoluir
                        tecnicamente e contribuir com soluções eficientes em um
                        ambiente colaborativo.
                    </p>

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
                            href={CV_URL}
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
                            href="https://github.com/https-shini"
                            className="social-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub de Guilherme Cruz"
                        >
                            <IconGitHub />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/oguilherme-cruz/"
                            className="social-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn de Guilherme Cruz"
                        >
                            <IconLinkedIn />
                        </a>
                        <a
                            href="mailto:guilherme.cruz@gmail.com"
                            className="social-link"
                            aria-label="Enviar e-mail para Guilherme Cruz"
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
                            src="https://raw.githubusercontent.com/https-shini/vite-portfolio/refs/heads/main/public/destaque/Icons/avatar.png"
                            alt="Guilherme Cruz"
                            className="hero__avatar"
                            width={380}
                            height={420}
                            loading="eager"
                            fetchPriority="high"
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
                aria-label="Rolar para a próxima seção"
                onClick={(e) => handleScroll(e, SECTION_IDS.ABOUT)}
            >
                <span className="hero__scroll-text">Explorar</span>

                <div className="hero__scroll-line" aria-hidden="true">
                    <span className="hero__scroll-dot" />
                </div>
            </button>
        </section>
    );
};
