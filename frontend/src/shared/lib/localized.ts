/* ─────────────────────────────────────────────────────────
   localized — tipos utilitários de internacionalização
   ─────────────────────────────────────────────────────────
   Padrão único para conteúdo bilíngue vindo de data files
   (arrays/objetos). Resolvido no render via `valor[lang]`.

   Ex.: const title: Localized = { pt: "Carreira", en: "Career" };
        <h2>{title[lang]}</h2>
───────────────────────────────────────────────────────── */

/** Idiomas suportados pela aplicação. */
export type Lang = "pt" | "en";

/** Valor traduzível — mesma forma para PT-BR e EN. */
export type Localized<T = string> = { pt: T; en: T };
