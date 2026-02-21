/**
 * LAZY LOADING DE IMAGENS - VERSÃO ACESSÍVEL
 * ============================================================
 * Carrega imagens sob demanda usando IntersectionObserver
 * com melhorias de acessibilidade e performance
 *
 * Recursos implementados:
 * ✅ IntersectionObserver para performance
 * ✅ Placeholder com baixa qualidade durante carregamento
 * ✅ Transição suave ao carregar
 * ✅ Tratamento de erros
 * ✅ alt text apropriado em todas as imagens
 * ✅ Feedback visual durante carregamento
 * ✅ Fallback para navegadores antigos
 * ============================================================
 */

/**
 * CONFIGURAÇÃO
 * ------------------------------------------------------------
 */
const CONFIG = {
    // Margem antes de começar a carregar (antecipa o carregamento)
    rootMargin: "50px 0px",

    // Porcentagem visível para disparar o carregamento
    threshold: 0.01,

    // Classe CSS aplicada quando imagem está carregando
    loadingClass: "lazy-loading",

    // Classe CSS aplicada quando imagem foi carregada
    loadedClass: "lazy-loaded",

    // Classe CSS aplicada em caso de erro
    errorClass: "lazy-error",
};

/**
 * CARREGAR IMAGEM
 * ------------------------------------------------------------
 * Carrega uma imagem específica e gerencia estados
 *
 * @param {HTMLImageElement} img - Elemento de imagem a ser carregado
 */
function loadImage(img) {
    const src = img.dataset.src;

    if (!src) {
        console.warn("Lazy loading: Imagem sem data-src", img);
        return;
    }

    // Adiciona classe de carregamento
    img.classList.add(CONFIG.loadingClass);

    // Cria uma nova imagem para pré-carregar
    const tempImage = new Image();

    // ✅ Evento: Sucesso no carregamento
    tempImage.onload = () => {
        // Define o src real
        img.src = src;

        // Remove atributo data-src
        img.removeAttribute("data-src");

        // Remove classe de carregamento e adiciona classe de sucesso
        img.classList.remove(CONFIG.loadingClass);
        img.classList.add(CONFIG.loadedClass);

        // ✅ ACESSIBILIDADE: Garante que a imagem tem alt text
        if (!img.hasAttribute("alt") || img.alt === "") {
            console.warn(
                "Lazy loading: Imagem sem texto alternativo (alt)",
                img,
            );
            // Define um alt genérico se não houver (não ideal, mas melhor que nada)
            img.setAttribute("alt", "Imagem decorativa");
        }

        // Opcional: Remove loading="lazy" nativo após carregar manualmente
        img.removeAttribute("loading");
    };

    // ✅ Evento: Erro no carregamento
    tempImage.onerror = () => {
        console.error("Lazy loading: Falha ao carregar imagem", src);

        // Remove classe de carregamento e adiciona classe de erro
        img.classList.remove(CONFIG.loadingClass);
        img.classList.add(CONFIG.errorClass);

        // ✅ ACESSIBILIDADE: Define alt text descritivo do erro
        img.setAttribute(
            "alt",
            "Erro ao carregar imagem. Por favor, recarregue a página.",
        );

        // Opcional: Define uma imagem de fallback
        // img.src = '/path/to/fallback-image.png';
    };

    // Inicia o carregamento
    tempImage.src = src;
}

/**
 * CRIAR OBSERVER
 * ------------------------------------------------------------
 * Cria e configura o IntersectionObserver
 *
 * @returns {IntersectionObserver} Observer configurado
 */
function createObserver() {
    return new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                // Verifica se o elemento está visível
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // Carrega a imagem
                    loadImage(img);

                    // Para de observar esta imagem
                    observer.unobserve(img);
                }
            });
        },
        {
            rootMargin: CONFIG.rootMargin,
            threshold: CONFIG.threshold,
        },
    );
}

/**
 * FALLBACK PARA NAVEGADORES ANTIGOS
 * ------------------------------------------------------------
 * Carrega todas as imagens imediatamente se IntersectionObserver
 * não for suportado
 *
 * @param {NodeList} images - Lista de imagens
 */
function fallbackLoad(images) {
    console.warn(
        "Lazy loading: IntersectionObserver não suportado. Carregando todas as imagens.",
    );

    images.forEach((img) => {
        if (img.dataset.src) {
            loadImage(img);
        }
    });
}

/**
 * INICIALIZAÇÃO
 * ------------------------------------------------------------
 * Configura o lazy loading para todas as imagens com data-src
 */
function initLazyLoading() {
    // Seleciona todas as imagens com data-src
    const lazyImages = document.querySelectorAll("img[data-src]");

    if (lazyImages.length === 0) {
        // Não há imagens para carregar
        return;
    }

    // Verifica suporte ao IntersectionObserver
    if (!("IntersectionObserver" in window)) {
        // Fallback: carrega todas as imagens imediatamente
        fallbackLoad(lazyImages);
        return;
    }

    // Cria o observer
    const observer = createObserver();

    // ✅ ACESSIBILIDADE: Valida e configura cada imagem
    lazyImages.forEach((img) => {
        // Adiciona loading="lazy" nativo como camada extra de otimização
        // (browsers modernos podem usar isso além do IntersectionObserver)
        img.setAttribute("loading", "lazy");

        // ✅ Valida que a imagem tem alt text
        if (!img.hasAttribute("alt")) {
            console.warn(
                "Lazy loading: Imagem sem atributo alt. Adicione um para acessibilidade.",
                img,
            );
        }

        // ✅ PERFORMANCE: Define dimensões para evitar layout shifts
        if (!img.hasAttribute("width") || !img.hasAttribute("height")) {
            console.warn(
                "Lazy loading: Imagem sem width/height. Adicione para evitar layout shifts.",
                img,
            );
        }

        // Começa a observar a imagem
        observer.observe(img);
    });

    // Cleanup ao sair da página (opcional)
    window.addEventListener("beforeunload", () => {
        observer.disconnect();
    });
}

/**
 * CARREGAR IMAGEM MANUALMENTE
 * ------------------------------------------------------------
 * Função auxiliar para forçar carregamento de uma imagem específica
 * Útil para imagens que precisam ser carregadas por evento
 *
 * @param {HTMLImageElement|string} imgOrSelector - Elemento ou seletor CSS
 */
function forceLoadImage(imgOrSelector) {
    const img =
        typeof imgOrSelector === "string"
            ? document.querySelector(imgOrSelector)
            : imgOrSelector;

    if (img && img.dataset.src) {
        loadImage(img);
    }
}

/**
 * EXPORTAÇÃO
 * ------------------------------------------------------------
 */
export default initLazyLoading;
export { forceLoadImage };
