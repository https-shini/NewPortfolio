import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/* NEWSLETTER_ENDPOINT é lido de import.meta.env no load do módulo
   constants — daí o mesmo arranjo do ContactForm: stub do env e import
   dinâmico do componente E do provider, do mesmo grafo de módulos. */
const ENDPOINT = "https://exemplo.test/newsletter";

async function renderForm(endpoint: string = ENDPOINT, lang = "pt") {
    vi.resetModules();
    vi.stubEnv("VITE_NEWSLETTER_ENDPOINT", endpoint);
    localStorage.setItem("portfolio-lang", lang);
    const [{ NewsletterForm }, { LangProvider }] = await Promise.all([
        import("./NewsletterForm"),
        import("@/app/LangContext"),
    ]);
    return render(
        <LangProvider>
            <NewsletterForm />
        </LangProvider>,
    );
}

const inscrever = () => screen.getByRole("button", { name: /inscrever/i });
const campo = () => screen.getByLabelText(/novidades por e-mail/i);

describe("NewsletterForm", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    /* É o que sustenta a decisão de ter o contrato no código antes do
       backend: sem endpoint, nada meio-pronto aparece na página. */
    it("não renderiza sem endpoint configurado", async () => {
        const { container } = await renderForm("");
        expect(container).toBeEmptyDOMElement();
    });

    it("recusa endereço inválido sem chamar a rede", async () => {
        const user = userEvent.setup();
        await renderForm();

        await user.type(campo(), "nao-e-email");
        await user.click(inscrever());

        expect(screen.getByText(/não parece um e-mail/i)).toBeInTheDocument();
        expect(fetch).not.toHaveBeenCalled();
        /* Erro de digitação não pode travar o campo. */
        expect(campo()).not.toBeDisabled();
    });

    it("envia o contrato combinado e trava o campo no sucesso", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            status: 200,
        } as Response);
        const user = userEvent.setup();
        await renderForm();

        await user.type(campo(), "  alguem@exemplo.com  ");
        await user.click(inscrever());

        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        const [url, init] = vi.mocked(fetch).mock.calls[0];
        expect(url).toBe(ENDPOINT);
        expect(JSON.parse(String((init as RequestInit).body))).toEqual({
            /* O endereço vai sem os espaços que a pessoa digitou. */
            email: "alguem@exemplo.com",
            lang: "pt",
            source: "footer",
        });

        await waitFor(() =>
            expect(
                screen.getByText(/confirme a inscrição/i),
            ).toBeInTheDocument(),
        );
        expect(campo()).toBeDisabled();
    });

    /* 409 não é falha: é quem já está na lista. Tratar como erro faria a
       pessoa tentar de novo à toa — e travar o campo a impediria de usar
       outro endereço, que é o que a mensagem sugere. */
    it("trata 409 como já inscrito e deixa tentar outro endereço", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 409,
        } as Response);
        const user = userEvent.setup();
        await renderForm();

        await user.type(campo(), "alguem@exemplo.com");
        await user.click(inscrever());

        await waitFor(() =>
            expect(screen.getByText(/já está inscrito/i)).toBeInTheDocument(),
        );
        expect(campo()).not.toBeDisabled();
    });

    it("falha do servidor e queda de rede caem na mesma mensagem", async () => {
        const user = userEvent.setup();

        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 500,
        } as Response);
        const { unmount } = await renderForm();
        await user.type(campo(), "alguem@exemplo.com");
        await user.click(inscrever());
        await waitFor(() =>
            expect(screen.getByText(/tente de novo/i)).toBeInTheDocument(),
        );
        unmount();

        vi.mocked(fetch).mockRejectedValue(new Error("offline"));
        await renderForm();
        await user.type(campo(), "alguem@exemplo.com");
        await user.click(inscrever());
        await waitFor(() =>
            expect(screen.getByText(/tente de novo/i)).toBeInTheDocument(),
        );
    });

    /* Um leitor de tela não vê a cor mudar: a região tem de existir na
       árvore ANTES de ter texto, senão pode não anunciar quando aparece. */
    it("mantém a região viva na árvore mesmo vazia", async () => {
        await renderForm();
        const regiao = screen.getByRole("status");
        expect(regiao).toBeInTheDocument();
        expect(regiao).toHaveAttribute("aria-live", "polite");
        expect(regiao).toBeEmptyDOMElement();
    });

    it("preenchimento do honeypot não chama a rede", async () => {
        const user = userEvent.setup();
        const { container } = await renderForm();

        const isca = container.querySelector<HTMLInputElement>(
            'input[name="_gotcha"]',
        );
        expect(isca).not.toBeNull();
        /* `type` do userEvent ignora campo fora de alcance; aqui o ponto é
           simular o bot, que preenche por script. */
        await user.type(campo(), "alguem@exemplo.com");
        isca!.value = "sou um bot";
        await user.click(inscrever());

        await waitFor(() =>
            expect(
                screen.getByText(/confirme a inscrição/i),
            ).toBeInTheDocument(),
        );
        expect(fetch).not.toHaveBeenCalled();
    });

    it("manda o idioma escolhido para o backend", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            status: 200,
        } as Response);
        const user = userEvent.setup();
        await renderForm(ENDPOINT, "en");

        await user.type(
            screen.getByLabelText(/updates by email/i),
            "someone@example.com",
        );
        await user.click(screen.getByRole("button", { name: /subscribe/i }));

        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        const [, init] = vi.mocked(fetch).mock.calls[0];
        expect(JSON.parse(String((init as RequestInit).body)).lang).toBe("en");
    });
});
