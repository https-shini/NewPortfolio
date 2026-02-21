/**
 * ============================================================
 * TIMELINE COMPONENT - SISTEMA BASEADO EM DADOS
 * ============================================================
 * Timeline escalável e responsiva para portfólio profissional
 * Última atualização: 15/02/2026
 * ============================================================
 */

// ============================================================
// DADOS DA TIMELINE
// ============================================================
// Para adicionar novos eventos, basta adicionar um objeto ao array

const timelineData = {
    education: [
        {
            id: 1,
            title: "Ciência da Computação",
            institution: "Universidade Cruzeiro do Sul",
            date: "2023 - 2026",
            status: "Cursando",
            description:
                "Durante minha graduação em Ciências da Computação, estou adquirindo uma base sólida em lógica de programação, desenvolvimento web e mobile, e diversas áreas essenciais para engenharia de software. O curso abrange desde algoritmos e estruturas de dados até sistemas operacionais e banco de dados.",
            tags: ["Back-end", "Front-end", "Algoritmos", "Banco de Dados"],
            certificateUrl: null,
        },
        {
            id: 2,
            title: "Desenvolvimento de Sistemas",
            institution: "ETEC - Escola Técnica Estadual",
            date: "2020 - 2022",
            status: "Concluído",
            description:
                "Durante minha formação técnica em Desenvolvimento de Sistemas na ETEC, adquiri uma sólida base em programação, desenvolvimento de aplicações e banco de dados. O curso abrangeu desde a lógica de programação até o desenvolvimento de projetos completos, me preparando para criar soluções tecnológicas eficientes e inovadoras.",
            tags: ["Programação", "Web", "Banco de Dados"],
            certificateUrl: "./public/docs/etec.pdf",
        },
    ],

    courses: [
        {
            id: 3,
            title: "Discover - Trilha Fundamentar",
            institution: "Rocketseat",
            date: "2024",
            status: "Concluído",
            description:
                "Durante a Trilha Discover da Rocketseat, desenvolvi habilidades essenciais para atuar no desenvolvimento de software, explorando tanto o Front-end quanto o Back-end. A formação abordou tecnologias e práticas fundamentais para Desenvolvimento Web e Mobile, com foco na resolução de problemas e na construção de aplicações modernas e escaláveis.",
            tags: ["HTML", "CSS", "JavaScript", "React"],
            certificateUrl:
                "https://app.rocketseat.com.br/certificates/5e1a87e2-9e71-4dbd-82a1-52f98b99c984",
        },
        {
            id: 4,
            title: "Modelagem de Dados",
            institution: "SENAI - Serviço Nacional de Aprendizagem Industrial",
            date: "2021",
            status: "Concluído",
            description:
                "Durante o curso de Modelagem de Dados no SENAI, aprendi a estruturar e organizar informações de forma eficiente, utilizando diagramas e técnicas para criar bancos de dados funcionais e bem planejados. Também foram exploradas práticas de análise de dados, garantindo uma compreensão sólida para a organização e interpretação de informações em sistemas tecnológicos.",
            tags: ["Banco de Dados", "SQL", "Modelagem"],
            certificateUrl: "./public/docs/modelagem-de-dados.pdf",
        },
    ],

    experience: [
        {
            id: 5,
            title: "Atendente de Suporte Técnico (Helpdesk)",
            institution: "Wise System · Efetivado",
            date: "Janeiro 2026 - Presente",
            status: "Atual",
            description:
                "Desde abril de 2025, atuo como Estagiário de Suporte Técnico na Wise System, em São Paulo, com atendimento presencial. Minhas principais responsabilidades incluem prestar suporte técnico aos clientes por telefone, chat, e-mail e acesso remoto, esclarecendo dúvidas e orientando quanto às boas práticas no uso dos softwares da empresa. Além disso, sou responsável pelo gerenciamento de chamados por meio do sistema de ServiceDesk interno.",
            tags: ["Suporte", "Atendimento", "Service Desk"],
            certificateUrl: null,
        },
        {
            id: 6,
            title: "Atendente de Suporte Técnico (Helpdesk)",
            institution: "Wise System · Estágio",
            date: "Abril 2025 - Dezembro 2025",
            status: "Concluído",
            description:
                "Desde abril de 2025, atuo como Estagiário de Suporte Técnico na Wise System, em São Paulo, com atendimento presencial. Minhas principais responsabilidades incluem prestar suporte técnico aos clientes por telefone, chat, e-mail e acesso remoto, esclarecendo dúvidas e orientando quanto às boas práticas no uso dos softwares da empresa. Além disso, sou responsável pelo gerenciamento de chamados por meio do sistema de ServiceDesk interno.",
            tags: ["Suporte", "Atendimento", "Service Desk"],
            certificateUrl: null,
        },
    ],
};

// ============================================================
// FUNÇÕES DE RENDERIZAÇÃO
// ============================================================

/**
 * Cria o HTML de um item da timeline
 * @param {Object} item - Dados do item
 * @param {number} index - Índice do item
 * @returns {string} HTML do item
 */
function createTimelineItem(item, index) {
    const side = index % 2 === 0 ? "left" : "right";
    const statusClass =
        item.status === "Cursando" || item.status === "Atual"
            ? "active"
            : "completed";

    const tagsHTML =
        item.tags && item.tags.length > 0
            ? `<div class="timeline-tags">
         ${item.tags.map((tag) => `<span class="timeline-tag">${tag}</span>`).join("")}
       </div>`
            : "";

    const certificateHTML = item.certificateUrl
        ? `<a href="${item.certificateUrl}" 
          class="timeline-link" 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="Ver certificado de ${item.title} (abre em nova aba)">
         <i class="bx bx-link-external" aria-hidden="true"></i>
         Ver Certificado
       </a>`
        : "";

    return `
    <article class="timeline-item timeline-item--${side}" data-timeline-item>
      <div class="timeline-marker" aria-hidden="true"></div>
      <div class="timeline-content">
        <div class="timeline-content__header">
          <time class="timeline-date" datetime="${item.date}">${item.date}</time>
          <span class="timeline-status timeline-status--${statusClass}">${item.status}</span>
        </div>
        <h3 class="timeline-content__title">${item.title}</h3>
        <h4 class="timeline-content__subtitle">${item.institution}</h4>
        <p class="timeline-content__description">${item.description}</p>
        ${tagsHTML}
        ${certificateHTML}
      </div>
    </article>
  `;
}

/**
 * Renderiza todos os itens de uma categoria
 * @param {string} category - Categoria a ser renderizada
 */
function renderTimeline(category) {
    const container = document.querySelector(
        `#timeline-panel-${category} .timeline-items`,
    );
    if (!container) return;

    const items = timelineData[category];
    if (!items || items.length === 0) return;

    container.innerHTML = items
        .map((item, index) => createTimelineItem(item, index))
        .join("");

    // Inicializa animações após renderizar
    initScrollAnimations();
}

// ============================================================
// SISTEMA DE TABS
// ============================================================

function initTabs() {
    const tabs = document.querySelectorAll(".timeline-tab");
    const panels = document.querySelectorAll(".timeline-panel");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            // Remove active de todas as tabs
            tabs.forEach((t) => {
                t.setAttribute("aria-selected", "false");
                t.classList.remove("active");
            });

            // Remove active de todos os panels
            panels.forEach((p) => {
                p.setAttribute("aria-hidden", "true");
                p.classList.remove("active");
            });

            // Ativa tab clicada
            tab.setAttribute("aria-selected", "true");
            tab.classList.add("active");

            // Ativa panel correspondente
            const targetId = tab.getAttribute("data-tab");
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.setAttribute("aria-hidden", "false");
                targetPanel.classList.add("active");
            }

            // Reinicia animações
            initScrollAnimations();
        });

        // Navegação por teclado
        tab.addEventListener("keydown", (e) => {
            const currentIndex = Array.from(tabs).indexOf(tab);
            let targetTab = null;

            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                targetTab = tabs[currentIndex + 1] || tabs[0];
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                targetTab = tabs[currentIndex - 1] || tabs[tabs.length - 1];
            } else if (e.key === "Home") {
                e.preventDefault();
                targetTab = tabs[0];
            } else if (e.key === "End") {
                e.preventDefault();
                targetTab = tabs[tabs.length - 1];
            }

            if (targetTab) {
                targetTab.click();
                targetTab.focus();
            }
        });
    });
}

// ============================================================
// ANIMAÇÕES DE SCROLL
// ============================================================

function initScrollAnimations() {
    const items = document.querySelectorAll("[data-timeline-item]");

    // Remove animações anteriores
    items.forEach((item) => {
        item.classList.remove("timeline-item--visible");
    });

    // Verifica se deve respeitar preferência de movimento reduzido
    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
        // Mostra todos os itens sem animação
        items.forEach((item) => {
            item.classList.add("timeline-item--visible");
        });
        return;
    }

    // Cria observer para animações
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("timeline-item--visible");
                    // Para de observar após animar
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px",
        },
    );

    items.forEach((item) => {
        observer.observe(item);
    });
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

function initTimeline() {
    // Renderiza cada categoria
    renderTimeline("education");
    renderTimeline("courses");
    renderTimeline("experience");

    // Inicializa sistema de tabs
    initTabs();

    // Inicializa animações de scroll
    initScrollAnimations();
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTimeline);
} else {
    initTimeline();
}

// Exporta para uso em outros módulos se necessário
if (typeof module !== "undefined" && module.exports) {
    module.exports = { timelineData, initTimeline };
}
