import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Work.css";
import { useLang } from "@/shared/hooks/useLang";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import { useDevhubPinned } from "@/features/devhub/useDevhub";
import { ProjectCard } from "@/features/devhub/components/ProjectCard";
import type { Repository } from "@/features/devhub/types";
import { GITHUB_URL } from "@/shared/config/constants";
import { ROUTES } from "@/shared/config/routes";
import {
    IconArrowRight,
    IconChevronLeft,
    IconChevronRight,
    IconExternalLink,
    IconGitHub,
} from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   Work — a vitrine da home (#projetos)
   ─────────────────────────────────────────────────────────
   Todos os projetos FIXADOS no GitHub, na ordem escolhida lá, num
   carrossel que mostra três por vez (dois no tablet, um e um
   pedaço do próximo no celular — o "pedaço" avisa que há mais).

     cabeçalho → eyebrow · título · subtítulo
     barra     → "06 projetos em destaque" · "01–03 de 06" · ‹ ›
     trilho    → cartões (o ProjectCard único do site)
     dots      → uma bolinha por página
     rodapé    → "Explore o acervo completo" → /projetos

   O trilho é NATIVO (`overflow-x` + `scroll-snap`): arrastar,
   deslizar no trackpad e a inércia vêm do navegador. Setas, dots e
   teclado só pedem para rolar; a posição é lida de volta da rolagem.

   Acessibilidade: região "carrossel" rotulada; cada cartão é um
   grupo "slide" ("4 de 6"); ←/→ com o foco dentro navegam; a troca
   é anunciada numa região viva, só depois de uma ação do visitante;
   sem avanço automático. Cartões fora de vista continuam no Tab — ao
   receber foco, o navegador os traz para a vista.
───────────────────────────────────────────────────────── */

const pad = (n: number) => String(n).padStart(2, "0");

const Carousel: React.FC<{ repos: Repository[] }> = ({ repos }) => {
    const { t } = useLang();
    const trilhoRef = useRef<HTMLDivElement>(null);
    const [primeiro, setPrimeiro] = useState(0);
    const [porVez, setPorVez] = useState(3);
    const [interagiu, setInteragiu] = useState(false);
    const total = repos.length;

    /* Lê do layout quantos cabem e qual é o primeiro visível. */
    const medir = useCallback(() => {
        const trilho = trilhoRef.current;
        const item = trilho?.firstElementChild as HTMLElement | null;
        if (!trilho || !item || item.offsetWidth === 0) return;
        const gap = parseFloat(getComputedStyle(trilho).columnGap) || 0;
        const passo = item.offsetWidth + gap;
        setPorVez(
            Math.max(1, Math.floor((trilho.clientWidth + gap + 1) / passo)),
        );
        setPrimeiro(
            Math.min(
                total - 1,
                Math.max(0, Math.round(trilho.scrollLeft / passo)),
            ),
        );
    }, [total]);

    useEffect(() => {
        medir();
        const trilho = trilhoRef.current;
        if (!trilho || typeof ResizeObserver === "undefined") return;
        const obs = new ResizeObserver(medir);
        obs.observe(trilho);
        return () => obs.disconnect();
    }, [medir]);

    const ultimoInicio = Math.max(0, total - porVez);
    const inicio = Math.min(primeiro, ultimoInicio);
    const fim = Math.min(total, inicio + porVez);
    const paginas = Math.max(1, Math.ceil(total / porVez));
    const paginaAtual =
        inicio >= ultimoInicio ? paginas - 1 : Math.floor(inicio / porVez);

    const irPara = (indice: number) => {
        const trilho = trilhoRef.current;
        const alvo = Math.min(Math.max(0, indice), ultimoInicio);
        const item = trilho?.children[alvo] as HTMLElement | undefined;
        if (!trilho || !item) return;
        setInteragiu(true);
        const reduzir =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        trilho.scrollTo?.({
            left: item.offsetLeft - trilho.offsetLeft,
            behavior: reduzir ? "auto" : "smooth",
        });
        setPrimeiro(alvo);
    };

    const anterior = () => irPara(inicio - porVez);
    const proximo = () => irPara(inicio + porVez);

    const aoTeclar = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            anterior();
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            proximo();
        }
    };

    const intervalo = (fim - inicio === 1 ? t("work.single") : t("work.range"))
        .replace("{from}", pad(inicio + 1))
        .replace("{to}", pad(fim))
        .replace("{total}", pad(total));
    const temMais = total > porVez;

    return (
        <section
            className="work-carousel"
            aria-roledescription={t("work.carousel")}
            aria-label={t("work.featured")}
            onKeyDown={aoTeclar}
        >
            <div className="work__bar">
                <p className="work__count">
                    <strong>{pad(total)}</strong>
                    <span>{t("work.featured")}</span>
                </p>
                {temMais && (
                    <div className="work__nav">
                        <p className="work__range" aria-hidden="true">
                            {intervalo}
                        </p>
                        <button
                            type="button"
                            className="work__arrow"
                            onClick={anterior}
                            disabled={inicio === 0}
                            aria-label={t("work.prev")}
                        >
                            <IconChevronLeft
                                width={18}
                                height={18}
                                aria-hidden
                            />
                        </button>
                        <button
                            type="button"
                            className="work__arrow"
                            onClick={proximo}
                            disabled={inicio >= ultimoInicio}
                            aria-label={t("work.next")}
                        >
                            <IconChevronRight
                                width={18}
                                height={18}
                                aria-hidden
                            />
                        </button>
                    </div>
                )}
            </div>

            {/* div, não ul: os itens são grupos "slide" (padrão de
                carrossel), e uma lista só pode conter itens de lista. */}
            <div
                ref={trilhoRef}
                className="work__track"
                onScroll={medir}
                data-fits={!temMais || undefined}
            >
                {repos.map((repo, i) => (
                    <div
                        key={repo.id}
                        className="work__slide"
                        role="group"
                        aria-roledescription={t("work.slide")}
                        aria-label={t("work.slideOf")
                            .replace("{n}", String(i + 1))
                            .replace("{total}", String(total))}
                    >
                        <ProjectCard repo={repo} index={i} variant="featured" />
                    </div>
                ))}
            </div>

            {temMais && paginas > 1 && (
                <div
                    className="work__dots"
                    role="group"
                    aria-label={t("work.pages")}
                >
                    {Array.from({ length: paginas }, (_, p) => (
                        <button
                            key={p}
                            type="button"
                            className="work__dot"
                            aria-current={
                                p === paginaAtual ? "true" : undefined
                            }
                            aria-label={t("work.goTo").replace(
                                "{n}",
                                String(p + 1),
                            )}
                            onClick={() => irPara(p * porVez)}
                        >
                            <span />
                        </button>
                    ))}
                </div>
            )}

            <p className="sr-only" aria-live="polite" aria-atomic="true">
                {interagiu
                    ? t("work.announce")
                          .replace("{from}", String(inicio + 1))
                          .replace("{to}", String(fim))
                          .replace("{total}", String(total))
                    : ""}
            </p>
        </section>
    );
};

export const Work: React.FC = () => {
    const { t } = useLang();
    const { data, loading, error } = useDevhubPinned();
    const catalogo = useLinkProps(ROUTES.PROJECTS);
    const repos = data?.repositories ?? [];

    return (
        <section
            id="projetos"
            className="work section"
            aria-labelledby="work-title"
            data-reveal
        >
            <div className="container">
                <header className="work__head section-header">
                    <span className="section-eyebrow">{t("work.eyebrow")}</span>
                    <h2 className="section-title" id="work-title">
                        {t("work.title")}
                    </h2>
                    <p className="section-subtitle work__sub">
                        {t("work.sub")}
                    </p>
                </header>

                {loading && (
                    <ul
                        className="work__track work__track--skeleton"
                        aria-busy="true"
                        aria-label={t("work.loading")}
                    >
                        {[0, 1, 2].map((i) => (
                            <li
                                key={i}
                                className="work__skeleton"
                                aria-hidden="true"
                            >
                                <span className="work__skeleton-media" />
                                <span className="work__skeleton-line work__skeleton-line--short" />
                                <span className="work__skeleton-line work__skeleton-line--title" />
                                <span className="work__skeleton-line" />
                            </li>
                        ))}
                    </ul>
                )}

                {!loading && (error || repos.length === 0) && (
                    <p className="work__state" role="status">
                        {t("work.error")}
                    </p>
                )}

                {!loading && repos.length > 0 && <Carousel repos={repos} />}

                {/* Próximo passo: o acervo inteiro, com busca e filtros. */}
                <div className="work__more">
                    <div className="work__more-text">
                        <p className="work__more-title">
                            {t("work.moreTitle")}
                        </p>
                        <p className="work__more-desc">{t("work.moreDesc")}</p>
                    </div>
                    <div className="work__more-actions">
                        <a
                            className="work-btn work-btn--primary"
                            {...catalogo.anchorProps}
                        >
                            {t("work.viewAll")}
                            <IconArrowRight
                                className="work-btn__icon work-btn__icon--go"
                                width={18}
                                height={18}
                                aria-hidden
                            />
                        </a>
                        <a
                            href={GITHUB_URL}
                            className="work-btn work-btn--ghost"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${t("work.more")} (${t("card.newTab")})`}
                        >
                            <IconGitHub
                                className="work-btn__icon"
                                width={18}
                                height={18}
                                aria-hidden
                            />
                            {t("work.more")}
                            <IconExternalLink
                                className="work-btn__icon"
                                width={13}
                                height={13}
                                aria-hidden
                            />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
