/**
 * ThemeContext.tsx — o tema da interface, com UMA fonte de verdade.
 *
 * ── Por que isto existe ──────────────────────────────────────────────
 *
 * A lógica morava em `shared/hooks/useTheme.ts`, num `useState`, e o
 * cabeçalho daquele arquivo avisava: *"O hook NÃO deve ser chamado em
 * múltiplos componentes — use Context se precisar compartilhar o estado"*.
 *
 * O aviso existia porque a violação já tinha acontecido. A `pages/Links`
 * chamava o hook em paralelo com o Header, que é quem tem o botão — dois
 * `useState` independentes para a mesma coisa. O efeito era visível: lá, os
 * seis ícones de stack escolhiam a variante pelo estado DA PÁGINA, e
 * clicar no botão do Header trocava o tema do documento sem trocar os
 * ícones. Um aviso em comentário não impede ninguém de chamar um hook
 * exportado; um Provider, sim.
 *
 * Agora o estado é um só, e o hook público (`shared/hooks/useTheme.ts`)
 * virou um reexport deste Context — a mesma forma que `useLang` tem desde
 * sempre.
 *
 * ── O que NÃO mudou ──────────────────────────────────────────────────
 *
 * A API (`{ theme, toggleTheme, setTheme }`), a chave `portfolio-theme`, o
 * `data-theme` no `<html>`, `body.dark-mode` / `body.light-mode`, o
 * `color-scheme`, o `meta[name="theme-color"]`, o listener de
 * `prefers-color-scheme` e a ausência de flash — que continua sendo
 * trabalho do script inline do `index.html`, não daqui. O Header não
 * mudou uma linha.
 */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import type React from "react";
import { THEME_KEY } from "@/shared/config/constants";

export type Theme = "dark" | "light";

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (next: Theme) => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Utilitários — fora do componente para não recriar em cada render
   ───────────────────────────────────────────────────────────────────────────── */

/** Lê o tema inicial na ordem: localStorage → prefers-color-scheme → 'dark' */
function getInitialTheme(): Theme {
    /* Mesma razão do idioma em LangContext: durante a pré-renderização não
       há `localStorage` nem `matchMedia`. O escuro é o padrão do site — é o
       que o <body class="dark-mode"> do index.html já declara. */
    if (typeof window === "undefined") return "dark";

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

/* Cor do meta theme-color por tema — afeta a barra de navegador mobile */
const THEME_COLOR: Record<Theme, string> = {
    dark: "#040710",
    light: "#f2f4f8",
};

/**
 * Aplica o tema ao DOM e persiste no localStorage.
 * Centralizado aqui para garantir que as duas fontes de verdade
 * (data-theme no <html> e classes no <body>) sejam sempre sincronizadas.
 */
function applyTheme(theme: Theme): void {
    const isDark = theme === "dark";
    const root = document.documentElement;
    const body = document.body;

    /* Atributo semântico — usado pelos CSS tokens E pelo SkillIcon, que
       escolhe a variante do ícone por `:root[data-theme="light"]`. */
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
}

/**
 * Persiste a preferência — chamado APENAS quando o usuário escolhe o tema
 * explicitamente. Persistir também no mount anularia o listener de
 * `prefers-color-scheme` abaixo (nunca haveria "sem preferência salva").
 */
function persistTheme(theme: Theme): void {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch {
        /* silencioso — tema ainda funciona sem persistência */
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Provider
   ───────────────────────────────────────────────────────────────────────────── */

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
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

    /** Alterna entre dark e light (escolha explícita → persiste) */
    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next: Theme = prev === "dark" ? "light" : "dark";
            persistTheme(next);
            return next;
        });
    }, []);

    /** Define um tema específico sem toggle (escolha explícita → persiste) */
    const setThemeExplicit = useCallback((next: Theme) => {
        persistTheme(next);
        setTheme(next);
    }, []);

    return (
        <ThemeContext.Provider
            value={{ theme, toggleTheme, setTheme: setThemeExplicit }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

/* O hook fica no mesmo arquivo que o Provider, pelo mesmo motivo que em
   LangContext: quem lê o provider lê o contrato de consumo na mesma tela.
   O custo — este arquivo perde o Fast Refresh — é conhecido e menor que o de
   espalhar o par por dois arquivos. */
/* eslint-disable-next-line react-refresh/only-export-components */
export function useThemeContext(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx)
        throw new Error("useThemeContext must be used inside ThemeProvider");
    return ctx;
}
