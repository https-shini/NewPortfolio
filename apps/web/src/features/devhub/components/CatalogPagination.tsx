import React from "react";
import { pageList } from "@/features/devhub/catalog";
import { useLang } from "@/shared/hooks/useLang";
import { IconChevronLeft, IconChevronRight } from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   CatalogPagination — páginas numeradas, como num marketplace
   ─────────────────────────────────────────────────────────
   Ordem: Primeira · Anterior · números · Próxima · Última.
   `<nav>` com rótulo próprio; a página atual leva
   `aria-current="page"`. Primeira/Anterior ficam desativadas na
   página 1, Próxima/Última na última — `disabled` nativo, que também
   tira o botão da ordem de Tab. No celular, os números ocupam a
   primeira linha e os quatro controles viram só ícones na segunda (o
   nome segue no aria-label). Botões, e não links: a página vive no
   estado (espelhado na URL por useCatalogState), e o "voltar" do
   navegador não deve atravessar páginas de resultado uma a uma.
───────────────────────────────────────────────────────── */

/* Seta dupla (« / ») — ir ao extremo. Desenhada aqui: o conjunto de
   ícones do projeto só tem a seta simples. */
const Duplo: React.FC<{ lado: "esquerda" | "direita" }> = ({ lado }) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <path
            d={
                lado === "esquerda"
                    ? "m11 17-5-5 5-5M18 17l-5-5 5-5"
                    : "m13 17 5-5-5-5M6 17l5-5-5-5"
            }
        />
    </svg>
);

interface Props {
    page: number;
    pageCount: number;
    onChange: (page: number) => void;
}

export const CatalogPagination: React.FC<Props> = ({
    page,
    pageCount,
    onChange,
}) => {
    const { t } = useLang();
    if (pageCount <= 1) return null;

    return (
        <nav className="catalog-pages" aria-label={t("catalog.pagination")}>
            <button
                type="button"
                className="catalog-pages__step catalog-pages__step--edge"
                onClick={() => onChange(1)}
                disabled={page === 1}
                aria-label={t("catalog.first")}
            >
                <Duplo lado="esquerda" />
                <span className="catalog-pages__label">
                    {t("catalog.first")}
                </span>
            </button>

            <button
                type="button"
                className="catalog-pages__step"
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                aria-label={t("catalog.prev")}
            >
                <IconChevronLeft width={16} height={16} aria-hidden />
                <span className="catalog-pages__label">
                    {t("catalog.prev")}
                </span>
            </button>

            <ul className="catalog-pages__list">
                {pageList(page, pageCount).map((p, i) =>
                    p === null ? (
                        <li
                            key={`gap-${i}`}
                            className="catalog-pages__gap"
                            aria-hidden="true"
                        >
                            …
                        </li>
                    ) : (
                        <li key={p}>
                            <button
                                type="button"
                                className="catalog-pages__num"
                                aria-current={p === page ? "page" : undefined}
                                aria-label={t("catalog.page").replace(
                                    "{n}",
                                    String(p),
                                )}
                                onClick={() => onChange(p)}
                            >
                                {p}
                            </button>
                        </li>
                    ),
                )}
            </ul>

            <button
                type="button"
                className="catalog-pages__step"
                onClick={() => onChange(page + 1)}
                disabled={page === pageCount}
                aria-label={t("catalog.next")}
            >
                <span className="catalog-pages__label">
                    {t("catalog.next")}
                </span>
                <IconChevronRight width={16} height={16} aria-hidden />
            </button>

            <button
                type="button"
                className="catalog-pages__step catalog-pages__step--edge"
                onClick={() => onChange(pageCount)}
                disabled={page === pageCount}
                aria-label={t("catalog.last")}
            >
                <span className="catalog-pages__label">
                    {t("catalog.last")}
                </span>
                <Duplo lado="direita" />
            </button>
        </nav>
    );
};
