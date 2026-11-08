/**
 * skillIcons.ts — o mapeamento ID → arquivo dos ícones de tecnologia.
 *
 * ── Por que existe ───────────────────────────────────────────────────
 *
 * Antes, quatro arquivos montavam URL para `skillicons.dev` cada um por
 * conta própria, com três cópias da constante de base:
 *
 *   About.tsx            `const skilliconsBase = …`
 *   Featured.tsx         `const SKILLICONS_BASE = …`
 *   FormationCard.tsx    `const SKILLICONS_BASE = …`
 *   pages/Links          dez imports estáticos próprios
 *
 * Eram 46 requisições de imagem a um domínio de terceiro na home — o único
 * recurso externo de imagem do site. Quando a rede até ele falha, as 46
 * somem e três seções ficam com buracos. Medido: numa verificação com a
 * rede externa bloqueada, as 46 falharam e as 13 imagens locais não.
 *
 * Agora os arquivos são locais e o ID é uma união fechada: pedir um ícone
 * que não existe passa a ser erro de compilação, não imagem quebrada em
 * produção. Foi assim que se descobriu que `oracle` já estava quebrado —
 * `skillicons.dev` nunca o serviu.
 *
 * ── A origem dos arquivos ────────────────────────────────────────────
 *
 * `src/assets/skills/`, com os nomes originais de
 * https://github.com/https-shini/skill-icons (fork de skill-icons, de
 * tandpfun, MIT). Preservar o nome da fork é o que torna a atualização
 * futura uma cópia por cima, em vez de um exercício de tradução.
 *
 * Todos os arquivos vêm da fork, inclusive o `SQL-*` (par temático) e as
 * artes do catálogo ampliado; procedência e licenças no CREDITS.md.
 *
 * ── Por que `dark` e `light` em vez de um `src` só ───────────────────
 *
 * A variante NÃO é escolhida em JavaScript. O componente
 * `shared/ui/SkillIcon` emite os dois `<img>` e o CSS esconde o que não
 * é do tema, pelo `data-theme` que `useTheme` já escreve no `<html>`.
 *
 * A razão é concreta: `useTheme` é `useState` puro e o próprio cabeçalho
 * dele avisa que não deve ser chamado em mais de um componente. Resolver
 * por CSS não cria estado nenhum, então não há o que dessincronizar —
 * nem aqui, nem na /links, que já chamava o hook em paralelo com o Header.
 *
 * Ícone sem variante aponta `dark` e `light` para o mesmo arquivo. O
 * componente detecta isso e emite UM `<img>`, não dois.
 */

/* Temáticos — par Dark/Light */
import bashDark from "@/assets/skills/Bash-Dark.svg";
import bashLight from "@/assets/skills/Bash-Light.svg";
import figmaDark from "@/assets/skills/Figma-Dark.svg";
import figmaLight from "@/assets/skills/Figma-Light.svg";
import firebaseDark from "@/assets/skills/Firebase-Dark.svg";
import firebaseLight from "@/assets/skills/Firebase-Light.svg";
import javaDark from "@/assets/skills/Java-Dark.svg";
import javaLight from "@/assets/skills/Java-Light.svg";
import linuxDark from "@/assets/skills/Linux-Dark.svg";
import linuxLight from "@/assets/skills/Linux-Light.svg";
import mysqlDark from "@/assets/skills/MySQL-Dark.svg";
import mysqlLight from "@/assets/skills/MySQL-Light.svg";
import nodejsDark from "@/assets/skills/NodeJS-Dark.svg";
import nodejsLight from "@/assets/skills/NodeJS-Light.svg";
import phpDark from "@/assets/skills/PHP-Dark.svg";
import phpLight from "@/assets/skills/PHP-Light.svg";
import pythonDark from "@/assets/skills/Python-Dark.svg";
import pythonLight from "@/assets/skills/Python-Light.svg";
import reactDark from "@/assets/skills/React-Dark.svg";
import reactLight from "@/assets/skills/React-Light.svg";
import sqlDark from "@/assets/skills/SQL-Dark.svg";
import sqlLight from "@/assets/skills/SQL-Light.svg";
import viteDark from "@/assets/skills/Vite-Dark.svg";
import viteLight from "@/assets/skills/Vite-Light.svg";
import vscodeDark from "@/assets/skills/VSCode-Dark.svg";
import vscodeLight from "@/assets/skills/VSCode-Light.svg";

/* Arquivo único — logotipo com fundo de marca próprio, igual nos dois temas */
import cssIcon from "@/assets/skills/CSS.svg";
import dockerIcon from "@/assets/skills/Docker.svg";
import fastapiIcon from "@/assets/skills/FastAPI.svg";
import gitIcon from "@/assets/skills/Git.svg";
import htmlIcon from "@/assets/skills/HTML.svg";
import jsIcon from "@/assets/skills/JavaScript.svg";
import oracleIcon from "@/assets/skills/Oracle.svg";
import sassIcon from "@/assets/skills/Sass.svg";
import tsIcon from "@/assets/skills/TypeScript.svg";
/* Acrescentados com o catálogo ampliado da fork (08/11/2026) */
import nextjsDark from "@/assets/skills/NextJS-Dark.svg";
import nextjsLight from "@/assets/skills/NextJS-Light.svg";
import tailwindDark from "@/assets/skills/TailwindCSS-Dark.svg";
import tailwindLight from "@/assets/skills/TailwindCSS-Light.svg";
import postgresDark from "@/assets/skills/PostgreSQL-Dark.svg";
import postgresLight from "@/assets/skills/PostgreSQL-Light.svg";
import uvicornDark from "@/assets/skills/Uvicorn-Dark.svg";
import uvicornLight from "@/assets/skills/Uvicorn-Light.svg";
import lucideDark from "@/assets/skills/Lucide-Dark.svg";
import lucideLight from "@/assets/skills/Lucide-Light.svg";
import ruffDark from "@/assets/skills/Ruff-Dark.svg";
import ruffLight from "@/assets/skills/Ruff-Light.svg";
import banditDark from "@/assets/skills/Bandit-Dark.svg";
import banditLight from "@/assets/skills/Bandit-Light.svg";
import radonDark from "@/assets/skills/Radon-Dark.svg";
import radonLight from "@/assets/skills/Radon-Light.svg";
import biomeDark from "@/assets/skills/Biome-Dark.svg";
import biomeLight from "@/assets/skills/Biome-Light.svg";
import golangciDark from "@/assets/skills/GolangCI-Dark.svg";
import golangciLight from "@/assets/skills/GolangCI-Light.svg";
import githubDark from "@/assets/skills/Github-Dark.svg";
import githubLight from "@/assets/skills/Github-Light.svg";
import geminiDark from "@/assets/skills/Gemini-Dark.svg";
import geminiLight from "@/assets/skills/Gemini-Light.svg";
import claudeDark from "@/assets/skills/Claude-Dark.svg";
import claudeLight from "@/assets/skills/Claude-Light.svg";
import openrouterDark from "@/assets/skills/OpenRouter-Dark.svg";
import openrouterLight from "@/assets/skills/OpenRouter-Light.svg";
import motionDark from "@/assets/skills/Motion-Dark.svg";
import motionLight from "@/assets/skills/Motion-Light.svg";
import expressDark from "@/assets/skills/ExpressJS-Dark.svg";
import expressLight from "@/assets/skills/ExpressJS-Light.svg";
import socketioDark from "@/assets/skills/SocketIO-Dark.svg";
import socketioLight from "@/assets/skills/SocketIO-Light.svg";
import jwtDark from "@/assets/skills/JWT-Dark.svg";
import jwtLight from "@/assets/skills/JWT-Light.svg";
import pydanticDark from "@/assets/skills/Pydantic-Dark.svg";
import pydanticLight from "@/assets/skills/Pydantic-Light.svg";
import jupyterDark from "@/assets/skills/Jupyter-Dark.svg";
import jupyterLight from "@/assets/skills/Jupyter-Light.svg";
import jinjaDark from "@/assets/skills/Jinja-Dark.svg";
import jinjaLight from "@/assets/skills/Jinja-Light.svg";
import svgDark from "@/assets/skills/SVG-Dark.svg";
import svgLight from "@/assets/skills/SVG-Light.svg";
import styledcomponentsIcon from "@/assets/skills/StyledComponents.svg";
import herokuIcon from "@/assets/skills/Heroku.svg";

/**
 * Os IDs em uso. União fechada de propósito: é o que faz o compilador
 * reprovar um ícone inexistente, como `TranslationKey` faz com as
 * traduções. Acrescentar um ícone é acrescentar o arquivo, o import e a
 * entrada aqui — nessa ordem, e o `tsc` cobra as três.
 */
export type SkillIconId =
    | "bandit"
    | "bash"
    | "biome"
    | "claude"
    | "css"
    | "docker"
    | "express"
    | "fastapi"
    | "figma"
    | "firebase"
    | "gemini"
    | "git"
    | "github"
    | "golangci"
    | "heroku"
    | "html"
    | "java"
    | "jinja"
    | "js"
    | "jupyter"
    | "jwt"
    | "linux"
    | "lucide"
    | "motion"
    | "mysql"
    | "nextjs"
    | "nodejs"
    | "openrouter"
    | "oracle"
    | "php"
    | "postgres"
    | "pydantic"
    | "python"
    | "radon"
    | "react"
    | "ruff"
    | "sass"
    | "socketio"
    | "sql"
    | "styledcomponents"
    | "svg"
    | "tailwind"
    | "ts"
    | "uvicorn"
    | "vite"
    | "vscode";

export interface SkillIcon {
    /** Arquivo para o tema escuro. */
    readonly dark: string;
    /** Arquivo para o tema claro — o mesmo que `dark` quando não há variante. */
    readonly light: string;
}

/**
 * O registro. `Record` sobre a união fechada significa que esquecer uma
 * entrada é erro de compilação, não um `undefined` em tempo de execução.
 */
export const SKILL_ICONS: Readonly<Record<SkillIconId, SkillIcon>> = {
    bandit: { dark: banditDark, light: banditLight },
    bash: { dark: bashDark, light: bashLight },
    biome: { dark: biomeDark, light: biomeLight },
    claude: { dark: claudeDark, light: claudeLight },
    css: { dark: cssIcon, light: cssIcon },
    docker: { dark: dockerIcon, light: dockerIcon },
    express: { dark: expressDark, light: expressLight },
    fastapi: { dark: fastapiIcon, light: fastapiIcon },
    figma: { dark: figmaDark, light: figmaLight },
    firebase: { dark: firebaseDark, light: firebaseLight },
    gemini: { dark: geminiDark, light: geminiLight },
    git: { dark: gitIcon, light: gitIcon },
    github: { dark: githubDark, light: githubLight },
    golangci: { dark: golangciDark, light: golangciLight },
    heroku: { dark: herokuIcon, light: herokuIcon },
    html: { dark: htmlIcon, light: htmlIcon },
    java: { dark: javaDark, light: javaLight },
    jinja: { dark: jinjaDark, light: jinjaLight },
    js: { dark: jsIcon, light: jsIcon },
    jupyter: { dark: jupyterDark, light: jupyterLight },
    jwt: { dark: jwtDark, light: jwtLight },
    linux: { dark: linuxDark, light: linuxLight },
    lucide: { dark: lucideDark, light: lucideLight },
    motion: { dark: motionDark, light: motionLight },
    mysql: { dark: mysqlDark, light: mysqlLight },
    nextjs: { dark: nextjsDark, light: nextjsLight },
    nodejs: { dark: nodejsDark, light: nodejsLight },
    openrouter: { dark: openrouterDark, light: openrouterLight },
    oracle: { dark: oracleIcon, light: oracleIcon },
    php: { dark: phpDark, light: phpLight },
    postgres: { dark: postgresDark, light: postgresLight },
    pydantic: { dark: pydanticDark, light: pydanticLight },
    python: { dark: pythonDark, light: pythonLight },
    radon: { dark: radonDark, light: radonLight },
    react: { dark: reactDark, light: reactLight },
    ruff: { dark: ruffDark, light: ruffLight },
    sass: { dark: sassIcon, light: sassIcon },
    socketio: { dark: socketioDark, light: socketioLight },
    sql: { dark: sqlDark, light: sqlLight },
    styledcomponents: {
        dark: styledcomponentsIcon,
        light: styledcomponentsIcon,
    },
    svg: { dark: svgDark, light: svgLight },
    tailwind: { dark: tailwindDark, light: tailwindLight },
    ts: { dark: tsIcon, light: tsIcon },
    uvicorn: { dark: uvicornDark, light: uvicornLight },
    vite: { dark: viteDark, light: viteLight },
    vscode: { dark: vscodeDark, light: vscodeLight },
};

/** `true` quando o ícone tem variante por tema — ou seja, dois arquivos. */
export const temVariante = (id: SkillIconId): boolean =>
    SKILL_ICONS[id].dark !== SKILL_ICONS[id].light;
