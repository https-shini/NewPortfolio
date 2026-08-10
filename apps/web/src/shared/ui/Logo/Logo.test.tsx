import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Logo } from "./Logo";

/* ─────────────────────────────────────────────────────────
   Logo — a marca é texto, e texto tem contrato
   ─────────────────────────────────────────────────────────
   O que importa aqui não é o pixel (isso é papel das auditorias), e sim
   três invariantes: o leitor de tela recebe o nome e não a pontuação,
   as cores vêm de classe (token) e nunca de estilo inline, e as duas
   variantes rendem o texto combinado.
───────────────────────────────────────────────────────── */

describe("Logo", () => {
    it("a variante completa expõe 'gcruz.dev' ao leitor de tela", () => {
        render(<Logo />);
        expect(
            screen.getByRole("img", { name: "gcruz.dev" }),
        ).toBeInTheDocument();
    });

    it("a variante compacta expõe 'gc'", () => {
        render(<Logo variante="compacta" />);
        expect(screen.getByRole("img", { name: "gc" })).toBeInTheDocument();
    });

    it("os colchetes existem no visual e somem da árvore acessível", () => {
        const { container } = render(<Logo />);
        /* Visíveis: o acento da marca. */
        expect(container.textContent).toBe("<gcruz.dev/>");
        /* Mas nenhum pedaço soletrável: tudo que é pontuação está
           escondido, e o nome inteiro vive no aria-label. */
        for (const span of container.querySelectorAll(".logo > span")) {
            expect(span).toHaveAttribute("aria-hidden", "true");
        }
    });

    it("nenhuma cor é declarada inline — tema é assunto dos tokens", () => {
        const { container } = render(<Logo />);
        for (const el of container.querySelectorAll("*")) {
            expect(el.getAttribute("style")).toBeNull();
        }
    });
});
