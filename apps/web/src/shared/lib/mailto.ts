import { PROFILE } from "@/shared/config/profile";
import type { Lang } from "@/shared/lib/localized";

/* ─────────────────────────────────────────────────────────
   buildMailtoHref — mailto: com assunto e corpo pré-preenchidos
   adaptados ao idioma corrente. Usado por Footer e Contact.
───────────────────────────────────────────────────────── */
export function buildMailtoHref(lang: Lang): string {
    const isPt = lang === "pt";
    const subject = encodeURIComponent(
        isPt
            ? `Contato via Portfólio — ${PROFILE.name}`
            : `Contact via Portfolio — ${PROFILE.name}`,
    );
    const body = encodeURIComponent(
        isPt
            ? "Olá, Guilherme!\n\nEntrei em contato pelo seu portfólio e gostaria de conversar sobre..."
            : "Hi, Guilherme!\n\nI found you through your portfolio and would love to chat about...",
    );
    return `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;
}

/**
 * buildNewsletterMailtoHref — a saída da newsletter quando não há endpoint.
 *
 * Antes, sem `VITE_NEWSLETTER_ENDPOINT` o campo inteiro sumia da página.
 * Isso protegia contra um formulário que não envia nada, mas ao preço de
 * não haver inscrição nenhuma — e a página não dizia por quê. Degradar
 * para mailto é o que o formulário de contato já fazia, e continua sendo
 * uma inscrição de verdade: chega um e-mail com o endereço dentro.
 */
export function buildNewsletterMailtoHref(lang: Lang, email: string): string {
    const isPt = lang === "pt";
    const subject = encodeURIComponent(
        isPt ? "Quero receber as novidades" : "I'd like to get updates",
    );
    const body = encodeURIComponent(
        isPt
            ? `Olá, Guilherme!\n\nGostaria de receber as novidades do portfólio neste endereço:\n${email}`
            : `Hi, Guilherme!\n\nI'd like to receive portfolio updates at this address:\n${email}`,
    );
    return `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;
}
