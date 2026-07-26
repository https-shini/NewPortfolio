import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

function renderModal(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
    const onClose = vi.fn();
    const utils = render(
        <Modal isOpen onClose={onClose} label="Diálogo de teste" {...props}>
            <button type="button">primeiro</button>
            <p>conteúdo do modal</p>
            <button type="button">último</button>
        </Modal>,
    );
    return { onClose, ...utils };
}

describe("Modal", () => {
    it("renderiza children num dialog acessível quando aberto", () => {
        renderModal();
        const dialog = screen.getByRole("dialog", {
            name: "Diálogo de teste",
        });
        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(screen.getByText("conteúdo do modal")).toBeInTheDocument();
    });

    it("não renderiza nada quando isOpen é false", () => {
        render(
            <Modal isOpen={false} onClose={vi.fn()} label="fechado">
                <p>invisível</p>
            </Modal>,
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.queryByText("invisível")).not.toBeInTheDocument();
    });

    it("fecha ao pressionar Escape", async () => {
        const user = userEvent.setup();
        const { onClose } = renderModal();
        await user.keyboard("{Escape}");
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("fecha ao clicar no overlay, mas não em cliques internos", async () => {
        const user = userEvent.setup();
        const { onClose } = renderModal();

        await user.click(screen.getByText("conteúdo do modal"));
        expect(onClose).not.toHaveBeenCalled();

        const backdrop = screen.getByRole("presentation");
        await user.pointer({ keys: "[MouseLeft]", target: backdrop });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("foca o primeiro elemento focável ao abrir", async () => {
        renderModal();
        await waitFor(() => expect(screen.getByText("primeiro")).toHaveFocus());
    });

    it("prende o foco: Tab no último volta ao primeiro e Shift+Tab inverte", async () => {
        const user = userEvent.setup();
        renderModal();
        const first = screen.getByText("primeiro");
        const last = screen.getByText("último");

        await waitFor(() => expect(first).toHaveFocus());

        last.focus();
        await user.tab();
        expect(first).toHaveFocus();

        await user.tab({ shift: true });
        expect(last).toHaveFocus();
    });

    it("restaura o foco ao elemento anterior quando fecha", async () => {
        const user = userEvent.setup();

        const Harness: React.FC = () => {
            const [open, setOpen] = React.useState(false);
            return (
                <>
                    <button type="button" onClick={() => setOpen(true)}>
                        abrir
                    </button>
                    <Modal
                        isOpen={open}
                        onClose={() => setOpen(false)}
                        label="restaura foco"
                    >
                        <button type="button" onClick={() => setOpen(false)}>
                            fechar
                        </button>
                    </Modal>
                </>
            );
        };

        render(<Harness />);
        const trigger = screen.getByText("abrir");

        await user.click(trigger);
        await waitFor(() => expect(screen.getByText("fechar")).toHaveFocus());

        await user.click(screen.getByText("fechar"));
        await waitFor(() => expect(trigger).toHaveFocus());
    });

    it("trava o scroll do body enquanto aberto e restaura ao fechar", () => {
        document.body.style.overflow = "auto";
        const { unmount } = renderModal();
        expect(document.body.style.overflow).toBe("hidden");
        unmount();
        expect(document.body.style.overflow).toBe("auto");
        document.body.style.overflow = "";
    });
});
