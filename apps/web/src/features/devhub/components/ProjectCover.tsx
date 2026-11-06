import React from "react";
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
}

export const ProjectCover: React.FC<Props> = ({ repo, className }) => {
    const linguagens = repo.languages.length
        ? repo.languages
        : repo.primaryLanguage
          ? [{ ...repo.primaryLanguage, size: 1 }]
          : [];
    const cor1 = linguagens[0]?.color ?? NEUTRAL_LANGUAGE_COLOR;
    const cor2 = linguagens[1]?.color ?? cor1;
    const s = semente(repo.name);

    return (
        <span
            className={`${className ?? ""} pcover`}
            aria-hidden="true"
            style={
                {
                    "--pc-1": cor1,
                    "--pc-2": cor2,
                    "--pc-angle": `${s % 360}deg`,
                    "--pc-x": `${20 + (s % 61)}%`,
                } as React.CSSProperties
            }
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
