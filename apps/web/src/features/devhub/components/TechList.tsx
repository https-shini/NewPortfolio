import React from "react";
import "./TechList.css";
import type { GenericTech, Tech } from "@/features/devhub/tech";
import { useLang } from "@/shared/hooks/useLang";
import { SkillIcon } from "@/shared/ui/SkillIcon/SkillIcon";

/* ─────────────────────────────────────────────────────────
   TechList — chips de tecnologia com ícone, nome e cor
   ─────────────────────────────────────────────────────────
   Ícone oficial (Skill Icons, servido do próprio domínio) quando o
   catálogo de `tech.ts` tem um; senão, um GENÉRICO desenhado aqui,
   que mostra a finalidade (código, biblioteca, estilo, banco,
   servidor, segurança) num ladrilho neutro do mesmo tamanho. Nunca
   uma imitação do logotipo.

   O nome é sempre texto real — é ele o rótulo acessível; o ícone é
   decorativo. A cor da tecnologia entra só no contorno e num fundo
   de 10%, e o texto fica na cor do tema: o contraste não depende de
   quão clara é a cor da marca (o amarelo do JavaScript, por exemplo).
───────────────────────────────────────────────────────── */

const GLIFOS: Record<GenericTech, React.ReactNode> = {
    code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />,
    lib: <path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8" />,
    style: (
        <>
            <path d="M18.4 2.6a2 2 0 0 1 2.9 2.9L11 15.8 8.2 13z" />
            <path d="M8.2 13c-2.2 0-4 1.8-4 4 0 1.5-1 2.6-2.2 3 1 .7 2.6 1 4.2 1 2.8 0 4.8-2.2 4.8-5" />
        </>
    ),
    database: (
        <>
            <ellipse cx="12" cy="5" rx="8" ry="3" />
            <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
        </>
    ),
    server: (
        <>
            <rect x="3" y="4" width="18" height="7" rx="2" />
            <rect x="3" y="13" width="18" height="7" rx="2" />
            <path d="M7 7.5h.01M7 16.5h.01" />
        </>
    ),
    security: (
        <>
            <path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6z" />
            <path d="m9 12 2 2 4-4" />
        </>
    ),
};

const GenericIcon: React.FC<{ kind: GenericTech; size: number }> = ({
    kind,
    size,
}) => (
    <span
        className="tech__generic"
        style={{ width: size, height: size }}
        aria-hidden="true"
    >
        <svg
            viewBox="0 0 24 24"
            width={Math.round(size * 0.6)}
            height={Math.round(size * 0.6)}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
        >
            {GLIFOS[kind]}
        </svg>
    </span>
);

interface Props {
    techs: Tech[];
    /** `sm` no cartão, `lg` no modal. */
    size?: "sm" | "lg";
    /** Quantos chips antes do "+N". Ausente ⇒ todos. */
    limit?: number;
    className?: string;
    label?: string;
}

export const TechList: React.FC<Props> = ({
    techs,
    size = "sm",
    limit,
    className,
    label,
}) => {
    const { t } = useLang();
    if (techs.length === 0) return null;
    const lado = size === "lg" ? 24 : 18;
    const visiveis = limit ? techs.slice(0, limit) : techs;
    const resto = techs.length - visiveis.length;

    return (
        <ul
            className={`tech-list${className ? ` ${className}` : ""}`}
            data-size={size}
            aria-label={label ?? t("tech.label")}
        >
            {visiveis.map((tech) => (
                <li
                    key={tech.key}
                    className="tech"
                    style={{ "--tech": tech.color } as React.CSSProperties}
                >
                    {tech.icon ? (
                        <SkillIcon
                            id={tech.icon}
                            size={lado}
                            className="tech__icon"
                        />
                    ) : (
                        <GenericIcon kind={tech.generic} size={lado} />
                    )}
                    <span className="tech__name">{tech.name}</span>
                </li>
            ))}
            {resto > 0 && (
                <li className="tech tech--more">
                    <span aria-hidden="true">+{resto}</span>
                    <span className="sr-only">
                        {resto === 1
                            ? t("tech.moreOne")
                            : t("tech.more").replace("{n}", String(resto))}
                    </span>
                </li>
            )}
        </ul>
    );
};
