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
