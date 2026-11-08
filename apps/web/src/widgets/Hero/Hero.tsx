import React from "react";
import "./Hero.css";
import { ProfileLink } from "@/shared/ui/ProfileLink";
import { useLang } from "@/shared/hooks/useLang";
import { renderRichParagraphs } from "@/shared/lib/richText";
import { scrollToSection } from "@/shared/lib/smoothScroll";
import { PROFILE } from "@/shared/config/profile";
import {
    GITHUB_URL,
    LINKEDIN_URL,
    AUTHOR_EMAIL,
    getCvUrl,
    SECTION_IDS,
} from "@/shared/config/constants";
import {
    IconArrowDown,
    IconCode,
    IconDownload,
    IconGitHub,
    IconLinkedIn,
    IconGmail,
} from "@/shared/ui/Icons";
/* Variantes geradas por `scripts/imagens.mjs` a partir de um retrato
   quadrado de 760px. O cartão mede até 520px de largura em Full HD; 480,
   620 e 760 cobrem tamanho × densidade. Imagem `eager` com prioridade
   alta: em desktop ela é a maior área pintada da primeira tela, então os
   bytes dela estão no caminho da LCP. */
import avatar480 from "@/assets/gerado/avatar-480.webp";
import avatar620 from "@/assets/gerado/avatar-620.webp";
import avatar760 from "@/assets/gerado/avatar-760.webp";

/* ─────────────────────────────────────────────────────────
   Hero — a primeira tela, composta para 1920×1080
   ─────────────────────────────────────────────────────────
   Mesma gramática do topo da /projetos: rótulo em mono, título em
   escala de capa, texto na medida de leitura, um bloco lateral e um
   painel de fatos dividido por filetes. Em Full HD tudo cabe na
   primeira dobra: linha superior, nome e cargo, texto, ações, retrato
   e a faixa de fatos.

   Nenhum dado é inventado aqui: rótulo, atuação e base vêm de PROFILE;
   a stack é a lista curta abaixo; o texto vem de translations.json.
───────────────────────────────────────────────────────── */

/* Stack em destaque — nomes próprios, não traduzidos. */
const HERO_STACK = ["React", "Node.js", "Python", "SQL", "Docker", "Git"];

export const Hero: React.FC = () => {
    const { t, lang } = useLang();
    const cvUrl = getCvUrl(lang);

    const irPara = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        scrollToSection(id);
    };

    return (
        <section
            id={SECTION_IDS.HOME}
            className="hero"
            aria-labelledby="hero-name"
        >
            <div className="container hero__grid">
                {/* ── Linha superior: atravessa as duas colunas — rótulo à
                    esquerda, status alinhado à borda do retrato. */}
                <div className="hero__topline">
                    <p className="section-eyebrow hero__eyebrow">
                        {t("hero.sub")} · {PROFILE.location[lang]}
                    </p>
                    <p className="hero__status" role="status">
                        <span className="hero__status-dot" aria-hidden="true" />
                        {t("hero.status")}
                    </p>
                </div>

                {/* ── Coluna principal ─────────────────────────────── */}
                <div className="hero__main">
                    <div className="hero__headline">
                        <p className="hero__greeting">{t("hero.greeting")}</p>
                        <h1 className="hero__name" id="hero-name">
                            {PROFILE.name}
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
                        <div className="hero__ctas">
                            <button
                                type="button"
                                className="btn btn--primary btn--lg"
                                onClick={(e) => irPara(e, SECTION_IDS.WORK)}
                            >
                                <IconCode />
                                <span>{t("hero.cta.work")}</span>
                            </button>
                            <ProfileLink
                                href={cvUrl}
                                className="btn btn--outline btn--lg"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <IconDownload />
                                <span>{t("hero.cta.cv")}</span>
                            </ProfileLink>
                        </div>

                        <div
                            className="hero__social"
                            role="group"
                            aria-label={t("hero.social.label")}
                        >
                            <span
                                className="hero__social-label"
                                aria-hidden="true"
                            >
                                {t("hero.social.label")}
                            </span>
                            <ProfileLink
                                href={GITHUB_URL}
                                className="social-link"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t("hero.social.github")}
                            >
                                <IconGitHub />
                            </ProfileLink>
                            <ProfileLink
                                href={LINKEDIN_URL}
                                className="social-link"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t("hero.social.linkedin")}
                            >
                                <IconLinkedIn />
                            </ProfileLink>
                            <ProfileLink
                                href={`mailto:${AUTHOR_EMAIL}`}
                                className="social-link"
                                aria-label={t("hero.social.email")}
                            >
                                <IconGmail />
                            </ProfileLink>
                        </div>
                    </div>
                </div>

                {/* ── Retrato ─────────────────────────────────────────
                    Decorativo: o nome já está no h1. A barra em mono
                    repete a convenção dos cartões da /projetos
                    (`$ cd ~/projeto`). */}
                <figure className="hero__portrait" aria-hidden="true">
                    <div className="hero__portrait-media">
                        <img
                            src={avatar760}
                            srcSet={`${avatar480} 480w, ${avatar620} 620w, ${avatar760} 760w`}
                            sizes="(min-width: 1440px) 520px, (min-width: 1024px) 340px, (min-width: 641px) 320px, 280px"
                            alt=""
                            className="hero__avatar"
                            width={460}
                            height={575}
                            loading="eager"
                            /* Minúsculo, que é o nome do atributo em HTML:
                               o react-dom 18.3.1 não reconhece a forma
                               camelCase e avisaria no console. */
                            {...{ fetchpriority: "high" }}
                            decoding="async"
                        />
                    </div>
                    <figcaption className="hero__portrait-bar">
                        <span className="hero__portrait-prompt">$ whoami</span>
                        <span className="hero__portrait-user">
                            guilherme-cruz
                        </span>
                        <span className="hero__portrait-dot" />
                    </figcaption>
                </figure>
            </div>

            {/* ── Faixa de fatos ──────────────────────────────────────── */}
            <div className="container">
                <div className="hero__facts">
                    <dl className="hero__facts-list">
                        <div className="hero__fact hero__fact--stack">
                            <dt>{t("hero.facts.stack")}</dt>
                            <dd>
                                <ul className="hero__stack">
                                    {HERO_STACK.map((tech) => (
                                        <li
                                            key={tech}
                                            className="hero__stack-item"
                                        >
                                            {tech}
                                        </li>
                                    ))}
                                </ul>
                            </dd>
                        </div>
                        <div className="hero__fact">
                            <dt>{t("hero.facts.focus")}</dt>
                            <dd>{PROFILE.roles.join(" · ")}</dd>
                        </div>
                        <div className="hero__fact">
                            <dt>{t("hero.facts.base")}</dt>
                            <dd>{PROFILE.location[lang]}</dd>
                        </div>
                    </dl>

                    <button
                        type="button"
                        className="hero__scroll"
                        aria-label={t("hero.scrollLabel")}
                        onClick={(e) => irPara(e, SECTION_IDS.ABOUT)}
                    >
                        <span>{t("hero.scroll")}</span>
                        <IconArrowDown aria-hidden="true" />
                    </button>
                </div>
            </div>
        </section>
    );
};
