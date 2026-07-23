import React, { useCallback, useState } from "react";
import "./ContactForm.css";
import { useLang } from "@/shared/hooks/useLang";
import { FORM_ENDPOINT } from "@/shared/config/constants";
import { IconEmail } from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   ContactForm — formulário de contato com envio via endpoint
   externo (Formspree ou similar) configurado por variável de
   ambiente (VITE_FORM_ENDPOINT).

   · Sem endpoint configurado → componente não renderiza
     (a seção Contato degrada para o fluxo de mailto).
   · Validação client-side com mensagens i18n por campo.
   · Estados: idle → sending → success | error, com feedback
     visual e aria-live para leitores de tela.
   · Honeypot anti-spam (campo oculto que bots preenchem).
───────────────────────────────────────────────────────── */

type FormStatus = "idle" | "sending" | "success" | "error";

interface FormValues {
    name: string;
    email: string;
    message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MIN_LENGTH = 10;

export const ContactForm: React.FC = () => {
    const { t } = useLang();
    const [values, setValues] = useState<FormValues>({
        name: "",
        email: "",
        message: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [status, setStatus] = useState<FormStatus>("idle");

    const validate = useCallback(
        (v: FormValues): FormErrors => {
            const next: FormErrors = {};
            if (!v.name.trim()) next.name = t("contact.form.error.name");
            if (!EMAIL_RE.test(v.email.trim()))
                next.email = t("contact.form.error.email");
            if (v.message.trim().length < MESSAGE_MIN_LENGTH)
                next.message = t("contact.form.error.message");
            return next;
        },
        [t],
    );

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        /* Limpa o erro do campo assim que o usuário corrige */
        setErrors((prev) =>
            prev[name as keyof FormValues]
                ? { ...prev, [name]: undefined }
                : prev,
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!FORM_ENDPOINT || status === "sending") return;

        /* Honeypot — se preenchido, é bot: finge sucesso sem enviar */
        const honeypot = new FormData(e.currentTarget).get("_gotcha");
        if (typeof honeypot === "string" && honeypot.length > 0) {
            setStatus("success");
            return;
        }

        const nextErrors = validate(values);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setStatus("sending");
        try {
            const res = await fetch(FORM_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name: values.name.trim(),
                    email: values.email.trim(),
                    message: values.message.trim(),
                }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setStatus("success");
            setValues({ name: "", email: "", message: "" });
        } catch {
            setStatus("error");
        }
    };

    /* Sem endpoint configurado, o formulário não existe na UI */
    if (!FORM_ENDPOINT) return null;

    const isSending = status === "sending";

    return (
        <form
            className="contact-form"
            onSubmit={handleSubmit}
            noValidate
            aria-labelledby="contact-form-title"
        >
            <h4 id="contact-form-title" className="contact-form__title">
                {t("contact.form.title")}
            </h4>

            {/* Honeypot — invisível para humanos, atrativo para bots */}
            <input
                type="text"
                name="_gotcha"
                tabIndex={-1}
                autoComplete="off"
                className="contact-form__honeypot"
                aria-hidden="true"
            />

            <div className="contact-form__row">
                <div className="contact-form__field">
                    <label htmlFor="cf-name" className="contact-form__label">
                        {t("contact.form.name")}
                    </label>
                    <input
                        id="cf-name"
                        name="name"
                        type="text"
                        className="contact-form__input"
                        placeholder={t("contact.form.name.placeholder")}
                        value={values.name}
                        onChange={handleChange}
                        autoComplete="name"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={
                            errors.name ? "cf-name-error" : undefined
                        }
                        disabled={isSending}
                        required
                    />
                    {errors.name && (
                        <p id="cf-name-error" className="contact-form__error">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div className="contact-form__field">
                    <label htmlFor="cf-email" className="contact-form__label">
                        {t("contact.form.email")}
                    </label>
                    <input
                        id="cf-email"
                        name="email"
                        type="email"
                        className="contact-form__input"
                        placeholder={t("contact.form.email.placeholder")}
                        value={values.email}
                        onChange={handleChange}
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={
                            errors.email ? "cf-email-error" : undefined
                        }
                        disabled={isSending}
                        required
                    />
                    {errors.email && (
                        <p id="cf-email-error" className="contact-form__error">
                            {errors.email}
                        </p>
                    )}
                </div>
            </div>

            <div className="contact-form__field">
                <label htmlFor="cf-message" className="contact-form__label">
                    {t("contact.form.message")}
                </label>
                <textarea
                    id="cf-message"
                    name="message"
                    className="contact-form__input contact-form__textarea"
                    placeholder={t("contact.form.message.placeholder")}
                    value={values.message}
                    onChange={handleChange}
                    rows={5}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={
                        errors.message ? "cf-message-error" : undefined
                    }
                    disabled={isSending}
                    required
                />
                {errors.message && (
                    <p id="cf-message-error" className="contact-form__error">
                        {errors.message}
                    </p>
                )}
            </div>

            <div className="contact-form__footer">
                <button
                    type="submit"
                    className="btn btn--primary contact-form__submit"
                    disabled={isSending}
                >
                    <IconEmail width={16} height={16} aria-hidden="true" />
                    {isSending ? t("contact.sending") : t("contact.send")}
                </button>

                {/* Status do envio — anunciado a leitores de tela */}
                <p
                    className={`contact-form__status${
                        status === "success"
                            ? " is-success"
                            : status === "error"
                              ? " is-error"
                              : ""
                    }`}
                    role="status"
                    aria-live="polite"
                >
                    {status === "success" && t("contact.cta.success")}
                    {status === "error" && t("contact.cta.error")}
                </p>
            </div>
        </form>
    );
};
