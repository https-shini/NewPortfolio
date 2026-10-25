import { describe, expect, it } from "vitest";
import {
    isOwnLinkedInProfile,
    linkedInNoticePath,
    linkedInDestination,
} from "./linkedin";
import { PROFILE } from "./profile";

describe("proteção do perfil do LinkedIn", () => {
    it("inclui o perfil, www e suas páginas de certificados", () => {
        expect(isOwnLinkedInProfile(PROFILE.social.linkedin.url)).toBe(true);
        expect(isOwnLinkedInProfile(`${PROFILE.social.linkedin.url}/`)).toBe(
            true,
        );
        expect(
            isOwnLinkedInProfile(
                "https://www.linkedin.com/in/oguilherme-cruz/details/certifications/",
            ),
        ).toBe(true);
    });

    it("não intercepta terceiros, empresas e destinos parecidos", () => {
        for (const href of [
            "https://linkedin.com/in/outra-pessoa",
            "https://linkedin.com/company/exemplo",
            "https://linkedin.com/in/oguilherme-cruz-falso",
            "https://linkedin.com.evil.test/in/oguilherme-cruz",
            "https://evil.test/?to=https://linkedin.com/in/oguilherme-cruz",
            "javascript:alert(1)",
            "/links",
        ]) {
            expect(isOwnLinkedInProfile(href)).toBe(false);
        }
    });

    it("preserva destino, parâmetros e idioma no link de aviso", () => {
        const destination = `${PROFILE.social.linkedin.url}/details/certifications/?ref=portfolio`;
        const url = new URL(
            linkedInNoticePath(destination, "en"),
            "https://portfolio.test",
        );
        expect(url.pathname).toBe("/linkedin");
        expect(url.searchParams.get("lang")).toBe("en");
        expect(linkedInDestination(url.search)).toBe(destination);
    });

    it("rejeita destinos injetados na URL pública", () => {
        for (const destination of [
            "https://evil.test",
            "javascript:alert(1)",
            "https://user:pass@linkedin.com/in/oguilherme-cruz",
            "https://linkedin.com:8443/in/oguilherme-cruz",
            "https://linkedin.com/in/outra-pessoa",
        ]) {
            expect(
                linkedInDestination(`?to=${encodeURIComponent(destination)}`),
            ).toBe(PROFILE.social.linkedin.url);
        }
    });
});
