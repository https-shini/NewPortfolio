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

/**
 * Versões fixadas, e o motivo de cada uma. Fixar sem dizer por quê é como
 * comentar código: alguém vai desfazer por parecer resíduo.
 */
const FIXADAS: Record<string, { versao: string; porque: string }> = {
    "@vercel/og": {
        versao: "1.0.1",
        porque:
            "A 0.11.1 traz sharp 0.34.5, com duas ALTAS herdadas de libvips e " +
            "libheif — e é por ela que este alfinete nasceu. " +
            "O motivo original de não subir para 1.0.3 era o satori 0.33.x, " +
            "que depende de fflate 0.7.3 e reintroduzia três MODERADAS. ISSO " +
            "DEIXOU DE VALER: o fflate não tem advisory nenhum hoje, então a " +
            "1.0.3 está liberada. A 1.0.1 continua sendo a escolha por ser a " +
            "mudança menor — ela e a 1.0.3 declaram a MESMA faixa de sharp " +
            "(optionalDependency ^0.35.3), então subir a og move satori e " +
            "fflate sem resolver nada que a faixa já não resolva. " +
            "O CVE-2026-96889 (ALTA, librsvg via sharp <0.35.5) foi fechado " +
            "subindo só o sharp para 0.35.5 DENTRO da faixa ^0.35.3, no " +
            "lockfile: package.json intacto, og em 1.0.1, satori em 0.29.0. " +
            "npm audit --omit=dev devolve zero. " +
            "Nota de alcance: api/og.ts monta uma árvore de divs e texto e não " +
            "passa imagem nenhuma ao ImageResponse, então o decodificador de " +
            "SVG do librsvg não é alimentado por este uso — o que baixa a " +
            "urgência, não a obrigação de manter a porta verde.",
    },
};

/* O vitest roda com a raiz em apps/web/. */
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
        const { dependencies } = lerPackageJson("../../package.json");
        expect(Object.keys(dependencies ?? {}).sort()).toEqual(
            Object.keys(SERVIDOR).sort(),
        );
    });

    it("as versões fixadas continuam fixas, e exatamente na que se escolheu", () => {
        /* Sem isto, um `npm update` ou um bot de dependências sobe a versão e
           reintroduz a vulnerabilidade em silêncio — o `npm audit` não roda no
           CI, então nada reprovaria. O teste roda. */
        const { dependencies } = lerPackageJson("../../package.json");
        for (const [nome, { versao }] of Object.entries(FIXADAS)) {
            expect(dependencies?.[nome]).toBe(versao);
        }
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
