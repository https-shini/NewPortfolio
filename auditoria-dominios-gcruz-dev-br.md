# Auditoria de domínios — gcruz.dev.br

Data: 15/11/2026. Testes feitos com `nslookup` (1.1.1.1 e o servidor autoritativo `jihoon.ns.cloudflare.com`), `curl`, `openssl s_client` e navegador.

## 1. Inventário

### 1.1 Aplicações públicas (domínio próprio)

| Domínio | Serviço | Plataforma / destino | Situação |
|---|---|---|---|
| `gcruz.dev.br` | Portfólio (`NewPortfolio`) | Vercel, projeto `new-portfolio` — A `216.198.79.65`, `64.29.17.65` | ✅ 200 |
| `www.gcruz.dev.br` | Redirecionamento do portfólio | Vercel — A `64.29.17.1`, `216.198.79.65` | ✅ 308 → `gcruz.dev.br` |
| `cinelux.gcruz.dev.br` | Cinelux (`movies_lib`) | Vercel, projeto `cinelux` — CNAME `52e9e0a3466b055b.vercel-dns-017.com` | ✅ 200; API `/api/tmdb` retorna filmes |
| `icons.gcruz.dev.br` | Skill Icons | Vercel, projeto `skill-icons` — CNAME `4dc2ce2b2247e76d.vercel-dns-017.com` | ✅ 200; `/icons` e `/api/manifest` |
| `financas.gcruz.dev.br` | Finanças (`financas-reactjs`) | Vercel, projeto `financas-reactjs` — CNAME `f044f2bb3ebe56d3.vercel-dns-017.com` | ✅ 200; lançamento testado |
| `webchat.gcruz.dev.br` | web-chat (site) | CNAME `chat-frontend-g42t.onrender.com` + Worker `gcruz-render-proxy` (rota `webchat.gcruz.dev.br/*`) | ✅ 200; chat testado entre duas sessões |
| `receitas.gcruz.dev.br` | Portal-Receitas | CNAME `portal-receitas.onrender.com` | ❌ 403 (erro 1000 Cloudflare) |

### 1.2 APIs

| Domínio | Serviço | Destino | Situação |
|---|---|---|---|
| `webchat-api.gcruz.dev.br` | web-chat (WebSocket) | CNAME `chat-backend-3sxv.onrender.com` | ❌ 403 (erro 1000) |
| `chat-backend-3sxv.onrender.com` | web-chat (WebSocket) — **endereço em uso pelo site** | Render `chat-backend` | ✅ `/healthz` 200; aceita `https://webchat.gcruz.dev.br` e `https://chat-frontend-g42t.onrender.com`; recusa outras origens (403) |
| `cinelux.gcruz.dev.br/api/tmdb/*` | Proxy do TMDB | Função da Vercel | ✅ |
| `icons.gcruz.dev.br/icons`, `/api/manifest` | API de ícones | Vercel | ✅ |

### 1.3 Autenticação

| Domínio | Serviço | Destino | Situação |
|---|---|---|---|
| `authservice.gcruz.dev.br` | AuthService (FastAPI + front) | CNAME `authservice-mbul.onrender.com` | ❌ 403 (erro 1000) |
| `authservice-mbul.onrender.com` | AuthService — **endereço em uso** | Render `AuthService` | ✅ `/health`, `/docs`, cadastro, `/token`, `/me` (401 sem token) |

### 1.4 Endereços antigos

| Endereço | Situação | Tratamento |
|---|---|---|
| `movies-lib-vite.vercel.app` | Obsoleto | 308 → `cinelux.gcruz.dev.br`, mesmo caminho e query, inclusive a raiz |
| `financas-reactjs.vercel.app` | Obsoleto | 308 → `financas.gcruz.dev.br`, mesmo caminho e query, inclusive a raiz |
| `skill-icons-gcruz.vercel.app` | Mantido de propósito | Serve normalmente (READMEs de terceiros usam esse endereço) |
| `skill-icons-nine.vercel.app` | Obsoleto | 307 → `skill-icons-gcruz.vercel.app` |
| `chat-frontend-g42t.onrender.com` | Em transição | Serve o site; redireciona para `webchat.gcruz.dev.br` quando `VITE_PUBLIC_URL` for definida |
| `portal-receitas.onrender.com` | **Em uso** | Endereço real do Portal até o domínio próprio funcionar |
| `gcruzstack.com.br` | Domínio secundário (DNS na Vercel) | 308 → `gcruz.dev.br`; `www.gcruzstack.com.br` faz 307 → `gcruzstack.com.br` → 308 (dois saltos) |

### 1.5 Serviços internos e infraestrutura

| Registro | Finalidade | Observação |
|---|---|---|
| `*.lab.gcruz.dev.br` → `26.37.81.139` | lab-platform (`inicio.lab`, `portfolio.lab`…) | IP da faixa Radmin VPN (26.0.0.0/8): só acessível por quem está na VPN |
| ~~`*.gcruz.dev.br` → `64.29.17.1`, `216.198.79.1`~~ | **Removido** em 16/11/2026 | Nenhum serviço dependia dele; levava nomes não usados à Vercel, sem projeto (certificado vencido + 404). Nomes não definidos agora retornam NXDOMAIN. Para desfazer: recriar os dois registros A |
| `MX` `route1/2/3.mx.cloudflare.net`, `cf2024-1._domainkey` | Cloudflare Email Routing | Gerenciados pela Cloudflare (somente leitura) |
| `TXT` SPF, `_dmarc` | E-mail | SPF inclui Cloudflare e Google |
| `send`, `rsend` (CNAME), `resend._domainkey` | Envio de e-mail (Resend) | Mantidos |
| `_domainconnect` (CNAME, proxy) | Domain Connect da Vercel | Herança da Vercel; inofensivo |
| `CAA` `sectigo.com`, `pki.goog`, `letsencrypt.org` | Autoridades permitidas | Cobrem Vercel, Render e Cloudflare; o painel mostra um aviso nesses registros |
| `gcruz-render-proxy.bl4ck404.workers.dev` | Worker proxy do `webchat` | 404 para hosts fora do mapa |

## 2. Diagnóstico

1. **403 em `webchat-api`, `receitas` e `authservice`** — erro Cloudflare **1000 "DNS points to prohibited IP"**. A documentação da Cloudflare descreve exatamente este caso: o domínio aponta para um provedor que usa Cloudflare for SaaS (o Render) e o provedor não tem o hostname personalizado ativo; *"o erro vem da conta Cloudflare do provedor, não da sua"*. Evidências: DNS correto (CNAME → `*.onrender.com` → `gcp-us-west1-1.origin.onrender.com`, DNS only), zona sem bloqueio (zone hold falso, sem rotas de Worker para esses nomes, sem AAAA, SSL Full), e a borda entrega o certificado `*.gcruz.dev.br` da própria zona em vez do certificado do Render. No painel do Render os domínios aparecem como Verified/Issued, mas não estão ativos na borda. Não é configuração da aplicação, de firewall, de CORS nem de autenticação.
2. **Proxy por Worker não serve para os serviços web do Render**: as requisições do Worker recebem o desafio anti-bot (429) da Cloudflare do Render. Funciona só para o site estático (`webchat`).
3. **Raiz dos endereços antigos da Vercel não redirecionava**: o padrão `/:path*` não cobre `/`, e a Vercel servia a página do cache.
4. **`cinelux`, `icons` e `financas` dependiam do curinga** `*.gcruz.dev.br` (registros A genéricos), em vez dos CNAMEs recomendados pela Vercel.
5. **Curinga `*.gcruz.dev.br` obsoleto e com certificado vencido** para qualquer nome não definido.
6. **Portfólio com links antigos** para o web-chat e o Finanças.
7. **CI do `NewPortfolio`**: a etapa "Auditoria de dependências" falha na `main` (vulnerabilidades moderadas em `minimatch` via `@typescript-eslint`), sem relação com domínios.

## 3. Correções feitas

- CNAMEs `cinelux`, `icons` e `financas` criados com os destinos recomendados pela Vercel (DNS only). Confirmados no servidor autoritativo e com HTTPS 200.
- `vercel.json` de `movies_lib` e `financas-reactjs`: regra passa a `source: "/(.*)"` → `https://<domínio>/$1` (PRs [movies_lib#34](https://github.com/https-shini/movies_lib/pull/34) e [financas-reactjs#2](https://github.com/https-shini/financas-reactjs/pull/2), mergeados e no ar; a raiz agora responde 308).
- Portfólio: `PROJECT_URLS.webChat.live` → `https://webchat.gcruz.dev.br`, `finances.live` → `https://financas.gcruz.dev.br` (PR [NewPortfolio#70](https://github.com/https-shini/NewPortfolio/pull/70), mergeado; confirmado no JavaScript publicado em `gcruz.dev.br`). O AuthService continua no `onrender.com`.
- Curinga `*.gcruz.dev.br` removido (dois registros A).

## 4. Configuração definitiva de referência

Valores de produção **hoje** (enquanto o Render não ativar os domínios):

| Serviço | Variável | Valor atual | Valor final (após o Render) |
|---|---|---|---|
| `chat-backend` | `ALLOWED_ORIGINS` | `https://webchat.gcruz.dev.br,https://chat-frontend-g42t.onrender.com` | igual; tirar o `onrender.com` quando o endereço antigo for desativado |
| `chat-frontend` | `VITE_SOCKET_URL` | `wss://chat-backend-3sxv.onrender.com` | `wss://webchat-api.gcruz.dev.br` |
| `chat-frontend` | `VITE_PUBLIC_URL` | (vazia) | `https://webchat.gcruz.dev.br` |
| `chat-frontend` | CSP `connect-src` | `'self' wss://webchat-api.gcruz.dev.br wss://chat-backend-3sxv.onrender.com` | igual |
| `Portal-Receitas` | `APP_URL` | (vazia — canonical/sitemap usam o host da requisição) | `https://receitas.gcruz.dev.br` |
| `AuthService` | `PUBLIC_URL` | (vazia) | `https://authservice.gcruz.dev.br` |

Depois de definir as variáveis finais: remover a rota `webchat.gcruz.dev.br/*` do Worker `gcruz-render-proxy` (e o Worker, se não houver outro uso).

## 5. Pendências

| Pendência | Motivo | Quem | Próximo passo |
|---|---|---|---|
| `webchat-api`, `receitas`, `authservice` com 403 | Hostname não ativo na Cloudflare do Render | Você (suporte Render) | Abrir chamado: erro 1000, Ray ID `a5b16e549fb0f1f5`, domínios Verified/Issued, zona na Cloudflare em DNS only, borda entrega o certificado da zona |
| `www.gcruz.dev.br` em registros A | Funciona, mas a Vercel recomenda CNAME `0c8f7f37f5e4e3a5.vercel-dns-017.com` | Opcional | Trocar os dois A pelo CNAME |
| `www.gcruzstack.com.br` com dois saltos | Configuração de domínio na Vercel | Opcional | Redirecionar direto para `gcruz.dev.br` |
| CI do `NewPortfolio` | Vulnerabilidades moderadas em dependências de desenvolvimento | Opcional | `npm audit fix` em PR próprio |
