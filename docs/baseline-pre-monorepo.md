# Linha de base antes do monorepo

Leituras de cada portão de qualidade no commit **`6cd2733`**, tiradas antes de mover
`frontend/` para `apps/web/`.

Existe por um motivo prático: depois de uma reorganização de pastas, "não quebrou nada" é
uma opinião até alguém comparar com um número anotado antes. E há um modo de falha pior que
quebrar — uma auditoria que passa a apontar para um caminho que não existe mais **não falha,
ela para de vigiar**. Um `bundle-budget` lendo um `frontend/dist` inexistente é um portão
aberto com cara de fechado.

## Leituras

| Portão             | Comando                  | Valor em `6cd2733`                           |
| ------------------ | ------------------------ | -------------------------------------------- |
| Testes             | `npm test`               | **292** em 36 arquivos                       |
| Acessibilidade     | `npm run audit:a11y`     | **20/20** combinações, 0 violações           |
| Rolagem horizontal | `npm run audit:overflow` | **25/25** combinações                        |
| Camadas            | `npm run audit:layers`   | todos os invariantes respeitados             |
| Identidade         | `npm run audit:identity` | **66 superfícies** intactas                  |
| Bundle — JS        | `npm run audit:bundle`   | **113,3 KB** / 125 KB (folga 11,7 KB)        |
| Bundle — vendor    | idem                     | **44,2 KB** / 50 KB (folga 5,8 KB)           |
| Bundle — CSS       | idem                     | **32,5 KB** / 36 KB (folga 3,5 KB)           |
| QR do rodapé       | `npm run qr:check`       | aponta para `https://gcruz.dev.br/downloads` |

Rotas que precisam responder em produção depois da migração: `/`, `/links`,
`/release-notes`, `/release-notes/v2.0.0`, `/downloads` (e `/downloads/`), `/sitemap.xml`,
`/feed.xml`.

## Geometria — por que não está aqui

`scripts/geometry.mjs captura` produz **360 cenários e 107.004 caixas**, cerca de **19 MB**.
É ferramenta de comparação, não registro histórico, e versionar isso poluiria o repositório
sem servir a ninguém depois da migração.

O procedimento certo é capturar **imediatamente antes** de mexer nas pastas e comparar
**logo depois**, no mesmo dia:

```bash
npm run build
node scripts/geometry.mjs captura /tmp/antes.json
#  … a migração acontece aqui …
npm run build
node scripts/geometry.mjs captura /tmp/depois.json
node scripts/geometry.mjs diff /tmp/antes.json /tmp/depois.json
```

O diff tem de sair **vazio**. A migração é de pastas e de caminhos de ferramenta; qualquer
pixel que se mova é defeito, não progresso.

O que É durável e já está versionado: `docs/identity-baseline.json`, com as 66 superfícies
de cor, borda, raio, espaçamento e tipo. Ele atravessa a migração e não deve ser regravado
por causa dela — se `audit:identity` acusar diferença, é porque algo se moveu de verdade.

## Como provar que os portões continuam vigiando

Passar não basta: um portão desligado também passa. Depois da migração, quebrar cada um de
propósito e confirmar que ele acusa — acrescentar um `<div>` com 2000px de largura e ver o
`audit:overflow` reprovar; subir o limite de um orçamento e ver o `audit:bundle` reprovar;
mudar uma cor e ver o `audit:identity` reprovar. Desfazer em seguida.
