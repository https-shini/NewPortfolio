/**
 * ============================================================================
 * CONTACT.JS
 * ============================================================================
 * Responsabilidades:
 *   1. Botão CTA → scroll suave até o formulário + foco no primeiro campo
 *   2. Validação em tempo real por campo (blur + input)
 *   3. Honeypot anti-spam
 *   4. Envio assíncrono via fetch (sem recarregar a página)
 *   5. Bloqueio contra múltiplos envios consecutivos
 *   6. Estados visuais do botão: idle / loading / sent
 *   7. Feedback global: sucesso e erro
 *   8. Limpeza automática do formulário após sucesso
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CONFIGURAÇÃO DO ENDPOINT
 * ─────────────────────────────────────────────────────────────────────────────
 * Altere FORM_ENDPOINT para o seu serviço de envio de e-mail.
 *
 * Opções gratuitas prontas para uso:
 *
 *   Formspree (até 50 envios/mês grátis):
 *     1. Crie conta em https://formspree.io
 *     2. Novo formulário → informe contato.guilhermescruz@gmail.com
 *     3. Copie o ID gerado (ex.: xpwzablk)
 *     FORM_ENDPOINT = "https://formspree.io/f/xpwzablk"
 *
 *   Web3Forms (grátis e ilimitado):
 *     1. Gere access key em https://web3forms.com
 *     2. FORM_ENDPOINT = "https://api.web3forms.com/submit"
 *     3. Descomente a linha `access_key` em buildPayload()
 *
 * Enquanto FORM_ENDPOINT contém "SEU_ID_AQUI", o código usa
 * fallback mailto (abre cliente de e-mail com dados pré-preenchidos).
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

const FORM_ENDPOINT = "https://formspree.io/f/SEU_ID_AQUI";
const AUTHOR_EMAIL = "contato.guilhermescruz@gmail.com"; // não exposto no HTML
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SCROLL_OFFSET = 80; // px — compensar header fixo no scroll do CTA

// ─────────────────────────────────────────────────────────────────────────────
// SELETORES
// ─────────────────────────────────────────────────────────────────────────────

/** @type {HTMLButtonElement} */
const ctaBtn = document.getElementById("contact-cta-btn");

/** @type {HTMLFormElement} */
const form = document.getElementById("contact-form");

/** @type {HTMLButtonElement} */
const submitBtn = document.getElementById("cf-submit");

/** @type {HTMLDivElement} */
const statusEl = document.getElementById("cf-status");

/** @type {HTMLInputElement} */
const firstField = document.getElementById("cf-name");

// ─────────────────────────────────────────────────────────────────────────────
// VALIDADORES POR CAMPO
// Retornam string de erro ou "" se válido
// ─────────────────────────────────────────────────────────────────────────────

const VALIDATORS = {
    name(v) {
        if (!v.trim()) return "Informe seu nome.";
        if (v.trim().length < 2)
            return "Nome muito curto (mínimo 2 caracteres).";
        return "";
    },
    email(v) {
        if (!v.trim()) return "Informe seu e-mail.";
        if (!EMAIL_REGEX.test(v.trim()))
            return "E-mail inválido. Ex.: nome@dominio.com";
        return "";
    },
    subject(v) {
        if (!v.trim()) return "Informe o assunto.";
        if (v.trim().length < 3)
            return "Assunto muito curto (mínimo 3 caracteres).";
        return "";
    },
    message(v) {
        if (!v.trim()) return "Escreva sua mensagem.";
        if (v.trim().length < 10)
            return "Mensagem muito curta (mínimo 10 caracteres).";
        return "";
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// VALIDAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valida um campo e atualiza as classes e a mensagem de erro na UI.
 * @param {HTMLInputElement|HTMLTextAreaElement} input
 * @returns {boolean} true = válido
 */
function validateField(input) {
    const name = input.name;
    const validate = VALIDATORS[name];
    if (!validate) return true;

    const fieldEl = document.getElementById(`cf-field-${name}`);
    const errorEl = document.getElementById(`cf-err-${name}`);
    if (!fieldEl || !errorEl) return true;

    const msg = validate(input.value);

    if (msg) {
        errorEl.textContent = msg;
        fieldEl.classList.add("cf-field--invalid");
        fieldEl.classList.remove("cf-field--valid");
        input.setAttribute("aria-invalid", "true");
        return false;
    }

    errorEl.textContent = "";
    fieldEl.classList.remove("cf-field--invalid");
    fieldEl.classList.add("cf-field--valid");
    input.setAttribute("aria-invalid", "false");
    return true;
}

/**
 * Valida todos os campos do formulário.
 * @returns {boolean} true = todos válidos
 */
function validateAll() {
    const inputs = form.querySelectorAll(
        "[name='name'], [name='email'], [name='subject'], [name='message']",
    );
    let allValid = true;
    inputs.forEach((input) => {
        if (!validateField(input)) allValid = false;
    });
    return allValid;
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTADO DO BOTÃO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Alterna o estado visual do botão de submit.
 * @param {"idle"|"loading"|"sent"} state
 */
function setButtonState(state) {
    submitBtn.setAttribute("data-state", state);
    submitBtn.disabled = state !== "idle";
}

// ─────────────────────────────────────────────────────────────────────────────
// FEEDBACK GLOBAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exibe mensagem de sucesso ou erro na área de status.
 * @param {"success"|"error"|""} type
 * @param {string} message
 */
function setStatus(type, message) {
    statusEl.textContent = message;
    statusEl.className = "cf-status";
    if (type === "success") statusEl.classList.add("cf-status--success");
    if (type === "error") statusEl.classList.add("cf-status--error");

    // Leva o feedback até a viewport se necessário
    if (type) {
        setTimeout(() => {
            statusEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 120);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENVIO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Constrói o payload JSON a ser enviado.
 * @param {FormData} fd
 * @returns {string} JSON string
 */
function buildPayload(fd) {
    return JSON.stringify({
        // access_key: "SUA_WEB3FORMS_KEY",  // descomente para Web3Forms
        name: fd.get("name"),
        email: fd.get("email"),
        subject: fd.get("subject"),
        message: fd.get("message"),
    });
}

/**
 * Verifica se o endpoint ainda não foi configurado.
 */
function isPlaceholder() {
    return FORM_ENDPOINT.includes("SEU_ID_AQUI");
}

/**
 * Abre o cliente de e-mail com os dados pré-preenchidos (fallback de desenvolvimento).
 * @param {FormData} fd
 */
function fallbackMailto(fd) {
    const subject = encodeURIComponent(
        fd.get("subject") || "Mensagem do portfólio",
    );
    const body = encodeURIComponent(
        `Nome: ${fd.get("name")}\nE-mail: ${fd.get("email")}\n\n${fd.get("message")}`,
    );
    window.open(
        `mailto:${AUTHOR_EMAIL}?subject=${subject}&body=${body}`,
        "_blank",
    );
}

/**
 * Envia os dados para o endpoint configurado.
 * @param {FormData} fd
 */
async function submitToEndpoint(fd) {
    const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: buildPayload(fd),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Erro ${res.status} no servidor.`);
    }
}

/**
 * Limpa o formulário e os estados visuais de validação.
 */
function resetForm() {
    form.reset();
    form.querySelectorAll(".cf-field").forEach((f) => {
        f.classList.remove("cf-field--valid", "cf-field--invalid");
    });
    form.querySelectorAll("[aria-invalid]").forEach((i) => {
        i.removeAttribute("aria-invalid");
    });
    form.querySelectorAll(".cf-error").forEach((e) => {
        e.textContent = "";
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER DE SUBMIT
// ─────────────────────────────────────────────────────────────────────────────

async function handleSubmit(e) {
    e.preventDefault();

    // Limpa status anterior
    setStatus("", "");

    // 1. Validação — foca o primeiro campo inválido
    if (!validateAll()) {
        const firstBad = form.querySelector("[aria-invalid='true']");
        if (firstBad) firstBad.focus();
        return;
    }

    const fd = new FormData(form);

    // 2. Honeypot — bot preencheu o campo oculto
    if (fd.get("bot_field")) {
        // Faz parecer sucesso para não revelar a detecção
        setStatus("success", "✓ Mensagem enviada! Responderei em breve.");
        resetForm();
        return;
    }

    setButtonState("loading");

    try {
        if (isPlaceholder()) {
            // Modo desenvolvimento: abre mailto
            fallbackMailto(fd);
            setStatus(
                "success",
                "✓ Seu cliente de e-mail foi aberto com a mensagem pré-preenchida. " +
                    "Configure FORM_ENDPOINT em contact.js para envio direto pelo site.",
            );
        } else {
            await submitToEndpoint(fd);
            setStatus(
                "success",
                "✓ Mensagem enviada com sucesso! Responderei em até 24 horas.",
            );
        }

        setButtonState("sent");
        resetForm();

        // Volta o botão ao estado idle após 4 s para permitir novo envio
        setTimeout(() => setButtonState("idle"), 4000);
    } catch (err) {
        console.error("[contact.js]", err);
        setStatus(
            "error",
            `✗ Não foi possível enviar. Tente novamente ou escreva diretamente para ${AUTHOR_EMAIL}`,
        );
        setButtonState("idle"); // libera imediatamente para nova tentativa
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA — scroll suave até o formulário + foco no primeiro campo
// ─────────────────────────────────────────────────────────────────────────────

function handleCta() {
    const formArea = document.getElementById("contact-form-area");
    if (!formArea) return;

    const top =
        formArea.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;

    window.scrollTo({ top, behavior: "smooth" });

    // Foca o primeiro campo após a animação de scroll terminar
    setTimeout(() => {
        if (firstField) firstField.focus({ preventScroll: true });
    }, 500);
}

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registra todos os event listeners.
 * Chamado pelo main.js dentro de DOMContentLoaded.
 */
function initContact() {
    if (!form || !submitBtn) return;

    // ── CTA ──────────────────────────────────────────────────────────────────
    if (ctaBtn) {
        ctaBtn.addEventListener("click", handleCta);
    }

    // ── Validação em tempo real ───────────────────────────────────────────────
    const validatedInputs = form.querySelectorAll(
        "[name='name'], [name='email'], [name='subject'], [name='message']",
    );

    validatedInputs.forEach((input) => {
        // Valida ao sair do campo
        input.addEventListener("blur", () => validateField(input));

        // Re-valida em tempo real apenas se o campo já foi marcado como inválido
        // (não interrompe enquanto o usuário ainda está digitando pela primeira vez)
        input.addEventListener("input", () => {
            const fieldEl = document.getElementById(`cf-field-${input.name}`);
            if (fieldEl?.classList.contains("cf-field--invalid")) {
                validateField(input);
            }
        });
    });

    // ── Submit ────────────────────────────────────────────────────────────────
    form.addEventListener("submit", handleSubmit);
}

export default initContact;
