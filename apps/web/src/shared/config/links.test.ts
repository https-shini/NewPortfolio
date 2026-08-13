import { describe, it, expect } from "vitest";
import {
    TREE_LINKS,
    PRIMARY_LINKS,
    SOCIAL_LINKS,
    PROJECT_URLS,
    siteDomain,
    linkKind,
} from "./links";
import { PROFILE } from "./profile";
import { ROUTES } from "./routes";

describe("TREE_LINKS — integridade dos dados", () => {
    it("não tem ids repetidos", () => {
        const ids = TREE_LINKS.map((l) => l.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("não tem URL duplicada", () => {
        const hrefs = TREE_LINKS.map((l) => l.href);
        expect(new Set(hrefs).size).toBe(hrefs.length);
    });

    it("todo rótulo tem pt e en preenchidos", () => {
        TREE_LINKS.forEach((link) => {
            expect(link.label.pt.length).toBeGreaterThan(0);
            expect(link.label.en.length).toBeGreaterThan(0);
        });
    });

    it("todo item tem um componente de ícone", () => {
        TREE_LINKS.forEach((link) => {
            expect(typeof link.icon).toBe("function");
        });
    });

    it("primary e social particionam TREE_LINKS", () => {
        expect(PRIMARY_LINKS.length + SOCIAL_LINKS.length).toBe(
            TREE_LINKS.length,
        );
    });

    it("todo link primário tem sublabel", () => {
        PRIMARY_LINKS.forEach((link) => {
            expect(link.sublabel).toBeTruthy();
        });
    });

    it("external está coerente com o tipo do href", () => {
        TREE_LINKS.forEach((link) => {
            const isHttp = /^https?:\/\//.test(link.href);
            expect(Boolean(link.external)).toBe(isHttp);
        });
    });
});

describe("TREE_LINKS — derivação de PROFILE (sem URL reescrita à mão)", () => {
    const byId = (id: string) => TREE_LINKS.find((l) => l.id === id);

    it("GitHub e LinkedIn vêm do perfil", () => {
        expect(byId("github")?.href).toBe(PROFILE.social.github.url);
        expect(byId("linkedin")?.href).toBe(PROFILE.social.linkedin.url);
    });

    /* O portfólio era `PROFILE.siteUrl` e abria aba nova. Depois que a
       /links passou a montar o Header e o Footer do site, esse link
       mandava o visitante para uma segunda aba do domínio em que ele já
       estava. Virou rota interna; o domínio segue visível no sublabel,
       que é a única linha da página que diz onde ele está. */
    it("o portfólio é rota interna, com o domínio no sublabel", () => {
        expect(byId("portfolio")?.href).toBe(ROUTES.HOME);
        expect(byId("portfolio")?.external).toBe(false);
        expect(byId("portfolio")?.sublabel).toBe(siteDomain);
    });

    it("o contato usa o e-mail do perfil", () => {
        expect(byId("email")?.href).toBe(`mailto:${PROFILE.email}`);
        expect(byId("email")?.sublabel).toBe(PROFILE.email);
    });

    it("os handles exibidos são os do perfil", () => {
        expect(byId("github")?.sublabel).toBe(PROFILE.social.github.handle);
        expect(byId("linkedin")?.sublabel).toBe(PROFILE.social.linkedin.handle);
    });

    it("siteDomain é o siteUrl sem protocolo", () => {
        expect(siteDomain).toBe(PROFILE.siteUrl.replace(/^https?:\/\//, ""));
        expect(siteDomain).not.toMatch(/^https?:/);
    });
});

describe("PROJECT_URLS", () => {
    it("as URLs de repositório derivam do perfil do GitHub", () => {
        Object.values(PROJECT_URLS).forEach((project) => {
            expect(project.repo.startsWith(PROFILE.social.github.url)).toBe(
                true,
            );
        });
    });

    it("as URLs live não terminam em barra (comparáveis entre consumidores)", () => {
        Object.values(PROJECT_URLS).forEach((project) => {
            expect(project.live.endsWith("/")).toBe(false);
        });
    });
});

describe("linkKind", () => {
    it("reconhece rota registrada", () => {
        expect(linkKind(ROUTES.LINKS)).toBe("route");
        expect(linkKind(ROUTES.HOME)).toBe("route");
    });

    it("trata caminho interno não registrado como arquivo estático", () => {
        expect(linkKind("/docs/Curriculo_PTBR.pdf")).toBe("file");
    });

    it("reconhece externo e mailto", () => {
        expect(linkKind("https://github.com/https-shini")).toBe("external");
        expect(linkKind("mailto:alguem@exemplo.com")).toBe("mailto");
    });
});
