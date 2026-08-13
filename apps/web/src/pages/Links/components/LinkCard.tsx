import React, { useCallback } from "react";
import "./LinkCard.css";
import { IconArrowUp } from "@/shared/ui/Icons";
import { useLang } from "@/shared/hooks/useLang";
import { useRoute } from "@/shared/hooks/useRoute";
import { linkKind, type TreeLink } from "@/shared/config/links";

interface LinkCardProps {
    link: TreeLink;
    /** Índice para o stagger de entrada (reveal). */
    index: number;
}

/**
 * LinkCard — card grande do Social Tree.
 * Herda glass + tokens do design system; efeito ripple na origem do clique
 * (respeitando reduced-motion via CSS) e seta que desliza no hover.
 */
export const LinkCard: React.FC<LinkCardProps> = ({ link, index }) => {
    const { t, lang } = useLang();
    const { navigate } = useRoute();
    const Icon = link.icon;

    /* Rota interna é o caso do cartão do portfólio: sem isto o clique
       recarregaria o site inteiro para chegar à home. `href` continua
       real, então abrir em nova aba e o menu de contexto seguem valendo
       — daí o respeito aos modificadores, como no rodapé. */
    const ehRota = linkKind(link.href) === "route";

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            const el = e.currentTarget;
            const r = el.getBoundingClientRect();
            el.style.setProperty(
                "--rx",
                `${((e.clientX - r.left) / r.width) * 100}%`,
            );
            el.style.setProperty(
                "--ry",
                `${((e.clientY - r.top) / r.height) * 100}%`,
            );
            el.classList.remove("is-rippling");
            /* reflow para reiniciar a animação */
            void el.offsetWidth;
            el.classList.add("is-rippling");

            if (!ehRota) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey) return;
            e.preventDefault();
            navigate(link.href);
        },
        [ehRota, navigate, link.href],
    );

    /* O sublabel é decorativo (repete o destino); o nome acessível traz o
       rótulo e o aviso de nova aba, como no rodapé do site. */
    const accessibleName = link.external
        ? `${link.label[lang]} (${t("links.newTab")})`
        : link.label[lang];

    return (
        <a
            className="link-card reveal-item"
            style={{ "--reveal-i": index } as React.CSSProperties}
            href={link.href}
            aria-label={accessibleName}
            onClick={handleClick}
            {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
        >
            <span className="link-card__icon" aria-hidden="true">
                <Icon width={20} height={20} />
            </span>

            <span className="link-card__body">
                <span className="link-card__title">{link.label[lang]}</span>
                {link.sublabel && (
                    <span className="link-card__sub">{link.sublabel}</span>
                )}
            </span>

            <span className="link-card__arrow" aria-hidden="true">
                <IconArrowUp width={18} height={18} />
            </span>
        </a>
    );
};
