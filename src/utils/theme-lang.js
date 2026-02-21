/**
 * ============================================================================
 * THEME-LANG.JS
 * Módulo unificado: tema claro/escuro + idioma PT/EN
 * ============================================================================
 * IMPORTANTE: Este arquivo NÃO importa CSS.
 * Os imports de CSS ficam no main.js.
 * ============================================================================
 */

// ── CONFIGURAÇÃO ─────────────────────────────────────────────────────────────

const THEME_KEY = "theme";
const LANG_KEY = "lang";

let currentLang = "pt"; // padrão português
let translations = {}; // carregado via fetch de i18n.json

// ── TEMA ─────────────────────────────────────────────────────────────────────

/**
 * Aplica tema claro ou escuro
 * @param {boolean} isDark
 */
function applyTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    document.body.classList.toggle("light-mode", !isDark);

    // Atualiza ARIA em todos os botões de tema
    document.querySelectorAll("[class*='__theme']").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(isDark));
        btn.setAttribute(
            "aria-label",
            isDark ? "Alternar para modo claro" : "Alternar para modo escuro",
        );
    });

    // Salva no localStorage
    localStorage.setItem(THEME_KEY, isDark ? "dark-mode" : "light-mode");

    // Anuncia mudança para leitores de tela
    announceChange(isDark ? "Modo escuro ativado" : "Modo claro ativado");
}

/**
 * Detecta tema inicial: localStorage > prefers-color-scheme > dark
 */
function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const isDark =
        saved === "dark-mode" ||
        (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);

    applyTheme(isDark);

    // Sincroniza mudanças do sistema
    window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
            if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches);
        });

    // Event listeners em todos os botões de tema
    document.querySelectorAll("[class*='__theme']").forEach((btn) => {
        btn.addEventListener("click", () => {
            const nowDark = document.body.classList.contains("dark-mode");
            applyTheme(!nowDark);
        });
    });
}

// ── IDIOMA ───────────────────────────────────────────────────────────────────

/**
 * Carrega arquivo translations.json
 */
async function loadTranslations() {
    try {
        const res = await fetch("/src/json/translations.json");
        translations = await res.json();
    } catch (err) {
        console.error("[theme-lang] Erro ao carregar translations.json:", err);
        // Fallback: funciona sem tradução, apenas PT
        translations = { pt: {}, en: {} };
    }
}

/**
 * Aplica tradução no DOM
 * Procura todos os elementos com [data-i18n] e substitui seu textContent
 * @param {string} lang - "pt" ou "en"
 */
function applyLang(lang) {
    currentLang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const value = getNestedValue(translations[lang], key);
        if (value) el.textContent = value;
    });

    // Atualiza texto dos botões de idioma
    const newLangText = lang === "pt" ? "EN" : "PT";
    document.querySelectorAll("[class*='__lang-text']").forEach((span) => {
        span.textContent = newLangText;
    });

    // Salva preferência
    localStorage.setItem(LANG_KEY, lang);

    // Atualiza lang no <html>
    document.documentElement.setAttribute("lang", lang);

    // Anuncia
    const msg =
        lang === "pt"
            ? "Idioma alterado para Português"
            : "Language changed to English";
    announceChange(msg);
}

/**
 * Acessa propriedade aninhada via string "nav.home"
 * @param {object} obj
 * @param {string} path
 */
function getNestedValue(obj, path) {
    return path.split(".").reduce((o, k) => (o || {})[k], obj);
}

/**
 * Detecta idioma inicial: localStorage > navegador > pt
 */
function initLang() {
    const saved = localStorage.getItem(LANG_KEY);
    const browserLang = navigator.language?.startsWith("en") ? "en" : "pt";
    const lang = saved || browserLang;

    applyLang(lang);

    // Event listeners em todos os botões de idioma
    document.querySelectorAll("[class*='__lang']").forEach((btn) => {
        btn.addEventListener("click", () => {
            const newLang = currentLang === "pt" ? "en" : "pt";
            applyLang(newLang);
        });
    });
}

// ── ACESSIBILIDADE ───────────────────────────────────────────────────────────

/**
 * Anuncia mudanças para leitores de tela
 */
function announceChange(msg) {
    let announcer = document.getElementById("sr-announcer");
    if (!announcer) {
        announcer = document.createElement("div");
        announcer.id = "sr-announcer";
        announcer.setAttribute("role", "status");
        announcer.setAttribute("aria-live", "polite");
        announcer.setAttribute("aria-atomic", "true");
        announcer.className = "sr-only"; // classe do style.css original
        document.body.appendChild(announcer);
    }
    announcer.textContent = msg;
    setTimeout(() => (announcer.textContent = ""), 1500);
}

// ── INICIALIZAÇÃO ────────────────────────────────────────────────────────────

/**
 * Inicializa tema e idioma
 * Chamado pelo main.js ANTES do DOMContentLoaded (tema precisa ser aplicado antes)
 */
async function initThemeLang() {
    // 1. Carrega traduções (assíncrono)
    await loadTranslations();

    // 2. Aplica tema (síncrono, evita flicker)
    initTheme();

    // 3. Aplica idioma (DOM ready)
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initLang);
    } else {
        initLang();
    }

    // 4. Ano atual no footer
    const yearEl = document.getElementById("current-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

export default initThemeLang;
