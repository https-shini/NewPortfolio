import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/* FORM_ENDPOINT é lido de import.meta.env no load do módulo constants —
   por isso os testes stubam o env e importam componente E provider
   dinamicamente do mesmo grafo de módulos (resetModules). */
const ENDPOINT = "https://formspree.io/f/test123";

async function renderForm(endpoint: string = ENDPOINT) {
    vi.resetModules();
    vi.stubEnv("VITE_FORM_ENDPOINT", endpoint);
    localStorage.setItem("portfolio-lang", "pt");
    const [{ ContactForm }, { LangProvider }] = await Promise.all([
        import("./ContactForm"),
        import("@/app/LangContext"),
    ]);
    return render(
        <LangProvider>
            <ContactForm />
        </LangProvider>,
    );
}

describe("ContactForm", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    it("não renderiza sem endpoint configurado", async () => {
        const { container } = await renderForm("");
        expect(container).toBeEmptyDOMElement();
    });

    it("valida campos e exibe mensagens de erro sem enviar", async () => {
        const user = userEvent.setup();
        await renderForm();

        await user.click(screen.getByRole("button", { name: /enviar/i }));

        expect(screen.getByText("Informe seu nome.")).toBeInTheDocument();
        expect(
            screen.getByText("Informe um e-mail válido."),
        ).toBeInTheDocument();
        expect(fetch).not.toHaveBeenCalled();
    });

    it("envia dados válidos e exibe sucesso", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);
        const user = userEvent.setup();
        await renderForm();

        await user.type(screen.getByLabelText("Nome"), "Maria Silva");
        await user.type(screen.getByLabelText("E-mail"), "maria@exemplo.com");
        await user.type(
            screen.getByLabelText("Mensagem"),
            "Olá! Tenho uma proposta de projeto para você.",
        );
        await user.click(screen.getByRole("button", { name: /enviar/i }));

        await waitFor(() =>
            expect(
                screen.getByText("Mensagem enviada com sucesso!"),
            ).toBeInTheDocument(),
        );
        expect(fetch).toHaveBeenCalledWith(
            ENDPOINT,
            expect.objectContaining({ method: "POST" }),
        );
    });

    it("exibe erro quando o envio falha", async () => {
        vi.mocked(fetch).mockRejectedValue(new Error("network"));
        const user = userEvent.setup();
        await renderForm();

        await user.type(screen.getByLabelText("Nome"), "Maria");
        await user.type(screen.getByLabelText("E-mail"), "maria@exemplo.com");
        await user.type(
            screen.getByLabelText("Mensagem"),
            "Mensagem longa o suficiente.",
        );
        await user.click(screen.getByRole("button", { name: /enviar/i }));

        await waitFor(() =>
            expect(screen.getByText(/Erro ao enviar/i)).toBeInTheDocument(),
        );
    });
});
