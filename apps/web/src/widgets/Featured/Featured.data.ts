/* Firecode — validador de repositórios (TCC; antes "Codex"). Apresentação baseada no material técnico
   disponível e nas capturas da página pública; não distribui código interno. */
import type { GenericTech } from "@/features/devhub/tech";
import { PROJECT_URLS } from "@/shared/config/links";
/** Camada da stack em que a tecnologia aparece. */
export type TechGroup = "interface" | "api" | "analysis" | "integrations";

export interface ProjectTech {
    key: string; // identificador estável da tecnologia
    label: string; // nome de exibição, como a tecnologia se escreve
    group: TechGroup;
    /** Ícone genérico quando o catálogo não tem a tecnologia. */
    generic: GenericTech;
}

export interface ProjectSlide {
    src: string; // captura no tema escuro (padrão do site)
    /** Mesma tela no tema claro; quando existe, acompanha o tema ativo. */
    srcLight?: string;
    label: { pt: string; en: string };
    sub: { pt: string; en: string };
    /** Descrição rica para exibir no lightbox (texto contextual) */
    description?: { pt: string; en: string };
}

export interface ArchitectureCard {
    icon: "layers" | "shield" | "package";
    title: { pt: string; en: string };
    /** Texto corrido completo (leitura técnica). */
    text: { pt: string; en: string };
    /** Introdução curta do cartão. */
    summary: { pt: string; en: string };
    /** Recursos listados no cartão. */
    details: { pt: string; en: string }[];
}

export const FEATURED_PROJECT = {
    id: "firecode",
    name: "Firecode",
    tagline: {
        pt: "TCC em engenharia de software: o repositório passa pelo teste de fogo da análise estática e da inteligência artificial.",
        en: "A software engineering capstone: the repository goes through a trial by fire of static analysis and artificial intelligence.",
    },
    description: {
        pt: "Uma aplicação que combina análise estática e revisão por inteligência artificial para avaliar repositórios do GitHub. Transforma lint, segurança e complexidade em um score de 0 a 1000 (40% análise estática, 60% revisão por IA), com um relatório do que corrigir primeiro.",
        en: "An application combining static analysis and AI review to evaluate GitHub repositories. It turns lint, security and complexity findings into a score from 0 to 1000 (40% static analysis, 60% AI review), with a report on what to fix first.",
    },
    detailsUrl: PROJECT_URLS.firecode.details,
    liveUrl: PROJECT_URLS.firecode.live,
    repoHost: "firecode.shxred.app.br",
    /* Stack conforme a página técnica do projeto (pages/Codex). */
    tech: [
        {
            key: "nextjs",
            label: "Next.js",
            group: "interface",
            generic: "code",
        },
        { key: "react", label: "React", group: "interface", generic: "code" },
        { key: "ts", label: "TypeScript", group: "interface", generic: "code" },
        {
            key: "tailwind",
            label: "Tailwind CSS",
            group: "interface",
            generic: "style",
        },
        {
            key: "lucide",
            label: "lucide-react",
            group: "interface",
            generic: "lib",
        },
        { key: "python", label: "Python", group: "api", generic: "code" },
        { key: "fastapi", label: "FastAPI", group: "api", generic: "server" },
        { key: "uvicorn", label: "Uvicorn", group: "api", generic: "server" },
        {
            key: "postgres",
            label: "PostgreSQL",
            group: "api",
            generic: "database",
        },
        {
            key: "docker",
            label: "Docker Compose",
            group: "api",
            generic: "server",
        },
        { key: "ruff", label: "ruff", group: "analysis", generic: "code" },
        {
            key: "bandit",
            label: "bandit",
            group: "analysis",
            generic: "security",
        },
        { key: "radon", label: "radon", group: "analysis", generic: "code" },
        { key: "biome", label: "Biome", group: "analysis", generic: "code" },
        {
            key: "golangci",
            label: "golangci-lint",
            group: "analysis",
            generic: "code",
        },
        {
            key: "github-api",
            label: "GitHub API",
            group: "integrations",
            generic: "server",
        },
        {
            key: "github-oauth",
            label: "GitHub OAuth",
            group: "integrations",
            generic: "security",
        },
        {
            key: "gemini",
            label: "Gemini",
            group: "integrations",
            generic: "lib",
        },
        {
            key: "claude",
            label: "Claude",
            group: "integrations",
            generic: "lib",
        },
        {
            key: "openrouter",
            label: "OpenRouter",
            group: "integrations",
            generic: "lib",
        },
    ] as ProjectTech[],
    slides: [
        {
            src: "/projects/firecode/overview.webp",
            srcLight: "/projects/firecode/overview-light.webp",
            label: {
                pt: "Visão geral",
                en: "Overview",
            },
            sub: {
                pt: "Análise estática + IA",
                en: "Static analysis + AI",
            },
            description: {
                pt: "Página pública do Firecode: proposta, os números do projeto (5 ferramentas, menos de 60 s por análise, nota de 0 a 1000) e uma demonstração do pipeline com dados de exemplo, como indicado no próprio site.",
                en: "Firecode's public page: the pitch, the project's numbers (5 tools, under 60 s per analysis, a score from 0 to 1000) and a pipeline demo with sample data, as stated on the site.",
            },
        },
        {
            src: "/projects/firecode/pipeline.webp",
            srcLight: "/projects/firecode/pipeline-light.webp",
            label: {
                pt: "Do código ao relatório",
                en: "From code to report",
            },
            sub: {
                pt: "Três etapas automáticas",
                en: "Three automatic stages",
            },
            description: {
                pt: "O fluxo completo: conectar o GitHub por OAuth, rodar a análise estática (ruff, bandit, radon e Biome) e a revisão por IA. O progresso chega ao vivo por streaming.",
                en: "The full flow: connect GitHub through OAuth, run static analysis (ruff, bandit, radon and Biome) and the AI review. Progress arrives live through streaming.",
            },
        },
        {
            src: "/projects/firecode/features.webp",
            srcLight: "/projects/firecode/features-light.webp",
            label: {
                pt: "Além da nota",
                en: "Beyond the score",
            },
            sub: {
                pt: "Recursos do sistema",
                en: "System features",
            },
            description: {
                pt: "O que o relatório entrega além da nota: sugestões de código lado a lado, comparação de pull requests, histórico, reanálise automática por webhook e achados consolidados. Os exemplos são demonstrativos.",
                en: "What the report delivers beyond the score: side-by-side code suggestions, pull request comparison, history, automatic webhook reanalysis and consolidated findings. The examples are illustrative.",
            },
        },
        {
            src: "/projects/firecode/score.webp",
            srcLight: "/projects/firecode/score-light.webp",
            label: {
                pt: "Critérios transparentes",
                en: "Transparent criteria",
            },
            sub: {
                pt: "Simulador de score",
                en: "Score simulator",
            },
            description: {
                pt: "Simulador das faixas de 0 a 1000 e do peso da nota: 40% análise estática e 60% revisão por IA; sem IA, só a parte estática. A nota exibida é uma simulação, não o resultado de uma análise real.",
                en: "Simulator of the 0–1000 bands and of how the score is weighted: 40% static analysis and 60% AI review; without AI, only the static part. The displayed score is simulated, not the result of a real analysis.",
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
            summary: {
                pt: "Lint, segurança e complexidade avaliados por ferramentas consolidadas, com os achados normalizados num só relatório.",
                en: "Lint, security and complexity assessed by established tools, with findings normalized into a single report.",
            },
            details: [
                {
                    pt: "Python com ruff, bandit e radon; JavaScript/TypeScript com Biome; Go com golangci-lint.",
                    en: "Python with ruff, bandit and radon; JavaScript/TypeScript with Biome; Go with golangci-lint.",
                },
                {
                    pt: "Revisão qualitativa opcional por IA (Gemini, Claude ou OpenRouter).",
                    en: "Optional qualitative AI review (Gemini, Claude or OpenRouter).",
                },
                {
                    pt: "Funciona também em modo totalmente estático, sem IA.",
                    en: "Also runs in fully static mode, without AI.",
                },
            ],
        },
        {
            icon: "shield",
            title: {
                pt: "Integração com o GitHub",
                en: "GitHub integration",
            },
            text: {
                pt: "Login com GitHub OAuth e acesso somente leitura a qualquer repositório do usuário, público ou privado. Cada push reanalisa o projeto, e a comparação de pull requests mostra a diferença de score entre base e head.",
                en: "GitHub OAuth sign-in with read-only access to any of the user's repositories, public or private. Every push triggers a new analysis, and pull request comparison shows the score difference between base and head.",
            },
            summary: {
                pt: "Conecte um repositório e veja como cada pull request altera a pontuação do código.",
                en: "Connect a repository and see how each pull request changes the code score.",
            },
            details: [
                {
                    pt: "Login com GitHub OAuth: qualquer repositório seu, público ou privado, com acesso somente leitura e revogável.",
                    en: "GitHub OAuth sign-in: any of your repositories, public or private, with read-only, revocable access.",
                },
                {
                    pt: "Reanálise automática por webhook a cada push na branch padrão.",
                    en: "Automatic reanalysis via webhook on every push to the default branch.",
                },
                {
                    pt: "Comparação de pull requests: diferença de score entre base e head.",
                    en: "Pull request comparison: score difference between base and head.",
                },
            ],
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
            summary: {
                pt: "Acompanhe cada análise em tempo real e compare com as anteriores para ver a qualidade evoluir.",
                en: "Follow each analysis in real time and compare it with earlier ones to see quality evolve.",
            },
            details: [
                {
                    pt: "Progresso via SSE, com polling como alternativa.",
                    en: "Progress via SSE, with polling as a fallback.",
                },
                {
                    pt: "Histórico e comparação entre análises em PostgreSQL.",
                    en: "History and comparison between analyses in PostgreSQL.",
                },
                {
                    pt: "Cache por commit: resultados da mesma versão são reaproveitados.",
                    en: "Per-commit cache: results for the same version are reused.",
                },
            ],
        },
    ] as ArchitectureCard[],
} as const;

/** Captura do tema ativo: a clara quando existe e o tema é claro. */
export function slideSrc(slide: ProjectSlide, theme: "light" | "dark"): string {
    return theme === "light" && slide.srcLight ? slide.srcLight : slide.src;
}
