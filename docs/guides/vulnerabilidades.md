# Vulnerabilidades conhecidas — pendências técnicas

Documento **vivo**: atualize a cada `npm audit`, sempre que uma
correção for publicada ou uma pendência for resolvida. Nenhum alerta é
silenciado no CI: a etapa "Auditoria de todas as dependências"
(`npm audit --audit-level=low`) continua reprovando enquanto houver item
aberto aqui.

Última revisão: **2026-11-08** · `npm audit`: **9 moderadas**, 0 altas,
0 críticas · todas transitivas de duas origens.

## Resumo

| #   | Origem                                            | Advisory                                                                 | Severidade | Onde roda                 | Risco real                     | Situação                        |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------ | ---------- | ------------------------- | ------------------------------ | ------------------------------- |
| V1  | `satori` 0.29.0, embutido em `@vercel/og` 1.0.1   | [GHSA-wx4j-mvgx-mqwp](https://github.com/advisories/GHSA-wx4j-mvgx-mqwp) | moderada   | produção (`api/og.ts`)    | baixo — entrada já restringida | aberta, sem correção compatível |
| V2  | `minimatch` 10.2.6 via `typescript-eslint` 8.67.0 | [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) | moderada   | só desenvolvimento (lint) | muito baixo                    | aberta, aguardando upstream     |

As 9 linhas do audit são essas duas cadeias: V1 conta `satori` e
`@vercel/og`; V2 conta `minimatch` e os seis pacotes
`@typescript-eslint/*` / `typescript-eslint` que dependem dele.

## V1 — escape impróprio no SVG gerado pelo satori

- **Descrição:** o satori não escapa corretamente certos conteúdos ao
  montar o SVG intermediário. Com texto controlado por terceiros, isso
  pode injetar marcação no SVG.
- **Componentes afetados:** `api/og.ts` (imagem Open Graph das notas
  de versão).
- **Por que o risco é baixo:** o único parâmetro (`v`) é validado por
  expressão regular e procurado numa lista fechada de versões. Fora do
  formato, cai no cartão genérico. Nenhum texto de terceiro chega ao
  satori, e a resposta é PNG rasterizado: o SVG não é servido.
- **Correção disponível e por que não foi aplicada:** `@vercel/og`
  1.0.3 traz o satori corrigido, mas o build de Node dele reprova os
  cinco casos de `api/og.test.ts` (a função deixa de gerar a imagem).
  Override do `satori` não resolve: ele é embutido no `dist` do
  `@vercel/og`, então o audit ficaria verde sem mudar o código que roda.
  Detalhes em `apps/web/src/shared/config/dependencies.test.ts`.
- **Condição para fechar:** uma versão do `@vercel/og` que carregue no
  runtime Node da Vercel e passe em `api/og.test.ts`. Revisar a cada
  release do pacote.

## V2 — negação de serviço no minimatch (globparts)

- **Descrição:** padrões glob construídos de forma maliciosa podem
  causar consumo excessivo de CPU.
- **Componentes afetados:** só o ESLint
  (`typescript-eslint` → `@typescript-eslint/typescript-estree`).
  Nada disso entra no bundle nem nas funções serverless.
- **Por que o risco é muito baixo:** os globs vêm do próprio
  repositório (configuração do ESLint), nunca de entrada externa.
- **Correção disponível e por que não foi aplicada:** o
  `npm audit fix` propõe `typescript-eslint` 8.36.0, que é um
  **downgrade** em relação ao 8.67.0 instalado. Um override de
  `minimatch` gerou uma árvore inválida (`typescript-estree` exige
  `^10.2.2`) e foi revertido.
- **Condição para fechar:** release do `typescript-eslint` com
  `minimatch` fora da faixa afetada. Atualizar, rodar `npm audit` e
  `npm run lint`.

## Como revisar

```bash
npm audit                 # lista atual
npm audit --json          # detalhes por pacote
npm ls @vercel/og satori typescript-eslint minimatch
```

Ao fechar um item: remova-o da tabela, registre a data e o commit da
correção no histórico abaixo e confirme que o job de CI voltou a passar.

## Histórico

| data       | evento                                                             |
| ---------- | ------------------------------------------------------------------ |
| 2026-10-28 | auditoria passa a reprovar o CI na `main` (V1 e V2)                |
| 2026-11-08 | pendências documentadas neste arquivo; nenhuma correção compatível |
