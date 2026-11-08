import React from "react";
import "./ErrorBoundary.css";

/* ─────────────────────────────────────────────────────────
   ErrorBoundary — o último recurso antes da página em branco
   ─────────────────────────────────────────────────────────
   Sem ele, qualquer exceção de render (ou um `import()` de rota que
   falhou e esgotou a nova tentativa de `lazyComRetry`) desmontava a
   árvore inteira: a pessoa via o fundo e mais nada, sem saber que
   recarregar resolveria.

   O texto NÃO vem do LangContext de propósito: o erro pode ter vindo
   justamente de lá. O idioma sai do `<html lang>`, que o provider
   mantém em dia e que o index.html já declara antes de tudo.

   Classe porque é a única API do React que captura erro de render.
───────────────────────────────────────────────────────── */

const TEXTOS = {
    pt: {
        titulo: "Algo saiu do lugar.",
        descricao:
            "Esta parte do portfólio não carregou. Recarregar a página costuma resolver.",
        recarregar: "Recarregar a página",
        inicio: "Ir para o início",
    },
    en: {
        titulo: "Something went wrong.",
        descricao:
            "This part of the portfolio didn't load. Reloading the page usually fixes it.",
        recarregar: "Reload the page",
        inicio: "Go to the home page",
    },
} as const;

function idiomaDoDocumento(): keyof typeof TEXTOS {
    if (typeof document === "undefined") return "pt";
    return document.documentElement.lang.toLowerCase().startsWith("en")
        ? "en"
        : "pt";
}

interface Props {
    children: React.ReactNode;
}

interface State {
    erro: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { erro: null };

    static getDerivedStateFromError(erro: Error): State {
        return { erro };
    }

    componentDidCatch(erro: Error, info: React.ErrorInfo): void {
        /* O console é o único destino hoje; um coletor de erros do cliente
           está no roadmap (F8-02). Sem dados da pessoa, só a falha. */
        console.error("[ErrorBoundary]", erro.message, info.componentStack);
    }

    render(): React.ReactNode {
        if (!this.state.erro) return this.props.children;

        const t = TEXTOS[idiomaDoDocumento()];
        return (
            <main id="main-content" className="erro-pagina" role="alert">
                <div className="erro-pagina__caixa">
                    <p className="erro-pagina__marca" aria-hidden="true">
                        &lt;gcruz<span>.dev</span>/&gt;
                    </p>
                    <h1 className="erro-pagina__titulo">{t.titulo}</h1>
                    <p className="erro-pagina__descricao">{t.descricao}</p>
                    <div className="erro-pagina__acoes">
                        <button
                            type="button"
                            className="btn btn--primary"
                            onClick={() => window.location.reload()}
                        >
                            {t.recarregar}
                        </button>
                        <a href="/" className="btn btn--outline">
                            {t.inicio}
                        </a>
                    </div>
                </div>
            </main>
        );
    }
}
