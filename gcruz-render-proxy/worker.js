// Proxy dos domínios próprios para os serviços no Render.
//
// Rota ativa: webchat.gcruz.dev.br/* (zona gcruz.dev.br). O Worker repassa a
// requisição ao endereço onrender.com do serviço, com o domínio público em
// X-Forwarded-Host, e devolve a resposta.
//
// Os serviços web do Render (chat-backend, Portal-Receitas, AuthService)
// respondem ao Worker com o desafio anti-bot da Cloudflare do Render (429),
// então as rotas deles foram removidas; o mapa continua aqui para quando o
// Render ativar os domínios próprios ou liberar esse tráfego.

const ORIGINS = {
  "webchat.gcruz.dev.br": "chat-frontend-g42t.onrender.com",
  "webchat-api.gcruz.dev.br": "chat-backend-3sxv.onrender.com",
  "receitas.gcruz.dev.br": "portal-receitas.onrender.com",
  "authservice.gcruz.dev.br": "authservice-mbul.onrender.com",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const publicHost = url.hostname;
    const originHost = ORIGINS[publicHost];
    if (!originHost) {
      return new Response("Not found", { status: 404 });
    }

    url.hostname = originHost;
    url.protocol = "https:";
    url.port = "";

    const headers = new Headers(request.headers);
    headers.set("X-Forwarded-Host", publicHost);
    headers.set("X-Forwarded-Proto", "https");

    // WebSocket: a resposta 101 do Render é devolvida como está.
    if ((request.headers.get("Upgrade") || "").toLowerCase() === "websocket") {
      return fetch(url.toString(), { method: request.method, headers });
    }

    const upstream = await fetch(url.toString(), {
      method: request.method,
      headers,
      body: request.body,
      redirect: "manual",
    });

    // Redirecionamentos absolutos para o onrender.com voltam ao domínio próprio.
    const location = upstream.headers.get("Location");
    if (location && location.includes(originHost)) {
      const response = new Response(upstream.body, upstream);
      response.headers.set("Location", location.split(originHost).join(publicHost));
      return response;
    }

    return upstream;
  },
};
