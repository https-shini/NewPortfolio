import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import "./Recommendations.css";
import { useLang } from "@/shared/hooks/useLang";
import { SECTION_IDS, LINKEDIN_URL } from "@/shared/config/constants";
import { recommendations } from "./Recommendations.data";
import { RecommendationCard } from "./components/RecommendationCard";
import { RecommendationModal } from "./components/RecommendationModal";
import { CarouselControls } from "./components/CarouselControls";
import { IconLinkedIn } from "@/shared/ui/Icons";
import type { RecommendationItem } from "./Recommendations.types";

const MOBILE_BREAKPOINT = 880;

export const Recommendations: React.FC = () => {
    const { t, lang } = useLang();
    const [openItem, setOpenItem] = useState<RecommendationItem | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMobile, setIsMobile] = useState<boolean>(
        typeof window !== "undefined"
            ? window.innerWidth < MOBILE_BREAKPOINT
            : false,
    );
    const lastTrigger = useRef<HTMLElement | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const total = recommendations.length;
    const maxIndex = Math.max(0, total - 1);

    /* Responsive switch */
    useEffect(() => {
        const mq = window.matchMedia(
            `(max-width: ${MOBILE_BREAKPOINT - 0.1}px)`,
        );
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    const goPrev = useCallback(() => {
        setActiveIndex((i) => (i === 0 ? maxIndex : i - 1));
    }, [maxIndex]);

    const goNext = useCallback(() => {
        setActiveIndex((i) => (i === maxIndex ? 0 : i + 1));
    }, [maxIndex]);

    const goTo = useCallback(
        (idx: number) => setActiveIndex(Math.max(0, Math.min(maxIndex, idx))),
        [maxIndex],
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
        if (!isMobile) return;
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
            goTo(maxIndex);
        }
    };

    const openModal = useCallback(
        (item: RecommendationItem, trigger?: HTMLElement) => {
            lastTrigger.current = trigger ?? null;
            setOpenItem(item);
        },
        [],
    );

    const closeModal = useCallback(() => {
        setOpenItem(null);
        requestAnimationFrame(() => lastTrigger.current?.focus());
    }, []);

    const trackStyle = useMemo(
        () => ({ transform: `translateX(-${activeIndex * 100}%)` }),
        [activeIndex],
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

                {/* Desktop: Grid · Mobile: Carousel */}
                {isMobile ? (
                    <>
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
                                    {recommendations.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            className="rec__slide"
                                            role="group"
                                            aria-roledescription="slide"
                                            aria-label={`${idx + 1} / ${total}`}
                                            aria-hidden={idx !== activeIndex}
                                        >
                                            <RecommendationCard
                                                item={item}
                                                index={idx}
                                                onOpen={openModal}
                                                tabbable={idx === activeIndex}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <CarouselControls
                            currentIndex={activeIndex}
                            total={total}
                            visibleCount={1}
                            onPrev={goPrev}
                            onNext={goNext}
                            onGoTo={goTo}
                            lang={lang}
                        />
                    </>
                ) : (
                    <div className="rec__grid" role="list">
                        {recommendations.map((item, idx) => (
                            <div
                                key={item.id}
                                role="listitem"
                                className="rec__grid-item"
                            >
                                <RecommendationCard
                                    item={item}
                                    index={idx}
                                    onOpen={openModal}
                                    tabbable
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {openItem && (
                <RecommendationModal item={openItem} onClose={closeModal} />
            )}
        </section>
    );
};
