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
            "O CVE-2026-96889 (ALTA, librsvg via sharp <0.35.5) foi fechado " +
            "subindo só o sharp para 0.35.5 DENTRO da faixa ^0.35.3, no " +
            "lockfile: package.json intacto, og em 1.0.1, satori em 0.29.0. " +
            "RESSALVA ABERTA, e ela é o motivo deste parágrafo existir: o " +
            "GHSA-wx4j-mvgx-mqwp (escape impróprio no SVG que o satori gera) " +
            "cobre satori >=0.0.27 <0.33.5 e portanto o 0.29.0 que esta " +
            "versão embute. `npm audit --omit=dev` devolve DUAS MODERADAS, " +
            "não zero, e o passo de audit do verify reprova por isso. " +
            "A 1.0.3 NÃO é a saída, e isto foi medido, não suposto: ela é " +
            '"type": "module" e seu único build de node é um bundle do ' +
            'esbuild cujo shim estoura `Dynamic require of "fs" is not ' +
            "supported` ao inicializar o harfbuzzjs. Falha em node puro, e " +
            "não só no vitest — api/og.test.ts reprova os cinco casos. " +
            "Forçar satori por override também não serve, e por um motivo " +
            "estrutural: o satori é EMBUTIDO no dist do og (não há import " +
            "em tempo de execução), então o override trocaria um " +
            "node_modules/satori que ninguém carrega. O audit ficaria verde " +
            "com o código vulnerável ainda rodando — teatro, não correção. " +
            "Nota de alcance, que é o que sustenta conviver com a ressalva: " +
            "api/og.ts valida a versão pedida por regex e a procura numa " +
            "lista fechada, caindo num título fixo quando não acha, então " +
            "nenhum texto de terceiro chega ao satori; e não passa imagem " +
            "nenhuma ao ImageResponse, então o decodificador de SVG do " +
            "librsvg não é alimentado por este uso. O alcance é nulo por " +
            "este caminho — o que baixa a urgência, não a obrigação de " +
            "revisitar quando a og publicar um build de node que carregue.",
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
