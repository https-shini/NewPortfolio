import React, { useState } from "react";
import { ProjectCover } from "@/features/devhub/components/ProjectCover";
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
    /**
     * `social` (padrão, vitrine da home): social card do GitHub.
     * `cover` (catálogo): só capa REAL — imagem social personalizada
     * ou imagem do README, escolhidas pela API. Sem ela, a capa
     * composta pela identidade do projeto; o card automático do
     * GitHub não entra, porque em 86 repositórios ele vira a mesma
     * imagem repetida com textos diferentes.
     * `showcase` (vitrine da home): capa real primeiro; sem ela, o
     * social card do GitHub (o slide é grande e único, então a
     * repetição não pesa); sem nenhum dos dois, a capa composta.
     */
    source?: "social" | "cover" | "showcase";
}

export const RepoThumb: React.FC<Props> = ({
    repo,
    className,
    source = "social",
}) => {
    /* Quantas fontes já falharam: cada `onError` passa para a próxima. */
    const [falhas, setFalhas] = useState(0);

    const cor = repo.primaryLanguage?.color ?? NEUTRAL_LANGUAGE_COLOR;
    const capa = repo.cover
        ? { url: repo.cover.url, kind: repo.cover.kind as string }
        : null;
    const social = repo.openGraphImageUrl
        ? { url: repo.openGraphImageUrl, kind: "social" }
        : null;
    const fontes = (
        source === "cover"
            ? [capa]
            : source === "showcase"
              ? [capa, social]
              : [social]
    ).filter((f): f is { url: string; kind: string } => f !== null);
    const atual = fontes[falhas];

    if (atual) {
        return (
            <img
                key={atual.url}
                className={className}
                src={atual.url}
                /* Vazio e não decorativo por engano: o cartão já expõe o
                   nome e a descrição como texto, logo abaixo. Uma `alt`
                   repetindo isso faria o leitor de tela anunciar o mesmo
                   conteúdo duas vezes. */
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setFalhas((n) => n + 1)}
                data-cover={source === "social" ? undefined : atual.kind}
            />
        );
    }

    if (source !== "social") {
        return <ProjectCover repo={repo} className={className} />;
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
