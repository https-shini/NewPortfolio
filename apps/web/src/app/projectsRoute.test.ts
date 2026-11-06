import { describe, it, expect } from "vitest";
import { matchProjects } from "./projectsRoute";
import { projectPath } from "@/shared/config/routes";

describe("matchProjects", () => {
    it.each([
        ["/projetos", { kind: "index" }],
        ["/projetos/", { kind: "index" }],
        ["/projetos/AuthService", { kind: "project", name: "AuthService" }],
        ["/projetos/web-chat/", { kind: "project", name: "web-chat" }],
        ["/projetos/a.b_c-1", { kind: "project", name: "a.b_c-1" }],
    ])("%s", (path, esperado) => {
        expect(matchProjects(path)).toEqual(esperado);
    });

    it.each([
        "/",
        "/projeto",
        "/projetosx",
        "/projetos/a/b",
        "/projetos/%ZZ",
        "/projetos/nome%20com%20espaco",
        "/projetos/<script>",
        "/projects/codex/readme.html",
    ])("recusa %s", (path) => {
        expect(matchProjects(path)).toBeNull();
    });

    it("é o inverso de projectPath", () => {
        expect(matchProjects(projectPath("NewPortfolio"))).toEqual({
            kind: "project",
            name: "NewPortfolio",
        });
    });
});
