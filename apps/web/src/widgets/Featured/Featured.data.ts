/* Codex — Code Validator, TCC. Apresentação baseada no material técnico
   disponível e nas capturas da página pública; não distribui código interno. */
import { PROJECT_URLS } from "@/shared/config/links";
import type { SkillIconId } from "@/shared/config/skillIcons";
export interface ProjectTech {
    /* O identificador É o do ícone. Tipar assim faz o compilador provar
       que toda tecnologia listada tem arte correspondente em
       shared/config/skillIcons — um nome sem ícone não compila. */
    key: SkillIconId;
    label: string; // display name
    variant: "brand" | "accent" | "neutral";
}

/** Linguagem que a ferramenta analisa — não confundir com a stack da aplicação. */
export interface AnalyzedLanguage {
    id: SkillIconId;
    label: string;
}

/**
 * O que a ferramenta faz, em quatro campos.
 *
 * Fonte: a própria página pública do Codex e o material técnico do TCC.
 * O score NÃO traz valor numérico: este portfólio apresenta o projeto, não
 * executa análises, e inventar uma nota seria descrever função que aqui
 * não existe. O que se mostra é a escala e onde ela é produzida.
 */
export const ENGENHARIA = {
    area: {
        pt: "Engenharia e Qualidade de Software",
        en: "Software Engineering and Quality",
    },
    abordagem: {
        pt: "Análise estática de código + revisão assistida por inteligência artificial",
        en: "Static code analysis + AI-assisted review",
    },
    /* As quatro linguagens que o Codex analisa. */
    linguagens: [
        { id: "python", label: "Python" },
        { id: "js", label: "JavaScript" },
        { id: "ts", label: "TypeScript" },
        { id: "go", label: "Go" },
    ] as AnalyzedLanguage[],
    score: {
        min: 0,
        max: 1000,
        legenda: {
            pt: "Escala de qualidade",
            en: "Quality scale",
        },
        /* Estado vazio honesto: a nota existe na aplicação, não aqui. */
        vazio: {
            pt: "A nota de cada repositório aparece na aplicação, ao fim da análise.",
            en: "Each repository's score appears in the application once the analysis finishes.",
        },
    },
    relatorio: {
        titulo: {
            pt: "Relatório de melhorias",
            en: "Improvement report",
        },
        texto: {
            pt: "Reúne os achados de lint, segurança e complexidade com a revisão qualitativa, e ordena o que corrigir primeiro.",
            en: "Brings lint, security and complexity findings together with the qualitative review, ordering what to fix first.",
        },
    },
} as const;

export interface ProjectSlide {
    src: string; // image URL
    label: { pt: string; en: string };
    sub: { pt: string; en: string };
    /** Descrição rica para exibir no lightbox (texto contextual) */
    description?: { pt: string; en: string };
}

export interface ArchitectureCard {
    icon: "layers" | "shield" | "package";
    title: { pt: string; en: string };
    text: { pt: string; en: string };
}

export const FEATURED_PROJECT = {
    id: "codex",
    name: "Codex — Code Validator",
    tagline: {
        pt: "TCC em engenharia de software: análise estática e inteligência artificial para compreender e acompanhar a qualidade do código.",
        en: "A software engineering capstone: static analysis and artificial intelligence to understand and track code quality.",
    },
    description: {
        pt: "Uma aplicação que combina análise estática e revisão por inteligência artificial para avaliar repositórios do GitHub. Transforma lint, segurança e complexidade em um score de 0 a 1000, com um relatório para orientar melhorias.",
        en: "An application combining static analysis and AI review to evaluate GitHub repositories. It turns lint, security and complexity findings into a score from 0 to 1000, with a report to guide improvements.",
    },
    detailsUrl: PROJECT_URLS.codex.details,
    liveUrl: PROJECT_URLS.codex.live,
    repoHost: "codex.shxred.app.br",
    tech: [
        {
            key: "fastapi",
            label: "FastAPI",
            variant: "brand",
        },
        {
            key: "python",
            label: "Python",
            variant: "brand",
        },
        {
            key: "nextjs",
            label: "Next.js",
            variant: "neutral",
        },
        {
            key: "tailwind",
            label: "Tailwind CSS",
            variant: "neutral",
        },
        {
            key: "postgres",
            label: "PostgreSQL",
            variant: "accent",
        },
        {
            key: "docker",
            label: "Docker",
            variant: "accent",
        },
    ] as ProjectTech[],
    slides: [
        {
            src: "/projects/codex/overview.webp",
            label: {
                pt: "Visão geral",
                en: "Overview",
            },
            sub: {
                pt: "Análise estática + IA",
                en: "Static analysis + AI",
            },
            description: {
                pt: "Página pública do Codex, com apresentação da proposta e demonstração do pipeline. A demonstração usa dados de exemplo, como indicado no próprio site.",
                en: "Codex's public page introducing the project and its pipeline demo. The demo uses sample data, as indicated on the site.",
            },
        },
        {
            src: "/projects/codex/pipeline.webp",
            label: {
                pt: "Do código ao relatório",
                en: "From code to report",
            },
            sub: {
                pt: "Três etapas integradas",
                en: "Three integrated stages",
            },
            description: {
                pt: "Captura real da explicação do fluxo: conectar o GitHub, executar as ferramentas de análise estática e revisar o código com IA.",
                en: "Real capture of the workflow explanation: connect GitHub, run static analysis tools and review code with AI.",
            },
        },
        {
            src: "/projects/codex/features.webp",
            label: {
                pt: "Além da nota",
                en: "Beyond the score",
            },
            sub: {
                pt: "Recursos do sistema",
                en: "System features",
            },
            description: {
                pt: "Seção pública que apresenta sugestões de código, comparação de pull requests, histórico e achados consolidados. Os exemplos visuais são demonstrativos.",
                en: "Public section presenting code suggestions, pull request comparisons, history and consolidated findings. The visual examples are illustrative.",
            },
        },
        {
            src: "/projects/codex/score.webp",
            label: {
                pt: "Critérios transparentes",
                en: "Transparent criteria",
            },
            sub: {
                pt: "Simulador de score",
                en: "Score simulator",
            },
            description: {
                pt: "Simulador da página pública: explore as faixas de classificação de 0 a 1000. A nota exibida é uma simulação, não o resultado de uma análise real.",
                en: "Public page simulator: explore rating bands from 0 to 1000. The displayed score is simulated, not the result of a real analysis.",
            },
        },
    ] as ProjectSlide[],
    architecture: [
        {
            icon: "layers",
            title: {
                pt: "Análise estática e IA",
                en: "Static analysis and AI",
            },
            text: {
                pt: "Lint, segurança e complexidade para Python, JavaScript/TypeScript e Go, com revisão opcional por IA. O sistema também opera em modo totalmente estático.",
                en: "Lint, security and complexity for Python, JavaScript/TypeScript and Go, with optional AI review. The system also runs in fully static mode.",
            },
        },
        {
            icon: "shield",
            title: {
                pt: "Integração com o GitHub",
                en: "GitHub integration",
            },
            text: {
                pt: "Análise por URL pública ou seleção de repositórios com OAuth. A comparação de pull requests mostra a diferença de score entre base e head.",
                en: "Analysis through a public URL or repository selection with OAuth. Pull request comparison shows the score difference between base and head.",
            },
        },
        {
            icon: "package",
            title: {
                pt: "Resultados e histórico",
                en: "Results and history",
            },
            text: {
                pt: "Progresso em tempo real via SSE, com fallback para polling. PostgreSQL habilita histórico, cache por commit e comparação entre análises.",
                en: "Real-time progress via SSE with polling fallback. PostgreSQL enables history, per-commit caching and comparison between analyses.",
            },
        },
    ] as ArchitectureCard[],
} as const;
