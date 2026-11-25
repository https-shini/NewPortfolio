# Serviços e orçamento na arquitetura atual

> **Data:** 2026-11-08 · **Base:** `claude/magical-wright-vg8w88` (`2e4476d`)
> mais o trabalho comercial da pasta local (base `8fe781f`).
> Política comercial e textos: [services-strategy.md](services-strategy.md).

`/servicos` e `/orcamento` são páginas nativas: entram pelo mesmo roteador,
pelo mesmo `ErrorBoundary` + `Suspense` + `lazyComRetry` das demais, ganham
documento HTML próprio no build e passam pelas mesmas auditorias de navegador.

## Onde cada coisa mora

| Responsabilidade                         | Arquivo                                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| Endereços                                | `apps/web/src/shared/config/routes.ts` (`ROUTES.SERVICES`, `ROUTES.QUOTE`)                    |
| Página por rota                          | `apps/web/src/app/routes.tsx` (lazy, `QuotePage` com `key` pela query)                        |
| Catálogo, preços e regras                | `apps/web/src/shared/config/serviceCatalog.ts`                                                |
| Textos bilíngues e FAQ                   | `apps/web/src/shared/config/servicesContent.ts`, `pages/Services/presentation.ts`             |
| URL de orçamento e metadados             | `apps/web/src/shared/config/quote.ts`, `services.ts`                                          |
| Metadados no cliente (JSON-LD, hreflang) | `apps/web/src/shared/hooks/useCommercialMeta.ts`                                              |
| HTML estático por rota                   | `apps/web/config/routeHtml.ts` → `dist/rotas/servicos.html`, `orcamento.html`                 |
| Reescritas e crawler                     | `vercel.json`, `api/crawler.ts` (`COMERCIAL`), `api/og.ts` (`page=services`)                  |
| Estilos                                  | `shared/ui/Commercial/Commercial.css`, `pages/Services/Services.css`, `pages/Quote/Quote.css` |
| Entrada no site                          | rodapé (coluna Páginas) e botão na home antes do Contato                                      |

## Decisões desta integração

- **HTML por rota em vez de `services.html`/`quote.html`.** O remoto já gera um
  documento por rota em `dist/rotas/`. O gerador ganhou campos opcionais
  (`robots`, `image`, `jsonLd`, `alternates`) e as duas rotas usam o mesmo
  mecanismo das outras. `config/servicesMetadata.ts` deixou de existir.
- **Textos comerciais continuam em módulo tipado, não em `translations.json`.**
  O JSON guarda chaves curtas de interface; o conteúdo comercial é estruturado
  (listas, tabelas, regras) e tipado com `Localized<T>`, como os `*.data.ts`
  dos widgets. Só a chave de navegação `nav.services` entrou no JSON.
- **Crawler com textos repetidos e teste de paridade.** A função é compilada
  fora do build do frontend; `api/crawler-commercial.test.ts` reprova se os
  textos divergirem de `SERVICE_META`/`QUOTE_META`.
- **Roteador:** a versão local foi adotada. `navigate` lê o destino como URL,
  entrega query e fragmento, recusa outra origem e expõe `search`, que a
  `/orcamento` usa para remontar quando a seleção muda.
- **`/orcamento` é `noindex`** e fica fora do sitemap; `/servicos` entra.
- **Fixture da política comercial** (`fixtures/commercial-policy.json`)
  regenerada do catálogo, que é idêntico ao da pasta local; o teste continua
  sendo a trava contra mudança de preço sem decisão explícita.
- **Correção:** `quoteUrl` usava `URLSearchParams.size`, ausente antes do
  Safari 17 e do Chrome 113; agora usa `toString()`, com teste de regressão.

## Validação

```sh
npm run verify            # portões estáticos
npm run audit:services    # E2E: 12 perfis, axe, teclado, simulador, SEO
```

`scripts/lib/browser.mjs` inclui `/servicos` e `/orcamento?service=express`
em `ROUTES`, então axe, overflow, camadas e geometria também passam por elas.
As capturas do E2E vão para `AUDIT_OUT` (padrão: pasta temporária), fora do
repositório.

## Pendências que não são de código

- Decidir se a tabela de preços fica pública (a auditoria de 08/2026 recomendava
  não publicar preços num portfólio de candidato).
- Formalizar regulamento de indicação e acordo de parceria antes de conceder
  créditos ou comissões.
- Se ativar o Formspree: incluir `https://formspree.io` em `connect-src` e
  `form-action` na CSP antes de torná-la obrigatória, e testar uma entrega real.
