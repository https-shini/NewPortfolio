/* ─────────────────────────────────────────────────────────
   eslint.config.api.js — o portão de lint das funções serverless
   ─────────────────────────────────────────────────────────
   O lint do projeto é `eslint src`, rodado de dentro de `apps/web`, e
   por isso nunca olhou para `api/`. A tentativa de estender o config de
   lá foi medida e o ESLint a recusa com uma mensagem clara: um arquivo
   fora do diretório base do config é ignorado, e a saída manda mover o
   config para um diretório pai. Daí este arquivo morar na raiz.

   A separação é a mesma do `tsconfig.api.json` e pelo mesmo motivo:
   `api/` roda em Node. Herdar a configuração do frontend traria React,
   jsx-a11y e os globais do navegador — `window`, `document`,
   `localStorage` —, que não existem nestas funções. Declarar os globais
   erradas esconde justamente o erro que o portão deveria pegar.

   Hoje este portão não acusa nada: as 14 entradas de `api/` passam em
   zero problemas. Ele existe para que continuem passando.

   Uma ressalva honesta sobre as dependências: `eslint`, `@eslint/js`,
   `typescript-eslint` e `eslint-config-prettier` estão declaradas em
   `apps/web`, não aqui, e este arquivo as alcança pelo hoisting do
   workspace. Declará-las também na raiz foi tentado e descartado: o
   `npm install` subiu `typescript-eslint` de 8.67.0 para 8.72.1 e mais
   doze pacotes transitivos sem ser pedido, e reescreveu as 16 mil linhas
   do lockfile num formato que nenhuma versão de npm daqui reproduz —
   custo alto para um portão que hoje acusa zero. Se o hoisting mudar,
   este script falha alto, com ERR_MODULE_NOT_FOUND, e não em silêncio.
───────────────────────────────────────────────────────── */
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
    { ignores: ["node_modules"] },

    {
        files: ["api/**/*.ts"],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            prettier,
        ],
        languageOptions: {
            ecmaVersion: 2022,
            /* Só o que estas funções realmente usam. A lista curta é
               deliberada: um global que falte aparece como erro de
               `no-undef`, o que é informação, não estorvo. */
            globals: {
                process: "readonly",
                console: "readonly",
                fetch: "readonly",
                URL: "readonly",
                URLSearchParams: "readonly",
                Buffer: "readonly",
                Response: "readonly",
                TextEncoder: "readonly",
                AbortSignal: "readonly",
                setTimeout: "readonly",
            },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/consistent-type-imports": [
                "warn",
                { fixStyle: "inline-type-imports" },
            ],
        },
    },
);
