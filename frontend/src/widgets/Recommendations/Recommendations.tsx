import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Recommendations.css';
import { useLang } from '@/shared/hooks/useLang';
import { SECTION_IDS } from '@/shared/config/constants';
import { recommendations } from './Recommendations.data';
import { RecommendationItem } from './Recommendations.types';
import { RecommendationCard } from './components/RecommendationCard';
import { RecommendationModal } from './components/RecommendationModal';
import { CarouselControls } from './components/CarouselControls';

/* ─────────────────────────────────────────────────────────
   COMPONENT — one recommendation per slide (foco + legibilidade)
───────────────────────────────────────────────────────── */
export const Recommendations: React.FC = () => {
    const { lang, t } = useLang();

    /* ── Carousel: one-per-page ───────────────────────── */
    const visibleCount = 1;
    const total = recommendations.length;
    const [index, setIndex] = useState(0);
    const maxIndex = Math.max(0, total - visibleCount);

    const goPrev = useCallback(
        () => setIndex(prev => (prev <= 0 ? maxIndex : prev - 1)),
        [maxIndex],
    );
    const goNext = useCallback(
        () => setIndex(prev => (prev >= maxIndex ? 0 : prev + 1)),
        [maxIndex],
    );
    const goTo = useCallback(
        (target: number) => setIndex(Math.min(Math.max(target, 0), maxIndex)),
        [maxIndex],
    );

    /* ── Touch / swipe ────────────────────────────────── */
    const touchStartX = useRef(0);
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.changedTouches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 48) (delta > 0 ? goNext : goPrev)();
    };

    /* ── Keyboard navigation ──────────────────────────── */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); goPrev(); }
        if (e.key === 'Home')       { e.preventDefault(); goTo(0); }
        if (e.key === 'End')        { e.preventDefault(); goTo(maxIndex); }
    };

    /* ── Modal state + focus return ───────────────────── */
    const [modalItem, setModalItem] = useState<RecommendationItem | null>(null);
    const lastFocused = useRef<HTMLElement | null>(null);

    const openModal = useCallback((item: RecommendationItem, trigger: HTMLElement) => {
        lastFocused.current = trigger;
        setModalItem(item);
    }, []);

    const closeModal = useCallback(() => {
        setModalItem(null);
        requestAnimationFrame(() => {
            lastFocused.current?.focus();
        });
    }, []);

    /* ── Carousel translate ───────────────────────────── */
    const translateX = -(index * 100);

    /* ── Only the active slide is tabbable ────────────── */
    const isVisible = useCallback((idx: number) => idx === index, [index]);

    return (
        <section
            id={SECTION_IDS.RECOMMENDATIONS}
            className="rec section"
            aria-labelledby="rec-title"
            data-reveal
        >
            <div className="container">
                {/* Section header */}
                <header className="section-header">
                    <span className="section-eyebrow">{t('rec.eyebrow')}</span>
                    <h2 className="section-title" id="rec-title">
                        {t('rec.title')}
                    </h2>
                    <p className="section-subtitle">{t('rec.sub')}</p>
                </header>

                {/* Carousel */}
                <div
                    className="rec-carousel"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    aria-roledescription="carousel"
                    aria-label={
                        lang === 'pt'
                            ? 'Carrossel de recomendações — use as setas para navegar'
                            : 'Recommendations carousel — use arrow keys to navigate'
                    }
                >
                    <div className="rec-carousel__viewport">
                    <div
                        className="rec-carousel__track"
                        aria-live="polite"
                        aria-atomic="false"
                        style={{ transform: `translateX(${translateX}%)` }}
                    >
                        {recommendations.map((rec, idx) => (
                            <div
                                key={rec.id}
                                className="rec-carousel__slide"
                                aria-hidden={!isVisible(idx)}
                                role="group"
                                aria-roledescription="slide"
                                aria-label={
                                    lang === 'pt'
                                        ? `${idx + 1} de ${total}`
                                        : `${idx + 1} of ${total}`
                                }
                            >
                                <RecommendationCard
                                    item={rec}
                                    index={idx}
                                    onOpen={openModal}
                                    tabbable={isVisible(idx)}
                                />
                            </div>
                        ))}
                    </div>
                    </div>

                    <CarouselControls
                        currentIndex={index}
                        total={total}
                        visibleCount={visibleCount}
                        onPrev={goPrev}
                        onNext={goNext}
                        onGoTo={goTo}
                        lang={lang}
                    />
                </div>
            </div>

            {modalItem && (
                <RecommendationModal item={modalItem} onClose={closeModal} />
            )}
        </section>
    );
};
