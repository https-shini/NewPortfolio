/**
 * Gera o QR code do rodapé — `frontend/public/qr-downloads.svg`.
 *
 *   node scripts/qr.mjs            escreve o arquivo
 *   node scripts/qr.mjs --check    confere o arquivo commitado
 *
 * ── Por que gerar no desenvolvimento e não no navegador ──────────────
 *
 * O QR codifica UMA url fixa, então a matriz é constante. Calculá-la a
 * cada visita seria pagar ~4 KB de JavaScript, em todo carregamento, para
 * chegar sempre ao mesmo desenho — trabalho que o desenvolvimento faz uma
 * vez. As outras saídas eram piores: um serviço externo de imagem põe o
 * rodapé na dependência de um terceiro em tempo de execução, e instalar
 * uma biblioteca reprova `dependencies.test.ts`, que afirma que o cliente
 * depende de `react` e `react-dom` e de mais nada.
 *
 * Este arquivo mora em `scripts/` e nunca é importado por `src/`: não
 * entra no bundle, não entra no package.json, não existe para quem visita.
 *
 * ── Por que um codificador inteiro, e não um recorte ─────────────────
 *
 * Seria menor resolver só o caso da url de hoje. Mas um gerador que só
 * funciona para uma entrada quebra em silêncio na primeira vez que a
 * entrada muda — e o modo de falha do QR é justamente o pior: ele
 * continua parecendo um QR. O `--check` do CI compara o arquivo commitado
 * com o que este script produz, então a matriz nunca envelhece sem que
 * alguém saiba.
 *
 * A implementação segue a ISO/IEC 18004 e nasceu com CINCO defeitos, todos
 * invisíveis a olho nu — o símbolo saía com cara de QR e não lia. Foram
 * encontrados comparando módulo a módulo com a `segno` e decodificando com
 * o OpenCV, duas implementações independentes. O procedimento inteiro, com
 * os cinco defeitos e como cada um foi isolado, está em `scripts/qr.diff.md`.
 *
 * O que se mediu, e não mais do que isso:
 *
 * · 71/71 símbolos voltam a ser exatamente o texto de origem;
 * · 71/71 com síndromes Reed–Solomon zeradas;
 * · a penalidade de máscara bate com a da `segno` nas 8 máscaras de 36
 *   casos — 288 pontuações, nenhuma diferença;
 * · 34/36 matrizes idênticas à `segno`; as 2 restantes são escolha de
 *   máscara dela, não erro de conta aqui (`qr.diff.md` detalha);
 * · o SVG que vai ao ar, renderizado a 120px e fotografado, lê a url.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SAIDA = path.join(RAIZ, "frontend/public/qr-downloads.svg");

/* A url é montada aqui a partir das mesmas peças do site. Repetir a
   string seria criar uma segunda fonte para o mesmo endereço. */
const SITE = "https://gcruz.dev.br";
const DESTINO = `${SITE}/downloads`;

/* Q corrige até 25% do símbolo. É mais do que a tela precisa e é o ponto
   em que um QR continua legível impresso, amassado ou fotografado torto —
   que é o uso que se espera dele. */
const NIVEL = "Q";

/* ═════════════════════════════════════════════════════════════════════
   1. GF(256) — a aritmética sobre a qual o Reed–Solomon acontece
   ═════════════════════════════════════════════════════════════════════ */

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
{
    let x = 1;
    for (let i = 0; i < 255; i++) {
        EXP[i] = x;
        LOG[x] = i;
        /* Polinômio primitivo do QR: x⁸ + x⁴ + x³ + x² + 1 (0x11d). */
        x <<= 1;
        if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
}

const mul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

/** Polinômio gerador de grau `grau`: ∏ (x − α^i). */
function gerador(grau) {
    let g = [1];
    for (let i = 0; i < grau; i++) {
        const proximo = new Array(g.length + 1).fill(0);
        for (let j = 0; j < g.length; j++) {
            proximo[j] ^= g[j];
            proximo[j + 1] ^= mul(g[j], EXP[i]);
        }
        g = proximo;
    }
    return g;
}

/** Resto da divisão dos dados pelo gerador — os códigos de correção. */
function correcao(dados, quantos) {
    const g = gerador(quantos);
    const resto = new Array(quantos).fill(0);
    for (const byte of dados) {
        const fator = byte ^ resto[0];
        resto.shift();
        resto.push(0);
        for (let i = 0; i < quantos; i++) resto[i] ^= mul(g[i + 1], fator);
    }
    return resto;
}

/* ═════════════════════════════════════════════════════════════════════
   2. Tabelas da norma
   ═════════════════════════════════════════════════════════════════════ */

/**
 * Por versão e nível: [correção por bloco, blocos do grupo 1, dados por
 * bloco do grupo 1, blocos do grupo 2, dados por bloco do grupo 2].
 *
 * O grupo 2 existe porque os dados nem sempre dividem igualmente entre os
 * blocos; quando dividem, ele é zero.
 */
const BLOCOS = {
    L: [
        null,
        [7, 1, 19, 0, 0],
        [10, 1, 34, 0, 0],
        [15, 1, 55, 0, 0],
        [20, 1, 80, 0, 0],
        [26, 1, 108, 0, 0],
        [18, 2, 68, 0, 0],
        [20, 2, 78, 0, 0],
        [24, 2, 97, 0, 0],
        [30, 2, 116, 0, 0],
        [18, 2, 68, 2, 69],
    ],
    M: [
        null,
        [10, 1, 16, 0, 0],
        [16, 1, 28, 0, 0],
        [26, 1, 44, 0, 0],
        [18, 2, 32, 0, 0],
        [24, 2, 43, 0, 0],
        [16, 4, 27, 0, 0],
        [18, 4, 31, 0, 0],
        [22, 2, 38, 2, 39],
        [22, 3, 36, 2, 37],
        [26, 4, 43, 1, 44],
    ],
    Q: [
        null,
        [13, 1, 13, 0, 0],
        [22, 1, 22, 0, 0],
        [18, 2, 17, 0, 0],
        [26, 2, 24, 0, 0],
        [18, 2, 15, 2, 16],
        [24, 4, 19, 0, 0],
        [18, 2, 14, 4, 15],
        [22, 4, 18, 2, 19],
        [20, 4, 16, 4, 17],
        [24, 6, 19, 2, 20],
    ],
    H: [
        null,
        [17, 1, 9, 0, 0],
        [28, 1, 16, 0, 0],
        [22, 2, 13, 0, 0],
        [16, 4, 9, 0, 0],
        [22, 2, 11, 2, 12],
        [28, 4, 15, 0, 0],
        [26, 4, 13, 1, 14],
        [26, 4, 14, 2, 15],
        [24, 4, 12, 4, 13],
        [28, 6, 15, 2, 16],
    ],
};

/** Centros dos padrões de alinhamento, por versão. */
const ALINHAMENTO = [
    [],
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
];

/** Bits do nível de correção dentro da informação de formato. */
const BITS_NIVEL = { L: 0b01, M: 0b00, Q: 0b11, H: 0b10 };

/* ═════════════════════════════════════════════════════════════════════
   3. Codificação dos dados
   ═════════════════════════════════════════════════════════════════════ */

/** Menor versão que comporta `bytes` no nível pedido. */
function menorVersao(bytes, nivel) {
    for (let v = 1; v <= 10; v++) {
        const [, b1, d1, b2, d2] = BLOCOS[nivel][v];
        const capacidade = b1 * d1 + b2 * d2;
        /* 4 bits de modo + 8 bits de contagem (versões 1 a 9) ou 16
           (versão 10 em diante, no modo byte). */
        const cabecalho = 4 + (v < 10 ? 8 : 16);
        if (capacidade * 8 >= cabecalho + bytes.length * 8) return v;
    }
    throw new Error(
        `${bytes.length} bytes não cabem em nenhuma versão até a 10 no ` +
            `nível ${nivel}. Aumente a tabela ou baixe o nível de correção.`,
    );
}

/** Fluxo de bits dos dados, já com terminador e enchimento. */
function bitsDeDados(bytes, versao, nivel) {
    const [, b1, d1, b2, d2] = BLOCOS[nivel][versao];
    const capacidade = (b1 * d1 + b2 * d2) * 8;

    const bits = [];
    const push = (valor, quantos) => {
        for (let i = quantos - 1; i >= 0; i--) bits.push((valor >> i) & 1);
    };

    push(0b0100, 4); /* modo byte */
    push(bytes.length, versao < 10 ? 8 : 16);
    for (const b of bytes) push(b, 8);

    /* Terminador: até quatro zeros, o que couber. */
    push(0, Math.min(4, capacidade - bits.length));
    /* Completa o último código. */
    while (bits.length % 8) bits.push(0);

    /* Enchimento alternado, definido pela norma. */
    const enchimento = [0xec, 0x11];
    for (let i = 0; bits.length < capacidade; i++) push(enchimento[i % 2], 8);

    const codigos = [];
    for (let i = 0; i < bits.length; i += 8) {
        let byte = 0;
        for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
        codigos.push(byte);
    }
    return codigos;
}

/**
 * Intercala blocos de dados e de correção.
 *
 * Não é capricho de formato: é o que faz uma mancha no papel atingir um
 * pedaço de cada bloco em vez de destruir um bloco inteiro. Sem isso a
 * correção de erro protegeria muito menos do que anuncia.
 */
function intercalar(codigos, versao, nivel) {
    const [ec, b1, d1, b2, d2] = BLOCOS[nivel][versao];

    const blocos = [];
    let i = 0;
    for (let b = 0; b < b1; b++, i += d1) blocos.push(codigos.slice(i, i + d1));
    for (let b = 0; b < b2; b++, i += d2) blocos.push(codigos.slice(i, i + d2));

    const corrigidos = blocos.map((bloco) => correcao(bloco, ec));

    const saida = [];
    const maiorDados = Math.max(d1, d2);
    for (let c = 0; c < maiorDados; c++)
        for (const bloco of blocos) if (c < bloco.length) saida.push(bloco[c]);
    for (let c = 0; c < ec; c++) for (const b of corrigidos) saida.push(b[c]);

    return saida;
}

/* ═════════════════════════════════════════════════════════════════════
   4. Montagem da matriz
   ═════════════════════════════════════════════════════════════════════ */

function novaMatriz(lado) {
    return {
        lado,
        /* `null` = ainda não escrito; é o que distingue módulo de dados
           de módulo de função na hora de aplicar a máscara. */
        celulas: Array.from({ length: lado }, () => new Array(lado).fill(null)),
    };
}

function padroesDeFuncao(m, versao) {
    const { lado, celulas } = m;

    const localizador = (linha, coluna) => {
        for (let i = -1; i <= 7; i++)
            for (let j = -1; j <= 7; j++) {
                const y = linha + i;
                const x = coluna + j;
                if (y < 0 || y >= lado || x < 0 || x >= lado) continue;
                const borda = i === -1 || i === 7 || j === -1 || j === 7;
                const anel = i === 0 || i === 6 || j === 0 || j === 6;
                const miolo = i >= 2 && i <= 4 && j >= 2 && j <= 4;
                celulas[y][x] = borda ? 0 : anel || miolo ? 1 : 0;
            }
    };
    localizador(0, 0);
    localizador(0, lado - 7);
    localizador(lado - 7, 0);

    /* Linhas de temporização — a régua que o leitor usa para achar o
       passo dos módulos. */
    for (let i = 8; i < lado - 8; i++) {
        const v = i % 2 === 0 ? 1 : 0;
        celulas[6][i] = v;
        celulas[i][6] = v;
    }

    for (const linha of ALINHAMENTO[versao])
        for (const coluna of ALINHAMENTO[versao]) {
            /* Os cantos são ocupados pelos localizadores. */
            const noCanto =
                (linha === 6 && coluna === 6) ||
                (linha === 6 && coluna === lado - 7) ||
                (linha === lado - 7 && coluna === 6);
            if (noCanto) continue;
            for (let i = -2; i <= 2; i++)
                for (let j = -2; j <= 2; j++)
                    celulas[linha + i][coluna + j] =
                        Math.max(Math.abs(i), Math.abs(j)) !== 1 ? 1 : 0;
        }

    /* Módulo escuro fixo. */
    celulas[lado - 8][8] = 1;

    /* Reserva das áreas de formato e de versão — preenchidas depois, mas
       marcadas agora para não receberem dados. */
    for (let i = 0; i < 9; i++) {
        if (celulas[8][i] === null) celulas[8][i] = 0;
        if (celulas[i][8] === null) celulas[i][8] = 0;
    }
    for (let i = 0; i < 8; i++) {
        if (celulas[8][lado - 1 - i] === null) celulas[8][lado - 1 - i] = 0;
        if (celulas[lado - 1 - i][8] === null) celulas[lado - 1 - i][8] = 0;
    }
    if (versao >= 7)
        for (let i = 0; i < 6; i++)
            for (let j = 0; j < 3; j++) {
                celulas[lado - 11 + j][i] = 0;
                celulas[i][lado - 11 + j] = 0;
            }
}

/** Percurso em ziguezague, de baixo para cima, dois módulos por vez. */
function escreverDados(m, codigos) {
    const { lado, celulas } = m;
    const bits = [];
    for (const byte of codigos)
        for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);

    let n = 0;
    let subindo = true;
    for (let direita = lado - 1; direita > 0; direita -= 2) {
        /* A coluna 6 é a de temporização e não entra na contagem de
           pares — pular isso desalinha o símbolo inteiro. */
        if (direita === 6) direita = 5;
        for (let passo = 0; passo < lado; passo++) {
            const linha = subindo ? lado - 1 - passo : passo;
            for (const coluna of [direita, direita - 1]) {
                if (celulas[linha][coluna] !== null) continue;
                celulas[linha][coluna] = n < bits.length ? bits[n] : 0;
                n++;
            }
        }
        subindo = !subindo;
    }
}

const MASCARAS = [
    (i, j) => (i + j) % 2 === 0,
    (i) => i % 2 === 0,
    (_, j) => j % 3 === 0,
    (i, j) => (i + j) % 3 === 0,
    (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0,
    (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0,
    (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0,
    (i, j) => (((i + j) % 2) + ((i * j) % 3)) % 2 === 0,
];

/**
 * Penalidade das quatro regras da norma.
 *
 * A máscara não é estética: ela existe para o símbolo não conter regiões
 * que o leitor confunda com os padrões de localização, e para o preto e o
 * branco ficarem equilibrados. Escolhe-se a de menor penalidade.
 */
function penalidade(celulas, lado) {
    let total = 0;

    const linhaOuColuna = (ler) => {
        for (let a = 0; a < lado; a++) {
            let corrida = 1;
            let anterior = ler(a, 0);
            for (let b = 1; b < lado; b++) {
                const atual = ler(a, b);
                if (atual === anterior) corrida++;
                else {
                    if (corrida >= 5) total += 3 + (corrida - 5);
                    corrida = 1;
                    anterior = atual;
                }
            }
            if (corrida >= 5) total += 3 + (corrida - 5);
        }
    };
    linhaOuColuna((a, b) => celulas[a][b]);
    linhaOuColuna((a, b) => celulas[b][a]);

    for (let i = 0; i < lado - 1; i++)
        for (let j = 0; j < lado - 1; j++) {
            const v = celulas[i][j];
            if (
                v === celulas[i][j + 1] &&
                v === celulas[i + 1][j] &&
                v === celulas[i + 1][j + 1]
            )
                total += 3;
        }

    /* Regra 3 — a proporção 1:1:3:1:1 que imita um localizador, com uma
       zona clara de quatro módulos antes ou depois.

       O detalhe que erra fácil: essa zona clara pode estar TRUNCADA pela
       borda do símbolo, e a norma conta assim mesmo. Exigir os quatro
       módulos inteiros dentro do símbolo — que foi a primeira versão
       disto — perde as ocorrências junto às bordas, que são justamente as
       que confundem o localizador do leitor. Com esse erro a máscara
       escolhida batia com a da `segno` em 18 de 36 casos. */
    const OLHO = [1, 0, 1, 1, 1, 0, 1];
    const claro = (seq, de, ate) => {
        for (let k = Math.max(de, 0); k < Math.min(ate, lado); k++)
            if (seq[k]) return false;
        return true;
    };
    const emSequencia = (seq) => {
        let i = 0;
        while (i + 7 <= lado) {
            let bate = true;
            for (let k = 0; k < 7; k++)
                if (seq[i + k] !== OLHO[k]) {
                    bate = false;
                    break;
                }
            if (!bate) {
                i++;
                continue;
            }
            if (
                i === 0 ||
                i === lado - 7 ||
                claro(seq, i - 4, i) ||
                claro(seq, i + 7, i + 11)
            ) {
                total += 40;
                i += 7;
            } else {
                /* Sem zona clara suficiente, o próximo casamento possível
                   começa no meio do próprio padrão. */
                i += 4;
            }
        }
    };
    for (let a = 0; a < lado; a++) {
        emSequencia(celulas[a]);
        emSequencia(celulas.map((linha) => linha[a]));
    }

    let escuros = 0;
    for (let i = 0; i < lado; i++)
        for (let j = 0; j < lado; j++) escuros += celulas[i][j];
    const proporcao = (escuros * 100) / (lado * lado);
    total += Math.floor(Math.abs(proporcao - 50) / 5) * 10;

    return total;
}

/** BCH(15,5) da informação de formato, já com o XOR da norma. */
function bitsDeFormato(nivel, mascara) {
    const dados = (BITS_NIVEL[nivel] << 3) | mascara;
    let resto = dados << 10;
    for (let i = 14; i >= 10; i--)
        if ((resto >> i) & 1) resto ^= 0b10100110111 << (i - 10);
    return ((dados << 10) | resto) ^ 0b101010000010010;
}

/**
 * BCH(18,6) da informação de versão — só a partir da versão 7.
 *
 * O gerador tem grau 12 (x¹²+x¹¹+x¹⁰+x⁹+x⁸+x⁵+x²+1) e portanto TREZE
 * bits. Escrito com dez, o resto sai errado e o bloco de versão vira
 * ruído — que é invisível até alguém tentar ler um símbolo grande.
 */
function bitsDeVersao(versao) {
    let resto = versao << 12;
    for (let i = 17; i >= 12; i--)
        if ((resto >> i) & 1) resto ^= 0b1111100100101 << (i - 12);
    return (versao << 12) | resto;
}

function escreverFormato(celulas, lado, nivel, mascara) {
    const bits = bitsDeFormato(nivel, mascara);
    /* O bit 14 é o PRIMEIRO a ser colocado: a norma numera a sequência do
       mais significativo para o menos, e a ordem inversa produz um símbolo
       de aparência perfeita que leitor nenhum decodifica. Conferido contra
       a `segno`. */
    const bit = (i) => (bits >> (14 - i)) & 1;

    for (let i = 0; i <= 5; i++) celulas[8][i] = bit(i);
    celulas[8][7] = bit(6);
    celulas[8][8] = bit(7);
    celulas[7][8] = bit(8);
    for (let i = 9; i <= 14; i++) celulas[14 - i][8] = bit(i);

    /* A segunda cópia divide 7 na vertical e 8 na horizontal — não 8 e 7.
       A divisão errada tem duas consequências ao mesmo tempo: escreve por
       cima do módulo escuro fixo, em (lado−8, 8), e deixa (8, lado−8) sem
       escrever. Um símbolo assim continua com cara de QR e falha em
       algumas máscaras e não em outras, que é o pior modo de falha
       possível. Localizado comparando com a `segno` em preenchimentos
       exatos, onde a diferença ficou num único módulo. */
    for (let i = 0; i <= 6; i++) celulas[lado - 1 - i][8] = bit(i);
    for (let i = 7; i <= 14; i++) celulas[8][lado - 15 + i] = bit(i);
}

function escreverVersao(celulas, lado, versao) {
    if (versao < 7) return;
    const bits = bitsDeVersao(versao);
    for (let i = 0; i < 18; i++) {
        /* Ao contrário do formato, aqui o bit MENOS significativo vem
           primeiro. As duas áreas não compartilham convenção, e supor que
           compartilham foi o que manteve o bloco de versão errado depois
           de o formato já estar certo. Conferido nos dois sentidos contra
           a `segno`: 36/36 nesta ordem, 24/36 na outra. */
        const b = (bits >> i) & 1;
        const linha = Math.floor(i / 3);
        const coluna = lado - 11 + (i % 3);
        celulas[linha][coluna] = b;
        celulas[coluna][linha] = b;
    }
}

/**
 * A matriz final, já mascarada, como array de arrays de 0 e 1.
 *
 * `mascaraFixa` existe para a conferência diferencial: comparar contra uma
 * implementação de referência com a máscara presa isola erros de
 * codificação dos de escolha de máscara, que se manifestam igual — o
 * símbolo inteiro diferente.
 */
export function gerarMatriz(texto, nivel = NIVEL, mascaraFixa = null) {
    const bytes = [...new TextEncoder().encode(texto)];
    const versao = menorVersao(bytes, nivel);
    const codigos = intercalar(
        bitsDeDados(bytes, versao, nivel),
        versao,
        nivel,
    );

    const lado = 17 + versao * 4;
    const base = novaMatriz(lado);
    padroesDeFuncao(base, versao);

    /* Guarda quais posições são de função ANTES dos dados entrarem: a
       máscara só pode tocar módulos de dados. */
    const ehFuncao = base.celulas.map((linha) => linha.map((c) => c !== null));

    escreverDados(base, codigos);

    /* A pontuação acontece ANTES de o formato e a versão serem escritos —
       a norma é explícita nisso (7.8), e a razão é que aquelas áreas não
       dependem dos dados: incluí-las na conta faria a máscara ser
       escolhida em parte por módulos que ela nem toca. Fazendo ao
       contrário, a máscara escolhida coincidia com a da referência em 26
       de 36 casos; movendo a escrita para depois, em 36. */
    let melhor = null;
    for (let mascara = 0; mascara < 8; mascara++) {
        if (mascaraFixa !== null && mascara !== mascaraFixa) continue;
        const celulas = base.celulas.map((linha) => [...linha]);
        for (let i = 0; i < lado; i++)
            for (let j = 0; j < lado; j++)
                if (!ehFuncao[i][j] && MASCARAS[mascara](i, j))
                    celulas[i][j] ^= 1;

        const p = penalidade(celulas, lado);
        if (!melhor || p < melhor.p) melhor = { p, celulas, mascara };
    }

    escreverFormato(melhor.celulas, lado, nivel, melhor.mascara);
    escreverVersao(melhor.celulas, lado, versao);

    return melhor.celulas;
}

/** Peças internas, expostas só para a conferência diferencial. */
export const _internos = {
    penalidade,
    novaMatriz,
    padroesDeFuncao,
    escreverDados,
    bitsDeDados,
    intercalar,
    menorVersao,
    MASCARAS,
};

/* ═════════════════════════════════════════════════════════════════════
   5. SVG
   ═════════════════════════════════════════════════════════════════════ */

/**
 * Um `<path>` só, e não um `<rect>` por módulo — e dentro do path, um
 * traço por CORRIDA horizontal, não por módulo. São ~900 módulos escuros;
 * desenhados um a um o arquivo passa de 6 KB, agrupados em corridas fica
 * perto da metade, e o desenho é exatamente o mesmo.
 *
 * Escuro sobre claro sempre, nos dois temas. Um QR invertido só é lido por
 * parte dos leitores, e o rodapé não controla qual câmera vai apontar para
 * ele — o fundo claro é do próprio desenho, não do tema.
 */
function paraSvg(celulas) {
    const lado = celulas.length;
    /* Zona de silêncio de 4 módulos: sem ela o leitor não consegue
       delimitar o símbolo contra o que estiver em volta. */
    const margem = 4;
    const total = lado + margem * 2;

    let d = "";
    for (let i = 0; i < lado; i++) {
        let j = 0;
        while (j < lado) {
            if (!celulas[i][j]) {
                j++;
                continue;
            }
            const inicio = j;
            while (j < lado && celulas[i][j]) j++;
            const largura = j - inicio;
            d += `M${inicio + margem} ${i + margem}h${largura}v1h-${largura}z`;
        }
    }

    return [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}"`,
        ` shape-rendering="crispEdges" role="img"`,
        ` aria-label="QR code para ${DESTINO}">`,
        `<rect width="${total}" height="${total}" fill="#ffffff"/>`,
        `<path d="${d}" fill="#070d19"/>`,
        `</svg>`,
        ``,
    ].join("");
}

/* ═════════════════════════════════════════════════════════════════════
   6. CLI
   ═════════════════════════════════════════════════════════════════════ */

/* Só roda como programa. Importado — pela conferência diferencial, por
   exemplo — o módulo não escreve nada: gerar arquivo como efeito colateral
   de um `import` é o tipo de surpresa que corrompe o que se estava
   medindo. */
const executandoDireto = process.argv[1] === fileURLToPath(import.meta.url);

if (executandoDireto) {
    const svg = paraSvg(gerarMatriz(DESTINO));
    if (process.argv.includes("--check")) confere(svg);
    else escreve(svg);
}

function confere(svg) {
    let atual;
    try {
        atual = readFileSync(SAIDA, "utf8");
    } catch {
        console.error(
            `FALHA  ${path.relative(RAIZ, SAIDA)} não existe. ` +
                `Rode 'npm run qr'.`,
        );
        process.exit(1);
    }
    if (atual !== svg) {
        console.error(
            `FALHA  ${path.relative(RAIZ, SAIDA)} não corresponde a ` +
                `"${DESTINO}". Rode 'npm run qr' e commite o resultado.`,
        );
        process.exit(1);
    }
    console.log(`  ok   o QR commitado aponta para ${DESTINO}`);
}

function escreve(svg) {
    writeFileSync(SAIDA, svg, "utf8");
    console.log(`gerado: ${path.relative(RAIZ, SAIDA)} → ${DESTINO}`);
}
