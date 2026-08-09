/* ─────────────────────────────────────────────────────────
   detectarPlataforma — qual instalador oferecer primeiro
   ─────────────────────────────────────────────────────────
   Serve a uma decisão de interface, não de segurança: qual cartão
   destacar. Errar tem custo baixo — os outros continuam na tela, a um
   clique. Por isso `userAgent` basta, e por isso não há biblioteca aqui.

   A ordem dos testes não é arbitrária. "Android" aparece dentro de um
   user-agent que também diz "Linux"; iPad moderno se anuncia como
   "Macintosh". Testar do mais específico para o mais genérico é o que
   evita entregar um .deb a quem está no celular.
───────────────────────────────────────────────────────── */

/* As plataformas com instalador. Espelha o tipo de `api/downloads.ts` —
   o cliente não importa de api/ para não arrastar código de servidor
   para o bundle. */
export type Plataforma = "windows" | "macos" | "linux" | "android";

/** Inclui os alvos sem instalador — a página precisa saber para explicar. */
export type PlataformaDetectada = Plataforma | "ios" | "desconhecida";

export function detectarPlataforma(
    ua: string = typeof navigator !== "undefined" ? navigator.userAgent : "",
    /* iPadOS 13+ mente: diz "Macintosh". O que o denuncia é ser um Mac
       com tela sensível ao toque, coisa que não existia até os primeiros
       modelos com toque — e mesmo neles a heurística acerta mais do que
       oferecer um .dmg a quem está num iPad. */
    pontosDeToque: number = typeof navigator !== "undefined"
        ? (navigator.maxTouchPoints ?? 0)
        : 0,
): PlataformaDetectada {
    const s = ua.toLowerCase();

    if (/android/.test(s)) return "android";
    if (/iphone|ipod/.test(s)) return "ios";
    if (/ipad/.test(s)) return "ios";
    if (/mac os x|macintosh/.test(s)) {
        return pontosDeToque > 1 ? "ios" : "macos";
    }
    if (/windows/.test(s)) return "windows";
    /* Depois do Android, porque todo Android também diz "Linux". */
    if (/linux|x11|cros/.test(s)) return "linux";

    return "desconhecida";
}
