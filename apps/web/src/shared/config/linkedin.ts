import { PROFILE } from "./profile";
import { ROUTES, withLang } from "./routes";

/** Inclui as páginas internas do perfil (por exemplo, certificados), mas
 * não perfis de terceiros, páginas de empresas ou domínios parecidos. */
export function isOwnLinkedInProfile(href: string): boolean {
    try {
        const url = new URL(href);
        const profile = new URL(PROFILE.social.linkedin.url);
        const path = url.pathname.replace(/\/+$/, "");
        return (
            url.protocol === "https:" &&
            !url.username &&
            !url.password &&
            !url.port &&
            ["linkedin.com", "www.linkedin.com"].includes(url.hostname) &&
            (path === profile.pathname ||
                path.startsWith(`${profile.pathname}/`))
        );
    } catch {
        return false;
    }
}

export function linkedInNoticePath(
    destination: string,
    lang: "pt" | "en",
): string {
    const params = new URLSearchParams({ to: destination });
    return withLang(`${ROUTES.LINKEDIN_NOTICE}?${params}`, lang);
}

/** O destino recebido por URL nunca pode virar um redirecionamento aberto. */
export function linkedInDestination(search: string): string {
    const destination = new URLSearchParams(search).get("to");
    return destination && isOwnLinkedInProfile(destination)
        ? destination
        : PROFILE.social.linkedin.url;
}

export const LINKEDIN_NOTICE_COPY = {
    pt: {
        eyebrow: "Antes de continuar",
        title: "Meu LinkedIn está temporariamente indisponível",
        body: "Meu perfil está passando por um processo de verificação de identidade. Já entrei em contato com o suporte do LinkedIn e aguardo um retorno.",
        detail: "Por enquanto, a página pode não estar acessível. Você pode falar comigo por e-mail ou continuar para o perfil, se preferir.",
        email: "Falar por e-mail",
        continue: "Continuar para o LinkedIn",
        continueHint: "abre em nova aba",
        close: "Fechar aviso",
        stay: "Continuar no portfólio",
        linkHint: "exibe um aviso antes de abrir",
    },
    en: {
        eyebrow: "Before you continue",
        title: "My LinkedIn is temporarily unavailable",
        body: "My profile is undergoing an identity verification process. I have already contacted LinkedIn support and am waiting for a response.",
        detail: "For now, the page may not be accessible. You can reach me by email or continue to the profile if you prefer.",
        email: "Get in touch by email",
        continue: "Continue to LinkedIn",
        continueHint: "opens in a new tab",
        close: "Close notice",
        stay: "Stay on the portfolio",
        linkHint: "shows a notice before opening",
    },
} as const;
