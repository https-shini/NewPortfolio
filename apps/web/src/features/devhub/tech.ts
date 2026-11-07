/* ─────────────────────────────────────────────────────────
   tech.ts — de "o que o repositório diz" para chips de tecnologia
   ─────────────────────────────────────────────────────────
   Três fontes, nesta ordem de confiança:

     1. linguagens medidas pelo GitHub (bytes de código);
     2. tópicos do repositório (escolhidos pelo autor);
     3. a seção "Tecnologias" do README (só no modal, que já
        carregou o detalhe do projeto).

   Cada nome passa pelo CATÁLOGO abaixo. É o catálogo que decide o
   ícone, e a regra é uma só:

     · existe logotipo OFICIAL no Skill Icons (`assets/skills`)
       → `icon` aponta para ele;
     · não existe → `generic`, um ícone neutro que diz a FINALIDADE
       (biblioteca, estilo, banco, servidor, segurança). Nunca um
       desenho que imite a marca.

   Linguagem fora do catálogo continua aparecendo — o GitHub mediu,
   então é verdade —, com o ícone genérico de código e a cor que o
   GitHub lhe dá. Tópico ou item de README fora do catálogo é
   descartado: tópico tende a ser assunto ("backend", "fullstack"),
   não tecnologia, e o README cita bibliotecas demais para virar chip.
───────────────────────────────────────────────────────── */

import type { SkillIconId } from "@/shared/config/skillIcons";
import { NEUTRAL_LANGUAGE_COLOR, type Repository } from "./types";

/** Finalidade do ícone genérico, quando não há logotipo oficial. */
export type GenericTech =
    "code" | "lib" | "style" | "database" | "server" | "security";

export interface Tech {
    /** Chave estável (dedupe e `key` do React). */
    key: string;
    /** Nome de exibição, preservado como a tecnologia se escreve. */
    name: string;
    /** Cor da marca/linguagem — contorno e fundo do chip. */
    color: string;
    /** Logotipo oficial; ausente ⇒ usa `generic`. */
    icon?: SkillIconId;
    generic: GenericTech;
}

interface Entry {
    name: string;
    color: string;
    icon?: SkillIconId;
    generic?: GenericTech;
    /** Grafias aceitas, já normalizadas (ver `norm`). */
    aliases: string[];
}

/* As grafias são comparadas depois de `norm`: minúsculas, sem
   acento, sem pontuação e sem espaços. "Node.js", "NodeJS" e
   "node js" viram todos `nodejs`. */
const CATALOGO: Record<string, Entry> = {
    js: {
        name: "JavaScript",
        color: "#F1E05A",
        icon: "js",
        aliases: ["javascript", "js", "es6", "vanillajs"],
    },
    ts: {
        name: "TypeScript",
        color: "#3178C6",
        icon: "ts",
        aliases: ["typescript", "ts"],
    },
    html: {
        name: "HTML",
        color: "#E34C26",
        icon: "html",
        aliases: ["html", "html5"],
    },
    css: {
        name: "CSS",
        color: "#663399",
        icon: "css",
        aliases: ["css", "css3"],
    },
    sass: {
        name: "Sass",
        color: "#C6538C",
        icon: "sass",
        aliases: ["sass", "scss"],
    },
    python: {
        name: "Python",
        color: "#3572A5",
        icon: "python",
        aliases: ["python", "python3"],
    },
    java: { name: "Java", color: "#B07219", icon: "java", aliases: ["java"] },
    php: { name: "PHP", color: "#4F5D95", icon: "php", aliases: ["php"] },
    bash: {
        name: "Shell",
        color: "#89E051",
        icon: "bash",
        aliases: ["shell", "bash"],
    },
    sql: {
        name: "SQL",
        color: "#E38C00",
        icon: "sql",
        aliases: ["sql", "tsql"],
    },
    plpgsql: {
        name: "PL/pgSQL",
        color: "#336790",
        icon: "sql",
        aliases: ["plpgsql"],
    },
    react: {
        name: "React",
        color: "#61DAFB",
        icon: "react",
        aliases: ["react", "reactjs"],
    },
    vite: {
        name: "Vite",
        color: "#646CFF",
        icon: "vite",
        aliases: ["vite", "vitejs"],
    },
    nodejs: {
        name: "Node.js",
        color: "#5FA04E",
        icon: "nodejs",
        aliases: ["nodejs", "node"],
    },
    fastapi: {
        name: "FastAPI",
        color: "#009688",
        icon: "fastapi",
        aliases: ["fastapi"],
    },
    docker: {
        name: "Docker",
        color: "#2496ED",
        icon: "docker",
        aliases: ["docker", "dockercompose"],
    },
    firebase: {
        name: "Firebase",
        color: "#FFCA28",
        icon: "firebase",
        aliases: ["firebase"],
    },
    mysql: {
        name: "MySQL",
        color: "#4479A1",
        icon: "mysql",
        aliases: ["mysql"],
    },
    oracle: {
        name: "Oracle",
        color: "#F80000",
        icon: "oracle",
        aliases: ["oracle", "oracledb"],
    },
    /* Sem logotipo oficial no Skill Icons → ícone da finalidade. */
    styled: {
        name: "Styled Components",
        color: "#DB7093",
        generic: "style",
        aliases: ["styledcomponents"],
    },
    tailwind: {
        name: "Tailwind CSS",
        color: "#38BDF8",
        generic: "style",
        aliases: ["tailwind", "tailwindcss"],
    },
    framer: {
        name: "Framer Motion",
        color: "#BB4BEB",
        generic: "lib",
        aliases: ["framermotion"],
    },
    express: {
        name: "Express",
        color: NEUTRAL_LANGUAGE_COLOR,
        generic: "server",
        aliases: ["express", "expressjs"],
    },
    socketio: {
        name: "Socket.IO",
        color: NEUTRAL_LANGUAGE_COLOR,
        generic: "server",
        aliases: ["socketio"],
    },
    postgres: {
        name: "PostgreSQL",
        color: "#336791",
        generic: "database",
        aliases: ["postgresql", "postgres"],
    },
    jwt: {
        name: "JWT",
        color: "#D63AFF",
        generic: "security",
        aliases: ["jwt", "jsonwebtoken"],
    },
    pydantic: {
        name: "Pydantic",
        color: "#E92063",
        generic: "lib",
        aliases: ["pydantic", "pydanticv2"],
    },
};

/** Normaliza para comparar grafias: "Node.js" → "nodejs". */
export function norm(s: string): string {
    return s
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

const POR_ALIAS = new Map<string, string>();
for (const [key, e] of Object.entries(CATALOGO)) {
    for (const a of e.aliases) POR_ALIAS.set(a, key);
}

function deEntrada(key: string): Tech {
    const e = CATALOGO[key];
    return {
        key,
        name: e.name,
        color: e.color,
        icon: e.icon,
        generic: e.generic ?? "code",
    };
}

/** Uma grafia qualquer → tecnologia do catálogo, ou `null`. */
export function lookupTech(raw: string): Tech | null {
    /* "Python 3.12", "React 18", "Vite v5" → sem a versão. */
    const semVersao = raw.replace(/\s+v?\d+(\.\d+)*\+?$/i, "");
    const key = POR_ALIAS.get(norm(raw)) ?? POR_ALIAS.get(norm(semVersao));
    return key ? deEntrada(key) : null;
}

/** Junta listas sem repetir (a primeira ocorrência vence). */
function unir(...listas: Tech[][]): Tech[] {
    const vistos = new Set<string>();
    const out: Tech[] = [];
    for (const lista of listas) {
        for (const t of lista) {
            if (vistos.has(t.key)) continue;
            vistos.add(t.key);
            out.push(t);
        }
    }
    return out;
}

/**
 * Tecnologias do cartão: linguagens medidas + tópicos reconhecidos.
 * A linguagem fora do catálogo entra com o ícone genérico e a cor
 * do GitHub — foi medida, então é fato.
 */
export function techsFromRepo(repo: Repository): Tech[] {
    const langs =
        repo.languages.length > 0
            ? repo.languages
            : repo.primaryLanguage
              ? [repo.primaryLanguage]
              : [];
    const deLinguagens = langs.map(
        (l): Tech =>
            lookupTech(l.name) ?? {
                key: `lang:${norm(l.name)}`,
                name: l.name,
                color: l.color ?? NEUTRAL_LANGUAGE_COLOR,
                generic: "code",
            },
    );
    const deTopicos = repo.topics
        .map(lookupTech)
        .filter((t): t is Tech => t !== null);
    return unir(deLinguagens, deTopicos);
}

/**
 * Tecnologias do modal: o que o README declara vem primeiro (é a
 * stack como o autor a descreve), depois o que o cartão já sabia.
 */
export function techsForDetail(
    repo: Repository,
    readmeTechs: string[],
): Tech[] {
    const doReadme = readmeTechs
        .map(lookupTech)
        .filter((t): t is Tech => t !== null);
    return unir(doReadme, techsFromRepo(repo));
}
