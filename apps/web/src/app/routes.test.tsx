import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
/* A árvore inteira, como o App a monta — mesmo motivo citado em
   pages/Links/Links.test.tsx: dois providers à mão quebram quando um
   terceiro entra. */
import { Providers } from "@/app/providers";
import { Routes } from "./routes";
import { ROUTES } from "@/shared/config/routes";

/* ─────────────────────────────────────────────────────────
   A guarda que faltava
   ─────────────────────────────────────────────────────────
   `ROUTES` declara o endereço, `app/routes.tsx` decide o que montar e o
   `vercel.json` ensina a hospedagem a servir o documento. São três
   lugares, e manter os três em acordo era responsabilidade de ninguém.

   Foi assim que a /contato se perdeu: a consolidação do portfólio tirou
   o caso do roteador e a reescrita, e deixou de pé a constante em
   ROUTES, o link visível no rodapé, os metadados em api/crawler.ts e a
   página em pages/Contact. O endereço respondia a 404 e nenhum portão
   reprovava — os testes de unidade não navegavam e as auditorias de
   navegador não visitavam a rota.

   Este arquivo fecha a classe do defeito, não só o caso dela: qualquer
   rota futura acrescentada a ROUTES sem destino no roteador reprova
   aqui, antes de chegar ao navegador.
───────────────────────────────────────────────────────── */

/** O h1 da 404 é "Página não encontrada — 404". A correspondência é por
 *  regex de propósito: a versão exata, sem o sufixo, NUNCA casava, e com
 *  isso as asserções positivas passavam por vacuidade — foi o controle
 *  negativo abaixo que denunciou. */
const TITULO_404 = /^Página não encontrada/;

/** Espera a rota montar de fato — a 404 também tem <main>, então esperar
 *  por ele não antecipa o veredito, só evita medir a tela vazia. */
const montou = () =>
    waitFor(() =>
        expect(
            document.querySelector("main, [role='dialog'], .links-page"),
        ).toBeTruthy(),
    );

const montar = (caminho: string) => {
    window.history.replaceState({}, "", caminho);
    return render(
        <Providers>
            <Routes />
        </Providers>,
    );
};

describe("Routes — toda rota declarada tem destino", () => {
    beforeEach(() => localStorage.setItem("portfolio-lang", "pt"));

    it.each(Object.entries(ROUTES))(
        "ROUTES.%s (%s) não cai na 404",
        async (_nome, caminho) => {
            montar(caminho);
            await montou();
            expect(
                screen.queryByRole("heading", {
                    level: 1,
                    name: TITULO_404,
                }),
            ).toBeNull();
        },
    );

    it("um caminho que ninguém declarou cai na 404", async () => {
        montar("/endereco/que-ninguem-declarou");
        await waitFor(() =>
            expect(
                screen.getByRole("heading", { level: 1, name: TITULO_404 }),
            ).toBeInTheDocument(),
        );
    });
});
