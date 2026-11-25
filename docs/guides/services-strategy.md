# Serviços e orçamento — reformulação de 01/11/2026

> **Registro da reformulação.** Os caminhos de build citados abaixo
> (`services.html`, `quote.html`, `config/servicesMetadata.ts`, Vite 5) são os
> da época. Na consolidação de 08/11/2026 a integração passou para a
> arquitetura atual; ver [servicos-integracao.md](servicos-integracao.md). A
> política comercial, os textos e as regras descritos aqui continuam valendo.

## Diagnóstico e decisão

A auditoria confirmou React 18, TypeScript, Vite, roteador próprio, LangContext,
ThemeContext, tokens semânticos, Cabinet Grotesk, JetBrains Mono, ícones SVG,
Accordion e Vitest. A implementação anterior reunia apresentação, simulador e
formulário em `/servicos`. As capturas iniciais chegaram a 21.209 px de altura
em 360 px no tema escuro; não havia overflow horizontal nos seis perfis iniciais.

Foram preservados identidade, Header/Footer, integração de contato, modelos,
valores e condições comerciais. A orientação final de preservar preços prevalece
sobre as propostas divergentes de novos valores e desconto de indicação.

## Entrega

`/servicos` apresenta 12 seções: hero, soluções, planos web, site personalizado,
adicionais/avulsos/pacotes, TI personalizada, manutenção, diferenciais e experiência,
processo, indicações, FAQ e CTA final. Detalhes complementares são expansíveis;
preços dos planos e manutenção ficam visíveis. Nenhum plano é anunciado como
mais vendido, nem há clientes ou resultados inventados.

`/orcamento` recebe seleções por IDs públicos na URL e reutiliza o simulador e o
formulário. Nome, e-mail, briefing e outros dados pessoais permanecem somente em
memória. A recarga recupera a seleção de entrada da URL, mas não o briefing ou
alterações posteriores na seleção. Alterar a seleção invalida o rascunho anterior.

Exemplos:

- `/orcamento?service=express`
- `/orcamento?service=bespoke-website`
- `/orcamento?service=custom-it`
- `/orcamento?addon=maintenance`
- `/orcamento?interest=referral`
- `/orcamento?interest=partner&lang=en`

IDs desconhecidos são ignorados; adicionais incompatíveis ou já incluídos não
entram na estimativa. A opção “somente adicionais” é um modo de solicitação, não
um pacote com preço novo: mostra referências e mensalidades, mantendo o total sob
consulta até avaliar o projeto existente. Exige ao menos um adicional selecionado.

## Política comercial preservada

Fonte única: `apps/web/src/shared/config/serviceCatalog.ts`.

| Grupo               | Valores preservados                                                                                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Planos              | Express R$ 990; Profissional R$ 1.500; Premium R$ 2.200                                                                                                                                                                                                |
| Avulsos             | Diagnóstico R$ 149; consultoria R$ 249; suporte R$ 120/h; e-mail R$ 250; SQL R$ 350; arquivos R$ 250; script R$ 450; API R$ 650; diagnóstico funcional R$ 249; processos R$ 350; CNAB R$ 450; treinamento R$ 150/h; equipe R$ 350; documentação R$ 250 |
| Pacotes             | Presença Digital R$ 1.500; Diagnóstico Empresarial R$ 349; Processos e Produtividade R$ 790; Treinamento Operacional R$ 490                                                                                                                            |
| Adicionais pontuais | Página R$ 350; seção R$ 150; formulário R$ 250; DNS R$ 150; analytics R$ 250; revisão R$ 150; suporte R$ 120; treinamento R$ 150; documentação R$ 200; conta de e-mail R$ 100                                                                          |
| Recorrente          | Manutenção programada a partir de R$ 149/mês                                                                                                                                                                                                           |
| Indicações          | Créditos R$ 30 / R$ 75 / R$ 150 nas faixas existentes; parceiros 10%–15% conforme acordo                                                                                                                                                               |

São preços iniciais e unidades/limites do catálogo, sujeitos à proposta. Mantidos
50% na contratação e 50% após aprovação, antes da publicação, exclusões,
compatibilidades, revisões e condições contratuais. Não foram criados planos de
R$ 99/R$ 249 nem desconto de 10%. Os dois novos serviços personalizados ficam
**sob consulta**, com viabilidade, escopo, prazo e investimento alinhados por e-mail.

O teste `commercialPolicy.test.ts` compara todos os registros anteriores,
incluindo escopos e exclusões, com uma cópia anterior à reformulação. Alterar essa
referência exige aprovação comercial explícita; não atualizá-la automaticamente.

## Arquitetura e arquivos (na época)

- `pages/Services/index.tsx`, `presentation.ts`, `Services.css`: composição comercial.
- `pages/Quote/`: página de solicitação, formulário, estimativa, resumo e adaptador de contato migrados.
- `shared/config/serviceCatalog.ts`: catálogo existente e duas modalidades sem preço.
- `shared/config/quote.ts`: URLs, validação de IDs, modo avulso e metadados.
- `shared/config/servicesContent.ts`: traduções e condições compartilhadas.
- `shared/ui/Commercial/Commercial.css`: estilos reutilizados nas duas páginas.
- `shared/hooks/useCommercialMeta.ts`: schema, imagens sociais e hreflang por página.
- `app/RouterContext.tsx`, `app/routes.tsx`, `shared/config/routes.ts`, `links.ts`: rota lazy e parâmetros sem contaminar o pathname.
- `widgets/Header/Header.css`: espaçamento em até 360 px para manter os controles e o menu dentro da tela, preservando alvos de toque.
- `config/servicesMetadata.ts`, `vite.config.ts`, `vercel.json`: HTML estático de entrada e rewrites explícitos.
- Testes de páginas, roteador, catálogo, política comercial, URLs e SEO; `scripts/e2e-services.mjs`.

Nenhuma dependência nova. `/servicos` mantém canonical, sitemap, Open Graph e
crawler existentes. `/orcamento` usa canonical próprio, WebPage e `noindex, follow`
para não indexar combinações de seleção; por isso não foi incluído no sitemap.
Rotas desconhecidas continuam na 404.

## Envio real e configuração

Sem endpoint compatível, o formulário **prepara um rascunho**, dirigido a
`contato@gcruz.dev.br`. O visitante precisa enviá-lo pelo aplicativo de e-mail ou
copiar o texto para o webmail. Preparar ou abrir o rascunho não significa envio.

Foi preservado o adaptador de `VITE_FORM_ENDPOINT` para
`https://formspree.io/f/ID`. O payload continua `name`, `email`, `message`,
`_gotcha`; seleção e contexto são serializados no texto. Há validação, limites,
honeypot, timeout, bloqueio de envio duplicado e estados acessíveis. A resposta
HTTP confirma recebimento pelo provedor, não entrega/leitura da caixa postal.

`VITE_BUSINESS_WHATSAPP` é opcional, exclusivamente comercial, em E.164.
Sem número válido, o canal alternativo é e-mail. Nenhum telefone pessoal foi usado.
Variáveis `VITE_*` são públicas: não colocar segredos. Mudanças exigem novo build.

Não foram implementados SMTP, upload, pagamento, confirmação automática ao
cliente nem compromisso de resposta em 24 horas úteis. Referências podem entrar
na descrição; anexos seguem pela conversa de e-mail. Nada foi enviado a terceiros.

## Validação e lançamento (na época)

A auditoria de navegador usou 12 perfis (PT/EN × claro/escuro × 360/768/1440),
as duas páginas, catálogo expandido, axe na página inteira, navegação, teclado,
CTAs, recarga, compatibilidade de adicionais, rascunho, imagem real, 404 e SEO
estático. Não envia formulário para serviços externos.

Resultados de 01/11/2026 (Windows, Node 24.11.1, Vite 5.4.21, Vitest 4.1.12,
Chromium 1248): TypeScript e lint aprovados, 463 testes em 56 arquivos, política
comercial preservada, build com as duas entradas, 12 perfis sem overflow e sem
violações automatizadas WCAG A/AA. Correções feitas na época: texto visível em
painéis fechados, botão longo do orçamento em inglês a 320 px e espaçamento do
cabeçalho em 320 px (alvos de toque de 44 × 44 px preservados).

Antes do lançamento, autorizar deploy e conferir rewrites/refresh na Vercel real.
Se ativar Formspree, confirmar destinatário, regras do provedor e entrega com
uma submissão autorizada. Formalizar regulamento de indicação e acordos antes
de conceder créditos/comissões. SMTP e prazo de resposta dependem de uma etapa
posterior. Não houve deploy, medição Lighthouse ou aferição de Core Web Vitals
de usuários reais nesta revisão.
