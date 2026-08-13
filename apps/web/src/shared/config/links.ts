import type React from "react";
import type { Localized } from "@/shared/lib/localized";
import { PROFILE } from "@/shared/config/profile";
import { ROUTES } from "@/shared/config/routes";
import {
    type IconProps,
    IconLink,
    IconGitHub,
    IconLinkedIn,
    IconGmail,
    /* Para redes secundárias, use nos itens kind:"social" abaixo:
       IconInstagram, IconDevTo, IconTwitterX */
} from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   links.ts — fonte única das URLs públicas
   ─────────────────────────────────────────────────────────
   Duas coisas moram aqui:

   · PROJECT_URLS — endereços canônicos dos projetos próprios,
     consumidos por Work, Featured e Footer.
   · TREE_LINKS   — os links da página /links (social tree).

   Nada deriva de string solta: identidade e contato vêm de
   PROFILE, rotas vêm de ROUTES. Adicionar um link = adicionar
   um item. Ver o passo a passo no README.
───────────────────────────────────────────────────────── */

/* ═════════════════════════════════════════════════════════
   1. Projetos — URLs canônicas
   ═════════════════════════════════════════════════════════ */

/** Monta a URL de um repositório a partir do perfil do GitHub. */
function repo(name: string): string {
    return `${PROFILE.social.github.url}/${name}`;
}

/**
 * PROJECT_URLS — endereços canônicos dos projetos próprios.
 * `live` é sempre sem barra final, para que a mesma URL seja
 * comparável entre consumidores.
 */
export const PROJECT_URLS = {
    authService: {
        live: "https://authservice-mbul.onrender.com",
        docs: "https://authservice-mbul.onrender.com/docs",
        repo: repo("AuthService"),
    },
    webChat: {
        live: "https://chat-frontend-g42t.onrender.com",
        repo: repo("web-chat"),
    },
    finances: {
        live: "https://financas-reactjs.vercel.app",
        repo: repo("financas-reactjs"),
    },
    homemadeGourmet: {
        live: "https://https-shini.github.io/homemade-gourmet",
        repo: repo("homemade-gourmet"),
    },
    devlinksRocketseat: {
        live: "https://devlinks-rocketseat-five.vercel.app",
        repo: repo("devlinks-rocketseat"),
    },
} as const;

/* ═════════════════════════════════════════════════════════
   2. Social tree — os links da página /links
   ═════════════════════════════════════════════════════════ */

/**
 * · primary → cartões grandes empilhados (destaque)
 * · social  → botões compactos na linha de ícones
 */
export type TreeLinkKind = "primary" | "social";

export interface TreeLink {
    /** Chave estável — key do React e identificador nos testes. */
    id: string;
    kind: TreeLinkKind;
    /** Rótulo visível, bilíngue. */
    label: Localized;
    /** Handle/URL curto exibido em mono sob o rótulo (só em primary). */
    sublabel?: string;
    href: string;
    /** Componente do ícone — vem direto de shared/ui/Icons. */
    icon: React.FC<IconProps>;
    /** Abre em nova aba. Falso para mailto e rotas internas. */
    external?: boolean;
}

/** Domínio sem protocolo — usado como sublabel do link do portfólio. */
export const siteDomain = PROFILE.siteUrl.replace(/^https?:\/\//, "");

export const TREE_LINKS: readonly TreeLink[] = [
    /* Rota interna, e não `PROFILE.siteUrl`: desde que a /links passou a
       montar o Header e o Footer do site, um link externo aqui abriria
       uma aba nova para o mesmo domínio em que o visitante já está. É o
       mesmo raciocínio que o rodapé já aplica à própria lista social —
       ver o filtro de `portfolio` em widgets/Footer/Footer.tsx.

       O sublabel continua sendo o domínio: quem chega de uma bio não
       sabe onde está, e é a única linha da página que informa isso. */
    {
        id: "portfolio",
        kind: "primary",
        label: { pt: "Portfólio", en: "Portfolio" },
        sublabel: siteDomain,
        href: ROUTES.HOME,
        icon: IconLink,
        external: false,
    },
    {
        id: "github",
        kind: "primary",
        label: { pt: "GitHub", en: "GitHub" },
        sublabel: PROFILE.social.github.handle,
        href: PROFILE.social.github.url,
        icon: IconGitHub,
        external: true,
    },
    {
        id: "linkedin",
        kind: "primary",
        label: { pt: "LinkedIn", en: "LinkedIn" },
        sublabel: PROFILE.social.linkedin.handle,
        href: PROFILE.social.linkedin.url,
        icon: IconLinkedIn,
        external: true,
    },
    {
        id: "email",
        kind: "primary",
        label: { pt: "Contato", en: "Contact" },
        sublabel: PROFILE.email,
        href: `mailto:${PROFILE.email}`,
        icon: IconGmail,
        external: false,
    },

    /* ── Secundárias (linha de ícones) ──────────────────────
       Descomente conforme os perfis forem ao ar. Mantidos como
       exemplo do padrão extensível.

    {
        id: "instagram",
        kind: "social",
        label: { pt: "Instagram", en: "Instagram" },
        href: "https://instagram.com/<handle>",
        icon: IconInstagram,
        external: true,
    },
    */
] as const;

export const PRIMARY_LINKS = TREE_LINKS.filter((l) => l.kind === "primary");
export const SOCIAL_LINKS = TREE_LINKS.filter((l) => l.kind === "social");

/* ═════════════════════════════════════════════════════════
   3. Derivações — nada aqui é campo manual
   ═════════════════════════════════════════════════════════ */

/** Como um href deve ser aberto. Derivado, nunca declarado à mão. */
export type LinkKind = "route" | "file" | "external" | "mailto";

export function linkKind(href: string): LinkKind {
    if (href.startsWith("mailto:")) return "mailto";
    if (/^https?:\/\//.test(href)) return "external";
    /* Caminho interno: rota da SPA se registrada, senão arquivo estático
       servido de public/ (os PDFs do currículo, por exemplo). */
    const isRoute = (Object.values(ROUTES) as string[]).includes(href);
    return isRoute ? "route" : "file";
}
