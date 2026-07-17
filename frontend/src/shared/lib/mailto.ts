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
