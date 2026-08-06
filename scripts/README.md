# Arranjos de auditoria

Medições que antes viviam numa sessão de trabalho e sumiam com ela. Todos
rodam a partir da raiz do repositório e sobem o `vite preview` sozinhos.

```bash
npm run build            # os arranjos medem o dist/, não o dev server
node scripts/a11y.mjs
```

Aponte `BASE_URL` para reaproveitar um servidor já de pé — nesse caso o
arranjo não derruba o que não subiu:

```bash
BASE_URL=http://localhost:4173 node scripts/a11y.mjs
```

Se o Chromium não for encontrado, rode `npx playwright install chromium` ou
aponte `PW_CHROMIUM_PATH` para um binário existente.

## `a11y.mjs`

axe-core nas quatro rotas, nos dois temas e nos dois idiomas — 16
combinações. Sai com código 1 se houver violação `serious` ou `critical`, ou
se o idioma declarado no documento divergir do renderizado.

```bash
node scripts/a11y.mjs             # relatório legível
node scripts/a11y.mjs --json      # saída para máquina
node scripts/a11y.mjs --baseline  # regrava docs/a11y-baseline.json
```

As `moderate` viram aviso e não barram: valem correção, não valem travar uma
entrega.

### Por que a auditoria força `prefers-reduced-motion`

Sem isso, o axe pega os elementos de `[data-reveal]` no meio do fade e mede
cores mescladas com o fundo. O contraste do mesmo botão muda conforme o
instante da medição, e duas execuções seguidas discordam. Com o movimento
reduzido, mede-se o estado assentado — que é o que a pessoa de fato lê.

O efeito colateral é bom: como nada fica meio transparente, o axe enxerga
mais elementos e a cobertura sobe.

## `docs/a11y-baseline.json`

O estado que se quer preservar, não um alvo a perseguir. Hoje é zero
violação em 16 combinações; qualquer regressão futura aparece como diferença
contra este arquivo.
