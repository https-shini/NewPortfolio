import { describe, it, expect } from "vitest";
import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangProvider } from "@/app/LangContext";
import { Featured } from "./Featured";
import { FEATURED_PROJECT } from "./Featured.data";
import { LANG_KEY } from "@/shared/config/constants";

/**
 * Janela com uma aba única do projeto e um carrossel MANUAL das
 * capturas: setas circulares, ←/→ com o carrossel em foco, gesto
 * horizontal no toque e legenda anunciada (aria-live).
 */
const SLIDES = FEATURED_PROJECT.slides;
const N = SLIDES.length;

const montar = (lang: "pt" | "en" = "pt") => {
    localStorage.setItem(LANG_KEY, lang);
    return render(
        <LangProvider>
            <Featured />
        </LangProvider>,
    );
};

const carrossel = () =>
    screen.getByRole("region", { name: "Capturas do projeto" });
const contador = (i: number) => `0${i} / 0${N}`;

describe("Featured — aba única e carrossel", () => {
    it("aba única do projeto e navegação circular pelas setas", async () => {
        const user = userEvent.setup();
        montar();
        expect(screen.queryAllByRole("tab")).toHaveLength(0);
        expect(screen.getByText("Codex Code Validator")).toBeInTheDocument();
        expect(carrossel()).toHaveAttribute(
            "aria-roledescription",
            "carrossel",
        );
        expect(screen.getByText(contador(1))).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: "Slide anterior" }),
        );
        expect(screen.getByText(contador(N))).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Próximo slide" }));
        expect(screen.getByText(contador(1))).toBeInTheDocument();
        expect(
            screen.getByRole("img", { name: new RegExp(SLIDES[0]!.label.pt) }),
        ).toBeInTheDocument();
    });

    it("legenda vinculada à captura e anunciada com aria-live", async () => {
        const user = userEvent.setup();
        montar();
        await user.click(screen.getByRole("button", { name: "Próximo slide" }));
        const legenda = screen.getByText(contador(2)).parentElement!;
        expect(legenda).toHaveAttribute("aria-live", "polite");
        expect(
            within(legenda).getByText(SLIDES[1]!.label.pt),
        ).toBeInTheDocument();
    });

    it("←/→ com o carrossel em foco e gesto horizontal no toque", async () => {
        const user = userEvent.setup();
        montar();
        carrossel().focus();
        await user.keyboard("{ArrowRight}");
        expect(screen.getByText(contador(2))).toBeInTheDocument();
        await user.keyboard("{ArrowLeft}{ArrowLeft}");
        expect(screen.getByText(contador(N))).toBeInTheDocument();

        const foto = screen.getByRole("button", { name: /^Ampliar:/ });
        fireEvent.touchStart(foto, {
            touches: [{ clientX: 300, clientY: 100 }],
        });
        fireEvent.touchEnd(foto, {
            changedTouches: [{ clientX: 100, clientY: 110 }],
        });
        expect(screen.getByText(contador(1))).toBeInTheDocument();
    });

    it("não troca sozinho (sem autoplay)", async () => {
        montar();
        await new Promise((r) => setTimeout(r, 50));
        expect(screen.getByText(contador(1))).toBeInTheDocument();
    });
});

describe("Featured — ações e conteúdo", () => {
    it("Acessar Projeto abre a aplicação em nova aba; documentação é interna", () => {
        montar();
        const acessar = screen.getByRole("link", { name: /Acessar Projeto/ });
        expect(acessar).toHaveAttribute("href", FEATURED_PROJECT.liveUrl);
        expect(acessar).toHaveAttribute("target", "_blank");
        expect(acessar).toHaveAttribute("rel", "noopener noreferrer");
        expect(acessar.className).toContain("btn--primary");

        const docs = screen.getByRole("link", {
            name: "Documentação do Projeto",
        });
        expect(docs).toHaveAttribute("href", FEATURED_PROJECT.detailsUrl);
        expect(docs).not.toHaveAttribute("target");
        expect(docs.className).toContain("btn--outline");
    });

    it("resumo integrado: TCC, pontuação 0–1000 e linguagens", () => {
        montar();
        expect(
            screen.getByText("TCC em Engenharia de Software"),
        ).toBeInTheDocument();
        expect(screen.getByText("0–1000")).toBeInTheDocument();
        expect(
            screen.getByText(
                (_, el) =>
                    el?.textContent ===
                    "Linguagens: Python, JavaScript/TypeScript e Go",
            ),
        ).toBeInTheDocument();
    });

    it("cartões de recurso com introdução e lista vindas dos dados", () => {
        montar();
        expect(
            screen.getByRole("heading", {
                name: "Cada resultado, uma visão mais clara do projeto.",
            }),
        ).toBeInTheDocument();
        const recursos = screen.getByRole("list", {
            name: "Principais recursos",
        });
        for (const item of FEATURED_PROJECT.architecture) {
            expect(
                within(recursos).getByRole("heading", { name: item.title.pt }),
            ).toBeInTheDocument();
            expect(
                within(recursos).getByText(item.summary.pt),
            ).toBeInTheDocument();
            for (const d of item.details)
                expect(within(recursos).getByText(d.pt)).toBeInTheDocument();
        }
    });

    it("em inglês, textos e link da documentação mudam de idioma", () => {
        montar("en");
        expect(
            screen.getByRole("link", { name: "Project documentation" }),
        ).toHaveAttribute("href", `${FEATURED_PROJECT.detailsUrl}?lang=en`);
        expect(
            screen.getByText("Software engineering capstone"),
        ).toBeInTheDocument();
    });
});

describe("Featured — o lightbox", () => {
    it("abre pela captura atual", async () => {
        const user = userEvent.setup();
        montar();
        await user.click(
            screen.getByRole("button", {
                name: `Ampliar: ${SLIDES[0]!.label.pt}`,
            }),
        );
        await waitFor(() =>
            expect(screen.getByRole("dialog")).toBeInTheDocument(),
        );
    });
});
