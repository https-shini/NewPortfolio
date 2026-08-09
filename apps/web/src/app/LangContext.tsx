import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { LANG_KEY } from "@/shared/config/constants";
import { LANG_PARAM, DEFAULT_LANG } from "@/shared/config/routes";
import {
    type Lang,
    TRANSLATIONS,
    type TranslationKey,
} from "@/shared/lib/translations";

/* ─────────────────────────────────────────────────────────
   O idioma na URL
   ─────────────────────────────────────────────────────────
   Como parâmetro (`?lang=en`), e não como prefixo de caminho
   (`/en/...`): vale para qualquer rota sem tocar no roteador
   nem multiplicar as reescritas da Vercel, inclusive nas
   páginas de versão. O que se queria era poder mandar um link
   em inglês para alguém — e isso resolve.

   A ordem de precedência é deliberada. Quem abre um link
   compartilhado precisa ver o idioma daquele link, mesmo tendo
   outro salvo: o link é uma escolha mais recente e mais
   explícita que a preferência antiga. Só depois vem o que está
   salvo, e por último o palpite do navegador.
───────────────────────────────────────────────────────── */

function isLang(value: string | null): value is Lang {
    return value === "pt" || value === "en";
}

/** Idioma pedido na URL, se houver e se for um dos suportados. */
export function langFromSearch(search: string): Lang | null {
    const pedido = new URLSearchParams(search).get(LANG_PARAM);
    return isLang(pedido) ? pedido : null;
}

function getInitialLang(): Lang {
    const daUrl = langFromSearch(window.location.search);
    if (daUrl) return daUrl;

    const salvo = localStorage.getItem(LANG_KEY);
    if (isLang(salvo)) return salvo;

    return navigator.language?.toLowerCase().startsWith("en") ? "en" : "pt";
}

/**
 * Mantém a URL coerente com o idioma corrente, sem empilhar histórico:
 * trocar de idioma não é navegar, e o botão voltar não deveria desfazer
 * a troca em vez de sair da página.
 *
 * O padrão (português) sai da URL em vez de virar `?lang=pt`. Uma URL
 * limpa é a canônica, e duas formas para a mesma página só dividiriam o
 * sinal para os buscadores.
 */
function syncUrl(lang: Lang): void {
    const url = new URL(window.location.href);
    const atual = url.searchParams.get(LANG_PARAM);

    if (lang === DEFAULT_LANG) {
        if (atual === null) return;
        url.searchParams.delete(LANG_PARAM);
    } else {
        if (atual === lang) return;
        url.searchParams.set(LANG_PARAM, lang);
    }

    window.history.replaceState(window.history.state, "", url);
}

interface LangContextValue {
    lang: Lang;
    toggleLang: () => void;
    t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

/* index.html nasce com lang="pt-BR"; estas são as etiquetas equivalentes
   para cada idioma da interface. */
const HTML_LANG: Record<Lang, string> = { pt: "pt-BR", en: "en" };

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [lang, setLang] = useState<Lang>(getInitialLang);

    /* O atributo era ajustado só na troca. Quem chegava com o navegador em
       inglês recebia conteúdo em inglês num documento declarado pt-BR —
       leitor de tela lia com a voz errada e o buscador indexava o idioma
       errado (WCAG 3.1.1). Sincronizar aqui cobre a carga inicial também. */
    useEffect(() => {
        document.documentElement.setAttribute("lang", HTML_LANG[lang]);
        syncUrl(lang);
    }, [lang]);

    /* Voltar e avançar podem trocar a URL sem recarregar a página — se o
       idioma não acompanhar, o histórico passa a mentir sobre o que
       aquela entrada mostrava. */
    useEffect(() => {
        const onPopState = () => {
            const daUrl = langFromSearch(window.location.search);
            setLang(daUrl ?? DEFAULT_LANG);
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    const toggleLang = useCallback(() => {
        setLang((prev) => {
            const next: Lang = prev === "pt" ? "en" : "pt";
            localStorage.setItem(LANG_KEY, next);
            return next;
        });
    }, []);

    const t = useCallback(
        (key: TranslationKey): string =>
            TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.pt[key] ?? key,
        [lang],
    );

    return (
        <LangContext.Provider value={{ lang, toggleLang, t }}>
            {children}
        </LangContext.Provider>
    );
};

export function useLangContext(): LangContextValue {
    const ctx = useContext(LangContext);
    if (!ctx)
        throw new Error("useLangContext must be used inside LangProvider");
    return ctx;
}
