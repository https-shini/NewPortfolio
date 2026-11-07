import React from "react";
import { pageList } from "@/features/devhub/catalog";
import { useLang } from "@/shared/hooks/useLang";
import { IconChevronLeft, IconChevronRight } from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   CatalogPagination — páginas numeradas, como num marketplace
   ─────────────────────────────────────────────────────────
   `<nav>` com rótulo próprio; a página atual leva
   `aria-current="page"`. Botões, e não links: a página vive no
   estado (espelhado na URL por useCatalogState), e o "voltar" do
   navegador não deve atravessar páginas de resultado uma a uma.
───────────────────────────────────────────────────────── */

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
                className="catalog-pages__step"
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
            >
                <IconChevronLeft width={16} height={16} aria-hidden />
                <span>{t("catalog.prev")}</span>
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
            >
                <span>{t("catalog.next")}</span>
                <IconChevronRight width={16} height={16} aria-hidden />
            </button>
        </nav>
    );
};
