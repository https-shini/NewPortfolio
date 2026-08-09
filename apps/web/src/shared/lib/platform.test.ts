import { describe, it, expect } from "vitest";
import { detectarPlataforma } from "./platform";

/* A ordem dos testes dentro da função é o que importa aqui: user-agents
   reais se sobrepõem, e testar do genérico para o específico entrega o
   instalador errado. */
describe("detectarPlataforma", () => {
    it("Android vem antes de Linux — todo Android também diz Linux", () => {
        expect(
            detectarPlataforma(
                "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36",
            ),
        ).toBe("android");
    });

    it("reconhece Windows, macOS e Linux de mesa", () => {
        expect(detectarPlataforma("Mozilla/5.0 (Windows NT 10.0; Win64)")).toBe(
            "windows",
        );
        expect(
            detectarPlataforma("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)"),
        ).toBe("macos");
        expect(
            detectarPlataforma("Mozilla/5.0 (X11; Ubuntu; Linux x86_64)"),
        ).toBe("linux");
    });

    /* iPadOS 13+ se anuncia como Macintosh. Sem a checagem de toque, um
       iPad receberia a oferta de um .dmg. */
    it("distingue iPad de Mac pelo toque", () => {
        const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)";
        expect(detectarPlataforma(ua, 0)).toBe("macos");
        expect(detectarPlataforma(ua, 5)).toBe("ios");
    });

    it("iPhone é iOS", () => {
        expect(
            detectarPlataforma("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)"),
        ).toBe("ios");
    });

    it("desconhecido não chuta — a página mostra todas as opções", () => {
        expect(detectarPlataforma("curl/8.4.0")).toBe("desconhecida");
    });
});
