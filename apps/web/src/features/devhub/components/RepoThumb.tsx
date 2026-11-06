import React, { useState } from "react";
import {
    NEUTRAL_LANGUAGE_COLOR,
    type Repository,
} from "@/features/devhub/types";

/* ─────────────────────────────────────────────────────────
   RepoThumb — a miniatura de um repositório
   ─────────────────────────────────────────────────────────
   O GitHub gera um social card para todo repositório público, e
   é ele que aparece aqui: traz o nome, o dono e a descrição
   compostos pelo próprio GitHub, o que dá à galeria uma textura
   que um gradiente genérico não daria.

   Quando a imagem não existe ou não carrega, o lugar dela é
   ocupado por uma superfície tingida pela cor da linguagem, com
   o nome do repositório. Isso não faz nenhuma requisição — é o
   que mantém a galeria utilizável offline e evita o buraco
   cinza que uma imagem quebrada deixaria.
───────────────────────────────────────────────────────── */

interface Props {
    repo: Repository;
    className?: string;
}

export const RepoThumb: React.FC<Props> = ({ repo, className }) => {
    const [falhou, setFalhou] = useState(false);

    const cor = repo.primaryLanguage?.color ?? NEUTRAL_LANGUAGE_COLOR;
    const og = repo.openGraphImageUrl;

    if (og && !falhou) {
        return (
            <img
                className={className}
                src={og}
                /* Vazio e não decorativo por engano: o cartão já expõe o
                   nome e a descrição como texto, logo abaixo. Uma `alt`
                   repetindo isso faria o leitor de tela anunciar o mesmo
                   conteúdo duas vezes. */
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setFalhou(true)}
            />
        );
    }

    return (
        <span
            className={className}
            data-fallback="true"
            aria-hidden="true"
            style={{ "--thumb-tint": cor } as React.CSSProperties}
        >
            <span className="devhub-thumb__name">{repo.name}</span>
        </span>
    );
};
