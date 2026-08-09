import { describe, it, expect } from "vitest";
import { buildMailtoHref } from "./mailto";
import { PROFILE } from "@/shared/config/profile";

describe("buildMailtoHref", () => {
    it("gera mailto para o e-mail do perfil", () => {
        expect(buildMailtoHref("pt")).toContain(`mailto:${PROFILE.email}`);
    });

    it("adapta assunto ao idioma", () => {
        expect(decodeURIComponent(buildMailtoHref("pt"))).toContain(
            "Contato via Portfólio",
        );
        expect(decodeURIComponent(buildMailtoHref("en"))).toContain(
            "Contact via Portfolio",
        );
    });

    it("inclui subject e body como query params", () => {
        const href = buildMailtoHref("pt");
        expect(href).toMatch(/\?subject=.+&body=.+/);
    });
});
