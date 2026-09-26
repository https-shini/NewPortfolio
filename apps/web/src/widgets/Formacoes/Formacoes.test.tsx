import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangProvider } from "@/app/LangContext";
import { Formacoes } from "./Formacoes";
import {
    educationItems,
    certificationItems,
} from "@/widgets/Timeline/Timeline.data";
import { LANG_KEY } from "@/shared/config/constants";
import { TRANSLATIONS } from "@/shared/lib/translations";

/** O mesmo texto que o componente usa, lido da fonte e não copiado. */
const t = (chave: "education.cert.link") => TRANSLATIONS.pt[chave];

/**
 * Este arquivo cobre o que SÓ O WIDGET decide, e nada além.
 *
 * A ordenação das listas e a presença do link de credencial em todo
 * certificado já têm teste em `Timeline.data.test.ts`, no nível dos dados.
 * Repetir aqui seria duplicar a mesma garantia em dois lugares que envelhecem
 * em ritmos diferentes — o defeito que a §1 do `docs/guides/github-project.md`
 * descreve.
 *
 * As contagens vêm dos dados, não de números fixos: se um certificado novo
 * entrar, o teste acompanha em vez de reprovar.
 */
const montar = () => {
    localStorage.setItem(LANG_KEY, "pt");
    return render(
        <LangProvider>
            <Formacoes />
        </LangProvider>,
    );
};

/* Sem seletor de região: a seção externa e a grade interna têm as duas o
   nome acessível "Formações", e `getByRole` acusa ambiguidade. Os `article`
   só existem dentro da grade, então contá-los no documento é inequívoco — e
   não amarra o teste à estrutura de contêineres. */
const cards = () => screen.queryAllByRole("article");
const aba = (nome: RegExp) => screen.getByRole("tab", { name: nome });

const LIMITE = 4;
const TOTAL = educationItems.length + certificationItems.length;

describe("Formacoes", () => {
    /* Não é `all`, e está escrito no código como decisão: "prioriza a
       formação acadêmica ao carregar a seção". */
    it("abre no filtro acadêmico, não em Tudo", () => {
        montar();
        expect(aba(/acadêmico/i)).toHaveAttribute("aria-selected", "true");
        expect(aba(/tudo/i)).toHaveAttribute("aria-selected", "false");
        expect(cards()).toHaveLength(educationItems.length);
    });

    it("o filtro de certificações mostra só certificações", async () => {
        const user = userEvent.setup();
        montar();

        await user.click(aba(/certifica/i));

        expect(aba(/certifica/i)).toHaveAttribute("aria-selected", "true");
        expect(cards()).toHaveLength(certificationItems.length);
    });

    /* O limite existe só em Tudo. É a parte não óbvia: hoje há 7
       certificações, mais que o limite de 4, e mesmo assim o filtro de
       certificações mostra as sete. */
    it("o limite de 4 não se aplica aos filtros específicos", async () => {
        const user = userEvent.setup();
        montar();

        expect(certificationItems.length).toBeGreaterThan(LIMITE);
        await user.click(aba(/certifica/i));

        expect(cards()).toHaveLength(certificationItems.length);
        expect(
            screen.queryByRole("button", { name: /ver mais|mostrar/i }),
        ).not.toBeInTheDocument();
    });

    it("em Tudo mostra 4 e oferece expandir", async () => {
        const user = userEvent.setup();
        montar();

        await user.click(aba(/tudo/i));

        expect(TOTAL).toBeGreaterThan(LIMITE);
        expect(cards()).toHaveLength(LIMITE);

        const expandir = screen.getByRole("button", { expanded: false });
        expect(expandir).toBeInTheDocument();
    });

    it("expandir mostra tudo, e recolher volta a 4", async () => {
        const user = userEvent.setup();
        montar();
        await user.click(aba(/tudo/i));

        await user.click(screen.getByRole("button", { expanded: false }));
        expect(cards()).toHaveLength(TOTAL);

        await user.click(screen.getByRole("button", { expanded: true }));
        expect(cards()).toHaveLength(LIMITE);
    });

    /* O `setShowAll(false)` do handleFilter. Sem ele, voltar para Tudo depois
       de ter expandido e trocado de filtro mostraria a lista inteira sem que
       ninguém tivesse pedido — e o botão diria "ver mais" sobre uma lista que
       já está toda à vista. */
    it("trocar de filtro depois de expandir recolhe a lista", async () => {
        const user = userEvent.setup();
        montar();

        await user.click(aba(/tudo/i));
        await user.click(screen.getByRole("button", { expanded: false }));
        expect(cards()).toHaveLength(TOTAL);

        await user.click(aba(/acadêmico/i));
        await user.click(aba(/tudo/i));

        expect(cards()).toHaveLength(LIMITE);
        expect(
            screen.getByRole("button", { expanded: false }),
        ).toBeInTheDocument();
    });

    /* O dado já garante que todo certificado TEM certUrl; o que se confere
       aqui é que o card o renderiza como link, e com rel seguro. */
    it("os cards de certificação linkam a credencial com rel seguro", async () => {
        const user = userEvent.setup();
        montar();
        await user.click(aba(/certifica/i));

        /* O rótulo vem de `education.cert.link`, que é "Ver certificado" em
           pt — não "credencial", como eu tinha suposto. Filtrar pela chave de
           tradução em vez de por palavra inventada. */
        const rotulo = new RegExp(t("education.cert.link"), "i");
        const credenciais = screen
            .getAllByRole("link")
            .filter((a) => rotulo.test(a.getAttribute("aria-label") ?? ""));

        expect(credenciais).toHaveLength(certificationItems.length);
        credenciais.forEach((a) => {
            expect(a).toHaveAttribute("target", "_blank");
            const rel = a.getAttribute("rel") ?? "";
            expect(rel).toContain("noopener");
            expect(rel).toContain("noreferrer");
        });
    });
});
