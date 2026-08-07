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

/** O que o navegador baixa. Esta lista não deveria crescer. */
const CLIENTE = ["react", "react-dom"];

/**
 * O que roda só no servidor da Vercel, dentro de api/. Nada daqui chega
 * ao navegador, então o peso é invisível para quem visita — mas some do
 * radar de quem lê apenas o package.json do frontend, e por isso fica
 * enumerado, com o motivo ao lado.
 */
const SERVIDOR: Record<string, string> = {
    "@vercel/og":
        "gera a imagem de compartilhamento por versão; os rastreadores não " +
        "executam JavaScript, então a imagem precisa sair pronta do servidor",
};

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
        expect(Object.keys(dependencies ?? {}).sort()).toEqual(CLIENTE);
    });

    it("a raiz só declara o que roda no servidor, e cada uma justificada", () => {
        const { dependencies } = lerPackageJson("../package.json");
        expect(Object.keys(dependencies ?? {}).sort()).toEqual(
            Object.keys(SERVIDOR).sort(),
        );
    });

    it("nenhuma dependência de servidor vazou para o cliente", () => {
        /* O erro que essa separação convida: instalar no lugar errado e
           mandar para o navegador algo que devia ficar na função. */
        const { dependencies } = lerPackageJson("package.json");
        for (const nome of Object.keys(SERVIDOR)) {
            expect(dependencies ?? {}).not.toHaveProperty(nome);
        }
    });
});
