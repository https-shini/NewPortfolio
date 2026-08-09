import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
    lazy,
    Suspense,
} from "react";
import "./Recommendations.css";
import { useLang } from "@/shared/hooks/useLang";
import { SECTION_IDS, LINKEDIN_URL } from "@/shared/config/constants";
import { recommendations } from "./Recommendations.data";
import { RecommendationCard } from "./components/RecommendationCard";
import { CarouselControls } from "./components/CarouselControls";
import { IconLinkedIn } from "@/shared/ui/Icons";
import type { RecommendationItem } from "./Recommendations.types";

/* Modal só aparece sob clique — carregado sob demanda para ficar
   fora do bundle inicial (JS + CSS). */
const RecommendationModal = lazy(() =>
    import("./components/RecommendationModal").then((m) => ({
        default: m.RecommendationModal,
    })),
);

/* Nº de cards por página: 2 no desktop, 1 no mobile. */
const MOBILE_BREAKPOINT = 880;
const DESKTOP_PER_PAGE = 2;

function getPerPage(): number {
    if (typeof window === "undefined") return DESKTOP_PER_PAGE;
    return window.innerWidth < MOBILE_BREAKPOINT ? 1 : DESKTOP_PER_PAGE;
}

export const Recommendations: React.FC = () => {
    const { t, lang } = useLang();
    const [openItem, setOpenItem] = useState<RecommendationItem | null>(null);
    const [activePage, setActivePage] = useState(0);
    const [perPage, setPerPage] = useState<number>(getPerPage);
    const carouselRef = useRef<HTMLDivElement>(null);
    const total = recommendations.length;

    /* Páginas de `perPage` cards cada. */
    const pages = useMemo(() => {
        const out: RecommendationItem[][] = [];
        for (let i = 0; i < recommendations.length; i += perPage) {
            out.push(recommendations.slice(i, i + perPage));
        }
        return out;
    }, [perPage]);

    const pageCount = Math.max(1, pages.length);
    const maxPage = pageCount - 1;
    /* Derivado (clamp) — evita setState em efeito ao mudar perPage. */
    const currentPage = Math.min(activePage, maxPage);

    /* Ajusta cards por página conforme o viewport. */
    useEffect(() => {
        const mq = window.matchMedia(
            `(max-width: ${MOBILE_BREAKPOINT - 0.1}px)`,
        );
        const update = () => setPerPage(mq.matches ? 1 : DESKTOP_PER_PAGE);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    const goPrev = useCallback(() => {
        setActivePage((i) => {
            const cur = Math.min(i, maxPage);
            return cur === 0 ? maxPage : cur - 1;
        });
    }, [maxPage]);

    const goNext = useCallback(() => {
        setActivePage((i) => {
            const cur = Math.min(i, maxPage);
            return cur === maxPage ? 0 : cur + 1;
        });
    }, [maxPage]);

    const goTo = useCallback(
        (idx: number) => setActivePage(Math.max(0, Math.min(maxPage, idx))),
        [maxPage],
    );

    const touchX = useRef(0);
    const onTouchStart = (e: React.TouchEvent) => {
        touchX.current = e.touches[0]!.clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        const delta = touchX.current - e.changedTouches[0]!.clientX;
        if (Math.abs(delta) > 48) (delta > 0 ? goNext : goPrev)();
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            goPrev();
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            goNext();
        } else if (e.key === "Home") {
            e.preventDefault();
            goTo(0);
        } else if (e.key === "End") {
            e.preventDefault();
            goTo(maxPage);
        }
    };

    /* A restauração do foco ao card de origem é feita pelo Modal base. */
    const openModal = useCallback((item: RecommendationItem) => {
        setOpenItem(item);
    }, []);

    const closeModal = useCallback(() => setOpenItem(null), []);

    const trackStyle = useMemo(
        () => ({ transform: `translateX(-${currentPage * 100}%)` }),
        [currentPage],
    );

    return (
        <section
            id={SECTION_IDS.RECOMMENDATIONS}
            className="rec section"
            aria-labelledby="rec-title"
            data-reveal
        >
            <div className="container">
                <header className="section-header">
                    <span className="section-eyebrow">{t("rec.eyebrow")}</span>
                    <h2 className="section-title" id="rec-title">
                        {t("rec.title")}
                    </h2>
                    <p className="section-subtitle">{t("rec.sub")}</p>
                </header>

                {/* Stats bar */}
                <div className="rec__stats" role="status">
                    <div className="rec__stats-counter">
                        <span className="rec__stats-num">
                            {String(total).padStart(2, "0")}
                        </span>
                        <span className="rec__stats-label">
                            {total === 1
                                ? t("rec.count.one")
                                : t("rec.count.many")}
                        </span>
                    </div>

                    <a
                        href={LINKEDIN_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rec__source-link"
                        aria-label={t("rec.source.label")}
                    >
                        <IconLinkedIn
                            width={14}
                            height={14}
                            aria-hidden="true"
                        />
                        <span>{t("rec.source.text")}</span>
                    </a>
                </div>

                {/* Carrossel paginado — 2 cards por página (1 no mobile) */}
                <div
                    ref={carouselRef}
                    className="rec__carousel"
                    role="region"
                    aria-roledescription="carrossel"
                    aria-label={t("rec.title")}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                    onKeyDown={onKeyDown}
                    tabIndex={0}
                >
                    <div className="rec__viewport">
                        <div className="rec__track" style={trackStyle}>
                            {pages.map((page, pageIdx) => (
                                <div
                                    key={pageIdx}
                                    className="rec__page"
                                    role="group"
                                    aria-roledescription="slide"
                                    aria-label={`${pageIdx + 1} / ${pageCount}`}
                                    aria-hidden={pageIdx !== currentPage}
                                >
                                    {page.map((item, itemIdx) => (
                                        <RecommendationCard
                                            key={item.id}
                                            item={item}
                                            index={pageIdx * perPage + itemIdx}
                                            onOpen={openModal}
                                            tabbable={pageIdx === currentPage}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {pageCount > 1 && (
                    <CarouselControls
                        currentIndex={currentPage}
                        total={pageCount}
                        visibleCount={1}
                        onPrev={goPrev}
                        onNext={goNext}
                        onGoTo={goTo}
                        lang={lang}
                    />
                )}
            </div>

            {openItem && (
                <Suspense fallback={null}>
                    <RecommendationModal item={openItem} onClose={closeModal} />
                </Suspense>
            )}
        </section>
    );
};
