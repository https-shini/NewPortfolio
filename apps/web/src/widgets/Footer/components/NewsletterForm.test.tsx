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
        /* jsdom não navega: atribuir href lança "Not implemented". O stub
           preserva os demais campos porque o LangProvider lê `search`
           para o parâmetro ?lang= — substituir o objeto inteiro derruba
           o provider antes de o formulário montar. */
        vi.stubGlobal("location", {
            ...window.location,
            /* A url real do jsdom, não uma inventada: o LangProvider faz
               `new URL(location.href)` e um `replaceState` com ?lang=, e o
               jsdom recusa replaceState para outra origem. */
            href: window.location.href,
        } as unknown as Location);
    });
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    /* A primeira versão escondia o campo inteiro sem endpoint. Protegia
       contra um formulário que não envia nada — ao preço de não haver
       inscrição nenhuma, e de a página não dizer por quê. */
    it("continua visível sem endpoint configurado", async () => {
        await renderForm("");
        expect(campo()).toBeInTheDocument();
        expect(inscrever()).toBeEnabled();
    });

    it("sem endpoint, degrada para mailto com o endereço no corpo", async () => {
        const user = userEvent.setup();
        await renderForm("");

        await user.type(campo(), "alguem@exemplo.com");
        await user.click(inscrever());

        await waitFor(() =>
            expect(screen.getByText(/app de e-mail/i)).toBeInTheDocument(),
        );
        /* Nada de fetch: não há para onde enviar, e fingir que houve envio
           seria mentir para quem preencheu. */
        expect(fetch).not.toHaveBeenCalled();

        const href = decodeURIComponent(window.location.href);
        expect(href).toMatch(/^mailto:/);
        expect(href).toContain("alguem@exemplo.com");

        /* `success` é o servidor confirmando; isto aqui é presunção. Se não
           houver cliente de e-mail registrado, o navegador não faz nada
           visível — e travar o campo deixaria sem saída a não ser recarregar
           a página. Mesmo tratamento de "já inscrito". */
        expect(campo()).not.toBeDisabled();
        expect(inscrever()).toBeEnabled();
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

    /* A região anuncia o erro UMA vez, quando ele aparece. Quem tabula de
       volta ao campo depois disso precisa ouvir de novo que ele está inválido
       e por quê — daí aria-invalid e aria-describedby, e não só a região.
       WCAG 2.1 SC 3.3.1. Nenhuma regra estática do axe liga um <p role=
       "status"> ao campo, então este portão é aqui ou em lugar nenhum. */
    it("associa o erro ao campo, e não só à região viva", async () => {
        const user = userEvent.setup();
        await renderForm();

        expect(campo()).toHaveAttribute("aria-invalid", "false");
        expect(campo()).not.toHaveAttribute("aria-describedby");

        await user.type(campo(), "joao@");
        await user.click(inscrever());

        expect(campo()).toHaveAttribute("aria-invalid", "true");
        const id = campo().getAttribute("aria-describedby");
        expect(id).toBeTruthy();
        expect(document.getElementById(id!)).toHaveTextContent(
            /não parece um e-mail/i,
        );

        /* Corrigido o campo, o estado inválido some junto com a mensagem. */
        await user.type(campo(), "exemplo.com");
        expect(campo()).toHaveAttribute("aria-invalid", "false");
        expect(campo()).not.toHaveAttribute("aria-describedby");
    });

    /* "error" é o envio que falhou do outro lado — o endereço pode estar
       perfeito. Descrever o que houve, sim; acusar o campo de inválido, não. */
    it("falha de envio descreve sem marcar o campo como inválido", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 500,
        } as Response);
        const user = userEvent.setup();
        await renderForm();

        await user.type(campo(), "alguem@exemplo.com");
        await user.click(inscrever());

        await waitFor(() =>
            expect(screen.getByText(/tente de novo/i)).toBeInTheDocument(),
        );
        expect(campo()).toHaveAttribute("aria-invalid", "false");
        const id = campo().getAttribute("aria-describedby");
        expect(id).toBeTruthy();
        expect(document.getElementById(id!)).toHaveTextContent(/tente de novo/i);
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
