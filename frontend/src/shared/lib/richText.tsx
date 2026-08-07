import React from "react";

/* ─────────────────────────────────────────────────────────
   renderRich — a ênfase mínima que um texto traduzido precisa.

   Converte `**negrito**` em <strong> e `código` em <code>, e nada
   além disso: o objetivo é deixar o tradutor decidir onde o
   destaque cai, não trazer um markdown inteiro para dentro do
   pacote.

   A precedência segue o markdown: crase vence. Dentro de um par
   de crases nada mais é interpretado, e por isso `**a**` entre
   crases sai literal. Já o inverso funciona — **a `b` c** rende
   negrito com um trecho de código dentro —, porque o conteúdo do
   negrito é analisado de novo, recursivamente.

   Delimitador sem par vira texto comum. Um asterisco solto no
   meio de uma frase é mais provável que uma ênfase que alguém
   esqueceu de fechar, e apagá-lo seria perder o que a pessoa
   escreveu.
───────────────────────────────────────────────────────── */

/** Posição do próximo delimitador que abre algo, ou -1. */
function proximoDelimitador(text: string, from: number) {
    const crase = text.indexOf("`", from);
    const forte = text.indexOf("**", from);
    if (crase === -1 && forte === -1) return null;
    if (crase !== -1 && (forte === -1 || crase < forte))
        return { tipo: "code" as const, at: crase };
    return { tipo: "strong" as const, at: forte };
}

function parse(text: string, keyPrefix = ""): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    let n = 0;

    while (cursor < text.length) {
        const encontrado = proximoDelimitador(text, cursor);
        if (!encontrado) break;

        const { tipo, at } = encontrado;
        const abertura = tipo === "code" ? 1 : 2;
        const fecha = text.indexOf(tipo === "code" ? "`" : "**", at + abertura);

        /* Sem par, ou par colado (conteúdo vazio): é texto, não marcação.
           Emite até o fim do delimitador e segue procurando adiante. */
        if (fecha === -1 || fecha === at + abertura) {
            nodes.push(
                <React.Fragment key={`${keyPrefix}t${n++}`}>
                    {text.slice(cursor, at + abertura)}
                </React.Fragment>,
            );
            cursor = at + abertura;
            continue;
        }

        if (at > cursor) {
            nodes.push(
                <React.Fragment key={`${keyPrefix}t${n++}`}>
                    {text.slice(cursor, at)}
                </React.Fragment>,
            );
        }

        const conteudo = text.slice(at + abertura, fecha);
        if (tipo === "code") {
            /* Nada dentro de crases é interpretado. */
            nodes.push(<code key={`${keyPrefix}c${n++}`}>{conteudo}</code>);
        } else {
            nodes.push(
                <strong key={`${keyPrefix}s${n}`}>
                    {parse(conteudo, `${keyPrefix}s${n++}-`)}
                </strong>,
            );
        }
        cursor = fecha + abertura;
    }

    if (cursor < text.length) {
        nodes.push(
            <React.Fragment key={`${keyPrefix}t${n++}`}>
                {text.slice(cursor)}
            </React.Fragment>,
        );
    }

    return nodes;
}

export function renderRich(text: string): React.ReactNode[] {
    return parse(text);
}

/**
 * renderRichParagraphs — divide por linhas em branco (\n\n) e renderiza
 * cada parágrafo via `renderRich`, aplicando `className` em cada <p>.
 */
export function renderRichParagraphs(
    text: string,
    className?: string,
): React.ReactNode[] {
    return text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
            <p key={i} className={className}>
                {renderRich(p)}
            </p>
        ));
}
