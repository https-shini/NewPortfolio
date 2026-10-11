/**
 * useTheme — o hook público do tema.
 *
 * A lógica mora em `app/ThemeContext.tsx`, num Provider: o estado é um só
 * para a aplicação inteira. Este arquivo é só o reexport, na mesma forma
 * que `useLang.ts` tem desde sempre — assim os consumidores importam de
 * `shared/hooks/` e não precisam saber que há um Context atrás.
 *
 * Antes isto era um `useState` aqui dentro, e o cabeçalho avisava para não
 * chamar o hook em mais de um componente. O aviso não bastava: a
 * `pages/Links` chamava em paralelo com o Header e os ícones de stack de lá
 * ficavam com o tema velho. Com o Provider, chamar de dez lugares é
 * correto e barato.
 */
export { useThemeContext as useTheme } from "@/app/ThemeContext";
export type { Theme } from "@/app/ThemeContext";
