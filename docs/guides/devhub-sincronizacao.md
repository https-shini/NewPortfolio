# DevHub — sincronização com o GitHub e cache persistente

A seção de projetos (home, `/projetos` e `/projetos/:nome`) mostra os
repositórios públicos do GitHub. Os dados chegam por uma sincronização no
servidor e ficam guardados num store persistente. Quem visita o site lê esse
store e nunca dispara uma consulta ao GitHub.

```
GitHub ──(de hora em hora)──▶ /api/devhub-sync ──▶ Vercel Blob (privado)
                                                        │
             home · /projetos · /projetos/:nome ◀── /api/devhub
```

## Fonte dos dados

| Dado                                                                                       | Origem no GitHub                                                    |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Vitrine da home e atalho "Fixados"                                                         | `pinnedItems` (GraphQL): os repositórios fixados                    |
| Catálogo e métricas                                                                        | `repositories` (GraphQL, paginado) + `followers`                    |
| Nome, descrição, tópicos, link do repositório                                              | `name`, `description`, `repositoryTopics`, `url`                    |
| Botão "Acessar projeto"                                                                    | `homepageUrl`: o botão some se o campo for vazio ou não for http(s) |
| README, linguagens, estatísticas, releases, deployments, branches, commits, contribuidores | coletados por repositório e gravados à parte                        |

O GitHub é a única fonte desses metadados. Para mudar o texto ou o link de um
projeto, edite o repositório no GitHub (About → Website e Topics). A mudança
aparece na sincronização seguinte. `PROJECT_URLS` (`links.ts`) não interfere
nos cartões: ele só alimenta o rodapé e as rotas internas, como `codex`.

Tópicos e linguagens aparecem separados. As linguagens são as detectadas pelo
GitHub. Os tópicos são os cadastrados, com nome padronizado e sem repetir uma
linguagem já detectada.

## Agendamento

- `vercel.json` → `crons: [{ "path": "/api/devhub-sync", "schedule": "0 * * * *" }]`.
- O Vercel Cron roda em **UTC**. `0 * * * *` dispara em toda hora cheia UTC,
  que também é hora cheia em `America/Sao_Paulo`: o fuso é UTC-3 fixo, sem
  horário de verão desde 2019. Se o horário de verão voltar (UTC-2), o
  deslocamento continua inteiro e o disparo continua na hora cheia.
- O cron só existe em deployments de **produção**. Previews não sincronizam
  sozinhos.

## Garantias da sincronização

1. **Trava**: um objeto `devhub/lock.json` criado com `allowOverwrite: false`
   (só cria se não existir). Uma trava com mais de 15 minutos é tida como
   abandonada e assumida com `ifMatch` (ETag), de modo que só uma instância
   vence. Uma segunda execução simultânea responde `409`.
2. **Validação antes de gravar**: o acervo não pode vir vazio, os URLs têm de
   ser `https://github.com/https-shini/…`, não pode haver nome repetido,
   são no máximo 6 fixados, e o acervo não pode encolher para menos da metade
   do anterior (sinal de paginação interrompida).
3. **Gravação atômica**: cada documento é um objeto inteiro, substituído num
   único `put`. Quem lê recebe a versão anterior ou a nova, nunca metade. Os
   detalhes (`devhub/details/<nome>.json`) são gravados primeiro e o índice
   (`devhub/snapshot.json`) por último: é ele que publica a nova versão.
4. **Falha preserva o último dado válido**: se a coleta ou a validação falhar,
   nada além do status é gravado. Se o detalhe de um projeto falhar, esse
   projeto mantém o detalhe anterior e o erro fica registrado.
5. **Status**: `devhub/status.json` guarda `lastSyncedAt` (última publicação),
   `lastAttemptAt`, `ok`, a duração, o número de repositórios e os erros (só
   a mensagem pública, nunca o detalhe da rede nem o token).

## Leitura (`/api/devhub`)

- Operações: `catalog` (fixados + acervo da mesma sincronização), `detail`
  (repositório + README + estatísticas), e as antigas `index`, `pinned`,
  `profile`, `project`, `readme` e `stats`.
- Cópia em memória por instância por 60 s, mais CDN
  (`s-maxage=300, stale-while-revalidate=3600`).
- Antes da primeira sincronização, ou com o store inacessível, responde
  `503 sincronizacao_pendente` (sem cache).
- No cliente, a home, o catálogo e os relacionados compartilham um único
  `op=catalog`. A página e o modal do projeto fazem um único `op=detail`.

## Sincronização manual

```bash
curl -X POST https://gcruz.dev.br/api/devhub-sync -H "Authorization: Bearer $CRON_SECRET"
```

Respostas: `200` sincronizou · `502` falhou (o corpo traz o status, e os dados
anteriores continuam no ar) · `409` já há uma em andamento · `401` segredo
errado · `503` `CRON_SECRET` ou store não configurados.

## Configuração em produção

1. **Storage → Blob → Create**, com acesso **Private**, conectado ao projeto
   `new-portfolio` (Production e Preview). A Vercel injeta
   `BLOB_READ_WRITE_TOKEN`.
2. **Settings → Environment Variables**: `CRON_SECRET` (por exemplo,
   `openssl rand -hex 32`) em Production.
3. `GITHUB_TOKEN` (já existe): fine-grained, somente leitura, repositórios
   públicos.
4. Depois do deploy, dispare uma sincronização manual (comando acima) para
   não esperar a próxima hora cheia.
5. **Plano**: no Hobby, a Vercel limita o cron a uma execução por dia. Para
   rodar de hora em hora é preciso o plano Pro. No Hobby, a alternativa é um
   agendador externo (por exemplo, um workflow agendado do GitHub Actions)
   chamando o endpoint manual com o mesmo `CRON_SECRET`.
