# Como o QR de `scripts/qr.mjs` foi conferido

O modo de falha de um QR code é o pior que existe num artefato visual: quando está errado,
ele continua **parecendo** um QR. Não há inspeção visual que separe um símbolo válido de um
que nenhuma câmera lê. Por isso o codificador não foi aceito por parecer certo — foi
conferido contra duas implementações independentes, e nasceu com cinco defeitos.

Este documento registra o procedimento para que ele possa ser repetido quando o arquivo
mudar.

## As duas referências

Nenhuma das duas entra no repositório. São ferramentas de conferência, instaladas na hora:

```bash
pip install segno opencv-python-headless numpy
```

- **`segno`** — codificador maduro em Python. Serve para comparar **matriz contra matriz**,
  módulo a módulo. Diz _onde_ está a diferença.
- **`OpenCV`** — decodificador. Serve para responder a única pergunta que interessa no fim:
  **isto lê?** Diz _se_ o símbolo funciona, sem dizer por quê.

As duas são necessárias. A `segno` sozinha não prova que o símbolo lê; o OpenCV sozinho não
diz onde consertar.

## As cinco provas

Rodadas sobre 71 entradas (versões 1 a 10 × níveis L/M/Q/H × tamanhos de 1 a 120 bytes):

| Prova                                                               | O que descarta                  | Resultado    |
| ------------------------------------------------------------------- | ------------------------------- | ------------ |
| Volta a ser o texto de origem, por um decodificador escrito à parte | erro em qualquer etapa          | **71/71**    |
| Síndromes Reed–Solomon zeradas                                      | ECC e intercalamento            | **71/71**    |
| Penalidade igual à da `segno` nas 8 máscaras de 36 casos            | as quatro regras de penalidade  | **288/288**  |
| Matriz idêntica à `segno`, com preenchimento exato                  | posicionamento, formato, versão | **34/36**    |
| O SVG renderizado a 120px, fotografado e decodificado               | o artefato que vai ao ar        | **lê a url** |

### Por que "preenchimento exato"

A `segno` emite um código zero **a mais** quando o fluxo de bits já está alinhado ao byte
depois do terminador. Os decodificadores param no terminador, então isso não muda leitura
nenhuma — mas muda o enchimento, e portanto a correção de erro, e portanto metade dos
módulos. Comparar matrizes só é conclusivo quando não há enchimento.

Escolhendo `n = ⌊(capacidade_em_bits − 12) / 8⌋` bytes, o terminador de 4 bits fecha o
símbolo exatamente e o enchimento desaparece dos dois lados.

### As 2 matrizes que ainda diferem

`L v1` e `L v4`. Nos dois casos minha penalidade é **idêntica** à da `segno` nas oito
máscaras — o que difere é a máscara que ela escolhe: em `L v1` ela não pega o mínimo
(1104 em vez de 1103), e em `L v4` ela desempata para o outro lado (1257 = 1257). A norma
manda pegar o menor, que é o que este arquivo faz. Símbolos diferentes, os dois válidos.

### As 2 leituras que o OpenCV não faz

`H v6 50B` e `H v7 64B`. Nos dois, `cv2.detect()` **não localiza** o símbolo — é falha de
localização, não de decodificação. Num deles a matriz da própria `segno`, na mesma máscara,
também não é localizada. Somado a 71/71 na volta pelo decodificador próprio e às síndromes
zeradas, é limitação do localizador do OpenCV com carga aleatória e correção alta.

## Os cinco defeitos que isso encontrou

Registrados porque cada um é uma armadilha que a próxima pessoa vai encontrar de novo:

1. **Ordem dos bits do formato.** O bit 14 é o primeiro a ser colocado, não o bit 0.
   Sintoma: nenhuma leitura, nunca.
2. **Divisão da segunda cópia do formato.** São 7 módulos na vertical e 8 na horizontal, não
   8 e 7. A divisão errada escreve por cima do módulo escuro fixo e deixa `(8, lado−8)` em
   branco. Sintoma: falha em _algumas_ máscaras e não em outras — o pior sintoma possível,
   porque parece intermitente.
3. **Gerador BCH da informação de versão truncado.** Grau 12 são treze bits
   (`0b1111100100101`); escrito com dez, o bloco de versão vira ruído. Sintoma: só versões
   7 ou maiores quebram.
4. **Regra 3 da penalidade.** A zona clara de quatro módulos pode estar **cortada pela
   borda**, e a norma conta assim mesmo. Exigir os quatro dentro do símbolo perde as
   ocorrências junto à borda — justamente as que confundem o localizador. Sintoma: nenhum
   direto; só símbolos mais difíceis de ler.
5. **Ordem de avaliação da máscara.** A norma (7.8) manda pontuar **antes** de escrever
   formato e versão. Escrevendo antes, a máscara acaba escolhida em parte por módulos que
   ela nem toca. Sintoma: nenhum direto; máscara pior.

Três dos cinco não têm sintoma visível e dois quebram de forma intermitente. É a razão de
existir este documento.

## A costura que permitiu isolar

`gerarMatriz(texto, nivel, mascaraFixa)` aceita prender a máscara, e `_internos` expõe as
peças. Sem isso, um erro de codificação e um erro de escolha de máscara se manifestam
igual — o símbolo inteiro diferente — e não há como saber qual dos dois se está olhando.

## Repetindo a conferência

Os arranjos não moram no repositório: são de uso único, escritos contra a versão do arquivo
sob suspeita. O roteiro é o de cima — gerar as mesmas entradas nos dois lados, comparar
matriz a matriz nos preenchimentos exatos, decodificar tudo, e conferir a penalidade máscara
a máscara antes de olhar qualquer outra coisa.

O que o CI guarda é mais modesto e é o que importa no dia a dia: `npm run qr:check` refaz o
símbolo e compara byte a byte com o commitado, para que a url nunca mude sem o QR mudar
junto.
