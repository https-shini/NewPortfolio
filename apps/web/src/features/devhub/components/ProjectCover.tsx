import React from "react";
import "./ProjectCover.css";
import { displayName } from "@/features/devhub/catalog";
import {
    NEUTRAL_LANGUAGE_COLOR,
    type Repository,
} from "@/features/devhub/types";

/* ─────────────────────────────────────────────────────────
   ProjectCover — capa composta pela identidade do projeto
   ─────────────────────────────────────────────────────────
   Usada quando o repositório não tem capa própria (imagem social
   personalizada ou imagem do README). Não é uma imagem genérica
   repetida: tudo nela vem do próprio repositório — nome de
   exibição, caminho, linguagens e as cores delas — e o ângulo do
   brilho deriva do nome, então dois projetos da mesma linguagem
   ainda ficam diferentes. Zero requisições.

   Decorativa (`aria-hidden`): o cartão já expõe esses dados como
   texto logo abaixo.
───────────────────────────────────────────────────────── */

/** Hash estável e barato (djb2) — só para variar a composição. */
function semente(texto: string): number {
    let h = 5381;
    for (let i = 0; i < texto.length; i++) {
        h = ((h << 5) + h + texto.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}

interface Props {
    repo: Repository;
    className?: string;
    /**
     * `full` (padrão): nome de exibição grande + caminho + linguagens.
     * `terminal`: o "prompt" do card — ícone de código, `$ cd ~/nome`
     * e a linguagem principal. Usado quando o nome já está logo abaixo.
     */
    variant?: "full" | "terminal";
}

export const ProjectCover: React.FC<Props> = ({
    repo,
    className,
    variant = "full",
}) => {
    const linguagens = repo.languages.length
        ? repo.languages
        : repo.primaryLanguage
          ? [{ ...repo.primaryLanguage, size: 1 }]
          : [];
    const cor1 = linguagens[0]?.color ?? NEUTRAL_LANGUAGE_COLOR;
    const cor2 = linguagens[1]?.color ?? cor1;
    const s = semente(repo.name);

    const estilo = {
        "--pc-1": cor1,
        "--pc-2": cor2,
        "--pc-angle": `${s % 360}deg`,
        "--pc-x": `${20 + (s % 61)}%`,
    } as React.CSSProperties;

    if (variant === "terminal") {
        return (
            <span
                className={`${className ?? ""} pcover pcover--terminal`}
                aria-hidden="true"
                style={estilo}
            >
                <span className="pcover__icon">〈/〉</span>
                <span className="pcover__prompt">
                    <span className="pcover__sign">$</span> cd ~/{repo.name}
                </span>
                {linguagens[0] && (
                    <span className="pcover__sub">{linguagens[0].name}</span>
                )}
            </span>
        );
    }

    return (
        <span
            className={`${className ?? ""} pcover`}
            aria-hidden="true"
            style={estilo}
        >
            <span className="pcover__path">~/{repo.name}</span>
            <span className="pcover__title">{displayName(repo.name)}</span>
            {linguagens.length > 0 && (
                <span className="pcover__langs">
                    {linguagens.slice(0, 3).map((l) => (
                        <span key={l.name} className="pcover__lang">
                            <span
                                className="pcover__dot"
                                style={{
                                    background:
                                        l.color ?? NEUTRAL_LANGUAGE_COLOR,
                                }}
                            />
                            {l.name}
                        </span>
                    ))}
                </span>
            )}
        </span>
    );
};
