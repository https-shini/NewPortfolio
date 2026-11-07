import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Work.css";
import { useLang } from "@/shared/hooks/useLang";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import { useDevhubPinned } from "@/features/devhub/useDevhub";
import { RepoThumb } from "@/features/devhub/components/RepoThumb";
import { formatNumber, formatRelativeDate } from "@/features/devhub/format";
import { lastActivity } from "@/features/devhub/selectors";
import {
    NEUTRAL_LANGUAGE_COLOR,
    type Repository,
} from "@/features/devhub/types";
import { GITHUB_URL } from "@/shared/config/constants";
import { PROFILE } from "@/shared/config/profile";
import { ROUTES, projectPath } from "@/shared/config/routes";
import {
    IconArrowRight,
    IconChevronLeft,
    IconChevronRight,
    IconCode,
    IconExternalLink,
    IconGitBranch,
    IconGitHub,
    IconStar,
} from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   Work — a vitrine da home (#projetos), em carrossel
   ─────────────────────────────────────────────────────────
   Os slides são os repositórios FIXADOS no perfil do GitHub, na
   ordem escolhida lá. Um projeto por vez, num card grande com a
   imagem de um lado e as informações do outro — o lado alterna a
   cada projeto (desktop); no mobile, imagem em cima.

   Composição (mesma gramática do "Projeto em destaque" logo acima):
     cabeçalho  → eyebrow + selo de sincronização · título · subtítulo
     carrossel  → card na largura do container (alinhado ao título)
     barra      → contador · progresso · dots · setas, numa linha só
     rodapé     → faixa "acervo completo" com os dois CTAs

   O trilho é NATIVO: `overflow-x` + `scroll-snap`. Arrastar no
   celular, deslizar no trackpad e a inércia vêm do navegador, sem
   biblioteca e sem código de toque próprio. Setas, dots, teclado
   e o contador só pedem ao trilho para rolar até um slide; o índice
   atual é lido de volta da posição de rolagem — uma fonte só.

   Acessibilidade (padrão de carrossel do WAI-ARIA APG):
     · região com `aria-roledescription="carousel"`;
     · cada slide é um grupo "slide", rotulado "3 de 6";
     · slides fora de vista ficam `inert` — o Tab percorre só o
       projeto visível, e setas/dots levam a todos os outros;
     · ←/→, Home e End navegam com o foco dentro do carrossel;
     · a troca é anunciada numa região viva, só depois de uma ação
       do visitante (nada é lido ao carregar a página);
     · sem avanço automático: o controle é sempre de quem visita.
───────────────────────────────────────────────────────── */

const BADGE_VARIANTS = ["brand", "accent", "neutral"] as const;
const MAX_LINGUAGENS = 4;
const MAX_DESTAQUES = 6;

const pad = (n: number) => String(n).padStart(2, "0");

/* ─────────────────────────────────────────────────────────
   Slide
───────────────────────────────────────────────────────── */

const WorkSlide: React.FC<{
    repo: Repository;
    index: number;
    total: number;
    ativo: boolean;
}> = ({ repo, index, total, ativo }) => {
    const { lang, t } = useLang();
    const detalhes = useLinkProps(projectPath(repo.name));
    const tituloId = `project-${repo.id}`;
    const lado = index % 2 === 0 ? "start" : "end";
    const atividade = new Date(lastActivity(repo)).toISOString();

    /* Até quatro linguagens, das maiores para as menores; sem divisão
       medida, fica a primária. */
    const linguagens = (
        repo.languages.length > 0
            ? repo.languages
            : repo.primaryLanguage
              ? [repo.primaryLanguage]
              : []
    ).slice(0, MAX_LINGUAGENS);

    /* "Destaques" são os tópicos que o próprio repositório declara no
       GitHub — dado real, nunca texto escrito aqui. Sem tópicos, a
       lista não aparece. */
    const destaques = repo.topics.slice(0, MAX_DESTAQUES);

    return (
        <article
            className="work-card"
            data-media={lado}
            data-active={ativo || undefined}
            role="group"
            aria-roledescription="slide"
            aria-label={`${repo.name} — ${t("work.slide")
                .replace("{n}", String(index + 1))
                .replace("{total}", String(total))}`}
        >
            <div className="work-card__media">
                {/* Moldura de janela: a linguagem de terminal/IDE do site.
                    Decorativa — o nome já está no título. */}
                <div className="work-card__window">
                    <div className="work-card__bar" aria-hidden="true">
                        <span className="work-card__dots">
                            <span />
                            <span />
                            <span />
                        </span>
                        <span className="work-card__path">
                            ~/{PROFILE.githubUsername}/{repo.name}
                        </span>
                    </div>
                    <div className="work-card__thumb">
                        <RepoThumb repo={repo} className="work-card__img" />
                    </div>
                </div>
            </div>

            <div className="work-card__body">
                <p className="work-card__eyebrow">
                    <span className="work-card__index" aria-hidden="true">
                        {pad(index + 1)}
                    </span>
                    {repo.primaryLanguage && (
                        <span className="work-card__lang">
                            <span
                                className="work-card__lang-dot"
                                style={{
                                    background:
                                        repo.primaryLanguage.color ??
                                        NEUTRAL_LANGUAGE_COLOR,
                                }}
                                aria-hidden="true"
                            />
                            {repo.primaryLanguage.name}
                        </span>
                    )}
                </p>

                <h3 className="work-card__title" id={tituloId}>
                    {repo.name}
                </h3>

                <p className="work-card__desc">
                    {repo.description ?? (
                        <em className="work-card__nodesc">
                            {t("work.noDescription")}
                        </em>
                    )}
                </p>

                {linguagens.length > 0 && (
                    <ul
                        className="work-card__tech"
                        aria-label={t("work.block.stack")}
                    >
                        {linguagens.map((l, i) => (
                            <li
                                key={l.name}
                                className={`badge badge--${BADGE_VARIANTS[i % BADGE_VARIANTS.length]}`}
                            >
                                {l.name}
                            </li>
                        ))}
                    </ul>
                )}

                {destaques.length > 0 && (
                    <div className="work-card__highlights">
                        <h4 className="work-card__label">
                            {t("work.highlights")}
                        </h4>
                        <ul className="work-card__topics">
                            {destaques.map((topico) => (
                                <li key={topico}>#{topico}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <dl className="work-card__facts" aria-label={t("work.facts")}>
                    <div className="work-card__fact">
                        <dt>
                            <IconStar width={13} height={13} aria-hidden />
                            <span className="sr-only">
                                {t("devhub.card.stars")}
                            </span>
                        </dt>
                        <dd>{formatNumber(repo.stargazerCount, lang)}</dd>
                    </div>
                    <div className="work-card__fact">
                        <dt>
                            <IconGitBranch width={13} height={13} aria-hidden />
                            <span className="sr-only">
                                {t("devhub.card.forks")}
                            </span>
                        </dt>
                        <dd>{formatNumber(repo.forkCount, lang)}</dd>
                    </div>
                    <div className="work-card__fact">
                        <dt>{t("devhub.card.updated")}</dt>
                        <dd>
                            <time dateTime={atividade}>
                                {formatRelativeDate(atividade, lang)}
                            </time>
                        </dd>
                    </div>
                    {repo.licenseName && (
                        <div className="work-card__fact">
                            <dt className="sr-only">
                                {t("devhub.detail.license")}
                            </dt>
                            <dd>{repo.licenseName}</dd>
                        </div>
                    )}
                </dl>

                <div className="work-card__actions">
                    {repo.homepageUrl ? (
                        <a
                            href={repo.homepageUrl}
                            className="work-btn work-btn--primary"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${t("work.btn.demo")} — ${repo.name}`}
                        >
                            {t("work.btn.demo")}
                            <IconExternalLink
                                className="work-btn__icon work-btn__icon--go"
                                width={15}
                                height={15}
                                aria-hidden="true"
                            />
                        </a>
                    ) : (
                        <a
                            className="work-btn work-btn--primary"
                            {...detalhes.anchorProps}
                            aria-label={`${t("work.btn.details")} — ${repo.name}`}
                        >
                            {t("work.btn.details")}
                            <IconArrowRight
                                className="work-btn__icon work-btn__icon--go"
                                width={16}
                                height={16}
                                aria-hidden="true"
                            />
                        </a>
                    )}

                    <a
                        href={repo.url}
                        className="work-btn work-btn--ghost"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t("work.btn.code")} — ${repo.name}`}
                    >
                        <IconCode
                            className="work-btn__icon"
                            width={15}
                            height={15}
                            aria-hidden="true"
                        />
                        {t("work.btn.code")}
                    </a>

                    {/* Com demo, "Detalhes" vira o terceiro caminho — mais
                        leve, mas presente: a página do projeto continua a
                        um clique em todo slide. */}
                    {repo.homepageUrl && (
                        <a
                            className="work-btn work-btn--link"
                            {...detalhes.anchorProps}
                            aria-label={`${t("work.btn.details")} — ${repo.name}`}
                        >
                            {t("work.btn.details")}
                            <IconArrowRight
                                className="work-btn__icon work-btn__icon--go"
                                width={14}
                                height={14}
                                aria-hidden="true"
                            />
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
};

/* ─────────────────────────────────────────────────────────
   Carrossel
───────────────────────────────────────────────────────── */

const Carousel: React.FC<{ repos: Repository[] }> = ({ repos }) => {
    const { t } = useLang();
    const trilhoRef = useRef<HTMLDivElement>(null);
    const [atual, setAtual] = useState(0);
    /* Vira `true` na primeira ação do visitante (seta, dot, tecla, gesto). */
    const [interagiu, setInteragiu] = useState(false);
    const total = repos.length;

    /* Destino de uma navegação programada (seta, dot, teclado). Enquanto
       o trilho rola até lá, a posição passa pelos slides do meio — sem
       esta trava, o contador piscava 05 → 02 → 05 e a animação de
       entrada disparava em slides que só estavam de passagem (medido). */
    const destinoRef = useRef<number | null>(null);
    const travaRef = useRef<number>(0);

    /* Lê o slide atual da posição do trilho: vale para seta, dot,
       teclado e gesto — todos terminam numa rolagem. */
    const sincronizar = useCallback(() => {
        const trilho = trilhoRef.current;
        if (!trilho) return;
        const slides = [...trilho.children] as HTMLElement[];
        let melhor = 0;
        let menor = Infinity;
        slides.forEach((slide, i) => {
            const d = Math.abs(slide.offsetLeft - trilho.scrollLeft);
            if (d < menor) {
                menor = d;
                melhor = i;
            }
        });
        const destino = destinoRef.current;
        if (destino !== null) {
            /* Ainda a caminho: mantém o índice no destino. Chegou (menos de
               2px): solta a trava. */
            if (melhor !== destino || menor > 2) return;
            destinoRef.current = null;
        }
        setAtual(melhor);
    }, []);

    useEffect(() => {
        const trilho = trilhoRef.current;
        if (!trilho) return;
        let quadro = 0;
        const aoRolar = () => {
            cancelAnimationFrame(quadro);
            quadro = requestAnimationFrame(sincronizar);
        };
        trilho.addEventListener("scroll", aoRolar, { passive: true });
        window.addEventListener("resize", aoRolar);
        return () => {
            cancelAnimationFrame(quadro);
            window.clearTimeout(travaRef.current);
            trilho.removeEventListener("scroll", aoRolar);
            window.removeEventListener("resize", aoRolar);
        };
    }, [sincronizar]);

    /* `inert` pelo DOM: o React 18 não conhece o atributo como prop. */
    useEffect(() => {
        const slides = trilhoRef.current?.children;
        if (!slides) return;
        [...slides].forEach((slide, i) => {
            if (i === atual) slide.removeAttribute("inert");
            else slide.setAttribute("inert", "");
        });
    }, [atual, total]);

    /* Anuncia só depois de uma ação: ler "Projeto 1 de 6" ao carregar a
       página interromperia quem está ouvindo outra coisa. Derivado no
       render — nada de estado sincronizado por efeito. */
    const repoAtual = repos[atual];
    const aviso =
        interagiu && repoAtual
            ? t("work.announce")
                  .replace("{n}", String(atual + 1))
                  .replace("{total}", String(total))
                  .replace("{name}", repoAtual.name)
            : "";

    const irPara = useCallback(
        (i: number) => {
            const trilho = trilhoRef.current;
            const alvo = Math.max(0, Math.min(total - 1, i));
            const slide = trilho?.children[alvo] as HTMLElement | undefined;
            if (!trilho || !slide) return;
            setInteragiu(true);
            const reduzir = window.matchMedia?.(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            /* `scrollTo` em elemento existe em todo navegador-alvo; a guarda
               é para ambientes sem layout (jsdom nos testes). */
            if (typeof trilho.scrollTo === "function") {
                trilho.scrollTo({
                    left: slide.offsetLeft,
                    behavior: reduzir ? "auto" : "smooth",
                });
            }
            /* Sem esperar o evento de rolagem: o contador e os dots
               respondem já, e a trava segura o índice até a chegada. A
               trava expira sozinha, caso a rolagem seja interrompida. */
            destinoRef.current = alvo;
            window.clearTimeout(travaRef.current);
            travaRef.current = window.setTimeout(() => {
                destinoRef.current = null;
                sincronizar();
            }, 1500);
            setAtual(alvo);
        },
        [total, sincronizar],
    );

    const aoTeclar = (e: React.KeyboardEvent) => {
        const mapa: Record<string, number> = {
            ArrowLeft: atual - 1,
            ArrowRight: atual + 1,
            Home: 0,
            End: total - 1,
        };
        if (!(e.key in mapa)) return;
        e.preventDefault();
        irPara(mapa[e.key]!);
    };

    /* Gesto também é ação do visitante: a partir do primeiro toque no
       trilho, as trocas passam a ser anunciadas. */
    /* O dedo (ou o mouse) no trilho assume o controle: solta qualquer
       trava de navegação programada. */
    const marcarInteracao = () => {
        destinoRef.current = null;
        setInteragiu(true);
    };

    return (
        <div
            className="work-carousel"
            role="region"
            aria-roledescription="carousel"
            aria-label={t("work.carousel")}
            onKeyDown={aoTeclar}
        >
            <div
                className="work-carousel__viewport"
                ref={trilhoRef}
                onPointerDown={marcarInteracao}
                onTouchStart={marcarInteracao}
                onWheel={marcarInteracao}
            >
                {repos.map((repo, i) => (
                    <div key={repo.id} className="work-carousel__slide">
                        <WorkSlide
                            repo={repo}
                            index={i}
                            total={total}
                            ativo={i === atual}
                        />
                    </div>
                ))}
            </div>

            {/* Barra única: contador e progresso à esquerda, dots e setas à
                direita. O progresso é o próprio filete superior da barra. */}
            <div
                className="work-carousel__nav"
                style={
                    {
                        "--progresso": total > 1 ? atual / (total - 1) : 1,
                    } as React.CSSProperties
                }
            >
                <p className="work-carousel__counter" aria-hidden="true">
                    <span className="work-carousel__counter-now">
                        {pad(atual + 1)}
                    </span>
                    <span className="work-carousel__counter-sep">/</span>
                    {pad(total)}
                </p>

                <div
                    className="work-carousel__dots"
                    role="group"
                    aria-label={t("work.pages")}
                >
                    {repos.map((repo, i) => (
                        <button
                            key={repo.id}
                            type="button"
                            className="work-carousel__dot"
                            aria-current={i === atual ? "true" : undefined}
                            aria-label={t("work.goTo")
                                .replace("{n}", String(i + 1))
                                .replace("{name}", repo.name)}
                            onClick={() => irPara(i)}
                        >
                            <span className="work-carousel__dot-fill" />
                        </button>
                    ))}
                </div>

                <div className="work-carousel__arrows">
                    <button
                        type="button"
                        className="work-carousel__arrow"
                        onClick={() => irPara(atual - 1)}
                        disabled={atual === 0}
                        aria-label={t("work.prev")}
                    >
                        <IconChevronLeft width={18} height={18} aria-hidden />
                    </button>
                    <button
                        type="button"
                        className="work-carousel__arrow"
                        onClick={() => irPara(atual + 1)}
                        disabled={atual === total - 1}
                        aria-label={t("work.next")}
                    >
                        <IconChevronRight width={18} height={18} aria-hidden />
                    </button>
                </div>
            </div>

            <p className="sr-only" aria-live="polite" aria-atomic="true">
                {aviso}
            </p>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   Seção
───────────────────────────────────────────────────────── */

export const Work: React.FC = () => {
    const { t } = useLang();
    const { data, loading, error } = useDevhubPinned();
    const verTodos = useLinkProps(ROUTES.PROJECTS);

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
                    <div className="work__eyebrow-row">
                        <span className="section-eyebrow">
                            {t("work.eyebrow")}
                        </span>
                        <span className="work__sync">
                            <span aria-hidden="true" />
                            {t("work.sync")}
                        </span>
                    </div>
                    <h2 className="section-title" id="work-title">
                        {t("work.title")}
                    </h2>
                    <p className="work__sub">{t("work.sub")}</p>
                </header>

                {loading && (
                    <div
                        className="work-carousel work-carousel--skeleton"
                        aria-busy="true"
                        aria-label={t("work.loading")}
                        role="status"
                    >
                        <div className="work-carousel__viewport">
                            <div
                                className="work-card work-card--skeleton"
                                data-media="start"
                                aria-hidden="true"
                            >
                                <div className="work-card__media">
                                    <span className="work-card__skel-block" />
                                </div>
                                <div className="work-card__body">
                                    <span className="work-card__skel-line work-card__skel-line--short" />
                                    <span className="work-card__skel-line work-card__skel-line--title" />
                                    <span className="work-card__skel-line" />
                                    <span className="work-card__skel-line" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && (error || repos.length === 0) && (
                    <p className="work__state" role="status">
                        {t("work.error")}
                    </p>
                )}

                {!loading && repos.length > 0 && <Carousel repos={repos} />}

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
                            {...verTodos.anchorProps}
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
                        >
                            <IconGitHub
                                className="work-btn__icon"
                                width={18}
                                height={18}
                                aria-hidden
                            />
                            {t("work.more")}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
