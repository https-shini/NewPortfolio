import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderRich, renderRichParagraphs } from "./richText";

describe("renderRich", () => {
    it("converte **texto** em <strong>", () => {
        render(<p>{renderRich("Olá **mundo** cruel")}</p>);
        const strong = screen.getByText("mundo");
        expect(strong.tagName).toBe("STRONG");
    });

    it("renderiza texto sem ênfase inalterado", () => {
        render(<p data-testid="plain">{renderRich("sem destaque")}</p>);
        expect(screen.getByTestId("plain")).toHaveTextContent("sem destaque");
    });

    it("converte `texto` em <code>", () => {
        render(<p>{renderRich("use o `min-width` aqui")}</p>);
        expect(screen.getByText("min-width").tagName).toBe("CODE");
    });

    it("aceita código dentro de negrito", () => {
        render(<p data-testid="w">{renderRich("**veja o `gap` agora**")}</p>);
        const strong = screen.getByTestId("w").querySelector("strong");
        expect(strong).toHaveTextContent("veja o gap agora");
        expect(strong?.querySelector("code")).toHaveTextContent("gap");
    });

    it("não interpreta ênfase dentro de crases", () => {
        render(<p data-testid="w">{renderRich("literal: `**dois**`")}</p>);
        const code = screen.getByTestId("w").querySelector("code");
        expect(code).toHaveTextContent("**dois**");
        expect(screen.getByTestId("w").querySelector("strong")).toBeNull();
    });

    it("trata delimitador sem par como texto comum", () => {
        render(<p data-testid="w">{renderRich("2 * 3 ** 4 e uma ` solta")}</p>);
        const w = screen.getByTestId("w");
        expect(w).toHaveTextContent("2 * 3 ** 4 e uma ` solta");
        expect(w.querySelector("strong")).toBeNull();
        expect(w.querySelector("code")).toBeNull();
    });
});

describe("renderRichParagraphs", () => {
    it("divide por linhas em branco e aplica a classe", () => {
        render(
            <div data-testid="wrap">
                {renderRichParagraphs("Primeiro\n\nSegundo **forte**", "para")}
            </div>,
        );
        const wrap = screen.getByTestId("wrap");
        const paragraphs = wrap.querySelectorAll("p.para");
        expect(paragraphs).toHaveLength(2);
        expect(paragraphs[1]?.querySelector("strong")).toHaveTextContent(
            "forte",
        );
    });
});
