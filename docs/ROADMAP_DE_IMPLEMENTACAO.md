# Roadmap de implementação — NewPortfolio

> **Data:** 2026-11-08 · **Base:** commit `7080c1b`
> **Origem das tarefas:** [`ANALISE_E_PLANO_DE_MELHORIAS.md`](ANALISE_E_PLANO_DE_MELHORIAS.md) (IDs `P-NN` = problema, `MEL-NN` = melhoria)
> **Relação com o backlog anterior:** itens `T-NN` são do [`reference/AUDITORIA-2026-08.md`](reference/AUDITORIA-2026-08.md) §22 e do [Project #3](https://github.com/users/https-shini/projects/3). Quando uma tarefa daqui corresponde a uma issue existente, **use a issue existente** em vez de abrir outra.

---

## Visão geral

| Fase      | Tema                      | Tarefas | Esforço estimado*     | Saída da fase                                                            |
| --------- | ------------------------- | ------- | --------------------- | ------------------------------------------------------------------------ |
| 1         | Correções críticas        | 10      | 1–2 dias              | Nenhum cenário de página vazia; CI = `verify`                            |
| 2         | Fundação técnica          | 10      | 3–5 dias              | Duplicações removidas, fonte única de identidade, i18n unificado         |
| 3         | Performance e otimização  | 4       | 2–3 dias              | Caminho crítico sem cascata; fontes sem terceiro (se a licença permitir) |
| 4         | Melhorias funcionais      | 7       | 4–6 dias              | Contato funcional, SEO e funções mais robustos                           |
| 5         | UX/UI e acessibilidade    | 4       | 2–3 dias              | Feedback completo, axe em estados interativos                            |
| 6         | Atualizações tecnológicas | 4       | 1–2 dias + observação | CSP aplicada; atualizações automatizadas                                 |
| 7         | Testes e validação        | 6       | 2–3 dias              | Cobertura dos módulos sem teste; validação em produção                   |
| 8         | Evolução futura           | 6       | contínuo              | Observabilidade e novas páginas pelo checklist de rota                   |
| **Total** |                           | **51**  |                       |                                                                          |

\* Estimativa para uma pessoa em ritmo de projeto pessoal; serve para ordenar, não para prometer prazo.

**Ordem de execução:** fases em sequência; dentro de cada fase, na ordem listada (já respeita dependências). Tarefas marcadas **∥** podem correr em paralelo com a anterior.

**Legenda:** Prioridade — Crítica · Alta · Média · Baixa. Complexidade — Baixa · Média · Alta.

---

## Fase 1 — Correções críticas

> Objetivo: eliminar os cenários de tela vazia e fechar os portões que deixaram os defeitos passar.

### F1-01 · Confirmar o defeito de `/contato` em produção

- **Objetivo:** registrar a evidência de P-01 antes de corrigir.
- **Prioridade / Complexidade:** Crítica / Baixa
- **Dependências:** — · **Pré-requisitos:** acesso ao site em produção
- **Módulos:** nenhum (validação)
- **Conclusão:** captura de tela e `getComputedStyle(document.querySelector('#contato')).opacity` anotados na issue.
- **Riscos:** se o conteúdo estiver visível, investigar a causa antes de seguir com F1-02 (a análise estática pode ter perdido uma regra).

### F1-02 · Revelar o conteúdo de `/contato` (MEL-01)

- **Objetivo:** a página exibe o conteúdo.
- **Prioridade / Complexidade:** Crítica / Baixa
- **Dependências:** F1-01 · **Pré-requisitos:** —
- **Módulos:** `apps/web/src/pages/Contact/index.tsx`
- **Conclusão:** `useScrollReveal()` chamado na página; teste de unidade com `IntersectionObserver` simulado verifica `.is-visible` em `#contato`.
- **Riscos:** baixos.

### F1-03 · `localStorage` resiliente no `LangContext` (MEL-02)

- **Objetivo:** o app monta mesmo com armazenamento bloqueado.
- **Prioridade / Complexidade:** Crítica / Baixa
- **Dependências:** — **∥** · **Pré-requisitos:** —
- **Módulos:** `app/LangContext.tsx` (linhas 57 e 128), opcionalmente `shared/lib/safeStorage.ts`
- **Conclusão:** teste em `LangContext.test.tsx` com `getItem`/`setItem` lançando `SecurityError` passa; nada mais muda de comportamento.
- **Riscos:** baixos.

### F1-04 · Scripts inline de tema protegidos + hash da CSP (MEL-02)

- **Objetivo:** o bootstrap de tema não aborta sem armazenamento.
- **Prioridade / Complexidade:** Alta / Baixa
- **Dependências:** F1-03 · **Pré-requisitos:** `npm run build` local
- **Módulos:** `apps/web/index.html`, `apps/web/projects/codex/readme.html`, `vercel.json`
- **Conclusão:** `try/catch` nos dois scripts (conteúdo idêntico); `node scripts/csp.mjs` executado e hash atualizado no `vercel.json` **no mesmo commit**; `npm run csp:check` verde.
- **Riscos:** esquecer o hash → o tema abre errado quando a CSP for aplicada (o CI acusa).

### F1-05 · `ErrorBoundary` na raiz (MEL-03)

- **Objetivo:** erro de render mostra mensagem bilíngue com ação de recarregar.
- **Prioridade / Complexidade:** Crítica / Baixa
- **Dependências:** F1-03 · **Pré-requisitos:** —
- **Módulos:** `shared/ui/ErrorBoundary/*` (novo), `app/App.tsx`, `shared/lib/translations.json`
- **Conclusão:** teste com componente que lança exibe o fallback; `audit:a11y` e `audit:bundle` verdes.
- **Riscos:** o fallback não pode depender de `LangContext` estar saudável — usar o idioma de `document.documentElement.lang` como reserva.

### F1-06 · Recuperação de chunk ausente após deploy (MEL-03)

- **Objetivo:** aba antiga que pede chunk inexistente recarrega uma vez, depois cai no fallback.
- **Prioridade / Complexidade:** Alta / Baixa
- **Dependências:** F1-05 · **Pré-requisitos:** —
- **Módulos:** `app/routes.tsx` (wrapper `lazyWithRetry`)
- **Conclusão:** teste com `import()` rejeitado: 1 chamada a `location.reload`, segunda falha mostra o fallback.
- **Riscos:** laço de recarga — limitar com marcador em `sessionStorage` (tolerante a falha).

### F1-07 · Lint e tipos das funções no CI (MEL-04)

- **Objetivo:** `api/` protegida pelo CI, não só pelo `verify` local.
- **Prioridade / Complexidade:** Alta / Baixa
- **Dependências:** — **∥** · **Pré-requisitos:** `npm run lint:api` e `npm run type-check:api` verdes localmente
- **Módulos:** `.github/workflows/ci.yml` (job `check`)
- **Conclusão:** os dois passos aparecem no log do CI; erro de tipo proposital em branch de teste reprova.
- **Riscos:** nenhum relevante.

### F1-08 · E2E de `/contato` no CI e verificação de opacidade (MEL-04, P-31)

- **Objetivo:** a regressão de F1-02 não volta sem ser vista.
- **Prioridade / Complexidade:** Alta / Baixa
- **Dependências:** F1-02 · **Pré-requisitos:** —
- **Módulos:** `scripts/lib/browser.mjs` (helper `assertOpaque`), `scripts/e2e-contato.mjs`, `e2e-not-found.mjs`, `e2e-release-notes.mjs`, `e2e-codex.mjs`, `.github/workflows/ci.yml` (job `audit`)
- **Conclusão:** `audit:contato` roda no CI; reverter F1-02 numa branch reprova a auditoria.
- **Riscos:** elementos em transição de reveal — aguardar `transitionend` ou checar após rolar até o elemento.

### F1-09 · Timeout nas chamadas ao GitHub (MEL-07)

- **Objetivo:** funções não ficam penduradas no GitHub.
- **Prioridade / Complexidade:** Alta / Baixa
- **Dependências:** — **∥** · **Pré-requisitos:** —
- **Módulos:** `api/_releases.ts`, `api/github-stats.ts` (ou novo `api/_http.ts` com `githubFetch`)
- **Conclusão:** teste com `fetch` que nunca resolve termina no limite e devolve lista vazia / nulos.
- **Riscos:** limite curto demais; começar com 3 s.

### F1-10 · Não cachear falhas de métricas (MEL-06)

- **Objetivo:** oscilação do GitHub não prende o fallback por horas.
- **Prioridade / Complexidade:** Alta / Baixa
- **Dependências:** F1-09 · **Pré-requisitos:** —
- **Módulos:** `api/github-stats.ts`, `api/github-stats.test.ts` (novo), `shared/hooks/useGithubStats.ts` e teste
- **Conclusão:** `s-maxage=60` quando algum campo é `null`; hook não grava `{null, null}`; testes cobrindo os três casos.
- **Riscos:** mais invocações sob falha longa (limitadas a 1/min por borda).

**Portão de saída da Fase 1:** `npm run verify -- --browser` verde · CI verde com os novos passos · F1-01 a F1-10 fechadas com os critérios acima · deploy validado (ver Fase 7, F7-05, aplicado em versão reduzida).

---

## Fase 2 — Fundação técnica

> Objetivo: reduzir duplicação e acoplamento sem mudar comportamento visível.

### F2-01 · Limpar resíduos da arquitetura anterior (MEL-12)

- **Objetivo:** comentários e configurações descrevem o que existe.
- **Prioridade / Complexidade:** Média / Baixa
- **Dependências:** — · **Pré-requisitos:** —
- **Módulos:** `entradas/comum.tsx`, `main.tsx`, `app/LangContext.tsx`, `app/ThemeContext.tsx`, `.gitignore`, `scripts/qr.diff.md`
- **Conclusão:** `grep -rn "rotaHtmlPlugin\|prerender\|qr.mjs\|apps/desktop\|apps/mobile" --exclude-dir=node_modules --exclude-dir=docs --exclude=CHANGELOG.md .` sem resultados.
- **Riscos:** remover do `.gitignore` algo que ainda é gerado localmente — conferir com `git status` após `npm run build`.

### F2-02 · Consolidar os testes de rotas (P-25)

- **Prioridade / Complexidade:** Baixa / Baixa
- **Dependências:** — **∥**
- **Módulos:** `app/routes.test.ts`, `app/routes.test.tsx`
- **Conclusão:** um arquivo; número de casos de teste igual ou maior que a soma sem duplicatas.
- **Riscos:** perder um caso — comparar a lista de `it(...)` antes/depois.

### F2-03 · Paridade automática entre `verify` e CI

- **Objetivo:** impedir que um portão novo fique só local (causa de P-04).
- **Prioridade / Complexidade:** Média / Baixa
- **Dependências:** F1-07, F1-08
- **Módulos:** teste novo (ex.: `scripts/verify-ci.test.mjs` ou em `shared/config/dependencies.test.ts`), `scripts/verify.mjs`, `.github/workflows/ci.yml`
- **Conclusão:** remover um passo do `ci.yml` reprova o teste; exceções (`audit:perf`, `geometry`) declaradas explicitamente.
- **Riscos:** parsing frágil do YAML — comparar por `npm run <script>` em texto.

### F2-04 · Endurecer o workflow (MEL-14)

- **Prioridade / Complexidade:** Baixa / Baixa
- **Dependências:** — **∥**
- **Módulos:** `.github/workflows/ci.yml`
- **Conclusão:** `permissions: contents: read` e `timeout-minutes` por job; CI verde.
- **Riscos:** algum passo precisar de permissão de escrita (upload de artefato usa o token do runtime, não `contents: write`).

### F2-05 · Utilitários comuns das funções (MEL-10d)

- **Objetivo:** um lugar para tipos Vercel, `esc`, cabeçalhos e `githubFetch`.
- **Prioridade / Complexidade:** Média / Baixa
- **Dependências:** F1-09
- **Módulos:** `api/_http.ts` (novo), `api/*.ts`
- **Conclusão:** nenhuma redeclaração de `VercelRequest` fora de `_http.ts`; `esc` único; testes de `crawler`, `feed`, `og`, `csp-report` verdes.
- **Riscos:** baixo.

### F2-06 · Unificar os hooks de revelação e de movimento (MEL-10a/b)

- **Objetivo:** um hook por responsabilidade; cada widget revela a si mesmo (resolve P-24 e torna F1-02 estrutural).
- **Prioridade / Complexidade:** Média / Média
- **Dependências:** F1-08 (proteção E2E)
- **Módulos:** `shared/hooks/useRevealOnScroll.ts`, `useScrollReveal.ts` (remover), `useReducedMotion.ts`, widgets com `data-reveal`, 10 usos avulsos de `matchMedia`
- **Conclusão:** `useScrollReveal` removido; `prefers-reduced-motion` só no hook; `audit:identity`, `audit:layers` e `geometry.mjs` sem diferença não intencional.
- **Riscos:** mudança sutil de timing do stagger — gravar base de geometria **antes** de começar.

### F2-07 · Um único `getUsedTags` (MEL-10c)

- **Prioridade / Complexidade:** Baixa / Baixa
- **Dependências:** — **∥**
- **Módulos:** `shared/config/releaseNotesModel.ts`, `releaseNotes.ts`, `releaseNotesClient.ts`
- **Conclusão:** uma implementação; testes de `releaseNotes` e `ReleaseNotes` verdes.
- **Riscos:** as duas versões diferem na forma; garantir mesma ordem de saída (ordem de aparição).

### F2-08 · Fonte única de identidade (MEL-09)

- **Objetivo:** nome, usuário, domínio e textos de SEO definidos uma vez.
- **Prioridade / Complexidade:** Média / Média
- **Dependências:** F2-05
- **Módulos:** `shared/config/identity.ts` (novo), `profile.ts`, `api/github-stats.ts`, `api/_releases.ts`, `api/crawler.ts`, `api/feed.ts`, `apps/web/config/homeMetadata.ts`, `index.html`, `vite.config.ts`
- **Conclusão:** `grep` de `"https-shini"` e `"Guilherme Cruz"` em `api/` e `index.html` só encontra o módulo/placeholder; teste compara o JSON-LD gerado com o módulo; e-mail do autor decidido (validação humana nº 5).
- **Riscos:** o builder da Vercel precisa resolver o import — já funciona para `mergeReleaseNotes`; confirmar em preview.

### F2-09 · Migrar textos inline para o sistema de i18n (MEL-11)

- **Objetivo:** um mecanismo de UI (chaves) e um de conteúdo (`Localized`).
- **Prioridade / Complexidade:** Média / Média
- **Dependências:** — (fazer arquivo por arquivo, um commit cada)
- **Módulos:** `pages/Codex/index.tsx`, `widgets/Footer/Footer.tsx`, `RecommendationModal.tsx`, `Featured.tsx`, `CarouselControls.tsx`, `ReleaseAside.tsx`, `Hero.tsx`, `Contact.tsx` e demais (16 arquivos, 100 ocorrências)
- **Conclusão:** `grep -rc 'lang === "pt"' apps/web/src --include=*.tsx` = 0 fora de contextos; regra ESLint impede reintrodução; testes de completude bilíngue verdes.
- **Riscos:** chave faltando num idioma (os testes pegam); textos alterados por engano — revisar o diff de `translations.json`.

### F2-10 · `csp.mjs` reprova handlers inline (MEL-05, parte 3)

- **Objetivo:** o portão de CSP enxerga o problema que bloqueia a aplicação da política.
- **Prioridade / Complexidade:** Alta / Baixa
- **Dependências:** —
- **Módulos:** `scripts/csp.mjs`
- **Conclusão:** com o `onload` atual, `csp:check` **reprova** com mensagem clara — por isso esta tarefa entra com a exceção documentada e temporária para o `onload` das fontes, removida em F3-03.
- **Riscos:** deixar a exceção para sempre — vinculá-la a F3-03 no próprio código.

**Portão de saída da Fase 2:** comportamento visível inalterado (bases de `audit:identity`, `audit:layers`, `a11y-baseline.json` e geometria iguais) · CI verde · INVENTARIO atualizado.

---

## Fase 3 — Performance e otimização

> Regra herdada de `PERFORMANCE-2026-08.md`: **nada entra sem antes/depois medido**; o que não melhorar é revertido e registrado.

### F3-01 · Linha de base de performance

- **Objetivo:** números de referência antes das mudanças.
- **Prioridade / Complexidade:** Alta / Baixa
- **Dependências:** Fase 2 concluída
- **Módulos:** `scripts/perf.mjs`; registro em `docs/reference/PERFORMANCE-AAAA-MM.md`
- **Conclusão:** FCP, LCP, TBT por rota (CPU 4×), commit de referência anotado.
- **Riscos:** variação entre execuções — usar mediana de 5.

### F3-02 · Preload das traduções (MEL-08)

- **Prioridade / Complexidade:** Alta / Média
- **Dependências:** F3-01
- **Módulos:** `apps/web/vite.config.ts` (plugin que injeta `<link rel="preload" as="fetch" crossorigin>`), `entradas/comum.tsx`
- **Conclusão:** uma única requisição ao JSON, iniciada pelo HTML; FCP/LCP melhores em ao menos uma rota sem piora nas outras — ou revertido com o resultado registrado.
- **Riscos:** download duplicado por divergência de `crossorigin`/credenciais.

### F3-03 · Autoalojar Cabinet Grotesk e General Sans (MEL-26)

- **Prioridade / Complexidade:** Média / Média
- **Dependências:** F3-01, **validação humana da licença ITF**
- **Módulos:** `apps/web/index.html`, `projects/codex/readme.html`, `shared/styles/tokens.css`, `src/assets/fonts/` (novo), `vercel.json` (CSP)
- **Conclusão:** zero requisições a `fontshare.com`; `onload` inline removido (exceção de F2-10 apagada); CSP sem hosts do Fontshare; LCP igual ou melhor; `audit:identity` verde.
- **Riscos:** licença; FOUT diferente — conferir em captura.
- **Se a licença não permitir:** substituir o `onload` por script externo mínimo e manter o Fontshare.

### F3-04 · Revisar o orçamento de bundle

- **Prioridade / Complexidade:** Baixa / Baixa
- **Dependências:** F1-05, F1-06, F3-02, F3-03
- **Módulos:** `scripts/bundle-budget.mjs`
- **Conclusão:** tetos recalculados com a folga de ~15% documentada no script, justificativa no commit.
- **Riscos:** afrouxar o teto sem motivo — só se o aumento vier de funcionalidade desta fase.

**Portão de saída da Fase 3:** novo registro de performance com antes/depois · CI verde.

---

## Fase 4 — Melhorias funcionais

### F4-01 · Sitemap sem âncoras (MEL-17 · T03 / issue #12)

- **Prioridade / Complexidade:** Média / Baixa
- **Dependências:** —
- **Módulos:** `apps/web/vite.config.ts` (laço em `SECTION_IDS`)
- **Conclusão:** `dist/sitemap.xml` sem `#`; teste ou script conferindo.
- **Riscos:** nenhum relevante.

### F4-02 · Feed tolerante a datas inválidas (MEL-19)

- **Prioridade / Complexidade:** Baixa / Baixa
- **Dependências:** F2-05 **∥**
- **Módulos:** `api/feed.ts`, `api/feed.test.ts`
- **Conclusão:** entrada com data inválida é omitida com aviso; resposta 200.

### F4-03 · Endurecer `/api/csp-report` (MEL-20)

- **Prioridade / Complexidade:** Baixa / Baixa
- **Dependências:** F2-05 **∥**
- **Módulos:** `api/csp-report.ts`, teste
- **Conclusão:** limites de corpo e de violações por requisição; `\r\n` removidos dos campos; testes.

### F4-04 · Cartões de compartilhamento bilíngues (MEL-18)

- **Prioridade / Complexidade:** Baixa / Baixa
- **Dependências:** F2-08
- **Módulos:** `api/crawler.ts`, `vercel.json` (repassar query), `api/crawler.test.ts`
- **Conclusão:** `?lang=en` gera `lang="en"`, `og:locale=en_US` e textos em inglês.
- **Riscos:** cache da CDN por query — as URLs já diferem pela query, sem conflito.

### F4-05 · `navigate()` preserva o fragmento (MEL-25)

- **Prioridade / Complexidade:** Baixa / Baixa
- **Dependências:** —
- **Módulos:** `app/RouterContext.tsx`, `RouterContext.test.tsx`
- **Conclusão:** `navigate("/#contato")` leva à home e rola até a seção; teste cobre.

### F4-06 · Backend de contato `api/contact.ts` (MEL-15 · issue #45)

- **Objetivo:** formulário funcional, mesma origem, com proteção antiabuso.
- **Prioridade / Complexidade:** Média / Média
- **Dependências:** F1-09, F2-05; **decisão humana do provedor de entrega**
- **Módulos:** `api/contact.ts` (novo) + teste, `shared/config/constants.ts`, `ContactForm.tsx`, `vercel.json` (se precisar de rewrite), variáveis server-only na Vercel, texto de privacidade em `translations.json`
- **Conclusão:** validação no servidor (campos, tamanhos, e-mail), honeypot, limite por IP (429), segredo só no servidor, formulário visível na home e em `/contato`; `connect-src 'self'` continua suficiente.
- **Riscos:** spam, custo, LGPD; limite por IP em função stateless precisa de armazenamento (KV) ou regra de firewall da borda — decidir no desenho.

### F4-07 · Decisão e execução sobre a newsletter (MEL-16)

- **Prioridade / Complexidade:** Média / Média (opção a) · Baixa (opção b)
- **Dependências:** decisão humana; F4-06 se reaproveitar a infraestrutura
- **Módulos:** `widgets/Footer/components/NewsletterForm.tsx` e teste, `translations.json`, `constants.ts`
- **Conclusão:** (a) double opt-in e descadastro funcionando; ou (b) bloco removido sem chaves órfãs e com teste de completude verde.

**Portão de saída da Fase 4:** CI verde · `audit:contato` cobrindo o formulário (se ativo) · README atualizado (variáveis e integrações).

---

## Fase 5 — UX/UI e acessibilidade

### F5-01 · Chips sem afordância falsa (MEL-24 · T05 / issue #14)

- **Prioridade / Complexidade:** Baixa / Baixa
- **Módulos:** `pages/Links/Links.css`
- **Conclusão:** sem `:hover` de elevação em `.linktree__chip`; base de `audit:identity` regravada **intencionalmente** no mesmo commit.

### F5-02 · Fallback visível nas rotas lazy (MEL-22)

- **Prioridade / Complexidade:** Baixa / Baixa
- **Dependências:** F1-06
- **Módulos:** `app/routes.tsx`, `shared/ui/RouteFallback/*` (novo)
- **Conclusão:** fallback aparece com rede estrangulada; sem animação em reduced motion; CLS não piora.

### F5-03 · Feedback completo no formulário (MEL-21)

- **Prioridade / Complexidade:** Baixa / Baixa
- **Dependências:** F4-06
- **Módulos:** `ContactForm.tsx`, `ContactForm.test.tsx`, `ContactForm.css`
- **Conclusão:** foco no primeiro campo inválido, `maxLength` igual ao do backend, contador acessível (`aria-live` polido), texto preservado em erro de rede; testes cobrindo.

### F5-04 · axe em estados interativos (MEL-23 · T19 / issue #29)

- **Prioridade / Complexidade:** Média / Média
- **Dependências:** F4-06 (estado de erro do formulário)
- **Módulos:** `scripts/a11y.mjs`, `docs/reference/a11y-baseline.json`
- **Conclusão:** menu aberto, modal aberto, accordion expandido e formulário em erro auditados nos 2 temas × 2 idiomas, com zero violações.

**Portão de saída da Fase 5:** `audit:a11y` ampliado verde · bases visuais regravadas só onde houve mudança intencional.

---

## Fase 6 — Atualizações tecnológicas e endurecimento da plataforma

### F6-01 · Observação dos relatórios de CSP

- **Objetivo:** confirmar que a política está calibrada antes de aplicá-la.
- **Prioridade / Complexidade:** Alta / Baixa
- **Dependências:** F3-03 (ou alternativa), F2-10, F4-06 · **Pré-requisitos:** deploy em produção
- **Módulos:** logs de `/api/csp-report` (painel da Vercel)
- **Conclusão:** 7 dias consecutivos sem violações de origem própria; violações de extensões de navegador classificadas e ignoradas.

### F6-02 · Promover a CSP para aplicada (T17 / issue #27)

- **Prioridade / Complexidade:** Alta / Baixa
- **Dependências:** F6-01
- **Módulos:** `vercel.json` (`Content-Security-Policy` no lugar de `-Report-Only`, mantendo `report-uri`/`report-to`)
- **Conclusão:** todas as auditorias de navegador verdes contra o preview com o header aplicado; produção sem violações novas em 48 h.
- **Riscos:** quebra parcial em navegador não coberto — plano de rollback: reverter o commit (volta ao Report-Only em um deploy).

### F6-03 · Atualizações automatizadas (MEL-27)

- **Prioridade / Complexidade:** Média / Baixa
- **Dependências:** F2-03 (CI completo como portão)
- **Módulos:** `.github/dependabot.yml` (novo)
- **Conclusão:** grupos por ecossistema (npm, actions), agenda semanal, exceções documentadas para `vite`, `@vitejs/plugin-react`, `esbuild` e `typescript` da raiz; primeiro ciclo integrado pelo fluxo de merge local do `CONTRIBUTING.md`.
- **Riscos:** volume de PRs — agrupar e limitar a 5 abertos.

### F6-04 · Atualizar as dependências fixadas, uma por vez

- **Prioridade / Complexidade:** Baixa / Média
- **Dependências:** F6-03, F3-01 (linha de base)
- **Módulos:** `apps/web/package.json`, `package-lock.json`
- **Conclusão:** cada salto (vite, plugin-react, esbuild) em commit próprio, com `audit:bundle`, `audit:perf` e bases visuais comparados.
- **Riscos:** mudança de saída do minificador/bundler — por isso uma por vez.

**Portão de saída da Fase 6:** CSP aplicada e estável · `npm audit --audit-level=low` limpo · bot de atualização ativo.

---

## Fase 7 — Testes e validação

### F7-01 · Testes de unidade dos módulos sem cobertura direta

- **Prioridade / Complexidade:** Média / Média
- **Dependências:** Fases 1–2
- **Módulos:** `widgets/Contact/Contact.tsx`, `widgets/Timeline/Timeline.tsx` e componentes, `widgets/Footer/Footer.tsx`, `pages/Contact`, `pages/LinkedInNotice`, `pages/Codex`, hooks `useDocumentMeta`, `useFocusTrap`, `useLinkProps`
- **Conclusão:** cada módulo com ao menos um teste de comportamento (não de snapshot); `npm test` verde.

### F7-02 · Testes das funções que faltam

- **Prioridade / Complexidade:** Média / Baixa
- **Dependências:** F1-10, F2-05
- **Módulos:** `api/github-stats.test.ts` (se não criado em F1-10), `api/release-notes.test.ts`
- **Conclusão:** cada arquivo público de `api/` com teste.

### F7-03 · Regravar e conferir as bases de regressão visual

- **Prioridade / Complexidade:** Média / Baixa
- **Dependências:** Fases 2, 3, 5
- **Módulos:** `docs/reference/identity-baseline.json`, `a11y-baseline.json`, base do `geometry.mjs`
- **Conclusão:** bases regravadas **somente** após revisão humana das diferenças, com o motivo no commit.

### F7-04 · Validação completa local

- **Prioridade / Complexidade:** Alta / Baixa
- **Dependências:** todas as tarefas da fase anterior concluída
- **Módulos:** —
- **Conclusão:** `npm ci --include=dev && npm run verify -- --browser` verde, saída anexada à issue de fechamento da fase.

### F7-05 · Validação em produção (smoke test)

- **Prioridade / Complexidade:** Alta / Baixa
- **Dependências:** deploy da fase
- **Módulos:** —
- **Conclusão:** checklist preenchido para cada deploy de fase:
    - `/`, `/links`, `/contato`, `/release-notes`, `/release-notes/v2.0.0`, `/projects/codex/readme.html`, `/linkedin`, rota inexistente — carregam, com conteúdo visível, nos 2 temas e com `?lang=en`;
    - `/feed.xml` válido; `/sitemap.xml` e `/robots.txt` presentes;
    - prévia de compartilhamento (ex.: depurador de cartões de uma rede social) de `/links` e de uma versão;
    - headers de segurança presentes (`curl -I https://gcruz.dev.br`);
    - logs das funções sem erros novos.

### F7-06 · Atualizar a documentação da fase

- **Prioridade / Complexidade:** Média / Baixa
- **Dependências:** F7-05
- **Módulos:** `README.md`, `docs/INVENTARIO_TECNICO.md`, este roadmap (status), `CHANGELOG.md` via `npm run changelog` quando houver versão
- **Conclusão:** nenhuma afirmação do README contradita pelo código (revisão com a lista de P-14).

---

## Fase 8 — Evolução futura

### F8-01 · Analytics sem cookies e Web Vitals de campo (MEL-29 · T10/T11)

- **Prioridade / Complexidade:** Média / Média
- **Dependências:** F6-02 (CSP liberando o provedor), decisão humana do provedor
- **Conclusão:** os 5 eventos do T11 visíveis no painel; aviso de privacidade publicado.

### F8-02 · Coleta de erros do cliente

- **Prioridade / Complexidade:** Média / Baixa
- **Dependências:** F1-05, F2-05
- **Módulos:** `api/client-error.ts` (novo, mesmo padrão de `csp-report.ts`), `ErrorBoundary`
- **Conclusão:** erro provocado em preview aparece no log da função, sem dados pessoais.

### F8-03 · Checklist de rota nova em `docs/guides/`

- **Prioridade / Complexidade:** Média / Baixa
- **Conclusão:** guia com os passos (`ROUTES` → `routes.tsx` → `vercel.json` SPA + crawler → sitemap → `crawler.ts` → `useDocumentMeta` → E2E no CI) e, se possível, teste que cruze `ROUTES` com `vercel.json` e com o sitemap.

### F8-04 · Estudos de caso `/case/[slug]` (MEL-30 · T12–T14)

- **Prioridade / Complexidade:** Média / Alta
- **Dependências:** F2-08, F2-09, F8-03

### F8-05 · Página `/servicos` (MEL-30 · T15)

- **Prioridade / Complexidade:** Média / Média
- **Dependências:** F8-04

### F8-06 · Avaliação de React 19 (MEL-28)

- **Prioridade / Complexidade:** Baixa / Média
- **Dependências:** F6-03
- **Conclusão:** relatório com bundle, `audit:perf`, testes e esforço; decisão registrada (adotar ou adiar).

---

## Estratégia de implementação futura

### 1. Incrementos pequenos e isolados

- **Uma tarefa = um commit** (ou um PR com squash), com mensagem Conventional Commits e `Closes #N`/`Refs #N`, como já exige o `CONTRIBUTING.md`.
- Nenhuma tarefa mistura refatoração com mudança de comportamento. Ex.: F2-06 (refatorar reveal) só começa depois de F1-02 (corrigir `/contato`) estar em produção.

### 2. Preservação de funcionalidades e compatibilidade

- **Nada é removido sem tarefa própria**, justificativa e verificação dos consumidores (`grep` + testes). Remoções previstas aqui: `useScrollReveal` (substituído), comentários e entradas obsoletas, e — só se decidido — o bloco de newsletter.
- URLs públicas são contrato: `/links`, `/contato`, `/release-notes/*`, `/projects/codex/readme.html`, `/feed.xml`, `?lang=en`. Qualquer mudança de rota exige redirect no `vercel.json`.
- Chaves de `localStorage` (`portfolio-theme`, `portfolio-lang`) não mudam de nome.

### 3. Versionamento

- SemVer no `package.json` (as duas) e em `releaseNotes.json`, já amarrados por teste.
- Sugestão: Fases 1–2 → `2.0.x` (correções e refatoração sem mudança visível); Fases 3–5 → `2.1.0`; CSP aplicada e novas páginas → `2.2.0`+.
- `npm run changelog` a cada versão; release publicada no GitHub para alimentar `/release-notes`.

### 4. Estratégia de branches

- O `CONTRIBUTING.md` define **commit direto na `main`** com verificação local completa. Para as Fases 1–3, que tocam caminhos críticos, recomenda-se **branch + PR** para ganhar o preview da Vercel e o CI antes da `main`, mantendo o **merge local com squash** prescrito pelo projeto (nunca pelo botão do GitHub).
- Nome sugerido: `fase-N/<id>-<resumo>` (ex.: `fase-1/f1-02-contato-visivel`).

### 5. Testes automatizados

- Cada tarefa traz o teste que prova o critério de aceite **no mesmo commit**.
- Correção de defeito começa por um teste (ou auditoria) que falha.
- O CI deve reproduzir o `verify -- --browser` (F1-07, F1-08, F2-03).

### 6. Revisão de código

- `CODEOWNERS` já existe; em PRs, revisar com o template de `.github/pull_request_template.md`.
- Para mudanças visuais, anexar captura antes/depois e a saída de `audit:identity`.

### 7. Migrações de dados

- Não há banco. As "migrações" são de **formato de conteúdo** (`translations.json`, `releaseNotes.json`, `*.data.ts`). Regra: mudar o formato junto com o leitor e o teste de completude no mesmo commit; nunca deixar duas formas convivendo.
- Se um backend de contato/newsletter armazenar dados, documentar retenção, base legal e exclusão antes de ir para produção.

### 8. Plano de rollback

| Tipo de mudança             | Como reverter                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------- |
| Código do site              | "Promote" do deploy anterior no painel da Vercel (instantâneo), depois `git revert` |
| `vercel.json` (headers/CSP) | `git revert` do commit; deploy volta ao estado anterior                             |
| Função serverless           | idem; funções são versionadas com o deploy                                          |
| Variáveis de ambiente       | restaurar o valor anterior no painel e redeploy                                     |
| Conteúdo (JSON)             | `git revert`                                                                        |

### 9. Validação após cada fase

- Portão de saída da fase (descrito ao fim de cada fase) + F7-04 (verify completo) + F7-05 (smoke em produção).
- Só iniciar a fase seguinte com o portão verde.

### 10. Documentação contínua

- Toda tarefa que mude comando, variável, rota ou integração atualiza o `README.md` no mesmo commit.
- `docs/INVENTARIO_TECNICO.md` é revisado ao fim de cada fase.
- Medições e decisões vão para `docs/reference/` (congelado); regras e processos, para `docs/guides/` (vivo), seguindo `docs/README.md`.

---

## Acompanhamento

| Fase | Status       | Início | Fim | Observações                  |
| ---- | ------------ | ------ | --- | ---------------------------- |
| 1    | Não iniciada |        |     |                              |
| 2    | Não iniciada |        |     |                              |
| 3    | Não iniciada |        |     |                              |
| 4    | Não iniciada |        |     |                              |
| 5    | Não iniciada |        |     |                              |
| 6    | Não iniciada |        |     |                              |
| 7    | Contínua     |        |     | aplicada ao fim de cada fase |
| 8    | Não iniciada |        |     |                              |
