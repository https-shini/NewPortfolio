import {
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import "./Featured.css";
import { useLang } from "@/shared/hooks/useLang";
import {
    IconArrowRight,
    IconChevronLeft,
    IconChevronRight,
    IconExternalLink,
    IconLayers,
    IconShield,
    IconPackage,
    IconSearch,
} from "@/shared/ui/Icons";
import { SkillIcon } from "@/shared/ui/SkillIcon/SkillIcon";
import { ENGENHARIA, FEATURED_PROJECT as project } from "./Featured.data";

const FeaturedLightbox = lazy(() =>
    import("./components/FeaturedLightbox").then((m) => ({
        default: m.FeaturedLightbox,
    })),
);
const capabilityIcons = [IconLayers, IconShield, IconPackage];
const AUTOPLAY_INTERVAL = 7000;

export function Featured() {
    const { lang, t } = useLang();
    const tr = (pt: string, en: string) => (lang === "pt" ? pt : en);
    const [current, setCurrent] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);
    const [interacting, setInteracting] = useState(false);
    const [hidden, setHidden] = useState(() => document.hidden);
    const [reducedMotion, setReducedMotion] = useState(
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const touch = useRef<{ x: number; y: number } | null>(null);
    const timer = useRef<ReturnType<typeof setInterval> | null>(null);
    const transition = useRef<ReturnType<typeof setTimeout> | null>(null);
    const slides = project.slides;
    const slide = slides[current]!;

    const endTransition = useCallback(() => {
        if (transition.current !== null) clearTimeout(transition.current);
        transition.current = null;
    }, []);
    const move = useCallback(
        (offset: number) => {
            if (transition.current !== null) return;
            setCurrent(
                (index) => (index + offset + slides.length) % slides.length,
            );
            if (!reducedMotion)
                transition.current = setTimeout(endTransition, 700);
        },
        [endTransition, reducedMotion, slides.length],
    );
    useEffect(() => endTransition, [endTransition]);
    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onMotion = (event: MediaQueryListEvent) => {
            setReducedMotion(event.matches);
            if (event.matches) endTransition();
        };
        const onVisibility = () => setHidden(document.hidden);
        media.addEventListener("change", onMotion);
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            media.removeEventListener("change", onMotion);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [endTransition]);
    const stopAuto = useCallback(() => {
        if (timer.current !== null) {
            clearInterval(timer.current);
            timer.current = null;
        }
    }, []);
    const startAuto = useCallback(() => {
        stopAuto();
        if (
            reducedMotion ||
            !autoPlay ||
            interacting ||
            hidden ||
            lightboxIndex !== null ||
            slides.length < 2
        )
            return;
        timer.current = setInterval(() => move(1), AUTOPLAY_INTERVAL);
    }, [
        autoPlay,
        hidden,
        interacting,
        lightboxIndex,
        move,
        reducedMotion,
        slides.length,
        stopAuto,
    ]);
    useEffect(() => {
        startAuto();
        return stopAuto;
    }, [current, startAuto, stopAuto]);
    const toggleAutoPlay = () => setAutoPlay((playing) => !playing);
    const detailsUrl =
        lang === "en" ? `${project.detailsUrl}?lang=en` : project.detailsUrl;

    return (
        <section
            id="destaque"
            className="featured section"
            aria-labelledby="featured-title"
            data-reveal
        >
            <div className="container">
                <header className="featured__heading section-header">
                    <div className="featured__eyebrow-row">
                        <span className="section-eyebrow">
                            {tr("Projeto em destaque", "Featured project")}
                        </span>
                        <span className="featured__status">
                            <span aria-hidden="true" />
                            {tr("Aplicação disponível", "Live application")}
                        </span>
                    </div>
                    <h2 className="section-title" id="featured-title">
                        Codex{" "}
                        <span className="featured__name-detail">
                            Code Validator
                        </span>
                    </h2>
                    <p className="featured__subtitle">
                        {tr(
                            "Meu TCC: qualidade de código medida, explicada e acompanhada.",
                            "My capstone project: code quality measured, explained and tracked.",
                        )}
                    </p>
                </header>

                <div className="featured__showcase">
                    <div className="featured__story">
                        <p className="featured__kicker">
                            {tr(
                                "Engenharia e qualidade de software",
                                "Software engineering and quality",
                            )}
                        </p>
                        <h3>
                            {tr(
                                "Do repositório a uma visão clara do código.",
                                "From repository to a clear view of the code.",
                            )}
                        </h3>
                        <p>
                            {tr(
                                "O Codex reúne análise estática e revisão opcional por IA para avaliar repositórios do GitHub. Segurança, complexidade e achados de lint compõem um relatório que ajuda a entender o estado do projeto.",
                                "Codex brings static analysis and optional AI review together to assess GitHub repositories. Security, complexity and lint findings form a report that helps explain the project's current state.",
                            )}
                        </p>
                        <dl className="featured__facts">
                            <div>
                                <dt>{tr("Contexto", "Context")}</dt>
                                <dd>
                                    {tr(
                                        "Trabalho de Conclusão de Curso",
                                        "Academic capstone project",
                                    )}
                                </dd>
                            </div>
                        </dl>

                        <div className="featured__actions">
                            <a href={detailsUrl} className="btn btn--primary">
                                {tr(
                                    "Conhecer o projeto",
                                    "Discover the project",
                                )}
                                <IconArrowRight
                                    width={16}
                                    height={16}
                                    aria-hidden="true"
                                />
                            </a>
                            <a
                                href={project.liveUrl}
                                className="btn btn--outline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {tr(
                                    "Explorar aplicação",
                                    "Explore application",
                                )}
                                <IconExternalLink
                                    width={16}
                                    height={16}
                                    aria-hidden="true"
                                />
                            </a>
                        </div>
                        <p className="featured__reading-note">
                            {tr(
                                "Arquitetura, funcionalidades e implementação documentadas no portfólio.",
                                "Architecture, features and implementation documented in this portfolio.",
                            )}
                        </p>
                    </div>

                    <div
                        className="featured__media"
                        role="region"
                        aria-label={t("featured.gallery.label")}
                        aria-roledescription={tr("carrossel", "carousel")}
                        tabIndex={0}
                        onMouseEnter={() => setInteracting(true)}
                        onMouseLeave={(event) =>
                            setInteracting(
                                event.currentTarget.contains(
                                    document.activeElement,
                                ),
                            )
                        }
                        onFocus={() => setInteracting(true)}
                        onBlur={(event) => {
                            if (
                                !event.currentTarget.contains(
                                    event.relatedTarget,
                                )
                            ) {
                                setInteracting(
                                    event.currentTarget.matches(":hover"),
                                );
                            }
                        }}
                        onKeyDown={(event) => {
                            if (
                                event.key === "ArrowLeft" ||
                                event.key === "ArrowRight"
                            ) {
                                event.preventDefault();
                                move(event.key === "ArrowLeft" ? -1 : 1);
                            }
                        }}
                    >
                        <figure className="featured__gallery">
                            <div className="featured__gallery-header">
                                <span>
                                    {tr(
                                        "Interface do projeto",
                                        "Project interface",
                                    )}
                                </span>
                                <span>{project.repoHost}</span>
                                <button
                                    type="button"
                                    className={`featured__autoplay${autoPlay ? " is-playing" : ""}`}
                                    onClick={toggleAutoPlay}
                                    aria-label={
                                        autoPlay
                                            ? t("featured.autoplay.pause")
                                            : t("featured.autoplay.play")
                                    }
                                    title={
                                        autoPlay
                                            ? t("featured.autoplay.pause")
                                            : t("featured.autoplay.play")
                                    }
                                >
                                    {autoPlay ? "Ⅱ" : "▶"}
                                </button>
                            </div>
                            <div className="featured__slides">
                                {slides.map((item, index) => (
                                    <div
                                        key={item.src}
                                        className={`featured__slide${current === index ? " is-active" : ""}`}
                                        aria-hidden={current !== index}
                                        onTouchStart={(event) => {
                                            const point = event.touches[0];
                                            if (point)
                                                touch.current = {
                                                    x: point.clientX,
                                                    y: point.clientY,
                                                };
                                        }}
                                        onTouchEnd={(event) => {
                                            const point =
                                                event.changedTouches[0];
                                            const start = touch.current;
                                            touch.current = null;
                                            if (!point || !start) return;
                                            const dx = start.x - point.clientX;
                                            if (
                                                Math.abs(dx) > 48 &&
                                                Math.abs(dx) >
                                                    Math.abs(
                                                        start.y - point.clientY,
                                                    )
                                            )
                                                move(dx > 0 ? 1 : -1);
                                        }}
                                    >
                                        <button
                                            type="button"
                                            className="featured__slide-trigger"
                                            onClick={() =>
                                                setLightboxIndex(index)
                                            }
                                            tabIndex={
                                                current === index ? 0 : -1
                                            }
                                            aria-label={`${t("featured.lightbox.open")}: ${item.label[lang]}`}
                                        >
                                            <img
                                                src={item.src}
                                                alt={`${project.name} — ${item.label[lang]}`}
                                                width={1920}
                                                height={1080}
                                                loading={
                                                    index === 0
                                                        ? "eager"
                                                        : "lazy"
                                                }
                                                decoding="async"
                                            />
                                            <span className="featured__zoom">
                                                <IconSearch
                                                    width={16}
                                                    height={16}
                                                    aria-hidden="true"
                                                />
                                                {tr("Ampliar", "Enlarge")}
                                            </span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <figcaption className="featured__caption">
                                <div
                                    aria-live={
                                        autoPlay &&
                                        !reducedMotion &&
                                        !interacting
                                            ? "off"
                                            : "polite"
                                    }
                                    aria-atomic="true"
                                >
                                    <span className="featured__counter">
                                        {String(current + 1).padStart(2, "0")} /{" "}
                                        {String(slides.length).padStart(2, "0")}
                                    </span>
                                    <strong>{slide.label[lang]}</strong>
                                    <p>{slide.sub[lang]}</p>
                                </div>
                                <div className="featured__arrows">
                                    <button
                                        type="button"
                                        className="featured__arrow"
                                        onClick={() => move(-1)}
                                        aria-label={t("featured.arrow.prev")}
                                    >
                                        <IconChevronLeft
                                            width={18}
                                            height={18}
                                            aria-hidden="true"
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        className="featured__arrow"
                                        onClick={() => move(1)}
                                        aria-label={t("featured.arrow.next")}
                                    >
                                        <IconChevronRight
                                            width={18}
                                            height={18}
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                            </figcaption>
                        </figure>
                        <div
                            className="featured__thumbnails"
                            role="group"
                            aria-label={tr(
                                "Selecionar captura",
                                "Select a screenshot",
                            )}
                        >
                            {slides.map((item, index) => (
                                <button
                                    type="button"
                                    key={item.src}
                                    className={`featured__thumbnail${current === index ? " is-active" : ""}`}
                                    aria-pressed={current === index}
                                    aria-label={`${tr("Ver captura", "View screenshot")} ${index + 1}: ${item.label[lang]}`}
                                    onClick={() => {
                                        endTransition();
                                        setCurrent(index);
                                    }}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key !== "ArrowLeft" &&
                                            event.key !== "ArrowRight"
                                        )
                                            return;
                                        event.preventDefault();
                                        event.stopPropagation();
                                        const offset =
                                            event.key === "ArrowLeft" ? -1 : 1;
                                        endTransition();
                                        setCurrent(
                                            (value) =>
                                                (value +
                                                    offset +
                                                    slides.length) %
                                                slides.length,
                                        );
                                    }}
                                >
                                    <img
                                        src={item.src}
                                        alt=""
                                        width={1920}
                                        height={1080}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <span>
                                        <span aria-hidden="true">
                                            0{index + 1}
                                        </span>
                                        {item.label[lang]}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <p className="featured__capture-note">
                            {tr(
                                "Capturas reais da página pública. As demonstrações exibem dados de exemplo.",
                                "Real screenshots of the public page. Demonstrations show sample data.",
                            )}
                        </p>
                    </div>
                </div>

                <div className="featured__capabilities">
                    {project.architecture.map((item, index) => {
                        const Icon = capabilityIcons[index]!;
                        return (
                            <article
                                className="featured__capability"
                                key={item.icon}
                            >
                                <span className="featured__capability-icon">
                                    <Icon
                                        width={22}
                                        height={22}
                                        aria-hidden="true"
                                    />
                                </span>
                                <div>
                                    <h3>{item.title[lang]}</h3>
                                    <p>{item.text[lang]}</p>
                                </div>
                            </article>
                        );
                    })}
                </div>
                {/* ── Engenharia e Qualidade de Software ──────────
                        O que a ferramenta faz, com o peso visual que o
                        assunto merece: a abordagem, as quatro linguagens
                        que ela analisa, a escala do score e o relatório.
                        Os ícones são Skill Icons servidos do próprio
                        domínio (ver shared/config/skillIcons). */}
                <section
                    className="featured__eng"
                    aria-labelledby="featured-eng-title"
                >
                    <p className="featured__eng-rotulo">
                        {tr("Área", "Field")}
                    </p>
                    <h3
                        className="featured__eng-titulo"
                        id="featured-eng-title"
                    >
                        {ENGENHARIA.area[lang]}
                    </h3>
                    <p className="featured__eng-abordagem">
                        {ENGENHARIA.abordagem[lang]}
                    </p>

                    <div className="featured__eng-grade">
                        <div className="featured__eng-bloco featured__eng-bloco--linguagens">
                            <h4>
                                {tr(
                                    "Linguagens analisadas",
                                    "Languages analysed",
                                )}
                            </h4>
                            <ul className="featured__linguagens">
                                {ENGENHARIA.linguagens.map((item) => (
                                    <li key={item.id}>
                                        <SkillIcon id={item.id} size={32} />
                                        <span>{item.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="featured__eng-bloco">
                            <h4>{tr("Score de qualidade", "Quality score")}</h4>
                            {/* Escala, não nota: este portfólio
                                    apresenta o projeto e não executa
                                    análises, então não há valor real a
                                    exibir — e inventar um descreveria
                                    função inexistente. */}
                            <p className="featured__escala-valores">
                                <span>{ENGENHARIA.score.min}</span>
                                <span
                                    className="featured__escala-traco"
                                    aria-hidden="true"
                                />
                                <span>{ENGENHARIA.score.max}</span>
                            </p>
                            <p className="featured__escala-nota">
                                {ENGENHARIA.score.vazio[lang]}
                            </p>
                        </div>

                        <div className="featured__eng-bloco">
                            <h4>{ENGENHARIA.relatorio.titulo[lang]}</h4>
                            <p>{ENGENHARIA.relatorio.texto[lang]}</p>
                        </div>
                    </div>
                </section>

                {/* Stack da APLICAÇÃO — complementar, e deliberadamente
                    com menos peso que o bloco de engenharia acima. Python
                    aparece nos dois: é linguagem analisada e também
                    tecnologia de construção. */}
                <div className="featured__stack">
                    <h3>
                        {tr("Tecnologias do projeto", "Project technologies")}
                    </h3>
                    <ul>
                        {project.tech.map((item) => (
                            <li key={item.key}>
                                <SkillIcon id={item.key} size={20} />
                                <span>{item.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {lightboxIndex !== null && (
                <Suspense fallback={null}>
                    <FeaturedLightbox
                        slides={slides}
                        initialIndex={lightboxIndex}
                        projectName={project.name}
                        liveUrl={project.liveUrl}
                        detailsUrl={detailsUrl}
                        onClose={() => setLightboxIndex(null)}
                    />
                </Suspense>
            )}
        </section>
    );
}
