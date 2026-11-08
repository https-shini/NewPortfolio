import React from "react";
import "./RouteFallback.css";

/* ─────────────────────────────────────────────────────────
   RouteFallback — o que aparece enquanto uma página chega
   ─────────────────────────────────────────────────────────
   Era `fallback={null}`: em rede lenta, navegar para as notas de
   versão ou para /projetos mostrava só o fundo, sem sinal de que algo
   estava acontecendo. Aqui há um indicador discreto, com a altura de
   uma tela para o rodapé não subir e descer, e um texto para leitor
   de tela. A barra para sob `prefers-reduced-motion` (CSS).

   O texto não depende do LangContext para não acoplar o fallback ao
   carregamento das traduções; o idioma vem do `<html lang>`.
───────────────────────────────────────────────────────── */

export const RouteFallback: React.FC = () => {
    const ingles =
        typeof document !== "undefined" &&
        document.documentElement.lang.toLowerCase().startsWith("en");
    return (
        <div className="route-fallback" role="status" aria-live="polite">
            <span className="route-fallback__barra" aria-hidden="true" />
            <span className="sr-only">
                {ingles ? "Loading page…" : "Carregando a página…"}
            </span>
        </div>
    );
};
