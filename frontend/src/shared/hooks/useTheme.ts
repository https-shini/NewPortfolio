/**
 * useTheme.ts — Design System v4.0 · bl4ck404.dev.br
 *
 * Responsabilidades:
 * · Lê preferência salva do localStorage (persistência entre sessões)
 * · Fallback para prefers-color-scheme do OS quando sem preferência salva
 * · Aplica data-theme no <html>, color-scheme, e classes no <body>
 * · Sincroniza com mudanças de preferência do OS em tempo real
 * · Sem flash de tema (FOUC) — o script inline do index.html cobre isso
 *
 * O hook NÃO deve ser chamado em múltiplos componentes — use Context se
 * precisar compartilhar o estado. No App atual, é chamado apenas no Header.
 */

import { useState, useEffect, useCallback } from "react";
import { THEME_KEY } from "@/shared/config/constants";

export type Theme = "dark" | "light";

/* ─────────────────────────────────────────────────────────────────────────────
   Utilitários — fora do hook para não recriar em cada render
   ───────────────────────────────────────────────────────────────────────────── */

/** Lê o tema inicial na ordem: localStorage → prefers-color-scheme → 'dark' */
function getInitialTheme(): Theme {
    try {
        const saved = localStorage.getItem(THEME_KEY) as Theme | null;
        if (saved === "dark" || saved === "light") return saved;
    } catch {
        /* localStorage pode lançar em contextos restritos (iframe, etc.) */
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

/**
 * Aplica o tema ao DOM e persiste no localStorage.
 * Centralizado aqui para garantir que as duas fontes de verdade
 * (data-theme no <html> e classes no <body>) sejam sempre sincronizadas.
 */
/* Cor do meta theme-color por tema — afeta a barra de navegador mobile */
const THEME_COLOR: Record<Theme, string> = {
    dark:  "#040710",
    light: "#f2f4f8",
};

function applyTheme(theme: Theme): void {
    const isDark = theme === "dark";
    const root = document.documentElement;
    const body = document.body;

    /* Atributo semântico — usado pelos CSS tokens */
    root.setAttribute("data-theme", theme);

    /* color-scheme — informa ao browser a paleta de UI nativa (scrollbar, inputs…) */
    root.style.colorScheme = theme;

    /* Classes no body — usadas pelos seletores body.light-mode / body.dark-mode */
    body.classList.toggle("dark-mode", isDark);
    body.classList.toggle("light-mode", !isDark);

    /* meta[name="theme-color"] dinâmico — barra de browser mobile alinhada ao tema */
    const themeColorMeta = document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]',
    );
    if (themeColorMeta) {
        themeColorMeta.setAttribute("content", THEME_COLOR[theme]);
    }

    /* Persiste preferência */
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch {
        /* silencioso — tema ainda funciona sem persistência */
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Hook principal
   ───────────────────────────────────────────────────────────────────────────── */
export function useTheme() {
    /* Inicialização lazy — getInitialTheme roda apenas no mount */
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    /* Aplica ao DOM sempre que o tema muda */
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    /* Sincroniza com mudanças de prefers-color-scheme do OS em tempo real,
     mas SOMENTE quando não há preferência salva pelo usuário. */
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");

        const handler = (e: MediaQueryListEvent) => {
            try {
                if (!localStorage.getItem(THEME_KEY)) {
                    setTheme(e.matches ? "dark" : "light");
                }
            } catch {
                /* localStorage indisponível — ignora */
            }
        };

        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    /** Alterna entre dark e light */
    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }, []);

    /** Define um tema específico sem toggle */
    const setThemeExplicit = useCallback((next: Theme) => {
        setTheme(next);
    }, []);

    return { theme, toggleTheme, setTheme: setThemeExplicit };
}
