import type { ReleaseEntry } from "@/shared/config/releaseNotes";

/* ─────────────────────────────────────────────────────────
   mergeReleaseNotes — combina GitHub e camada local
   ─────────────────────────────────────────────────────────
   O GitHub é a fonte da estrutura: versão, data e o link da
   release. A camada local é uma *sobreposição* editorial:
   título, resumo, corpo, mídia, tags e destaque.

   A razão de existirem as duas: o corpo de uma release do
   GitHub é um texto só, e o site é bilíngue. Quem quiser uma
   versão traduzida e com mídia escreve a entrada local; o
   resto aparece sozinho ao publicar a release.
───────────────────────────────────────────────────────── */

/** Uma release como a serverless entrega. */
export interface GithubRelease {
    /** Tag sem o prefixo "v". */
    version: string;
    /** `published_at`, ISO completo. */
    date: string;
    title: string;
    /** Corpo já convertido e sanitizado no servidor. */
    html: string;
    /** `html_url` da release. */
    url: string;
}

/** Entrada exibida na timeline, já resolvida entre as duas fontes. */
export interface MergedRelease extends ReleaseEntry {
    /** Corpo em HTML vindo do GitHub — só quando não há `body` local. */
    html?: string;
    /** Link para a release no GitHub. */
    url?: string;
}

/** Normaliza a versão para o casamento: remove "v" e espaços. */
function normalize(version: string): string {
    return version.trim().replace(/^v/i, "");
}

/** Só a parte da data, para o formato que a timeline exibe. */
function toIsoDay(date: string): string {
    return date.slice(0, 10);
}

/**
 * Combina as duas fontes numa lista única, da versão mais recente
 * para a mais antiga.
 *
 * · Versões presentes só no GitHub são IGNORADAS. A camada local é a
 *   lista de permissão: o histórico do site é curado, e uma release
 *   publicada lá não se convida para a timeline. Sem isso, uma release
 *   antiga — de um caminho que o projeto abandonou, por exemplo —
 *   ressurgiria sozinha e desfaria a curadoria.
 * · Versões presentes só na camada local continuam aparecendo — é o
 *   que mantém a timeline de pé quando a rede falha.
 * · Presentes nas duas: a data e o link vêm do GitHub; título, resumo,
 *   corpo, mídia, tags e destaque vêm do local quando existirem.
 */
export function mergeReleaseNotes(
    local: ReleaseEntry[],
    github: GithubRelease[],
): MergedRelease[] {
    const byVersion = new Map<string, MergedRelease>();

    /* A camada local é a lista de permissão do histórico. */
    const declaradas = new Set(local.map((e) => normalize(e.version)));

    /* 1. O GitHub entra primeiro, definindo data e link — mas só das
          versões que a camada local declara. */
    github.forEach((release) => {
        const version = normalize(release.version);
        if (!declaradas.has(version)) return;
        byVersion.set(version, {
            version,
            date: toIsoDay(release.date),
            title: { pt: release.title, en: release.title },
            html: release.html,
            url: release.url,
        });
    });

    /* 2. A camada local sobrepõe o que for editorial. */
    local.forEach((entry) => {
        const version = normalize(entry.version);
        const fromGithub = byVersion.get(version);

        if (!fromGithub) {
            byVersion.set(version, { ...entry, version });
            return;
        }

        byVersion.set(version, {
            ...fromGithub,
            /* Do local quando existir; senão preserva o do GitHub. */
            title: entry.title ?? fromGithub.title,
            summary: entry.summary,
            body: entry.body,
            /* O corpo local vence: se há tradução, não mostra o texto único. */
            html: entry.body ? undefined : fromGithub.html,
            cover: entry.cover,
            media: entry.media,
            tags: entry.tags,
            featured: entry.featured,
            changes: entry.changes,
            links: entry.links,
        });
    });

    /* 3. Mais recente primeiro; empate desfeito pela versão, para que a
          ordem seja estável entre execuções. */
    return [...byVersion.values()].sort((a, b) => {
        const diff = Date.parse(b.date) - Date.parse(a.date);
        return diff !== 0 ? diff : b.version.localeCompare(a.version);
    });
}
