import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { LangProvider } from "@/app/LangContext";
import { AtualizacaoDesktop } from "./AtualizacaoDesktop";
import type { EstadoAtualizacao } from "@/shared/lib/desktop";

/* ─────────────────────────────────────────────────────────
   AtualizacaoDesktop
   ─────────────────────────────────────────────────────────
   O cartão só existe dentro do aplicativo, e cada situação oferece UMA
   ação — a que faz sentido nela. Oferecer "baixar" com o download já
   pronto, ou "instalar" antes de baixar, é o tipo de erro que só aparece
   com o app instalado e uma release nova publicada.
───────────────────────────────────────────────────────── */

const instalar = vi.fn();
const baixar = vi.fn();
const verificar = vi.fn();

function montar(estado: EstadoAtualizacao | null) {
    if (estado) {
        window.portfolioDesktop = {
            versao: estado.versao ?? "2.3.0",
            plataforma: "linux",
            atualizacao: {
                ler: async () => estado,
                verificar: async () => estado,
                baixar: async () => estado,
                instalar,
                ouvir: () => () => {},
            } as never,
        };
    }
    localStorage.setItem("portfolio-lang", "pt");
    return render(
        <LangProvider>
            <AtualizacaoDesktop />
        </LangProvider>,
    );
}

afterEach(() => {
    delete window.portfolioDesktop;
    vi.clearAllMocks();
    baixar.mockClear();
    verificar.mockClear();
});

describe("AtualizacaoDesktop", () => {
    it("não renderiza nada no navegador", () => {
        const { container } = montar(null);
        /* Nem um "instale o app para ver isto": seria propaganda no
           lugar de informação. */
        expect(container.querySelector(".dl-update")).toBeNull();
    });

    it("com versão nova, oferece baixar", async () => {
        montar({ situacao: "disponivel", versao: "2.3.0", nova: "2.4.0" });
        await waitFor(() =>
            expect(
                screen.getByRole("heading", { level: 2 }),
            ).toBeInTheDocument(),
        );
        expect(
            screen.getByRole("button", { name: /baixar atualização/i }),
        ).toBeInTheDocument();
        /* A versão nova aparece no texto, concatenada — `t()` não interpola. */
        expect(screen.getByText(/2\.4\.0/)).toBeInTheDocument();
    });

    it("com o download pronto, oferece reiniciar — e não baixar de novo", async () => {
        montar({ situacao: "pronta", versao: "2.3.0", nova: "2.4.0" });
        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: /reiniciar e instalar/i }),
            ).toBeInTheDocument(),
        );
        expect(
            screen.queryByRole("button", { name: /baixar atualização/i }),
        ).toBeNull();
    });

    it("na versão mais recente, só resta verificar de novo", async () => {
        montar({ situacao: "atual", versao: "2.3.0" });
        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: /verificar agora/i }),
            ).toBeInTheDocument(),
        );
        expect(screen.getByText(/versão mais recente/i)).toBeInTheDocument();
    });

    it("enquanto baixa, o botão de verificar fica desabilitado", async () => {
        /* Disparar outra verificação no meio do download não cancela nem
           acelera nada; só confunde. */
        montar({ situacao: "baixando", versao: "2.3.0", progresso: 37 });
        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: /verificar agora/i }),
            ).toBeDisabled(),
        );
        expect(screen.getByText(/37%/)).toBeInTheDocument();
    });

    it("o estado é anunciado a quem usa leitor de tela", async () => {
        /* A mensagem muda sozinha conforme o download anda. */
        montar({ situacao: "verificando", versao: "2.3.0" });
        await waitFor(() => {
            const vivo = document.querySelector('[aria-live="polite"]');
            expect(vivo).not.toBeNull();
        });
    });

    it("numa instalação que não se atualiza, explica e não oferece botão", async () => {
        /* Quem instalou pelo .deb cai aqui: o electron-updater só se
           atualiza a partir de AppImage no Linux. Um "verificar" que
           nunca sai do lugar seria pior que a ausência dele. */
        montar({ situacao: "naoSuportada", versao: "2.3.0" });
        await waitFor(() =>
            expect(
                screen.getByText(/não se atualiza sozinha/i),
            ).toBeInTheDocument(),
        );
        expect(screen.queryByRole("button")).toBeNull();
    });

    it("em erro, mostra o cartão de erro e permite tentar de novo", async () => {
        montar({ situacao: "erro", versao: "2.3.0", detalhe: "ENOTFOUND" });
        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: /verificar agora/i }),
            ).toBeEnabled(),
        );
        /* O detalhe cru do updater cita URL e arquivo temporário; nada
           disso ajuda quem está olhando a tela. */
        expect(screen.queryByText(/ENOTFOUND/)).toBeNull();
    });
});
