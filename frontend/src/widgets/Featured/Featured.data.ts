/* ─────────────────────────────────────────────────────────
   Featured.data — AuthService project
   Fonte: https://github.com/https-shini/AuthService
───────────────────────────────────────────────────────── */

import loginImg from "@/assets/authservice/login.webp";
import cadastroImg from "@/assets/authservice/cadastro.webp";
import homeImg from "@/assets/authservice/home.webp";
import statusImg from "@/assets/authservice/status.webp";

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
    key: string; // skillicons key
    label: string; // display name
    variant: "brand" | "accent" | "neutral";
}

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

    repoUrl: "https://github.com/https-shini/AuthService",
    liveUrl: "https://authservice-mbul.onrender.com",
    docsUrl: "https://authservice-mbul.onrender.com/docs",
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
            src: loginImg,
            label: { pt: "Tela de Login", en: "Login Screen" },
            sub: { pt: "Autenticação JWT", en: "JWT Authentication" },
            description: {
                pt: "Interface de login com validação em tempo real e feedback visual claro. O backend valida credenciais via bcrypt e emite um JWT (HS256) com tempo de expiração configurável.",
                en: "Login interface with real-time validation and clear visual feedback. The backend validates credentials with bcrypt and issues a JWT (HS256) with configurable expiration time.",
            },
        },
        {
            src: cadastroImg,
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
            src: homeImg,
            label: { pt: "Dashboard", en: "Dashboard" },
            sub: { pt: "Perfil + token JWT", en: "Profile + JWT token" },
            description: {
                pt: "Dashboard pós-login exibindo dados do usuário autenticado (endpoint /me) e o token JWT em uso, com botão de cópia para área de transferência.",
                en: "Post-login dashboard showing authenticated user data (/me endpoint) and the active JWT token, with one-click copy to clipboard.",
            },
        },
        {
            src: statusImg,
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
