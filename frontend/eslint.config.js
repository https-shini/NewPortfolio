import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

export default tseslint.config(
    { ignores: ["dist", "node_modules", "coverage"] },

    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            jsxA11y.flatConfigs.recommended,
            prettier,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                window: "readonly",
                document: "readonly",
                navigator: "readonly",
                localStorage: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                requestAnimationFrame: "readonly",
                IntersectionObserver: "readonly",
                fetch: "readonly",
                console: "readonly",
            },
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/consistent-type-imports": [
                "warn",
                { fixStyle: "inline-type-imports" },
            ],

            /* Padrão WAI-ARIA de carrossel/região rolável: role="region" com
               tabIndex e handlers de teclado/touch é a implementação recomendada
               (https://www.w3.org/WAI/ARIA/apg/patterns/carousel/). */
            "jsx-a11y/no-noninteractive-tabindex": [
                "error",
                { roles: ["region", "dialog"], allowExpressionValues: true },
            ],
            "jsx-a11y/no-noninteractive-element-interactions": [
                "error",
                { handlers: ["onClick"] },
            ],
            "jsx-a11y/no-static-element-interactions": [
                "error",
                { handlers: ["onClick"] },
            ],
        },
    },

    /* Arquivos de configuração e testes — ambiente Node/menos restrito */
    {
        files: ["*.config.{js,ts,mjs}", "src/**/*.test.{ts,tsx}", "src/test/**"],
        rules: {
            "react-refresh/only-export-components": "off",
        },
    },
);
