import { lazy, Suspense, useRef, useState } from "react";
import "./Featured.css";
import { SkillIcon } from "@/shared/ui/SkillIcon/SkillIcon";
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
<<<<<<< Updated upstream
import {
    FEATURED_PROJECT,
    METHOD_COLOR,
    type HttpMethod,
    SLIDE_SIZES,
    SLIDE_W,
    SLIDE_H,
} from "./Featured.data";
/* Lightbox só abre sob clique — carregado sob demanda para ficar
   fora do bundle inicial (JS + CSS). */
=======
import { FEATURED_PROJECT as project } from "./Featured.data";

>>>>>>> Stashed changes
const FeaturedLightbox = lazy(() =>
    import("./components/FeaturedLightbox").then((m) => ({
        default: m.FeaturedLightbox,
    })),
);
const capabilityIcons = [IconLayers, IconShield, IconPackage];

<<<<<<< Updated upstream
const INTERVAL = 7000;

const ARCH_ICON: Record<
    "layers" | "shield" | "package",
    React.ComponentType<IconProps>
> = {
    layers: IconLayers,
    shield: IconShield,
    package: IconPackage,
};

export const Featured: React.FC = () => {
=======
export function Featured() {
>>>>>>> Stashed changes
    const { lang, t } = useLang();
    const tr = (pt: string, en: string) => (lang === "pt" ? pt : en);
    const [current, setCurrent] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const touch = useRef<{ x: number; y: number } | null>(null);
    const slides = project.slides;
    const slide = slides[current]!;
    const move = (offset: number) =>
        setCurrent((index) => (index + offset + slides.length) % slides.length);
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

<<<<<<< Updated upstream
                {/* ─── Main grid: gallery (browser mockup) + tech profile ─── */}
                <div className="featured__main">
                    {/* Left column: browser mockup + thumbnail filmstrip */}
                    <div
                        className="featured__media"
                        onMouseEnter={stopAuto}
                        onMouseLeave={() => autoPlay && startAuto()}
                    >
                        {/* Gallery — Browser mockup */}
                        <div
                            ref={galleryRef}
                            className="featured__gallery"
                            role="region"
                            aria-label={t("featured.gallery.label")}
                            aria-roledescription="carrossel"
                            onKeyDown={handleKeyDown}
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                            tabIndex={0}
                        >
                            {/* Browser chrome — a moldura é decorativa, mas o
                                botão de autoplay dentro dela é um controle de
                                verdade: esconder o conjunto tirava do leitor de
                                tela um botão que o teclado ainda alcançava. */}
                            <div className="featured__browser-chrome">
                                <div
                                    className="featured__browser-dots"
                                    aria-hidden="true"
                                >
                                    <span className="featured__browser-dot featured__browser-dot--red" />
                                    <span className="featured__browser-dot featured__browser-dot--amber" />
                                    <span className="featured__browser-dot featured__browser-dot--green" />
                                </div>
                                <div
                                    className="featured__browser-url"
                                    aria-hidden="true"
                                >
                                    <span className="featured__browser-url-protocol">
                                        https://
                                    </span>
                                    <span>authservice-mbul.onrender.com</span>
                                </div>
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
                                    {autoPlay ? (
                                        <svg
                                            width="10"
                                            height="10"
                                            viewBox="0 0 12 12"
                                            aria-hidden="true"
                                        >
                                            <rect
                                                x="3"
                                                y="2"
                                                width="2"
                                                height="8"
                                                rx="0.5"
                                                fill="currentColor"
                                            />
                                            <rect
                                                x="7"
                                                y="2"
                                                width="2"
                                                height="8"
                                                rx="0.5"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="10"
                                            height="10"
                                            viewBox="0 0 12 12"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M3.5 2L9.5 6L3.5 10V2Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Slides */}
                            <div className="featured__slides">
                                {slides.map((slide, i) => (
                                    <div
                                        key={slide.src}
                                        className={`featured__slide${i === current ? " is-active" : ""}`}
                                        aria-hidden={i !== current}
                                    >
                                        <button
                                            type="button"
                                            className="featured__slide-trigger"
                                            onClick={() => setLightboxIndex(i)}
                                            tabIndex={i === current ? 0 : -1}
                                            aria-label={`${t("featured.lightbox.open")}: ${slide.label[lang]}`}
                                        >
                                            <img
                                                src={slide.src}
                                                srcSet={slide.srcSet}
                                                sizes={SLIDE_SIZES}
                                                width={SLIDE_W}
                                                height={SLIDE_H}
                                                alt={`${project.name} — ${slide.label[lang]}`}
                                                className="featured__slide-img"
                                                loading={
                                                    i === 0 ? "eager" : "lazy"
                                                }
                                            />
                                            <span
                                                className="featured__slide-zoom"
                                                aria-hidden="true"
                                            >
                                                <IconSearch
                                                    width={16}
                                                    height={16}
                                                    aria-hidden="true"
                                                />
                                                <span>
                                                    {t(
                                                        "featured.lightbox.open",
                                                    )}
                                                </span>
                                            </span>
                                        </button>

                                        <div className="featured__slide-caption">
                                            <span className="featured__slide-label">
                                                {slide.label[lang]}
                                            </span>
                                            <span className="featured__slide-sub">
                                                {slide.sub[lang]}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Counter + progress (escala para qualquer quantidade) */}
                            {hasMultiple && (
                                <div className="featured__dots-row">
                                    <span
                                        className="featured__counter"
                                        aria-hidden="true"
                                    >
                                        {String(current + 1).padStart(2, "0")}
                                        <span className="featured__counter-sep">
                                            {" "}
                                            /{" "}
                                        </span>
                                        <span className="featured__counter-total">
                                            {String(slides.length).padStart(
                                                2,
                                                "0",
                                            )}
                                        </span>
                                    </span>
                                    <div
                                        className="featured__progress"
                                        role="progressbar"
                                        aria-label={t(
                                            "featured.progress.label",
                                        )}
                                        aria-valuemin={1}
                                        aria-valuemax={slides.length}
                                        aria-valuenow={current + 1}
                                    >
                                        <span
                                            className="featured__progress-fill"
                                            style={{
                                                width: `${((current + 1) / slides.length) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Arrows */}
                            {hasMultiple && (
                                <>
                                    <button
                                        type="button"
                                        className="featured__arrow featured__arrow--prev"
                                        onClick={() => {
                                            prev();
                                            resetAuto();
                                        }}
                                        aria-label={t("featured.arrow.prev")}
                                        tabIndex={-1}
                                    >
                                        <IconChevronLeft
                                            width={16}
                                            height={16}
                                            aria-hidden="true"
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        className="featured__arrow featured__arrow--next"
                                        onClick={() => {
                                            next();
                                            resetAuto();
                                        }}
                                        aria-label={t("featured.arrow.next")}
                                        tabIndex={-1}
                                    >
                                        <IconChevronRight
                                            width={16}
                                            height={16}
                                            aria-hidden="true"
                                        />
                                    </button>
                                </>
                            )}

                            {/* Slide name caption (bottom-left subtle) */}
                            <div
                                className="featured__slide-name"
                                aria-live="polite"
                            >
                                <span className="featured__slide-name-text">
                                    {currentSlide.label[lang]}
                                </span>
                            </div>
                        </div>

                        {/* Thumbnail filmstrip — dinâmico (vira carrossel scrollável quando > 4) */}
                        {hasMultiple && (
                            <div
                                ref={filmstripRef}
                                className={`featured__filmstrip${isScrollableStrip ? " featured__filmstrip--scroll" : ""}`}
                                role="group"
                                aria-label={t("featured.thumbs.label")}
                            >
                                {slides.map((slide, i) => (
                                    <button
                                        key={slide.src}
                                        type="button"
                                        className={`featured__thumb${i === current ? " is-active" : ""}`}
                                        onClick={() => {
                                            goTo(i);
                                            resetAuto();
                                        }}
                                        aria-label={slide.label[lang]}
                                        aria-current={i === current}
                                    >
                                        <img
                                            src={slide.src}
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                            aria-hidden="true"
                                            className="featured__thumb-img"
                                        />
                                        <span
                                            className="featured__thumb-index"
                                            aria-hidden="true"
                                        >
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* /featured__media */}

                    {/* ─── Tech Profile ─── */}
                    <aside
                        className="featured__profile"
                        aria-labelledby="featured-profile-title"
                    >
                        {/* Repo path */}
                        <div className="featured__repo-path">
                            <IconGitHub
                                width={14}
                                height={14}
                                aria-hidden="true"
                            />
                            <span>{project.repoHost}</span>
                        </div>

                        {/* Badges */}
                        {/* <ul>/<li> de verdade, e não ARIA por cima de
                            <div>/<span>: o Lighthouse reprovava o papel
                            sobreposto, e a semântica nativa já diz a mesma
                            coisa para leitor de tela e para agente. */}
                        <ul className="featured__badges">
                            {project.badges.map((b) => (
                                <li
                                    key={b.label}
                                    className={`featured__pill featured__pill--${b.variant}`}
                                >
                                    {b.variant === "live" && (
                                        <span
                                            className="featured__pill-dot"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {b.label}
                                </li>
                            ))}
                        </ul>

                        {/* Description */}
                        <p
                            className="featured__description"
                            id="featured-profile-title"
                        >
                            {project.description[lang]}
                        </p>

                        {/* Tech stack */}
                        <section className="featured__block">
                            <h3 className="featured__block-title">
                                {t("featured.block.tech")}
                            </h3>
                            <ul
                                className="featured__tech"
                                aria-label={t("featured.block.tech")}
                            >
                                {project.tech.map((item) => (
                                    <li
                                        key={item.key}
                                        className={`featured__tech-chip featured__tech-chip--${item.variant}`}
                                    >
                                        <SkillIcon id={item.key} size={18} />
                                        <span>{item.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Endpoints — terminal style */}
                        <section className="featured__block">
                            <h3 className="featured__block-title">
                                {t("featured.block.endpoints")}
                            </h3>
                            <ul
                                className="featured__endpoints"
                                aria-label="API endpoints"
                            >
                                {project.endpoints.map((ep) => {
                                    const color =
                                        METHOD_COLOR[ep.method as HttpMethod];
                                    return (
                                        <li
                                            key={ep.path}
                                            className="featured__endpoint"
                                        >
                                            <span
                                                className="featured__method"
                                                style={{
                                                    color: color.fg,
                                                    background: color.bg,
                                                    borderColor: color.border,
                                                }}
                                            >
                                                {ep.method}
                                            </span>
                                            <code className="featured__path">
                                                {ep.path}
                                            </code>
                                            {ep.protected && (
                                                /* Um <span> sem papel não
                                                   aceita aria-label. Como
                                                   imagem, o cadeado passa a
                                                   ter nome acessível de
                                                   verdade. */
                                                <span
                                                    className="featured__protected"
                                                    role="img"
                                                    title={t(
                                                        "featured.endpoint.protected",
                                                    )}
                                                    aria-label={t(
                                                        "featured.endpoint.protected",
                                                    )}
                                                >
                                                    <IconLock
                                                        width={11}
                                                        height={11}
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            )}
                                            <span className="featured__endpoint-desc">
                                                {ep.description[lang]}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>

                        {/* CTAs */}
=======
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
                            <div>
                                <dt>{tr("Abordagem", "Approach")}</dt>
                                <dd>
                                    {tr(
                                        "Análise estática + IA opcional",
                                        "Static analysis + optional AI",
                                    )}
                                </dd>
                            </div>
                        </dl>
>>>>>>> Stashed changes
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
                            </div>
                            <div
                                className="featured__slide is-active"
                                onTouchStart={(event) => {
                                    const point = event.touches[0];
                                    if (point)
                                        touch.current = {
                                            x: point.clientX,
                                            y: point.clientY,
                                        };
                                }}
                                onTouchEnd={(event) => {
                                    const point = event.changedTouches[0];
                                    const start = touch.current;
                                    touch.current = null;
                                    if (!point || !start) return;
                                    const dx = start.x - point.clientX;
                                    if (
                                        Math.abs(dx) > 48 &&
                                        Math.abs(dx) >
                                            Math.abs(start.y - point.clientY)
                                    )
                                        move(dx > 0 ? 1 : -1);
                                }}
                            >
                                <button
                                    type="button"
                                    className="featured__slide-trigger"
                                    onClick={() => setLightboxIndex(current)}
                                    aria-label={`${t("featured.lightbox.open")}: ${slide.label[lang]}`}
                                >
                                    <img
                                        src={slide.src}
                                        alt={`${project.name} — ${slide.label[lang]}`}
                                        width={1920}
                                        height={1080}
                                        loading="lazy"
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
                            <figcaption className="featured__caption">
                                <div aria-live="polite" aria-atomic="true">
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
                                    onClick={() => setCurrent(index)}
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

<<<<<<< Updated upstream
                {/* ─── Architecture cards ─── */}
                <ul className="featured__architecture">
                    {project.architecture.map((card, i) => {
                        const Icon = ARCH_ICON[card.icon];
                        return (
                            <li
                                key={card.icon}
                                className="arch-card"
                                style={{ ["--stagger-index" as string]: i }}
=======
                <div className="featured__capabilities">
                    {project.architecture.map((item, index) => {
                        const Icon = capabilityIcons[index]!;
                        return (
                            <article
                                className="featured__capability"
                                key={item.icon}
>>>>>>> Stashed changes
                            >
                                <span className="featured__capability-icon">
                                    <Icon
                                        width={22}
                                        height={22}
                                        aria-hidden="true"
                                    />
                                </span>
<<<<<<< Updated upstream
                                <h3 className="arch-card__title">
                                    {card.title[lang]}
                                </h3>
                                <p className="arch-card__text">
                                    {card.text[lang]}
                                </p>
                            </li>
                        );
                    })}
                </ul>
=======
                                <div>
                                    <h3>{item.title[lang]}</h3>
                                    <p>{item.text[lang]}</p>
                                </div>
                            </article>
                        );
                    })}
                </div>
                <div className="featured__stack">
                    <h3>
                        {tr("Tecnologias do projeto", "Project technologies")}
                    </h3>
                    <ul>
                        {project.tech.map((item) => (
                            <li key={item.key}>{item.label}</li>
                        ))}
                    </ul>
                </div>
>>>>>>> Stashed changes
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
