import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Providers } from "@/app/providers";
import { useLang } from "@/shared/hooks/useLang";
import { useTheme } from "@/shared/hooks/useTheme";
import { useRoute } from "@/shared/hooks/useRoute";
import { ROUTES } from "@/shared/config/routes";
import { QuotePage } from "./index";

import { verifiedEndpoint, businessWhatsApp } from "./contact";
import { COPY } from "@/shared/config/servicesContent";

const config = vi.hoisted(() => ({
    QUOTE_ENDPOINT: "",
    BUSINESS_CONTACT: "mailto:contato@gcruz.dev.br",
}));
vi.mock("./contact", async (importOriginal) => ({
    ...(await importOriginal<{
        verifiedEndpoint: (value: string) => string;
        businessWhatsApp: (value: string) => string;
    }>()),
    get QUOTE_ENDPOINT() {
        return config.QUOTE_ENDPOINT;
    },
    get BUSINESS_CONTACT() {
        return config.BUSINESS_CONTACT;
    },
}));
vi.mock("@/widgets/Header/Header", () => ({
    Header: () => {
        const { toggleLang } = useLang();
        const { toggleTheme } = useTheme();
        const { navigate, path } = useRoute();
        return (
            <header>
                <button onClick={toggleLang}>Language</button>
                <button onClick={toggleTheme}>Theme</button>
                <button onClick={() => navigate(ROUTES.SERVICES)}>
                    Services
                </button>
                <span>{path}</span>
            </header>
        );
    },
}));
vi.mock("@/widgets/Footer/Footer", () => ({ Footer: () => <footer /> }));
const page = () =>
    render(
        <Providers>
            <QuotePage />
        </Providers>,
    );
async function fill(consent = true) {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Nome"), "Cliente Exemplo");
    await user.type(screen.getByLabelText("E-mail"), "cliente@example.com");
    await user.selectOptions(
        screen.getByLabelText(COPY.pt.mainService, {
            selector: "#quote-service",
        }),
        "professional",
    );
    await user.type(
        screen.getByLabelText(COPY.pt.fields.message),
        "Um site para apresentar meu negócio.",
    );
    if (consent) await user.click(screen.getByLabelText(COPY.pt.consent));
    return user;
}
beforeEach(() => {
    window.history.replaceState({}, "", "/orcamento");
    config.QUOTE_ENDPOINT = "";
    config.BUSINESS_CONTACT = "mailto:contato@gcruz.dev.br";
    localStorage.setItem("portfolio-lang", "pt");
    localStorage.setItem("portfolio-theme", "dark");
});
afterEach(() => vi.unstubAllGlobals());
describe("Orçamento e contato", () => {
    it("abre a seleção compartilhável e não aceita adicionais avulsos vazios", async () => {
        window.history.replaceState({}, "", "/orcamento?addon=maintenance");
        page();
        expect(
            screen.getByLabelText(COPY.pt.mainService, {
                selector: "#estimate-service",
            }),
        ).toHaveValue("addons-only");
        const user = userEvent.setup();
        await user.click(screen.getByLabelText(/Manutenção web programada/));
        await user.click(screen.getByRole("button", { name: COPY.pt.prepare }));
        expect(
            screen.getByLabelText(COPY.pt.mainService, {
                selector: "#quote-service",
            }),
        ).toHaveAttribute("aria-invalid", "true");
    });
    it("valida dados obrigatórios e aceite de privacidade", async () => {
        page();
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: COPY.pt.prepare }));
        expect(screen.getAllByText(COPY.pt.required)).toHaveLength(4);
        expect(screen.getByText(COPY.pt.consentError)).toBeInTheDocument();
        expect(screen.getByLabelText("Nome")).toHaveFocus();
        await user.type(screen.getByLabelText("E-mail"), "invalido");
        await user.type(screen.getByLabelText(COPY.pt.fields.message), "curto");
        await user.click(screen.getByRole("button", { name: COPY.pt.prepare }));
        expect(screen.getByText(COPY.pt.invalidEmail)).toBeInTheDocument();
        expect(screen.getByText(COPY.pt.shortMessage)).toBeInTheDocument();
    });
    it("fallback prepara resumo completo sem envio fictício", async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        page();
        const user = await fill();
        await user.click(screen.getByRole("button", { name: COPY.pt.prepare }));
        const href = screen
            .getByRole("link", { name: COPY.pt.openEmail })
            .getAttribute("href")!;
        expect(decodeURIComponent(href)).toContain("Profissional");
        expect(decodeURIComponent(href)).toContain("1.500");
        expect(screen.getByText(COPY.pt.ready)).toBeInTheDocument();
        expect(fetchMock).not.toHaveBeenCalled();
        expect(screen.queryByText(COPY.pt.success)).not.toBeInTheDocument();
        await user.selectOptions(
            screen.getByLabelText(COPY.pt.mainService, {
                selector: "#estimate-service",
            }),
            "express",
        );
        expect(
            screen.queryByRole("link", { name: COPY.pt.openEmail }),
        ).not.toBeInTheDocument();
    });
    it.each(["referral", "partner"] as const)(
        "prepara contato %s sem exigir plano",
        async (interest) => {
            page();
            const user = userEvent.setup();
            await user.selectOptions(
                screen.getByLabelText(COPY.pt.interest),
                interest,
            );
            await user.type(screen.getByLabelText("Nome"), "Contato");
            await user.type(
                screen.getByLabelText("E-mail"),
                "contato@example.com",
            );
            await user.type(
                screen.getByLabelText(
                    interest === "referral"
                        ? COPY.pt.referralMessage
                        : COPY.pt.partnerMessage,
                ),
                "Gostaria de apresentar minha proposta.",
            );
            await user.click(screen.getByLabelText(COPY.pt.consent));
            await user.click(
                screen.getByRole("button", { name: COPY.pt.prepare }),
            );
            expect(
                decodeURIComponent(
                    screen
                        .getByRole("link", { name: COPY.pt.openEmail })
                        .getAttribute("href")!,
                ),
            ).toContain(COPY.pt.interests[interest]);
        },
    );
    it("confirma apenas recebimento HTTP após aguardar provedor", async () => {
        config.QUOTE_ENDPOINT = "https://formspree.io/f/testid";
        let resolve!: (r: Response) => void;
        const fetchMock = vi.fn(
            (_url: string, _options: RequestInit) =>
                new Promise<Response>((r) => {
                    resolve = r;
                }),
        );
        vi.stubGlobal("fetch", fetchMock);
        page();
        const user = await fill();
        await user.click(screen.getByRole("button", { name: COPY.pt.submit }));
        expect(
            screen.getByRole("button", { name: COPY.pt.sending }),
        ).toBeDisabled();
        expect(
            JSON.parse(fetchMock.mock.calls[0][1].body as string).message,
        ).toContain("Profissional");
        resolve({ ok: true } as Response);
        await waitFor(() =>
            expect(screen.getByText(COPY.pt.success)).toBeInTheDocument(),
        );
    });
    it.each(["http", "network"])("erro %s preserva dados", async (kind) => {
        config.QUOTE_ENDPOINT = "https://formspree.io/f/testid";
        vi.stubGlobal(
            "fetch",
            kind === "http"
                ? vi.fn().mockResolvedValue({ ok: false })
                : vi.fn().mockRejectedValue(new Error("offline")),
        );
        page();
        const user = await fill();
        await user.click(screen.getByRole("button", { name: COPY.pt.submit }));
        await waitFor(() =>
            expect(
                screen.getByText(COPY.pt.error, { exact: false }),
            ).toBeInTheDocument(),
        );
        expect(screen.getByLabelText("Nome")).toHaveValue("Cliente Exemplo");
    });
    it("honeypot bloqueia envio sem falso sucesso", async () => {
        config.QUOTE_ENDPOINT = "https://formspree.io/f/testid";
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        const { container } = page();
        const user = await fill();
        fireEvent.change(container.querySelector('[name="_gotcha"]')!, {
            target: { value: "spam" },
        });
        await user.click(screen.getByRole("button", { name: COPY.pt.submit }));
        expect(fetchMock).not.toHaveBeenCalled();
        expect(screen.queryByText(COPY.pt.success)).not.toBeInTheDocument();
    });
    it("aceita só endpoint conhecido e WhatsApp comercial E.164", () => {
        expect(verifiedEndpoint("https://formspree.io/f/abc")).toBeTruthy();
        for (const bad of [
            "",
            "https://example.com",
            "https://formspree.io.evil/f/abc",
        ])
            expect(verifiedEndpoint(bad)).toBe("");
        expect(businessWhatsApp("+5511999999999")).toBe(
            "https://wa.me/5511999999999",
        );
        expect(businessWhatsApp("11999999999")).toBe("");
    });
});

describe("Seleção e canais", () => {
    it("sem WhatsApp usa e-mail e com configuração usa o canal comercial", () => {
        const { unmount } = page();
        expect(
            screen.getAllByRole("link", { name: COPY.pt.email })[0],
        ).toHaveAttribute("href", config.BUSINESS_CONTACT);
        unmount();
        config.BUSINESS_CONTACT = "https://wa.me/5511999999999";
        page();
        expect(
            screen.getAllByRole("link", { name: COPY.pt.whatsapp })[0],
        ).toHaveAttribute("href", config.BUSINESS_CONTACT);
    });
    it("simulador separa mensalidade e preserva escolhas e dados no formulário", async () => {
        page();
        const user = userEvent.setup();
        await user.type(screen.getByLabelText("Nome"), "Nome preservado");
        await user.selectOptions(
            screen.getByLabelText(COPY.pt.mainService, {
                selector: "#estimate-service",
            }),
            "express",
        );
        await user.click(screen.getByLabelText(/Página simples adicional/));
        await user.click(screen.getByLabelText(/Manutenção web programada/));
        for (const subtotal of screen.getAllByTestId("estimate-subtotal"))
            expect(subtotal).toHaveTextContent("1.340");
        expect(screen.getAllByTestId("estimate-monthly")[0]).toHaveTextContent(
            "149",
        );
        await user.click(screen.getByRole("link", { name: COPY.pt.proposal }));
        expect(screen.getByLabelText("Nome")).toHaveValue("Nome preservado");
        expect(
            screen.getByLabelText(COPY.pt.mainService, {
                selector: "#quote-service",
            }),
        ).toHaveValue("express");
    });
    it("trocar principal limpa adicionais e bloqueia recursos incluídos", async () => {
        page();
        const user = userEvent.setup();
        const select = screen.getByLabelText(COPY.pt.mainService, {
            selector: "#estimate-service",
        });
        await user.selectOptions(select, "express");
        await user.click(screen.getByLabelText(/Página simples adicional/));
        await user.selectOptions(select, "premium");
        expect(
            screen.queryByRole("checkbox", {
                name: /Página simples adicional/,
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("checkbox", { name: /Formulário avançado/ }),
        ).not.toBeInTheDocument();
        expect(screen.getAllByTestId("estimate-subtotal")[0]).toHaveTextContent(
            "2.200",
        );
    });
    it("simula horas e solução sob orçamento", async () => {
        page();
        const user = userEvent.setup();
        const select = screen.getByLabelText(COPY.pt.mainService, {
            selector: "#estimate-service",
        });
        await user.selectOptions(select, "support");
        fireEvent.change(screen.getByLabelText(COPY.pt.hours), {
            target: { value: "3" },
        });
        expect(screen.getAllByTestId("estimate-subtotal")[0]).toHaveTextContent(
            "360",
        );
        await user.selectOptions(select, "custom-web");
        expect(screen.getAllByTestId("estimate-subtotal")[0]).toHaveTextContent(
            COPY.pt.onQuote,
        );
    });
});
