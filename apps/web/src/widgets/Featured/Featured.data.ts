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

/* ─────────────────────────────────────────────────────────
   AUTHSERVICE — dados completos do projeto
───────────────────────────────────────────────────────── */
export const FEATURED_PROJECT = {
    id: "authservice",
    name: "AuthService",
    tagline: {
        pt: "Sistema de autenticação fullstack com tema Dark Industrial Terminal.",
        en: "Fullstack authentication system with Dark Industrial Terminal theme.",
    },
    description: {
        pt: "API REST construída em FastAPI com autenticação JWT (HS256) e bcrypt, servida junto a um frontend vanilla em um único container Docker. Arquitetura em camadas (Controllers → Services → Repositories → Models) com dashboard de monitoramento em tempo real.",
        en: "REST API built with FastAPI featuring JWT (HS256) authentication and bcrypt, served alongside a vanilla frontend in a single Docker container. Layered architecture (Controllers → Services → Repositories → Models) with real-time monitoring dashboard.",
    },

    repoUrl: PROJECT_URLS.authService.repo,
    liveUrl: PROJECT_URLS.authService.live,
    docsUrl: PROJECT_URLS.authService.docs,
    repoHost: "github.com/https-shini/AuthService",

    badges: [
        { label: "LIVE", variant: "live" },
        { label: "MIT", variant: "license" },
        { label: "DOCKER", variant: "neutral" },
        { label: "FASTAPI", variant: "framework" },
        { label: "PYTHON 3.11", variant: "language" },
    ] as ProjectBadge[],

    tech: [
        { key: "fastapi", label: "FastAPI", variant: "brand" },
        { key: "python", label: "Python", variant: "brand" },
        { key: "docker", label: "Docker", variant: "accent" },
        { key: "html", label: "HTML5", variant: "neutral" },
        { key: "css", label: "CSS3", variant: "neutral" },
        { key: "js", label: "JavaScript", variant: "neutral" },
    ] as ProjectTech[],

    endpoints: [
        {
            method: "GET",
            path: "/health",
            description: {
                pt: "Status da API e latência",
                en: "API status & latency",
            },
        },
        {
            method: "POST",
            path: "/register",
            description: {
                pt: "Cadastro de novo usuário",
                en: "New user registration",
            },
        },
        {
            method: "POST",
            path: "/token",
            description: { pt: "Autenticação JWT", en: "JWT authentication" },
        },
        {
            method: "GET",
            path: "/me",
            description: {
                pt: "Dados do usuário autenticado",
                en: "Authenticated user data",
            },
            protected: true,
        },
    ] as ProjectEndpoint[],

    slides: [
        {
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
            sub: {
                pt: "Medidor de força de senha",
                en: "Password strength meter",
            },
            description: {
                pt: "Formulário de cadastro com medidor de força de senha em 5 níveis e validação de e-mail. As senhas são hasheadas com bcrypt + salt antes de serem persistidas.",
                en: "Registration form with 5-level password strength meter and email validation. Passwords are hashed with bcrypt + salt before being persisted.",
            },
        },
        {
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
            sub: {
                pt: "Status, latência e logs",
                en: "Status, latency & logs",
            },
            description: {
                pt: "Painel de monitoramento em tempo real com status de cada endpoint, latência em milissegundos e logs estilo terminal — visibilidade total da saúde da API.",
                en: "Real-time monitoring panel with per-endpoint status, millisecond latency and terminal-style logs — total visibility of API health.",
            },
        },
    ] as ProjectSlide[],

    architecture: [
        {
            icon: "layers",
            title: { pt: "Arquitetura em Camadas", en: "Layered Architecture" },
            text: {
                pt: "Controllers → Services → Repositories → Models. Separação clara de responsabilidades com Pydantic DTOs e injeção de dependência nativa do FastAPI.",
                en: "Controllers → Services → Repositories → Models. Clear separation of concerns with Pydantic DTOs and FastAPI native dependency injection.",
            },
        },
        {
            icon: "shield",
            title: { pt: "Segurança Robusta", en: "Robust Security" },
            text: {
                pt: "Hash de senhas com bcrypt + salt. Tokens JWT assinados em HS256 com expiração configurável. Endpoint /me protegido por Bearer Token.",
                en: "Password hashing with bcrypt + salt. JWT tokens signed in HS256 with configurable expiration. /me endpoint protected by Bearer Token.",
            },
        },
        {
            icon: "package",
            title: { pt: "Deploy Unificado", en: "Unified Deployment" },
            text: {
                pt: "Backend e frontend rodam no mesmo container Docker. FastAPI StaticFiles serve o frontend vanilla. Pronto pra subir em qualquer plataforma.",
                en: "Backend and frontend run in the same Docker container. FastAPI StaticFiles serves the vanilla frontend. Ready to deploy on any platform.",
            },
        },
    ] as ArchitectureCard[],
} as const;

/* Cor por método HTTP — terminal-style */
export const METHOD_COLOR: Record<
    HttpMethod,
    { fg: string; bg: string; border: string }
> = {
    GET: {
        fg: "var(--_green-400)",
        bg: "color-mix(in srgb, var(--_green-500) 13%, transparent)",
        border: "color-mix(in srgb, var(--_green-500) 32%, transparent)",
    },
    POST: {
        fg: "var(--color-accent-light)",
        bg: "var(--color-accent-subtle)",
        border: "color-mix(in srgb, var(--color-accent) 32%, transparent)",
    },
    PUT: {
        fg: "var(--_amber-400)",
        bg: "color-mix(in srgb, var(--_amber-500) 13%, transparent)",
        border: "color-mix(in srgb, var(--_amber-500) 32%, transparent)",
    },
    DELETE: {
        fg: "var(--_red-400)",
        bg: "color-mix(in srgb, var(--_red-500) 13%, transparent)",
        border: "color-mix(in srgb, var(--_red-500) 32%, transparent)",
    },
    PATCH: {
        fg: "var(--color-brand-light)",
        bg: "var(--color-brand-subtle)",
        border: "color-mix(in srgb, var(--color-brand) 32%, transparent)",
    },
};
