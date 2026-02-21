/**
 * DARK MODE TOGGLE - VERSÃO ARIA COMPLETA
 * ============================================================
 * Controla alternância entre tema claro/escuro
 * conforme WCAG 4.1.2 e WAI-ARIA 1.2
 *
 * Recursos implementados:
 * ✅ aria-pressed para indicar estado do toggle
 * ✅ aria-label descritivo e claro
 * ✅ Sincronização entre múltiplos botões
 * ✅ Persistência em localStorage
 * ✅ Respeita prefers-color-scheme do sistema
 * ✅ Atualiza aria-pressed em tempo real
 * ✅ Feedback visual + semântico
 * ============================================================
 */

// Seleciona todos os botões de toggle (header + mobile nav)
const themeToggleBtns = document.querySelectorAll("#theme-toggle");

/**
 * DEFINIR TEMA INICIAL
 * ------------------------------------------------------------
 * Aplica o tema seguindo a prioridade:
 * 1. Preferência salva no localStorage
 * 2. Preferência do sistema (prefers-color-scheme)
 * 3. Modo claro como fallback
 */
function setInitialTheme() {
    const savedTheme = localStorage.getItem("theme");

    // Verifica se o tema deve ser escuro
    const isDarkMode =
        savedTheme === "dark-mode" ||
        (!savedTheme &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);

    // Aplica as classes no body
    document.body.classList.toggle("dark-mode", isDarkMode);
    document.body.classList.toggle("light-mode", !isDarkMode);

    // ✅ ARIA: Atualiza aria-pressed em todos os botões
    updateAriaPressed(isDarkMode);
}

/**
 * ALTERNAR TEMA
 * ------------------------------------------------------------
 * Alterna entre modo claro e escuro
 * Atualiza todos os estados ARIA e persiste a escolha
 */
function toggleTheme() {
    // Alterna a classe dark-mode no body
    const isDarkMode = document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode", !isDarkMode);

    // ✅ ARIA: Atualiza aria-pressed em todos os botões
    updateAriaPressed(isDarkMode);

    // Persiste a preferência
    localStorage.setItem("theme", isDarkMode ? "dark-mode" : "light-mode");

    // Opcional: Anuncia a mudança para leitores de tela
    announceThemeChange(isDarkMode);
}

/**
 * ATUALIZAR ARIA-PRESSED
 * ------------------------------------------------------------
 * Sincroniza o atributo aria-pressed em todos os botões
 *
 * @param {boolean} isDarkMode - True se o modo escuro está ativo
 */
function updateAriaPressed(isDarkMode) {
    themeToggleBtns.forEach((btn) => {
        // aria-pressed="true" = modo escuro ativo
        // aria-pressed="false" = modo claro ativo
        btn.setAttribute("aria-pressed", String(isDarkMode));

        // ✅ ARIA: Atualiza o label para ser mais descritivo do estado atual
        const newLabel = isDarkMode
            ? "Alternar para modo claro"
            : "Alternar para modo escuro";
        btn.setAttribute("aria-label", newLabel);
    });
}

/**
 * ANUNCIAR MUDANÇA DE TEMA
 * ------------------------------------------------------------
 * Cria um anúncio para leitores de tela (opcional, mas melhora UX)
 *
 * @param {boolean} isDarkMode - True se o modo escuro foi ativado
 */
function announceThemeChange(isDarkMode) {
    // Cria ou reutiliza região de anúncio
    let announcer = document.getElementById("theme-announcer");

    if (!announcer) {
        announcer = document.createElement("div");
        announcer.id = "theme-announcer";
        announcer.setAttribute("role", "status");
        announcer.setAttribute("aria-live", "polite");
        announcer.setAttribute("aria-atomic", "true");
        announcer.className = "sr-only"; // Visualmente oculto
        document.body.appendChild(announcer);
    }

    // Anuncia a mudança
    const message = isDarkMode ? "Modo escuro ativado" : "Modo claro ativado";

    announcer.textContent = message;

    // Limpa o anúncio após 1 segundo
    setTimeout(() => {
        announcer.textContent = "";
    }, 1000);
}

/**
 * INICIALIZAÇÃO
 * ------------------------------------------------------------
 */
function initDarkMode() {
    // Garante que os atributos ARIA iniciais estão corretos
    themeToggleBtns.forEach((btn) => {
        // Define label descritivo inicial
        if (!btn.hasAttribute("aria-label")) {
            btn.setAttribute(
                "aria-label",
                "Alternar entre modo claro e escuro",
            );
        }

        // Garante que aria-pressed existe
        if (!btn.hasAttribute("aria-pressed")) {
            btn.setAttribute("aria-pressed", "false");
        }

        // Adiciona event listener
        btn.addEventListener("click", toggleTheme);
    });

    // Aplica o tema inicial
    setInitialTheme();

    // Observa mudanças na preferência do sistema (opcional)
    const darkModeMediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)",
    );
    darkModeMediaQuery.addEventListener("change", (e) => {
        // Só atualiza se o usuário não tiver preferência salva
        if (!localStorage.getItem("theme")) {
            const isDarkMode = e.matches;
            document.body.classList.toggle("dark-mode", isDarkMode);
            document.body.classList.toggle("light-mode", !isDarkMode);
            updateAriaPressed(isDarkMode);
        }
    });
}

// Executa a inicialização
export default initDarkMode;
