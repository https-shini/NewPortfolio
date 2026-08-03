import type React from "react";
import { useRoute } from "@/shared/hooks/useRoute";
import { linkKind, type LinkKind } from "@/shared/config/links";
import type { RoutePath } from "@/shared/config/routes";

/* ─────────────────────────────────────────────────────────
   useLinkProps — como um href deve se comportar
   ─────────────────────────────────────────────────────────
   Uma URL pública pode ser quatro coisas: rota da SPA, arquivo
   estático (PDF), site externo ou mailto. Cada uma abre de um
   jeito. Concentrar a decisão aqui evita que cada consumidor
   reimplemente a regra — e discorde dela.

   Rotas mantêm o href real no DOM (SEO, clique do meio, "abrir
   em nova aba" pelo menu do browser) e só interceptam o clique
   simples, sem modificadores.
───────────────────────────────────────────────────────── */

interface LinkProps {
    kind: LinkKind;
    /** True quando o destino sai da navegação da SPA. */
    opensNewTab: boolean;
    /** Props prontas para espalhar num <a>. */
    anchorProps: {
        href: string;
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
        target?: "_blank";
        rel?: "noopener noreferrer";
    };
}

export function useLinkProps(href: string): LinkProps {
    const { navigate } = useRoute();

    const kind = linkKind(href);
    const opensNewTab = kind === "external" || kind === "file";

    const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (kind !== "route") return;
        /* Respeita ctrl/cmd/shift-clique e cliques que não sejam o principal. */
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href as RoutePath);
    };

    return {
        kind,
        opensNewTab,
        anchorProps: {
            href,
            onClick,
            ...(opensNewTab
                ? {
                      target: "_blank" as const,
                      rel: "noopener noreferrer" as const,
                  }
                : {}),
        },
    };
}
