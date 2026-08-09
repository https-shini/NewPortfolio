import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { LangProvider } from "@/app/LangContext";
import { SyncBadge } from "./SyncBadge";
import type { ReleaseStatus } from "@/shared/hooks/useReleaseNotes";

const setup = (status: ReleaseStatus, count: number) => {
    localStorage.setItem("portfolio-lang", "pt");
    return render(
        <LangProvider>
            <SyncBadge status={status} count={count} />
        </LangProvider>,
    );
};

describe("SyncBadge", () => {
    it("enquanto busca, anuncia a sincronização em andamento", () => {
        setup("loading", 0);
        expect(screen.getByRole("status")).toHaveTextContent("Sincronizando");
    });

    it("com releases vindas do GitHub, diz que está sincronizado", () => {
        setup("ok", 3);
        expect(screen.getByText("Sincronizado")).toBeInTheDocument();
    });

    it("em erro, informa que só a camada local está na tela", () => {
        setup("error", 0);
        expect(screen.getByRole("status")).toHaveTextContent(
            "Exibindo o histórico local",
        );
    });

    it("sem releases publicadas, não alega sincronia", () => {
        /* A chamada deu certo, mas o repositório ainda não tem release
           nenhuma. Na tela há apenas a camada local — dizer "sincronizado"
           aqui seria falso, ainda que o status seja ok. */
        setup("ok", 0);

        expect(screen.queryByText("Sincronizado")).not.toBeInTheDocument();
        expect(screen.getByRole("status")).toHaveTextContent(
            "Exibindo o histórico local",
        );
    });
});
