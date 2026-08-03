import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { ROUTES, type RoutePath } from "@/shared/config/routes";

/* ─────────────────────────────────────────────────────────
   RouterContext — roteamento client-side sem dependências
   ─────────────────────────────────────────────────────────
   O projeto tem apenas react e react-dom em runtime. Um router
   completo (nested routes, loaders, data APIs) resolveria problemas
   que este site não tem: são poucas rotas, todas estáticas.

   Aqui bastam History API + popstate. Mesma forma do LangContext:
   Provider no app/, hook exposto via alias em shared/hooks/useRoute.
───────────────────────────────────────────────────────── */

/** Normaliza o pathname: remove barra final redundante ("/links/" → "/links"). */
function normalize(pathname: string): string {
    if (pathname.length > 1 && pathname.endsWith("/")) {
        return pathname.slice(0, -1);
    }
    return pathname || ROUTES.HOME;
}

function getInitialPath(): string {
    if (typeof window === "undefined") return ROUTES.HOME;
    return normalize(window.location.pathname);
}

interface RouterContextValue {
    /** Pathname corrente, já normalizado. */
    path: string;
    /** Navega para uma rota interna, empilhando no histórico do browser. */
    navigate: (to: RoutePath) => void;
    /** True quando a rota corrente é a home. */
    isHome: boolean;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [path, setPath] = useState<string>(getInitialPath);

    /* Botões voltar/avançar do browser. */
    useEffect(() => {
        const handlePopState = () =>
            setPath(normalize(window.location.pathname));
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const navigate = useCallback((to: RoutePath) => {
        const next = normalize(to);
        if (normalize(window.location.pathname) === next) return;

        window.history.pushState({}, "", next);
        setPath(next);

        /* Rota nova começa do topo — o browser não faz isso em pushState. */
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }, []);

    return (
        <RouterContext.Provider
            value={{ path, navigate, isHome: path === ROUTES.HOME }}
        >
            {children}
        </RouterContext.Provider>
    );
};

export function useRouterContext(): RouterContextValue {
    const ctx = useContext(RouterContext);
    if (!ctx)
        throw new Error("useRouterContext must be used inside RouterProvider");
    return ctx;
}
