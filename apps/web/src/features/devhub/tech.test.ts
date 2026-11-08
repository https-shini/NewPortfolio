import { describe, it, expect } from "vitest";
import { lookupTech, norm, techsForDetail, techsFromRepo } from "./tech";
import { repo } from "@/test/repoFixture";

describe("tech — catálogo de tecnologias", () => {
    it("normaliza grafias: Node.js, NodeJS e node js são a mesma coisa", () => {
        expect(norm("Node.js")).toBe("nodejs");
        expect(norm("NodeJS")).toBe("nodejs");
        expect(lookupTech("node js")?.name).toBe("Node.js");
        expect(lookupTech("HTML5")?.name).toBe("HTML");
        expect(lookupTech("Python 3.12")?.name).toBe("Python");
        expect(lookupTech("React 18")?.name).toBe("React");
    });

    it("logotipo do Skill Icons da fork para todo o catálogo", () => {
        expect(lookupTech("React")).toMatchObject({ icon: "react" });
        expect(lookupTech("TypeScript")).toMatchObject({ icon: "ts" });
        expect(lookupTech("styled-components")).toMatchObject({
            icon: "styledcomponents",
        });
        expect(lookupTech("PostgreSQL")).toMatchObject({ icon: "postgres" });
        expect(lookupTech("JWT")).toMatchObject({ icon: "jwt" });
        expect(lookupTech("Framer Motion")).toMatchObject({ icon: "motion" });
        expect(lookupTech("golangci-lint")).toMatchObject({ icon: "golangci" });
        expect(lookupTech("GitHub OAuth")).toMatchObject({ icon: "github" });
    });

    it("linguagens associadas mantêm o nome do GitHub e usam o ícone da fork", () => {
        expect(lookupTech("Dockerfile")).toMatchObject({
            name: "Dockerfile",
            icon: "docker",
        });
        expect(lookupTech("Procfile")).toMatchObject({
            name: "Procfile",
            icon: "heroku",
        });
        expect(lookupTech("PLpgSQL")).toMatchObject({ icon: "postgres" });
        expect(lookupTech("Jupyter Notebook")).toMatchObject({
            name: "Jupyter Notebook",
            icon: "jupyter",
        });
    });

    it("desconhecido no catálogo → null", () => {
        expect(lookupTech("backend")).toBeNull();
        expect(lookupTech("")).toBeNull();
    });

    it("cartão: linguagens medidas (mesmo fora do catálogo) + tópicos reconhecidos", () => {
        const techs = techsFromRepo(
            repo({
                languages: [
                    { name: "Python", color: "#3572A5", size: 80 },
                    { name: "Elixir", color: "#6e4a7e", size: 20 },
                ],
                topics: ["fastapi", "python", "fullstack", "docker"],
            }),
        );
        expect(techs.map((t) => t.name)).toEqual([
            "Python",
            "Elixir",
            "FastAPI",
            "Docker",
        ]);
        expect(techs[1]).toMatchObject({ generic: "code", color: "#6e4a7e" });
    });

    it("sem lista de linguagens, usa a principal", () => {
        const techs = techsFromRepo(
            repo({
                languages: [],
                primaryLanguage: { name: "Java", color: null },
            }),
        );
        expect(techs.map((t) => t.name)).toEqual(["Java"]);
    });

    it("modal: o README vem primeiro, sem repetir o que o cartão já tinha", () => {
        const techs = techsForDetail(
            repo({
                languages: [
                    { name: "JavaScript", color: "#f1e05a", size: 90 },
                    { name: "HTML", color: "#e34c26", size: 10 },
                ],
            }),
            ["React", "Styled Components", "Lucide React", "JavaScript"],
        );
        expect(techs.map((t) => t.name)).toEqual([
            "React",
            "Styled Components",
            "lucide-react",
            "JavaScript",
            "HTML",
        ]);
    });
});
