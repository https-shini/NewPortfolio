import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * O projeto roda com duas dependências de runtime, e essa foi a decisão que
 * mais moldou tudo o que veio depois: sem biblioteca de rotas, sem
 * componentes prontos, sem cliente HTTP. Cada uma dessas ausências virou
 * código próprio que hoje está aqui.
 *
 * Uma decisão dessas não se defende sozinha. Ela se perde numa tarde em que
 * alguém precisa de um datepicker, instala um, e o `npm install` passa sem
 * dizer nada. Este teste é o lugar onde a intenção vira regra: acrescentar
 * uma dependência de runtime exige mexer aqui, e mexer aqui exige explicar
 * por quê.
 *
 * O tamanho do bundle é consequência, não causa — quem vigia o peso é o
 * orçamento no CI. Aqui se vigia a contagem.
 */

const ESPERADAS = ["react", "react-dom"];

/* O vitest roda com a raiz em frontend/. */
function lerPackageJson(caminho: string) {
    return JSON.parse(
        readFileSync(resolve(process.cwd(), caminho), "utf8"),
    ) as {
        dependencies?: Record<string, string>;
    };
}

describe("dependências de runtime", () => {
    it("o frontend depende de react e react-dom, e de mais nada", () => {
        const { dependencies } = lerPackageJson("package.json");
        expect(Object.keys(dependencies ?? {}).sort()).toEqual(ESPERADAS);
    });

    it("a raiz não declara dependência de runtime", () => {
        /* A raiz orquestra scripts e hospeda os arranjos de auditoria; as
           funções em api/ também resolvem daqui. Nada disso chega ao
           navegador, mas uma dependência aqui vai para o servidor da
           Vercel — e some do radar de quem lê só o package.json do
           frontend. */
        const { dependencies } = lerPackageJson("../package.json");
        expect(dependencies ?? {}).toEqual({});
    });
});
