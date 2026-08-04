import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Accordion } from "./Accordion";

const setup = (props: Partial<React.ComponentProps<typeof Accordion>> = {}) =>
    render(
        <Accordion
            classPrefix="teste"
            trigger={<span>Cabeçalho</span>}
            {...props}
        >
            <p>Conteúdo do painel</p>
        </Accordion>,
    );

describe("Accordion", () => {
    it("começa fechado por padrão", () => {
        setup();
        expect(screen.getByRole("button")).toHaveAttribute(
            "aria-expanded",
            "false",
        );
    });

    it("respeita defaultOpen", () => {
        setup({ defaultOpen: true });
        expect(screen.getByRole("button")).toHaveAttribute(
            "aria-expanded",
            "true",
        );
    });

    it("alterna ao clicar", async () => {
        const user = userEvent.setup();
        setup();
        const trigger = screen.getByRole("button");

        await user.click(trigger);
        expect(trigger).toHaveAttribute("aria-expanded", "true");

        await user.click(trigger);
        expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("alterna pelo teclado (Enter e Espaço)", async () => {
        const user = userEvent.setup();
        setup();
        const trigger = screen.getByRole("button");

        trigger.focus();
        await user.keyboard("{Enter}");
        expect(trigger).toHaveAttribute("aria-expanded", "true");

        await user.keyboard(" ");
        expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("liga botão e painel por aria-controls/aria-labelledby", () => {
        setup({ defaultOpen: true });
        const trigger = screen.getByRole("button");
        const panel = screen.getByRole("region");

        expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
        expect(panel.getAttribute("aria-labelledby")).toBe(trigger.id);
    });

    it("marca o painel fechado como aria-hidden", async () => {
        const user = userEvent.setup();
        setup();
        const panel = screen.getByRole("region", { hidden: true });

        expect(panel).toHaveAttribute("aria-hidden", "true");

        await user.click(screen.getByRole("button"));
        expect(panel).toHaveAttribute("aria-hidden", "false");
    });

    it("aplica is-open e o classPrefix na raiz", async () => {
        const user = userEvent.setup();
        const { container } = setup({ className: "extra" });
        const root = container.firstElementChild!;

        expect(root.className).toContain("teste");
        expect(root.className).toContain("extra");
        expect(root.className).not.toContain("is-open");

        await user.click(screen.getByRole("button"));
        expect(root.className).toContain("is-open");
    });

    it("usa o elemento raiz pedido em `as`", () => {
        const { container } = setup({ as: "article" });
        expect(container.firstElementChild?.tagName).toBe("ARTICLE");
    });

    it("no modo controlado, não muda sozinho e avisa o consumidor", async () => {
        const user = userEvent.setup();
        const onToggle = vi.fn();
        setup({ open: false, onToggle });

        const trigger = screen.getByRole("button");
        await user.click(trigger);

        expect(onToggle).toHaveBeenCalledWith(true);
        /* Continua fechado: quem manda é a prop. */
        expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
});
