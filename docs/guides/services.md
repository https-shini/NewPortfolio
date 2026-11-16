# GCRUZ Services — histórico da implementação inicial

> Esta página registra a revisão anterior. Para a arquitetura atual com
> `/servicos` e `/orcamento`, consulte [a reformulação estratégica](services-strategy.md).

## Diagnóstico e escopo

A implementação foi conferida no código atual: React 18, TypeScript, Vite 5,
roteador próprio baseado na History API, LangContext, ThemeContext, tokens CSS,
Cabinet Grotesk, JetBrains Mono, useDocumentMeta e Vitest. A página anterior
tratava principalmente de sites. Esta revisão amplia a oferta sem substituir
roteador, Design System ou integração de contato e sem novas dependências npm.

A página apresenta 12 seções: hero, categorias, planos web, avulsos, pacotes
empresariais, personalização e simulador, projetos e experiência, indicações e
parcerias, processo, FAQ, formulário e CTA final. O Header e Footer continuam
compartilhados; a navegação contextual usa âncoras com compensação do header.

## Conteúdo verificado

O currículo `apps/web/public/docs/Curriculo_PTBR.pdf` foi lido integralmente por
extração de texto. Confirma desenvolvimento web, suporte a sistemas empresariais,
CNAB, rotinas financeiras/faturamento, treinamento e SQL. A descrição não utiliza
dados pessoais de endereço nem informações confidenciais de empregadores.

Fontes complementares: `widgets/Timeline/Timeline.data.ts`,
`widgets/Featured/Featured.data.ts`, `widgets/Work/Work.tsx` e a apresentação local
Codex. Codex e Web Chat estão identificados como projetos pessoais/acadêmicos,
sem alegação de contratação comercial ou resultados de clientes. A stack do
Auth Service diverge entre currículo e Work; por isso não fundamenta uma afirmação
específica nesta página. O PDF foi usado como fonte textual, sem edição visual.

## Catálogo e estimativa

`shared/config/serviceCatalog.ts` concentra modelos e configurações para:

- Seis categorias com descrições, exemplos e limites.
- Três planos web: Express, Profissional e Premium.
- Quatorze serviços avulsos e uma opção de desenvolvimento sob orçamento.
- Quatro pacotes empresariais.
- Onze adicionais, agrupados entre web e serviços técnicos.
- Condições comerciais, créditos e faixa de comissão de parceiros.

Cards, simulador e resumo do formulário consomem o mesmo catálogo. Valores
compartilhados derivam de uma fonte, inclusive hora adicional e Presença Digital.
Todas as moedas usam BRL com formatação pt-BR, também na interface em inglês.

O cálculo aceita um principal, filtra IDs incompatíveis, ignora duplicatas e
itens incluídos, limita horas a inteiros positivos até o máximo configurado e
separa o subtotal pontual da manutenção mensal. Trocar principal limpa adicionais
anteriores. Preço desconhecido permanece sob orçamento; não há desconto ou
pagamento. No Premium, páginas, seções, formulários e revisões dependem do escopo
confirmado e não entram novamente como extras automáticos.

A seleção fica no estado da página e é compartilhada pelo simulador e formulário.
Navegar entre seções, idiomas ou tipos de interesse não apaga o nome e o briefing.
Recarga ou saída da página descarta os dados; não há persistência de informações
pessoais. Alterar uma seleção invalida um rascunho de e-mail preparado anteriormente.

## Indicação e parceria

A interface explica faixas de crédito e comissão, condições de pagamento integral,
identificação prévia, vedação de autoindicação e de acumulação, cancelamentos e
proteção dos dados de terceiros. Os CTAs selecionam o tipo de interesse no
formulário. A indicação pede uma descrição sem dados pessoais de terceiros;
a parceria pede informações sobre a atuação do interessado.

Não há afiliados, cálculo de pagamentos, comissões automáticas ou controle de
créditos. O regulamento completo e o acordo de parceria precisam ser formalizados
antes de aplicar benefícios. A página informa essa condição explicitamente.

## Formulário e variáveis

Nome, e-mail, descrição e aceite de privacidade são obrigatórios. Orçamentos
exigem a seleção de um serviço; indicação e parceria não exigem plano.
WhatsApp, empresa e prazo são opcionais.

Sem endpoint compatível, o formulário prepara um e-mail para `contato@gcruz.dev.br`.
O visitante revisa e confirma no aplicativo de e-mail, ou copia o texto para o
webmail. A página não anuncia envio concluído. A abertura depende do cliente de
e-mail configurado; o texto selecionável e a cópia são alternativas explícitas.

`VITE_FORM_ENDPOINT` só é reutilizado para URLs `https://formspree.io/f/ID`.
O contrato existente continua enviando JSON com `name`, `email`, `message` e
`_gotcha`. Tipo de interesse, seleção, valores estimados e aceite entram em texto
no campo `message`. Há validação, limites de tamanho, honeypot, bloqueio de duplo
envio e timeout. Erros preservam o briefing. Confirmação HTTP significa recebimento
pelo serviço, não entrega/leitura na caixa de e-mail.

Referências do adaptador já verificado:
[AJAX](https://formspree.io/blog/formspree-ajax/) e
[honeypot](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering/).
Sem endpoint próprio, filtragem e validação no servidor dependem do provedor.
Antes de ativar envio direto, confirmar destinatário, limites, anti-spam, retenção
e entrega real com uma submissão autorizada. Não foram enviados dados reais.
A CSP atual é Report-Only com connect-src self; avaliar a origem Formspree antes
de torná-la obrigatória.

`VITE_BUSINESS_WHATSAPP` é opcional e exige número exclusivamente comercial E.164.
Ausente ou inválido: CTA por e-mail. Nenhum número pessoal é utilizado. Variáveis
VITE são públicas, sem segredos, e exigem novo build após alteração.

## SEO e integração

Metadados bilíngues, canonical português, hreflang, sitemap, schema Service e
Open Graph refletem a oferta ampliada. O build mantém `services.html`, servido
pela Vercel na rota pública `/servicos`; crawlers recebem HTML próprio em
`api/crawler`. O cartão de `api/og?page=services` acompanha o novo posicionamento.
O preview Vite usa fallback SPA; a regra da Vercel deve ser validada após deploy.

## Arquivos desta revisão

Criados:

- `apps/web/src/shared/config/serviceCatalog.ts`
- `apps/web/src/shared/config/serviceCatalog.test.ts`
- `apps/web/src/pages/Services/Estimate.tsx`
- `apps/web/src/pages/Services/selectionSummary.ts`

Atualizados:

- `apps/web/src/pages/Services/index.tsx`
- `apps/web/src/pages/Services/content.ts`
- `apps/web/src/pages/Services/QuoteForm.tsx`
- `apps/web/src/pages/Services/Services.css`
- `apps/web/src/pages/Services/Services.test.tsx`
- `apps/web/src/shared/config/services.ts`
- `api/og.ts` e `api/crawler.test.ts`
- `scripts/e2e-services.mjs`
- `README.md` e este guia

Rotas, regras de Vercel, hook de metadados, contato, Header/Footer e variáveis
existentes foram preservados. O workspace já continha alterações extensas;
a lista identifica os pontos desta revisão, não a autoria de todo o diff.

## Como validar e lançar

```sh
npm run type-check
npm run lint
npm run test --workspace apps/web -- --pool=forks --maxWorkers=2
npm run build
npm run preview --workspace apps/web -- --host 127.0.0.1
```

Executar `node scripts/e2e-services.mjs` com BASE_URL apontando para o preview.
No Windows, PW_CHROMIUM_PATH pode apontar para o Chromium instalado pelo Playwright.
Testar seleções, adicionais, manutenção, quantidade de horas, serviços sob orçamento,
indicação, parceria, aceite e e-mail em PT/EN e nos dois temas.

Somente após autorização: publicar e conferir acesso direto/refresh em `/servicos`,
metadados sem JavaScript, crawler, Open Graph, sitemap e 404. Confirmar o número
comercial se necessário e formalizar regulamento/acordos do programa. Sem essas
configurações opcionais, o contato por e-mail continua disponível. Não houve deploy,
alteração de serviços externos, teste de entrega real ou medição Lighthouse.

## Resultados da validação desta revisão — 01/11/2026

Ambiente: Windows 11, Node 24.11.1, Vite preview local. Auditoria final com
Chromium Playwright 1248; nenhuma medição em produção.

| Verificação                             | Resultado                                                                                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Typecheck                               | Passou                                                                                                                                                 |
| Lint                                    | Zero erros; um aviso preexistente de Fast Refresh em app/routes.tsx                                                                                    |
| Prettier dos arquivos desta revisão     | Passou                                                                                                                                                 |
| Build de produção                       | Passou; chunk de serviços lazy de aproximadamente 18,42 kB gzip                                                                                        |
| Testes focados                          | 44 testes passaram                                                                                                                                     |
| Suíte completa final, forks e um worker | 452 testes em 53 arquivos passaram                                                                                                                     |
| Auditoria Chromium                      | 12 perfis: PT/EN × claro/escuro × 360/768/1440                                                                                                         |
| Acessibilidade e layout                 | Zero violações WCAG A/AA no main e zero overflow nos 12 perfis                                                                                         |
| Interações                              | FAQ por teclado, simulador, incompatibilidades, mensalidade, preservação de briefing, indicação, parceria, consentimento e fallback de e-mail passaram |
| Integração                              | Navegação interna, recarga, 404, imagem real carregada, SEO estático e sitemap passaram                                                                |
| Verificação complementar                | Página inteira, com Header/Footer e simulador preenchido, passou em axe e sem erros no console no desktop escuro e celular claro                       |

A primeira suíte completa com dois workers teve uma falha de tempo/fechamento no
teste existente ProfileLink (modal do LinkedIn). O teste isolado passou sem
alterações; a suíte completa sequencial também passou. A captura complementar
com Chromium 1243 foi interrompida pelo encerramento do browser. A auditoria
final com Chromium 1248 e capturas de viewport terminou normalmente. Nenhuma
regra foi desabilitada para obter esses resultados.

Artefatos finais: `artifacts/services/hero-pt-dark-1440.png`,
`hero-pt-light-360.png`, `simulator-dark-1440.png`, `simulator-light-360.png` e
`audit.json`. Capturas de página inteira da primeira rodada são auxiliares;
os arquivos hero/simulator são as evidências finais revisadas.

Pendências para lançamento: autorização de deploy; validação das regras reais
da Vercel após publicação; número comercial caso desejado; confirmação do
destinatário e entrega de ponta a ponta caso o Formspree seja ativado; regulamento
completo e acordos aplicáveis antes da concessão de benefícios. Lighthouse não
foi executado. Nenhum pagamento, comissão ou envio real foi realizado.
