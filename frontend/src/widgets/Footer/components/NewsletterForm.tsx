import React, { useState } from "react";
import { useLang } from "@/shared/hooks/useLang";
import { NEWSLETTER_ENDPOINT } from "@/shared/config/constants";
import { IconSend } from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   NewsletterForm — inscrição, no rodapé
   ─────────────────────────────────────────────────────────
   Molde do ContactForm, e de propósito: mesmos estados, mesma
   validação, mesmo honeypot, mesma região aria-live. Duas
   entradas de e-mail no mesmo site que se comportam de forma
   diferente é ruído para quem usa e para quem mantém.

   Sem `VITE_NEWSLETTER_ENDPOINT` o componente devolve null —
   nada meio-pronto vai ao ar, e o campo passa a existir no dia
   em que a variável for configurada, sem novo deploy.
───────────────────────────────────────────────────────── */

/* Mesma expressão do ContactForm: validar e-mail com rigor no cliente
   rejeita endereços válidos. Quem decide de verdade é o servidor. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Estado =
    | "idle"
    | "sending"
    | "success"
    | "duplicate"
    /** Reprovado aqui, antes de sair: o endereço não parece um e-mail. */
    | "invalid"
    /** Falhou do outro lado — servidor fora, rede caída, 4xx/5xx. */
    | "error";

export const NewsletterForm: React.FC = () => {
    const { lang, t } = useLang();
    const [email, setEmail] = useState("");
    const [estado, setEstado] = useState<Estado>("idle");

    /* Copiado para uma constante local porque o TypeScript não estreita
       um binding de módulo dentro do closure do submit — sem isto, o
       `fetch` recebe `string | undefined` mesmo depois da guarda. */
    const endpoint = NEWSLETTER_ENDPOINT;

    /* Sem endpoint o campo não existe. */
    if (!endpoint) return null;

    const enviando = estado === "sending";
    /* Só o sucesso trava o campo. Em "já inscrito" a pessoa pode querer
       usar outro endereço, e travar seria impedi-la de fazer justamente
       o que a mensagem sugere. */
    const travado = enviando || estado === "success";
    const problema = estado === "invalid" || estado === "error";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (enviando) return;

        /* Honeypot — preenchido é bot: finge sucesso e não envia. */
        const isca = new FormData(e.currentTarget).get("_gotcha");
        if (typeof isca === "string" && isca.length > 0) {
            setEstado("success");
            return;
        }

        if (!EMAIL_RE.test(email.trim())) {
            setEstado("invalid");
            return;
        }

        setEstado("sending");
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
                    /* O idioma vai junto para o backend disparar a
                       confirmação na língua certa. */
                    lang,
                    source: "footer",
                }),
            });

            /* 409 não é erro: é quem já se inscreveu. Tratar como falha
               faria a pessoa tentar de novo sem necessidade. */
            if (res.status === 409) {
                setEstado("duplicate");
                return;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            setEstado("success");
            setEmail("");
        } catch {
            setEstado("error");
        }
    };

    return (
        <form className="footer__news" onSubmit={handleSubmit} noValidate>
            <label htmlFor="nl-email" className="footer__news-label">
                {t("footer.newsletter.label")}
            </label>

            <p className="footer__news-hint">{t("footer.newsletter.hint")}</p>

            {/* Honeypot — invisível para humanos, atrativo para bots. */}
            <input
                type="text"
                name="_gotcha"
                tabIndex={-1}
                autoComplete="off"
                className="footer__news-honeypot"
                aria-hidden="true"
            />

            <div className="footer__news-row">
                <input
                    id="nl-email"
                    type="email"
                    name="email"
                    className="footer__news-input"
                    placeholder={t("footer.newsletter.placeholder")}
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        /* Corrigir o campo limpa o erro anterior: manter a
                           mensagem antiga na tela enquanto a pessoa digita
                           é dizer que ainda está errado sem ter olhado. */
                        if (estado === "invalid" || estado === "error")
                            setEstado("idle");
                    }}
                    autoComplete="email"
                    required
                    disabled={travado}
                />
                <button
                    type="submit"
                    className="btn btn--primary btn--sm footer__news-btn"
                    disabled={travado}
                >
                    <IconSend width={14} height={14} aria-hidden="true" />
                    <span>
                        {enviando
                            ? t("footer.newsletter.sending")
                            : t("footer.newsletter.submit")}
                    </span>
                </button>
            </div>

            {/* Um leitor de tela não vê a cor mudar — precisa ouvir. */}
            <p
                className={`footer__news-status${
                    estado === "success" || estado === "duplicate"
                        ? " is-success"
                        : problema
                          ? " is-error"
                          : ""
                }`}
                role="status"
                aria-live="polite"
            >
                {estado === "success" && t("footer.newsletter.success")}
                {estado === "duplicate" && t("footer.newsletter.duplicate")}
                {estado === "invalid" && t("footer.newsletter.invalid")}
                {estado === "error" && t("footer.newsletter.error")}
            </p>

            <p className="footer__news-consent">
                {t("footer.newsletter.consent")}
            </p>
        </form>
    );
};

export default NewsletterForm;
