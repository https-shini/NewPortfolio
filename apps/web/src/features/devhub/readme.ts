/* ─────────────────────────────────────────────────────────
   readme.ts — o que o modal do projeto lê do README
   ─────────────────────────────────────────────────────────
   O servidor já entrega o README convertido e SANITIZADO
   (`readmeHtml`, ver api/_devhub-sanitize.ts). Aqui só se lê esse
   HTML com DOMParser — nada é injetado na página — para tirar:

     images   → capturas de tela para a galeria;
     lead     → o parágrafo de "O que é este projeto?";
     features → a lista de "Funcionalidades";
     techs    → os nomes da seção "Tecnologias".

   Tudo é opcional. README sem essas seções devolve listas vazias e
   `lead` nulo, e o modal recua para a descrição do repositório.

   ── Quais imagens entram na galeria ──────────────────────────
   Só as hospedadas pelo próprio GitHub (o sanitizador já converte
   caminho relativo em raw.githubusercontent.com) e que não sejam
   SVG. Isso descarta, de uma vez, os selos (shields.io), as faixas
   decorativas (capsule-render) e os ícones — e casa com o
   `img-src` da CSP, que só libera *.githubusercontent.com e
   github.com. Uma imagem de fora não carregaria de qualquer jeito.
───────────────────────────────────────────────────────── */

export interface ReadmeImage {
    src: string;
    alt: string;
}

export interface ReadmeInfo {
    images: ReadmeImage[];
    lead: string | null;
    features: string[];
    techs: string[];
}

const VAZIO: ReadmeInfo = { images: [], lead: null, features: [], techs: [] };

const MAX_IMAGENS = 12;
const MAX_FUNCIONALIDADES = 6;
const MAX_LEAD = 420;

/** Cabeçalho comparável: sem emoji, acento, pontuação ou caixa. */
const chave = (s: string) =>
    s
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z]/g, "");

const SECAO_SOBRE = [
    "oquee",
    "sobre",
    "about",
    "whatis",
    "overview",
    "descricao",
];
const SECAO_RECURSOS = ["funcionalidades", "features", "recursos"];
const SECAO_TECNOLOGIAS = [
    "tecnologia",
    "stack",
    "technolog",
    "builtwith",
    "feitocom",
];

const casa = (texto: string, alvos: string[]) => {
    const k = chave(texto);
    return alvos.some((a) => k.includes(a));
};

/** A imagem pode ir para a galeria? (ver cabeçalho) */
export function isGalleryImage(src: string): boolean {
    let url: URL;
    try {
        url = new URL(src);
    } catch {
        return false;
    }
    if (url.protocol !== "https:") return false;
    if (/\.svg$/i.test(url.pathname)) return false;
    const host = url.hostname;
    if (host === "raw.githubusercontent.com") return true;
    if (host.endsWith(".githubusercontent.com")) return true;
    return (
        host === "github.com" &&
        /^\/(user-attachments|[^/]+\/[^/]+\/(assets|raw))\//.test(url.pathname)
    );
}

const texto = (el: Element) =>
    (el.textContent ?? "").replace(/\s+/g, " ").trim();

/** Irmãos depois de `h` até o próximo cabeçalho de nível igual ou maior. */
function secao(h: Element): Element[] {
    const nivel = Number(h.tagName[1]);
    const out: Element[] = [];
    for (let el = h.nextElementSibling; el; el = el.nextElementSibling) {
        if (/^H[1-6]$/.test(el.tagName) && Number(el.tagName[1]) <= nivel)
            break;
        out.push(el);
    }
    return out;
}

/** "**React** — interface…" → "React"; "HTML5 / CSS3" → ["HTML5","CSS3"]. */
function nomesDoItem(li: Element): string[] {
    const forte = li.querySelector("strong, b, code");
    const bruto = forte ? texto(forte) : texto(li).split(/\s[—–-]\s|:/)[0];
    return bruto
        .split(/\s*(?:\/|\+|,|&|\be\b|\band\b)\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
}

export function extractReadme(html: string | null): ReadmeInfo {
    if (!html || typeof DOMParser === "undefined") return VAZIO;
    const doc = new DOMParser().parseFromString(html, "text/html");

    const vistas = new Set<string>();
    const images: ReadmeImage[] = [];
    for (const img of Array.from(doc.querySelectorAll("img"))) {
        const src = img.getAttribute("src") ?? "";
        if (!isGalleryImage(src) || vistas.has(src)) continue;
        vistas.add(src);
        images.push({ src, alt: (img.getAttribute("alt") ?? "").trim() });
        if (images.length >= MAX_IMAGENS) break;
    }

    let lead: string | null = null;
    let features: string[] = [];
    const techs: string[] = [];

    for (const h of Array.from(doc.querySelectorAll("h2, h3"))) {
        const titulo = texto(h);
        if (lead === null && casa(titulo, SECAO_SOBRE)) {
            const ps = secao(h)
                .filter((el) => el.tagName === "P")
                .map(texto)
                .filter(Boolean);
            if (ps.length > 0) {
                let t = ps.slice(0, 2).join(" ");
                if (t.length > MAX_LEAD)
                    t = `${t.slice(0, MAX_LEAD).replace(/\s+\S*$/, "")}…`;
                lead = t;
            }
        } else if (features.length === 0 && casa(titulo, SECAO_RECURSOS)) {
            const lista = secao(h).find(
                (el) => el.tagName === "UL" || el.tagName === "OL",
            );
            if (lista) {
                features = Array.from(lista.children)
                    .filter((el) => el.tagName === "LI")
                    .map(texto)
                    .filter(Boolean)
                    .slice(0, MAX_FUNCIONALIDADES);
            }
        } else if (techs.length === 0 && casa(titulo, SECAO_TECNOLOGIAS)) {
            for (const el of secao(h)) {
                for (const li of Array.from(el.querySelectorAll("li"))) {
                    techs.push(...nomesDoItem(li));
                }
            }
        }
    }

    return { images, lead, features, techs };
}
