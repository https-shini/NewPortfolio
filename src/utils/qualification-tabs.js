/**
 * QUALIFICATION TABS
 * ----------------------------------------------------
 * Versão genérica de tabs acessíveis
 * reutilizando o padrão ARIA oficial
 */

const qualificationTabs = document.querySelectorAll('[role="tab"]');
const qualificationPanels = document.querySelectorAll('[role="tabpanel"]');

/**
 * Ativa uma tab de qualificação
 */
function activateQualificationTab(tab) {
    qualificationTabs.forEach((t) => {
        t.setAttribute("aria-selected", "false");
        t.setAttribute("tabindex", "-1");
    });

    qualificationPanels.forEach((panel) =>
        panel.setAttribute("aria-hidden", "true"),
    );

    tab.setAttribute("aria-selected", "true");
    tab.setAttribute("tabindex", "0");

    document
        .getElementById(tab.getAttribute("aria-controls"))
        .setAttribute("aria-hidden", "false");
}

// Eventos
qualificationTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateQualificationTab(tab));

    tab.addEventListener("keydown", (e) => {
        let newIndex = null;

        if (e.key === "ArrowRight") newIndex = index + 1;
        if (e.key === "ArrowLeft") newIndex = index - 1;

        if (newIndex !== null) {
            const nextTab =
                qualificationTabs[newIndex] ||
                qualificationTabs[qualificationTabs.length - 1];

            nextTab.focus();
            activateQualificationTab(nextTab);
        }
    });
});
