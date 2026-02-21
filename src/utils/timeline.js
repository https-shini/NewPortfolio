/**
 * TIMELINE TABS - VERSÃO ARIA COMPLETA
 * ============================================================
 * Sistema de abas acessível seguindo o padrão WAI-ARIA Tabs
 * conforme WCAG 4.1.2 e WAI-ARIA Authoring Practices
 *
 * Recursos implementados:
 * ✅ role="tablist" no container de abas
 * ✅ role="tab" em cada botão de aba
 * ✅ role="tabpanel" em cada painel de conteúdo
 * ✅ aria-selected indica aba ativa
 * ✅ aria-controls vincula aba ao painel
 * ✅ aria-labelledby vincula painel à aba
 * ✅ aria-label no tablist para contexto
 * ✅ aria-hidden="true" em ícones decorativos
 * ✅ tabindex gerenciado dinamicamente
 * ✅ Navegação por setas ← → (padrão ARIA)
 * ✅ Home/End para primeira/última aba
 * ✅ Animações respeitam prefers-reduced-motion
 * ============================================================
 */

// Seleção de elementos
const tablist = document.querySelector(".timeline-tabs");
const tabs = document.querySelectorAll(".timeline-tab");
const panels = document.querySelectorAll(".timeline-content-container");

/**
 * ATIVAR ABA
 * ------------------------------------------------------------
 * Ativa uma aba específica e seu painel correspondente
 * Atualiza todos os atributos ARIA necessários
 *
 * @param {HTMLElement} targetTab - A aba a ser ativada
 */
function activateTab(targetTab) {
    // Desativa todas as abas
    tabs.forEach((tab) => {
        tab.classList.remove("active");

        // ✅ ARIA: Marca como não selecionada
        tab.setAttribute("aria-selected", "false");

        // ✅ ARIA: Remove do fluxo de tabulação
        tab.setAttribute("tabindex", "-1");
    });

    // Oculta todos os painéis
    panels.forEach((panel) => {
        panel.classList.remove("active");

        // ✅ ARIA: Oculta de leitores de tela
        panel.setAttribute("aria-hidden", "true");
    });

    // Ativa a aba selecionada
    targetTab.classList.add("active");

    // ✅ ARIA: Marca como selecionada
    targetTab.setAttribute("aria-selected", "true");

    // ✅ ARIA: Adiciona ao fluxo de tabulação
    targetTab.setAttribute("tabindex", "0");

    // Exibe o painel correspondente
    const panelId = targetTab.getAttribute("aria-controls");
    const targetPanel = document.getElementById(panelId);

    if (targetPanel) {
        targetPanel.classList.add("active");

        // ✅ ARIA: Torna visível para leitores de tela
        targetPanel.setAttribute("aria-hidden", "false");

        // Opcional: Anuncia mudança para leitores de tela
        announceTabChange(targetTab);
    }
}

/**
 * ANUNCIAR MUDANÇA DE ABA
 * ------------------------------------------------------------
 * Anuncia para leitores de tela qual aba foi selecionada
 *
 * @param {HTMLElement} tab - A aba que foi ativada
 */
function announceTabChange(tab) {
    // Cria ou reutiliza região de anúncio
    let announcer = document.getElementById("tab-announcer");

    if (!announcer) {
        announcer = document.createElement("div");
        announcer.id = "tab-announcer";
        announcer.setAttribute("role", "status");
        announcer.setAttribute("aria-live", "polite");
        announcer.setAttribute("aria-atomic", "true");
        announcer.className = "sr-only";
        document.body.appendChild(announcer);
    }

    // Anuncia a aba selecionada
    const tabText = tab.textContent.trim();
    announcer.textContent = `${tabText} selecionado`;

    // Limpa após 1 segundo
    setTimeout(() => {
        announcer.textContent = "";
    }, 1000);
}

/**
 * NAVEGAÇÃO POR TECLADO
 * ------------------------------------------------------------
 * Implementa navegação por setas conforme padrão ARIA Tabs
 *
 * @param {HTMLElement} currentTab - Aba atual com foco
 * @param {number} currentIndex - Índice da aba atual
 * @param {KeyboardEvent} e - Evento de teclado
 */
function handleKeyboardNavigation(currentTab, currentIndex, e) {
    let targetIndex = null;

    switch (e.key) {
        case "ArrowRight":
            // Próxima aba (circular)
            targetIndex = (currentIndex + 1) % tabs.length;
            break;

        case "ArrowLeft":
            // Aba anterior (circular)
            targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            break;

        case "Home":
            // Primeira aba
            targetIndex = 0;
            e.preventDefault();
            break;

        case "End":
            // Última aba
            targetIndex = tabs.length - 1;
            e.preventDefault();
            break;

        default:
            return; // Não faz nada para outras teclas
    }

    if (targetIndex !== null) {
        const targetTab = tabs[targetIndex];

        // Foca na nova aba
        targetTab.focus();

        // Ativa a nova aba
        activateTab(targetTab);

        // Previne scroll da página com setas
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
        }
    }
}

/**
 * ANIMAÇÃO DOS ITENS DA TIMELINE
 * ------------------------------------------------------------
 * Anima os itens quando entram no viewport
 * Respeita prefers-reduced-motion
 */
function animateTimelineItems() {
    // Verifica preferência de movimento reduzido
    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
        // Se usuário prefere movimento reduzido, não anima
        const timelineItems = document.querySelectorAll(".timeline__item");
        timelineItems.forEach((item) => {
            item.classList.add("show");
        });
        return;
    }

    // Configuração do observer
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.2,
            rootMargin: "0px 0px -50px 0px",
        },
    );

    // Observa cada item da timeline
    const timelineItems = document.querySelectorAll(".timeline__item");
    timelineItems.forEach((item) => observer.observe(item));
}

/**
 * INICIALIZAÇÃO
 * ------------------------------------------------------------
 * Configura todos os atributos ARIA e event listeners
 */
function initTimelineTabs() {
    // Verifica se os elementos existem
    if (!tablist || tabs.length === 0 || panels.length === 0) {
        console.warn("Timeline tabs: Elementos não encontrados");
        return;
    }

    // ✅ ARIA: Configura o tablist
    tablist.setAttribute("role", "tablist");
    tablist.setAttribute("aria-label", "Navegação da timeline profissional");

    // Configura cada aba e painel
    tabs.forEach((tab, index) => {
        // ✅ ARIA: Define role e atributos da aba
        tab.setAttribute("role", "tab");

        // Gera IDs únicos se não existirem
        const tabId = tab.id || `tab-timeline-${index}`;
        const panelId =
            tab.getAttribute("data-target") || `panel-timeline-${index}`;

        tab.id = tabId;

        // ✅ ARIA: Vincula aba ao painel
        tab.setAttribute("aria-controls", panelId);

        // ✅ ARIA: Oculta ícones decorativos de leitores de tela
        const icon = tab.querySelector("i, svg");
        if (icon) {
            icon.setAttribute("aria-hidden", "true");
        }

        // Configura o painel correspondente
        const panel = document.getElementById(panelId);
        if (panel) {
            // ✅ ARIA: Define role e atributos do painel
            panel.setAttribute("role", "tabpanel");
            panel.setAttribute("id", panelId);

            // ✅ ARIA: Vincula painel à aba
            panel.setAttribute("aria-labelledby", tabId);
        }

        // Event: Clique na aba
        tab.addEventListener("click", () => {
            activateTab(tab);
        });

        // Event: Navegação por teclado
        tab.addEventListener("keydown", (e) => {
            handleKeyboardNavigation(tab, index, e);
        });
    });

    // Ativa a primeira aba por padrão (ou a que tem classe 'active')
    const activeTab = Array.from(tabs).find((tab) =>
        tab.classList.contains("active"),
    );
    activateTab(activeTab || tabs[0]);
}

/**
 * EXPORTAÇÃO
 * ------------------------------------------------------------
 */
export { initTimelineTabs as timelineTabs, animateTimelineItems };
