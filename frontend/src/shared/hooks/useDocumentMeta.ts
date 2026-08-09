import { useEffect } from "react";
import { PROFILE } from "@/shared/config/profile";

/* ─────────────────────────────────────────────────────────
   useDocumentMeta — título e metatags por rota
   ─────────────────────────────────────────────────────────
   O index.html é estático e servido em todas as rotas, com o
   SEO da home. Como agora há mais de uma página, cada uma
   declara o próprio título, descrição e canonical.

   Sem biblioteca de head: são cinco atributos e o projeto não
   tem dependências de runtime além do React. Tudo o que é
   escrito aqui é restaurado no unmount, então voltar para a
   home devolve exatamente o que o HTML trazia.
───────────────────────────────────────────────────────── */

export interface DocumentMeta {
    title: string;
    description: string;
    /** Pathname da rota — vira canonical e og:url absolutos. */
    path: string;
    /**
     * Diretiva `robots` da rota. O index.html declara `index, follow` para
     * todas as páginas, o que está certo enquanto todas têm conteúdo — mas
     * uma página provisória indexada é conteúdo raso apontando para o
     * domínio, e isso não fica contido nela: pesa no site inteiro.
     *
     * `noindex, follow` é a combinação certa nesse caso — não entre no
     * índice, mas siga os links daqui, que levam de volta ao que interessa.
     */
    robots?: string;
}

/** Desfaz uma alteração aplicada ao <head>. */
type Restore = () => void;

interface MetaKey {
    name?: string;
    property?: string;
}

function upsertMeta(key: MetaKey, content: string): Restore {
    const selector = key.name
        ? `meta[name="${key.name}"]`
        : `meta[property="${key.property}"]`;

    const existing = document.head.querySelector<HTMLMetaElement>(selector);

    if (existing) {
        const previous = existing.getAttribute("content");
        existing.setAttribute("content", content);
        return () => {
            if (previous === null) existing.removeAttribute("content");
            else existing.setAttribute("content", previous);
        };
    }

    const created = document.createElement("meta");
    if (key.name) created.setAttribute("name", key.name);
    else created.setAttribute("property", key.property!);
    created.setAttribute("content", content);
    document.head.appendChild(created);

    return () => created.remove();
}

function upsertCanonical(href: string): Restore {
    const existing = document.head.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
    );

    if (existing) {
        const previous = existing.getAttribute("href");
        existing.setAttribute("href", href);
        return () => {
            if (previous === null) existing.removeAttribute("href");
            else existing.setAttribute("href", previous);
        };
    }

    const created = document.createElement("link");
    created.setAttribute("rel", "canonical");
    created.setAttribute("href", href);
    document.head.appendChild(created);

    return () => created.remove();
}

export function useDocumentMeta({
    title,
    description,
    path,
    robots,
}: DocumentMeta): void {
    useEffect(() => {
        const url = new URL(path, PROFILE.siteUrl).toString();

        const previousTitle = document.title;
        document.title = title;

        const restores: Restore[] = [
            upsertCanonical(url),
            upsertMeta({ name: "description" }, description),
            upsertMeta({ property: "og:title" }, title),
            upsertMeta({ property: "og:description" }, description),
            upsertMeta({ property: "og:url" }, url),
            upsertMeta({ name: "twitter:title" }, title),
            upsertMeta({ name: "twitter:description" }, description),
        ];

        /* Só quando a rota pede: sem isto a `robots` do index.html vale, que
           é o comportamento correto para toda página que tem conteúdo. */
        if (robots) restores.push(upsertMeta({ name: "robots" }, robots));

        return () => {
            document.title = previousTitle;
            /* Ordem inversa: o último a escrever é o primeiro a desfazer. */
            restores.reverse().forEach((restore) => restore());
        };
    }, [title, description, path, robots]);
}
