import React, { useEffect, useRef, useState } from "react";
import "./About.css";

/* ── Ícones do design system ─────────────────────────────────────────────── */
import {
    IconGraduationCap,
    IconGitCommit,
    IconCode,
    IconBriefcase,
    IconBolt,
    IconTranslate,
    IconFrontend,
    IconBackend,
    IconDatabaseStack,
    IconQuality,
} from "../../shared/ui/Icons.tsx";

/* ── Hook de i18n ────────────────────────────────────────────────────────── */
import { useLang } from "@/shared/hooks/useLang";

/* ── Foto (import estático resolvido pelo Vite — sem path relativo frágil) ── */
import heroImg from "@/public/hero.png";

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
        title: "Front-end",
        desc: "Desenvolvimento de interfaces modernas com React, foco em componentização, performance e experiência do usuário (UX/UI), utilizando JavaScript/TypeScript e CSS avançado.",
        icon: <IconFrontend />,
    },
    {
        title: "Back-end",
        desc: "Criação de APIs e serviços com Node.js e PHP, aplicando arquitetura organizada, integração com banco de dados e construção de aplicações escaláveis.",
        icon: <IconBackend />,
    },
    {
        title: "Banco de Dados",
        desc: "Modelagem e gerenciamento de dados com MySQL e Firebase, focando em estrutura eficiente, integridade dos dados e otimização de consultas.",
        icon: <IconDatabaseStack />,
    },
    {
        title: "Qualidade de Software",
        desc: "Aplicação de boas práticas como Clean Code, versionamento com Git e organização de projetos, garantindo legibilidade, manutenção e evolução do código.",
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
    const { t } = useLang();

    // URL base da CDN de ícones SVG pelo nome da tecnologia
    const skilliconsBase = "https://skillicons.dev/icons?i=";

    return (
        <section
            id="about"
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
                            <p className="about__text">
                                Sou um estudante de{" "}
                                <strong>Ciência da Computação</strong> na
                                Universidade Cruzeiro do Sul, com formação
                                técnica em{" "}
                                <strong>Desenvolvimento de Sistemas</strong>{" "}
                                pela <strong>ETEC Vila Formosa</strong>. Ao
                                longo da minha formação, desenvolvi uma base
                                sólida em <strong>lógica de programação</strong>
                                , <strong>estruturas de dados</strong> e{" "}
                                <strong>
                                    fundamentos de engenharia de software
                                </strong>
                                , aplicando esses conceitos na construção de{" "}
                                <strong>projetos práticos</strong> e soluções
                                reais.
                            </p>

                            <p className="about__text">
                                Tenho experiência no desenvolvimento de{" "}
                                <strong>aplicações web modernas</strong>, com
                                foco em <strong>frontend</strong> e integração
                                com <strong>APIs</strong>. Utilizo tecnologias
                                como <strong>React</strong>,{" "}
                                <strong>JavaScript/TypeScript</strong>,{" "}
                                <strong>Node.js</strong> e{" "}
                                <strong>MySQL</strong>, criando{" "}
                                <strong>interfaces responsivas</strong>,
                                organizadas e com atenção à{" "}
                                <strong>experiência do usuário (UX/UI)</strong>,
                                sempre buscando entregar soluções{" "}
                                <strong>funcionais</strong>,{" "}
                                <strong>performáticas</strong> e bem
                                estruturadas.
                            </p>

                            <p className="about__text">
                                Além do desenvolvimento web, tenho interesse em
                                áreas como <strong>Java</strong>,{" "}
                                <strong>machine learning</strong>,{" "}
                                <strong>segurança da informação</strong> e{" "}
                                <strong>arquitetura de software</strong>,
                                buscando construir soluções{" "}
                                <strong>escaláveis</strong> e{" "}
                                <strong>robustas</strong>. Durante meus
                                projetos, aplico <strong>código limpo</strong>,{" "}
                                <strong>
                                    boas práticas de desenvolvimento
                                </strong>{" "}
                                e <strong>versionamento com Git</strong>,
                                mantendo foco em <strong>organização</strong>,{" "}
                                <strong>manutenibilidade</strong> e{" "}
                                <strong>evolução contínua</strong> como
                                desenvolvedor.
                            </p>
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
                                Áreas de especialização
                            </h3>

                            <div className="about__specs-grid">
                                {SPECS.map((spec) => (
                                    <article
                                        className="spec-card"
                                        key={spec.title}
                                        tabIndex={0}
                                        aria-label={`Área de especialização: ${spec.title}`}
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
                                                {spec.title}
                                            </h4>
                                        </div>

                                        {/* DESCRIÇÃO */}
                                        <p className="spec-card__desc">
                                            {spec.desc}
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
                                <p className="about__objective-text">
                                    Estou em busca da minha primeira
                                    oportunidade como{" "}
                                    <strong>Desenvolvedor Júnior</strong> ou{" "}
                                    <strong>
                                        Estagiário em Desenvolvimento
                                    </strong>
                                    , com o objetivo de aplicar meus
                                    conhecimentos em{" "}
                                    <strong>projetos reais</strong>, evoluir
                                    minhas <strong>habilidades técnicas</strong>{" "}
                                    e contribuir ativamente com o time. Tenho
                                    interesse em{" "}
                                    <strong>desenvolvimento web</strong> e{" "}
                                    <strong>Java</strong>, além de explorar
                                    áreas como{" "}
                                    <strong>segurança da informação</strong> e{" "}
                                    <strong>arquitetura de software</strong>,
                                    ampliando constantemente minha visão
                                    técnica.
                                </p>

                                <p className="about__objective-text">
                                    Meu foco é desenvolver aplicações com{" "}
                                    <strong>boa estrutura</strong>,{" "}
                                    <strong>escalabilidade</strong> e{" "}
                                    <strong>manutenibilidade</strong>, aplicando{" "}
                                    <strong>boas práticas</strong> e{" "}
                                    <strong>organização de código</strong>.
                                    Busco um ambiente onde eu possa crescer
                                    profissionalmente, contribuir com{" "}
                                    <strong>resolução de problemas</strong>,
                                    manter um ritmo de{" "}
                                    <strong>aprendizado contínuo</strong> e
                                    entregar soluções com{" "}
                                    <strong>qualidade</strong> e{" "}
                                    <strong>performance</strong>.
                                </p>
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
                        aria-label="Foto, estatísticas e stack tecnológico"
                    >
                        {/* 1. Foto ──────────────────────────────────────────── */}
                        <div className="about__photo-wrap">
                            <img
                                src={heroImg}
                                alt="Guilherme Cruz em ambiente de trabalho"
                                className="about__photo"
                                loading="lazy"
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
