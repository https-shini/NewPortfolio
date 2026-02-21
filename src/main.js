/**
 * MAIN.JS — ATUALIZADO
 * ─────────────────────────────────────────────────────────────────────────────
 * Alterações em relação ao original:
 *   + import initThemeLang (substitui initDarkMode)
 *   + Tema e idioma inicializados ANTES do DOMContentLoaded
 *   + Removido import de mobile-nav.js (absorvido por theme-lang.js)
 *   + Ano atual no footer movido para theme-lang.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Estilos ──────────────────────────────────────────────────────────────────
import "../styles/modern-normalize.css";
import "../styles/style.css";
import "../styles/components/header.css"; // ← atualizado
import "../styles/components/hero.css";
import "../styles/components/about.css";
import "../styles/components/education.css";
import "../styles/components/featured.css";
import "../styles/components/work.css";
import "../styles/components/contact.css";
import "../styles/components/footer.css"; // ← atualizado
import "../styles/components/timeline.css";
import "../styles/utils.css";

// ── Módulos ──────────────────────────────────────────────────────────────────
import initThemeLang from "./utils/theme-lang"; // ← NOVO (substitui initDarkMode + mobile-nav)
import initLazyLoading from "./utils/lazy-loading";
import { timelineTabs, animateTimelineItems } from "./utils/timeline";
import initContact from "./utils/contact";

// ── Inicialização IMEDIATA (tema antes de renderizar) ────────────────────────
initThemeLang(); // ← tema + idioma (evita flicker, carrega i18n.json)
initLazyLoading();

// ── Após DOM carregado ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    timelineTabs();
    animateTimelineItems();
    initContact();
    initSkipLink();
    respectReducedMotion();
});

// ── Auxiliares (originais) ───────────────────────────────────────────────────
function initSkipLink() {
    const skipLink = document.querySelector('a[href="#main-content"]');
    if (!skipLink) return;
    skipLink.addEventListener("click", (e) => {
        e.preventDefault();
        const main = document.getElementById("main-content");
        if (!main) return;
        main.setAttribute("tabindex", "-1");
        main.focus();
        main.addEventListener("blur", () => main.removeAttribute("tabindex"), {
            once: true,
        });
    });
}

function respectReducedMotion() {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (v) => document.body.classList.toggle("reduce-motion", v);
    apply(mq.matches);
    mq.addEventListener("change", (e) => apply(e.matches));
}

// ── Erros globais (originais) ────────────────────────────────────────────────
window.addEventListener("error", (e) =>
    console.error("Erro não tratado:", e.error),
);
window.addEventListener("unhandledrejection", (e) =>
    console.error("Promise rejeitada:", e.reason),
);

export { initThemeLang, initLazyLoading, timelineTabs, animateTimelineItems };
