import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { LANG_KEY } from "@/shared/config/constants";
import {
    type Lang,
    TRANSLATIONS,
    type TranslationKey,
} from "@/shared/lib/translations";

function getInitialLang(): Lang {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null;
    if (saved === "pt" || saved === "en") return saved;
    return navigator.language?.toLowerCase().startsWith("en") ? "en" : "pt";
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
    }, [lang]);

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
