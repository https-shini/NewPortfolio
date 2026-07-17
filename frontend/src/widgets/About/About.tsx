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
            pt: "Desenvolvimento de interfaces modernas com React, foco em componentização, performance e experiência do usuário (UX/UI), utilizando JavaScript/TypeScript e CSS avançado.",
            en: "Building modern interfaces with React, focused on componentization, performance and user experience (UX/UI), using JavaScript/TypeScript and advanced CSS.",
        },
        icon: <IconFrontend />,
    },
    {
        title: { pt: "Back-end", en: "Back-end" },
        desc: {
            pt: "Criação de APIs e serviços com Node.js e PHP, aplicando arquitetura organizada, integração com banco de dados e construção de aplicações escaláveis.",
            en: "Creating APIs and services with Node.js and PHP, applying organized architecture, database integration and building scalable applications.",
        },
        icon: <IconBackend />,
    },
    {
        title: { pt: "Banco de Dados", en: "Databases" },
        desc: {
            pt: "Modelagem e gerenciamento de dados com MySQL e Firebase, focando em estrutura eficiente, integridade dos dados e otimização de consultas.",
            en: "Data modeling and management with MySQL and Firebase, focusing on efficient structure, data integrity and query optimization.",
        },
        icon: <IconDatabaseStack />,
    },
    {
        title: { pt: "Qualidade de Software", en: "Software Quality" },
        desc: {
            pt: "Aplicação de boas práticas como Clean Code, versionamento com Git e organização de projetos, garantindo legibilidade, manutenção e evolução do código.",
            en: "Applying best practices like Clean Code, version control with Git and project organization, ensuring readability, maintainability and code evolution.",
        },
        icon: <IconQuality />,
    },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   STATS — tipagem, dados, hook e sub-componentes (todos inline)
═══════════════════════════════════════════════════════════════════════════ */

/* ── Interface de um stat ────────────────────────────────────────────────── */
interface Stat {
    icon: React.ReactNode;
    value: string; // valor base (numérico como string, ou textual ex: "B2")
    numericTarget?: number; // se presente → dispara animação count-up
    suffix?: string; // sufixo após o valor (ex: "+", " anos", "º sem")
    label: string; // título principal do card
    sublabel?: string; // detalhe em uppercase muted abaixo do label
    accent: "brand" | "accent"; // variante de cor: crimson (brand) | indigo (accent)
}

/* ── 4 stat-cards ────────────────────────────────────────────────────────── */
const STATS: Stat[] = [
    {
        icon: <IconGraduationCap />,
        value: "3",
        numericTarget: 3,
        suffix: " anos",
        label: "Formação Técnica",
        sublabel: "ETEC Vila Formosa",
        accent: "brand",
    },
    {
        icon: <IconCode />,
        value: "7",
        numericTarget: 7,
        suffix: "º semestre",
        label: "Graduação",
        sublabel: "Ciência da Computação",
        accent: "accent",
    },
    {
        icon: <IconGitCommit />,
        value: "100",
        numericTarget: 100,
        suffix: "+",
        label: "Commits",
        sublabel: "Versionamento Git",
        accent: "accent",
    },
    {
        icon: <IconBolt />,
        value: "5",
        numericTarget: 5,
        suffix: "+",
        label: "Anos Estudando",
        sublabel: "Dev & Computação",
        accent: "brand",
    },
];

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
            {STATS.map((s, i) => (
                <StatCard key={s.label} stat={s} active={active} index={i} />
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
