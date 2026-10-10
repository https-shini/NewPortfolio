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
 * `SQL-*` é a exceção e está dito no CREDITS.md: a fork não tem ícone SQL
 * genérico (só SQLite, MySQL e PostgreSQL), então ele foi criado neste
 * projeto no mesmo modelo.
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

/**
 * Os IDs em uso. União fechada de propósito: é o que faz o compilador
 * reprovar um ícone inexistente, como `TranslationKey` faz com as
 * traduções. Acrescentar um ícone é acrescentar o arquivo, o import e a
 * entrada aqui — nessa ordem, e o `tsc` cobra as três.
 */
export type SkillIconId =
    | "bash"
    | "css"
    | "docker"
    | "fastapi"
    | "figma"
    | "firebase"
    | "git"
    | "html"
    | "java"
    | "js"
    | "linux"
    | "mysql"
    | "nodejs"
    | "oracle"
    | "php"
    | "python"
    | "react"
    | "sass"
    | "sql"
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
    bash: { dark: bashDark, light: bashLight },
    css: { dark: cssIcon, light: cssIcon },
    docker: { dark: dockerIcon, light: dockerIcon },
    fastapi: { dark: fastapiIcon, light: fastapiIcon },
    figma: { dark: figmaDark, light: figmaLight },
    firebase: { dark: firebaseDark, light: firebaseLight },
    git: { dark: gitIcon, light: gitIcon },
    html: { dark: htmlIcon, light: htmlIcon },
    java: { dark: javaDark, light: javaLight },
    js: { dark: jsIcon, light: jsIcon },
    linux: { dark: linuxDark, light: linuxLight },
    mysql: { dark: mysqlDark, light: mysqlLight },
    nodejs: { dark: nodejsDark, light: nodejsLight },
    oracle: { dark: oracleIcon, light: oracleIcon },
    php: { dark: phpDark, light: phpLight },
    python: { dark: pythonDark, light: pythonLight },
    react: { dark: reactDark, light: reactLight },
    sass: { dark: sassIcon, light: sassIcon },
    sql: { dark: sqlDark, light: sqlLight },
    vite: { dark: viteDark, light: viteLight },
    vscode: { dark: vscodeDark, light: vscodeLight },
};

/** `true` quando o ícone tem variante por tema — ou seja, dois arquivos. */
export const temVariante = (id: SkillIconId): boolean =>
    SKILL_ICONS[id].dark !== SKILL_ICONS[id].light;
