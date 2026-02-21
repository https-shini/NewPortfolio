/**
 * MOBILE NAVIGATION - VERSÃO ARIA COMPLETA
 * ============================================================
 * Controla o menu mobile como um DIALOG acessível
 * conforme WAI-ARIA Authoring Practices e WCAG 4.1.2
 *
 * Recursos implementados:
 * ✅ aria-label descritivo
 * ✅ aria-expanded no botão (sincronizado com estado)
 * ✅ aria-controls vincula botão ao menu
 * ✅ aria-hidden no menu (sincronizado)
 * ✅ role="dialog" + aria-modal="true"
 * ✅ aria-hidden="true" em ícones decorativos
 * ✅ Focus trap (mantém foco dentro do dialog)
 * ✅ ESC para fechar
 * ✅ Restaura foco ao botão ao fechar
 * ✅ Gerenciamento de scroll da página
 * ============================================================
 */

// Seleção de elementos
const headerBtn = document.querySelector(".header__bars");
const mobileNavEl = document.querySelector(".mobile-nav");
const mobileNavLinks = document.querySelectorAll(".mobile-nav__link");

// Estado do menu
let isMobileNavOpen = false;
let removeFocusTrap = null;

/**
 * FOCUS TRAP
 * ------------------------------------------------------------
 * Cria um "focus trap" dentro do menu mobile
 * Impede que o foco saia do dialog quando aberto
 * Permite navegação por Tab e Shift+Tab dentro do menu
 */
function trapFocus(container) {
    const focusableSelectors = `
        a[href]:not([disabled]),
        button:not([disabled]),
        textarea:not([disabled]),
        input:not([disabled]),
        select:not([disabled]),
        [tabindex]:not([tabindex="-1"]):not([disabled])
    `;

    const focusableElements = container.querySelectorAll(focusableSelectors);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    function handleKeydown(e) {
        if (e.key === "Tab") {
            if (e.shiftKey && document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            } else if (
                !e.shiftKey &&
                document.activeElement === lastFocusable
            ) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }

        if (e.key === "Escape") {
            closeMobileNav();
        }
    }

    container.addEventListener("keydown", handleKeydown);

    setTimeout(() => {
        firstFocusable.focus();
    }, 100);

    return () => container.removeEventListener("keydown", handleKeydown);
}

/**
 * ABRIR MENU MOBILE
 */
function openMobileNav() {
    isMobileNavOpen = true;

    // CORRIGIDO: usa classe CSS em vez de style.display
    // para que a transição de opacity/visibility funcione
    mobileNavEl.classList.add("mobile-nav--open");

    document.body.style.overflowY = "hidden";

    headerBtn.setAttribute("aria-expanded", "true");
    mobileNavEl.setAttribute("aria-hidden", "false");

    removeFocusTrap = trapFocus(mobileNavEl);
}

/**
 * FECHAR MENU MOBILE
 */
function closeMobileNav() {
    isMobileNavOpen = false;

    // CORRIGIDO: remove classe em vez de style.display = "none"
    mobileNavEl.classList.remove("mobile-nav--open");

    document.body.style.overflowY = "auto";

    headerBtn.setAttribute("aria-expanded", "false");
    mobileNavEl.setAttribute("aria-hidden", "true");

    if (removeFocusTrap) {
        removeFocusTrap();
        removeFocusTrap = null;
    }

    headerBtn.focus();
}

/**
 * INICIALIZAÇÃO
 */
function initMobileNav() {
    headerBtn.setAttribute("aria-expanded", "false");
    headerBtn.setAttribute("aria-controls", "mobile-menu");
    headerBtn.setAttribute("aria-label", "Abrir menu de navegação");

    mobileNavEl.setAttribute("aria-hidden", "true");
    mobileNavEl.setAttribute("id", "mobile-menu");

    headerBtn.addEventListener("click", () => {
        isMobileNavOpen ? closeMobileNav() : openMobileNav();
    });

    mobileNavLinks.forEach((link) => {
        link.addEventListener("click", closeMobileNav);
    });

    mobileNavEl.addEventListener("click", (e) => {
        if (e.target === mobileNavEl) {
            closeMobileNav();
        }
    });
}

export default initMobileNav;
