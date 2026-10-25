<<<<<<< Updated upstream
/* ─────────────────────────────────────────────────────────
   Featured.data — AuthService project
   URLs em shared/config/links.ts (fonte única).
───────────────────────────────────────────────────────── */

import type { SkillIconId } from "@/shared/config/skillIcons";
import { PROJECT_URLS } from "@/shared/config/links";
/* ── As cinco variantes de cada slide, para o `srcset` ───────────────
   Geradas por `scripts/imagens.mjs`, que documenta a escolha das larguras.
   Medido no navegador: o slide exibe de 326px (viewport 360) a 958px
   (viewport 1024) e trava em 602px acima de 1200 — a virada está no
   `@media (min-width: 1025px)` do Featured.css.

   As fontes têm 1600x900; a maior variante é 1920 para cobrir 958 a 2x
   (1916). O `src` aponta para a de 1440 como reserva de quem não entende
   `srcset`. */
import login400 from "@/assets/gerado/login-400.webp";
import login720 from "@/assets/gerado/login-720.webp";
import login1024 from "@/assets/gerado/login-1024.webp";
import login1440 from "@/assets/gerado/login-1440.webp";
import login1920 from "@/assets/gerado/login-1920.webp";
import cadastro400 from "@/assets/gerado/cadastro-400.webp";
import cadastro720 from "@/assets/gerado/cadastro-720.webp";
import cadastro1024 from "@/assets/gerado/cadastro-1024.webp";
import cadastro1440 from "@/assets/gerado/cadastro-1440.webp";
import cadastro1920 from "@/assets/gerado/cadastro-1920.webp";
import home400 from "@/assets/gerado/home-400.webp";
import home720 from "@/assets/gerado/home-720.webp";
import home1024 from "@/assets/gerado/home-1024.webp";
import home1440 from "@/assets/gerado/home-1440.webp";
import home1920 from "@/assets/gerado/home-1920.webp";
import status400 from "@/assets/gerado/status-400.webp";
import status720 from "@/assets/gerado/status-720.webp";
import status1024 from "@/assets/gerado/status-1024.webp";
import status1440 from "@/assets/gerado/status-1440.webp";
import status1920 from "@/assets/gerado/status-1920.webp";

/** Monta o `srcset` a partir das cinco variantes, na ordem das larguras. */
const jogo = (...urls: readonly string[]): string =>
    urls.map((u, i) => `${u} ${[400, 720, 1024, 1440, 1920][i]}w`).join(", ");

const SRCSET = {
    login: jogo(login400, login720, login1024, login1440, login1920),
    cadastro: jogo(
        cadastro400,
        cadastro720,
        cadastro1024,
        cadastro1440,
        cadastro1920,
    ),
    home: jogo(home400, home720, home1024, home1440, home1920),
    status: jogo(status400, status720, status1024, status1440, status1920),
} as const;

/**
 * `sizes` — a largura de exibição, conforme medida.
 *
 *   <= 1024px    92vw   (326 a 958px, conferido de 360 a 1024)
 *   <= 1250px    50vw   (548 em 1100, 602 em 1200)
 *   acima       602px   (travado, de 1280 a 1920)
 *
 * Sem isto o navegador assume 100vw e escolhe sempre a variante maior —
 * que é exatamente o que acontecia antes.
 *
 * 92vw e não 94: as medições deram 91vw a 360 e 390, 92vw de 480 a 768,
 * 93vw a 900 e 94vw a 1024. Com 94 o cálculo em 768 dava 1444px e o
 * navegador subia para a variante de 1920 onde a de 1440 bastava — 17,1 KB
 * em vez de 11,7. Com 92, 768 cai em 1440 e 1024 continua em 1920, porque
 * 92vw de 1024 são 942px, que a 2x pedem 1884 e ainda passam de 1440.
 * Subestimar um pouco é o lado seguro: a variante seguinte cobre.
 */
export const SLIDE_SIZES =
    "(max-width: 1024px) 92vw, (max-width: 1250px) 50vw, 602px";

/** As dimensões intrínsecas das quatro fontes, para a proporção 16:9. */
export const SLIDE_W = 1600;
export const SLIDE_H = 900;

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ProjectEndpoint {
    method: HttpMethod;
    path: string;
    description: { pt: string; en: string };
    protected?: boolean;
}

export interface ProjectBadge {
    label: string;
    variant: "live" | "license" | "framework" | "language" | "neutral";
}

=======
/* Codex — Code Validator, TCC. Conteúdo conferido no código-fonte do projeto. */
import { PROJECT_URLS } from "@/shared/config/links";
>>>>>>> Stashed changes
export interface ProjectTech {
    /** ID do ícone local — ver `shared/config/skillIcons.ts`. */
    key: SkillIconId;
    label: string; // display name
    variant: "brand" | "accent" | "neutral";
}

export interface ProjectSlide {
    src: string; // reserva para quem não entende srcset
    /** As cinco variantes com descritor `w` — ver SRCSET acima. */
    srcSet: string;
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
<<<<<<< Updated upstream
            src: login1440,
            srcSet: SRCSET.login,
            label: { pt: "Tela de Login", en: "Login Screen" },
            sub: { pt: "Autenticação JWT", en: "JWT Authentication" },
            description: {
                pt: "Interface de login com validação em tempo real e feedback visual claro. O backend valida credenciais via bcrypt e emite um JWT (HS256) com tempo de expiração configurável.",
                en: "Login interface with real-time validation and clear visual feedback. The backend validates credentials with bcrypt and issues a JWT (HS256) with configurable expiration time.",
            },
        },
        {
            src: cadastro1440,
            srcSet: SRCSET.cadastro,
            label: { pt: "Cadastro", en: "Registration" },
=======
            src: "/projects/codex/overview.webp",
            label: {
                pt: "Visão geral",
                en: "Overview",
            },
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            src: home1440,
            srcSet: SRCSET.home,
            label: { pt: "Dashboard", en: "Dashboard" },
            sub: { pt: "Perfil + token JWT", en: "Profile + JWT token" },
            description: {
                pt: "Dashboard pós-login exibindo dados do usuário autenticado (endpoint /me) e o token JWT em uso, com botão de cópia para área de transferência.",
                en: "Post-login dashboard showing authenticated user data (/me endpoint) and the active JWT token, with one-click copy to clipboard.",
            },
        },
        {
            src: status1440,
            srcSet: SRCSET.status,
            label: { pt: "Monitor da API", en: "API Monitor" },
=======
            src: "/projects/codex/pipeline.webp",
            label: {
                pt: "Do código ao relatório",
                en: "From code to report",
            },
>>>>>>> Stashed changes
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
