/* ─────────────────────────────────────────────────────────
   platform.ts — o vocabulário de plataformas do cliente
   ─────────────────────────────────────────────────────────
   Espelha o tipo de `api/downloads.ts`. A duplicação é deliberada: o
   cliente não importa de `api/` para não arrastar código de servidor
   para o bundle, e o par é conferido pelo compilador em todo lugar que
   consome a resposta da função.

   Aqui houve também um `detectarPlataforma`, que lia o user-agent para
   decidir qual cartão destacar na /downloads. Saiu junto com o destaque:
   a página passou a apresentar os sistemas em pé de igualdade, e uma
   detecção que não decide mais nada é só uma heurística frágil esperando
   para errar em silêncio.
───────────────────────────────────────────────────────── */

export type Plataforma = "windows" | "macos" | "linux" | "android";
