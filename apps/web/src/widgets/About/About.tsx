import React, { useEffect, useRef, useState } from "react";
import "./About.css";

/* ── Ícones do design system ─────────────────────────────────────────────── */
import {
    IconGraduationCap,
    IconGitCommit,
    IconCode,
    IconBolt,
    IconFrontend,
    IconBackend,
    IconDatabaseStack,
    IconQuality,
} from "@/shared/ui/Icons";

/* ── Hook de i18n ────────────────────────────────────────────────────────── */
import { useLang } from "@/shared/hooks/useLang";
import { renderRichParagraphs } from "@/shared/lib/richText";
import { type TranslationKey } from "@/shared/lib/translations";

/* ── Automação temporal e métricas (fonte única de datas) ────────────────── */
import { TIMELINE_ANCHORS } from "@/shared/config/profile";
import { yearsSince } from "@/shared/lib/dateUtils";
import {
    currentSemester,
    isGraduationComplete,
} from "@/shared/lib/academicDates";
import { useGithubStats } from "@/shared/hooks/useGithubStats";

/* ── Foto (import estático resolvido pelo Vite — sem path relativo frágil) ── */
import heroImg from "@/assets/hero.webp";

/* ═══════════════════════════════════════════════════════════════════════════
   DADOS ESTÁTICOS
═══════════════════════════════════════════════════════════════════════════ */

/* ── Tech stack — ícones exibidos no grid da sidebar ────────────────────── */
const TECH_STACK = [
    { icon: "html", label: "HTML5" },
    { icon: "css", label: "CSS3" },
    { icon: "js", label: "JavaScript" },
    { icon: "react", label: "React" },
    { icon: "nodejs", label: "Node.js" },
    { icon: "php", label: "PHP" },
    { icon: "python", label: "Python" },
    { icon: "java", label: "Java" },
    { icon: "mysql", label: "MySQL" },
    { icon: "firebase", label: "Firebase" },
    { icon: "git", label: "Git" },
    { icon: "docker", label: "Docker" },
    { icon: "vite", label: "Vite" },
    { icon: "sass", label: "Sass" },
    { icon: "vscode", label: "VSCode" },
    { icon: "figma", label: "Figma" },
] as const;

/* ── Specs — 4 cards de área de especialização (coluna esquerda) ─────────── */
const SPECS = [
    {
        title: { pt: "Front-end", en: "Front-end" },
        desc: {
            pt: "Desenvolvo interfaces modernas e performáticas com React, criando aplicações SPA com foco em experiência do usuário, design responsivo e código escalável. Utilizo JavaScript/TypeScript, HTML5, CSS3 e Vite como parte do meu fluxo de desenvolvimento diário.",
            en: "I develop modern, high-performance interfaces with React and React Router, building SPAs focused on user experience, responsive design, and scalable code. I use JavaScript/TypeScript, HTML5, CSS3, and Vite as part of my daily development workflow.",
        },

        icon: <IconFrontend />,
    },
    {
        title: { pt: "Back-end", en: "Back-end" },
        desc: {
            pt: "Desenvolvo APIs REST e serviços em tempo real com Node.js e WebSocket, aplicando POO, autenticação JWT e arquitetura organizada. Também com experiência em Java, Python e PHP.",
            en: "I develop REST APIs and real-time services with Node.js and WebSocket, applying OOP, JWT authentication and organized architecture. Also experienced with Java, Python and PHP.",
        },
        icon: <IconBackend />,
    },
    {
        title: { pt: "Banco de Dados", en: "Databases" },
        desc: {
            pt: "Modelo e gerencio bancos de dados relacionais com MySQL e Oracle, projetando estruturas eficientes, garantindo a integridade dos dados e otimizando consultas para melhor desempenho.",
            en: "I design and manage relational databases with MySQL and Oracle, building efficient schemas, ensuring data integrity, and optimizing queries for better performance.",
        },
        icon: <IconDatabaseStack />,
    },
    {
        title: { pt: "Qualidade de Software", en: "Software Quality" },
        desc: {
            pt: "Aplico Clean Code, metodologias ágeis (Scrum/Kanban) e testes de software, com versionamento no Git, mantendo o código legível, sustentável e fácil de evoluir.",
            en: "I apply Clean Code, agile methodologies (Scrum/Kanban) and software testing, with Git versioning, keeping code readable, maintainable and easy to evolve.",
        },
        icon: <IconQuality />,
    },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   STATS — tipagem, dados, hook e sub-componentes (todos inline)
═══════════════════════════════════════════════════════════════════════════ */

/* ── Interface de um stat (resolvido, pronto para render) ─────────────────── */
interface Stat {
    icon: React.ReactNode;
    value: string; // valor base (numérico como string, ou textual ex: "Concluído")
    numericTarget?: number; // se presente → dispara animação count-up
    suffix?: string; // sufixo após o valor (ex: "+", " anos", "º sem")
    label: string; // título principal do card
    sublabel?: string; // detalhe em uppercase muted abaixo do label
    accent: "brand" | "accent"; // variante de cor: crimson (brand) | indigo (accent)
}

/* ── Fallback do contador de commits quando a API está indisponível ──────── */
const COMMITS_FALLBACK = 1000;

/* Discriminador de como o valor de cada card é obtido. */
type StatKind = "static" | "semester" | "years" | "commits";

/* ── Definições dos stats — labels via i18n, valores derivados ────────────── */
interface StatDef {
    icon: React.ReactNode;
    kind: StatKind;
    staticValue?: number; // usado apenas quando kind === "static"
    labelKey: TranslationKey;
    sublabelKey: TranslationKey;
    accent: "brand" | "accent";
}

const STAT_DEFS: StatDef[] = [
    {
        icon: <IconGraduationCap />,
        kind: "static", // Formação técnica concluída — não decai
        staticValue: 3,
        labelKey: "about.stats.techEdu.label",
        sublabelKey: "about.stats.techEdu.sublabel",
        accent: "brand",
    },
    {
        icon: <IconCode />,
        kind: "semester", // derivado das âncoras de graduação
        labelKey: "about.stats.grad.label",
        sublabelKey: "about.stats.grad.sublabel",
        accent: "accent",
    },
    {
        icon: <IconGitCommit />,
        kind: "commits", // derivado de /api/github-stats
        labelKey: "about.stats.commits.label",
        sublabelKey: "about.stats.commits.sublabel",
        accent: "accent",
    },
    {
        icon: <IconBolt />,
        kind: "years", // derivado do marco de jornada dev
        labelKey: "about.stats.years.label",
        sublabelKey: "about.stats.years.sublabel",
        accent: "brand",
    },
];

/**
 * resolveStat — transforma uma definição em um Stat pronto para render,
 * derivando o valor conforme o `kind` e traduzindo os textos via `t`.
 */
function resolveStat(
    def: StatDef,
    t: (key: TranslationKey) => string,
    commits: number,
): Stat {
    const base = {
        icon: def.icon,
        label: t(def.labelKey),
        sublabel: t(def.sublabelKey),
        accent: def.accent,
    };

    switch (def.kind) {
        case "semester": {
            const { graduationStart, graduationTotalSemesters } =
                TIMELINE_ANCHORS;
            if (isGraduationComplete(graduationStart, graduationTotalSemesters))
                return { ...base, value: t("about.stats.gradDone") };
            const sem = currentSemester(
                graduationStart,
                graduationTotalSemesters,
            );
            return {
                ...base,
                value: String(sem),
                numericTarget: sem,
                suffix: t("about.stats.semesterSuffix"),
            };
        }
        case "years": {
            const yrs = yearsSince(TIMELINE_ANCHORS.devJourneyStart);
            return {
                ...base,
                value: String(yrs),
                numericTarget: yrs,
                suffix: "+",
            };
        }
        case "commits":
            return {
                ...base,
                value: String(commits),
                numericTarget: commits,
                suffix: "+",
            };
        case "static":
        default: {
            const v = def.staticValue ?? 0;
            return {
                ...base,
                value: String(v),
                numericTarget: v,
                suffix: t("about.stats.yearsSuffix"),
            };
        }
    }
}

/* ── useCountUp ──────────────────────────────────────────────────────────────
   Anima de 0 até `target` em ~1200ms com easing ease-out cúbico.
   Só roda quando `active` = true (ativado pelo IntersectionObserver).
─────────────────────────────────────────────────────────────────────────── */
function useCountUp(target: number | undefined, active: boolean): number {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!active || target === undefined) return;

        const DURATION = 1200; // duração total em ms
        const FPS = 60;
        const STEPS = Math.round((DURATION / 1000) * FPS); // ~72 frames
        let frame = 0;

        const timer = setInterval(() => {
            frame++;
            // f(x) = 1 - (1 - x)³  → ease-out cúbico: acelerado no início, suave no fim
            const progress = 1 - Math.pow(1 - frame / STEPS, 3);
            setCount(Math.round(progress * target));

            if (frame >= STEPS) {
                clearInterval(timer);
                setCount(target); // garante valor exato no frame final
            }
        }, 1000 / FPS);

        return () => clearInterval(timer); // cleanup se o componente desmontar
    }, [active, target]);

    return count;
}

/* ── StatCard ────────────────────────────────────────────────────────────────
   Card individual do grid de stats.
   `index` é passado como CSS custom property --stat-index para o stagger
   de entrada escalonada via animation-delay no CSS.
─────────────────────────────────────────────────────────────────────────── */
interface StatCardProps {
    stat: Stat;
    active: boolean;
    index: number;
}

const StatCard: React.FC<StatCardProps> = ({ stat, active, index }) => {
    const count = useCountUp(stat.numericTarget, active);

    // Usa o count animado se houver numericTarget; caso contrário, exibe value literal
    const displayValue =
        stat.numericTarget !== undefined ? String(count) : stat.value;

    return (
        <div
            className={`stat-card stat-card--${stat.accent}`}
            // --stat-index controla o animation-delay escalonado definido no CSS
            style={{ "--stat-index": index } as React.CSSProperties}
        >
            {/* Ícone com fundo tintado pela variante de cor */}
            <div className="stat-card__icon" aria-hidden="true">
                {stat.icon}
            </div>

            {/* Valor principal animado + sufixo opcional */}
            <div className="stat-card__value-wrap">
                <span className="stat-card__value">
                    {displayValue}
                    {stat.suffix && (
                        <span className="stat-card__suffix">{stat.suffix}</span>
                    )}
                </span>
            </div>

            {/* Label principal e sublabel descritivo */}
            <div className="stat-card__labels">
                <span className="stat-card__label">{stat.label}</span>
                {stat.sublabel && (
                    <span className="stat-card__sublabel">{stat.sublabel}</span>
                )}
            </div>

            {/* Orb decorativo de glow — visível apenas no hover via CSS */}
            <div className="stat-card__orb" aria-hidden="true" />
        </div>
    );
};

/* ── AboutStats ──────────────────────────────────────────────────────────────
   Grid de 6 stat-cards com IntersectionObserver.
   O count-up só é disparado quando o grid entra no viewport (≥25%),
   evitando que a animação ocorra antes do usuário ver o componente.
─────────────────────────────────────────────────────────────────────────── */
const AboutStats: React.FC = () => {
    const { t } = useLang();
    const { commits } = useGithubStats();
    const ref = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setActive(true);
                    observer.disconnect(); // dispara uma única vez
                }
            },
            { threshold: 0.25 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="about__stats">
            {STAT_DEFS.map((def, i) => (
                <StatCard
                    key={def.labelKey}
                    stat={resolveStat(def, t, commits ?? COMMITS_FALLBACK)}
                    active={active}
                    index={i}
                />
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ABOUT — componente principal (exportado)
═══════════════════════════════════════════════════════════════════════════ */

export const About: React.FC = () => {
    const { t, lang } = useLang();

    // URL base da CDN de ícones SVG pelo nome da tecnologia
    const skilliconsBase = "https://skillicons.dev/icons?i=";

    return (
        <section
            id="sobre"
            className="about section"
            aria-labelledby="about-title"
            data-reveal
        >
            <div className="container">
                {/* ── Cabeçalho da seção ──────────────────────────────────── */}
                <header className="section-header">
                    <span className="section-eyebrow">Sobre</span>
                    <h2 className="section-title" id="about-title">
                        {t("about.title")}
                    </h2>
                </header>

                {/* ── Layout: coluna esquerda (corpo) + sidebar direita ────── */}
                <div className="about__layout">
                    {/* ════════════════════════════════════════════════════════
                        COLUNA ESQUERDA
                        1. Biografia
                        2. Cards de especialização
                        3. Objetivo profissional
                    ════════════════════════════════════════════════════════ */}
                    <div className="about__body">
                        {/* 1. Biografia ─────────────────────────────────────── */}
                        <div className="about__bio">
                            {renderRichParagraphs(
                                t("about.bio"),
                                "about__text",
                            )}
                        </div>

                        {/* 2. Cards de especialização ───────────────────────── */}
                        <section
                            className="about__specs"
                            aria-labelledby="specs-title"
                        >
                            <h3
                                id="specs-title"
                                className="section-eyebrow"
                                style={{ marginBottom: "var(--space-4)" }}
                            >
                                {t("about.specs.title")}
                            </h3>

                            <div className="about__specs-grid">
                                {SPECS.map((spec, i) => (
                                    <article
                                        className="spec-card"
                                        key={i}
                                        aria-label={`${lang === "pt" ? "Área de especialização" : "Area of expertise"}: ${spec.title[lang]}`}
                                    >
                                        {/* HEADER (ícone + título lado a lado) */}
                                        <div className="spec-card__header">
                                            <div
                                                className="spec-card__icon"
                                                aria-hidden="true"
                                            >
                                                {spec.icon}
                                            </div>

                                            <h4 className="spec-card__title">
                                                {spec.title[lang]}
                                            </h4>
                                        </div>

                                        {/* DESCRIÇÃO */}
                                        <p className="spec-card__desc">
                                            {spec.desc[lang]}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </section>

                        {/* 3. Objetivo profissional ─────────────────────────── */}
                        <section
                            className="about__objective"
                            aria-labelledby="about-objective-title"
                        >
                            <header className="about__objective-header">
                                <p
                                    id="about-objective-title"
                                    className="about__objective-title"
                                >
                                    {t("about.goal.title")}
                                </p>
                            </header>

                            <div className="about__objective-content">
                                {renderRichParagraphs(
                                    t("about.goal.body"),
                                    "about__objective-text",
                                )}
                            </div>
                        </section>
                    </div>
                    {/* ── fim .about__body ──────────────────────────────────── */}

                    {/* ════════════════════════════════════════════════════════
                        SIDEBAR DIREITA (sticky)
                        1. Foto
                        2. Stats — grid de 6 cards com count-up
                        3. Tech stack — grid de ícones
                    ════════════════════════════════════════════════════════ */}
                    <aside
                        className="about__sidebar"
                        aria-label={
                            lang === "pt"
                                ? "Foto, estatísticas e stack tecnológico"
                                : "Photo, stats and tech stack"
                        }
                    >
                        {/* 1. Foto ──────────────────────────────────────────── */}
                        <div className="about__photo-wrap">
                            <img
                                src={heroImg}
                                alt="Guilherme Cruz em ambiente de trabalho"
                                className="about__photo"
                                loading="lazy"
                                decoding="async"
                                width={480}
                                height={600}
                            />
                        </div>

                        {/* 2. Stats com count-up ────────────────────────────── */}
                        <AboutStats />

                        {/* 3. Tech stack ────────────────────────────────────── */}
                        <div className="about__tech">
                            <p
                                className="section-eyebrow"
                                style={{ marginBottom: "var(--space-4)" }}
                            >
                                Stack tecnológico
                            </p>

                            <div className="about__tech-grid">
                                {TECH_STACK.map((tech) => (
                                    <div
                                        className="about__tech-item"
                                        key={tech.icon}
                                        title={tech.label}
                                    >
                                        <img
                                            src={`${skilliconsBase}${tech.icon}`}
                                            alt={tech.label}
                                            width={32}
                                            height={32}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <span>{tech.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                    {/* ── fim .about__sidebar ───────────────────────────────── */}
                </div>
                {/* ── fim .about__layout ────────────────────────────────────── */}
            </div>
            {/* ── fim .container ────────────────────────────────────────────── */}
        </section>
    );
};
