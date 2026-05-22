import React from 'react';
import './CarouselControls.css';

interface CarouselControlsProps {
    currentIndex: number;
    total:        number;
    visibleCount: number;
    onPrev:       () => void;
    onNext:       () => void;
    onGoTo:       (index: number) => void;
    lang:         'pt' | 'en';
}

export const CarouselControls = React.memo<CarouselControlsProps>(
    ({ currentIndex, total, visibleCount, onPrev, onNext, onGoTo, lang }) => {
        const maxIndex   = Math.max(0, total - visibleCount);
        const slideCount = maxIndex + 1;

        const prevLabel = lang === 'pt' ? 'Recomendação anterior' : 'Previous recommendation';
        const nextLabel = lang === 'pt' ? 'Próxima recomendação'  : 'Next recommendation';
        const goToLabel = (idx: number) =>
            lang === 'pt'
                ? `Ir para recomendação ${idx + 1} de ${slideCount}`
                : `Go to recommendation ${idx + 1} of ${slideCount}`;

        return (
            <div
                className="rec-controls"
                aria-label={lang === 'pt' ? 'Controles do carrossel' : 'Carousel controls'}
            >
                {/* Prev button */}
                <button
                    className="rec-controls__btn"
                    type="button"
                    onClick={onPrev}
                    aria-label={prevLabel}
                    disabled={slideCount <= 1}
                >
                    <svg viewBox="0 0 24 24" width={18} height={18} fill="none"
                         stroke="currentColor" strokeWidth={2}
                         strokeLinecap="round" strokeLinejoin="round"
                         aria-hidden="true">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                {/* Counter + clickable dots */}
                <div className="rec-controls__middle">
                    <span className="rec-controls__counter" aria-hidden="true">
                        <strong>{String(currentIndex + 1).padStart(2, '0')}</strong>
                        <span className="rec-controls__counter-sep">/</span>
                        <span className="rec-controls__counter-total">
                            {String(slideCount).padStart(2, '0')}
                        </span>
                    </span>

                    <div
                        className="rec-controls__dots"
                        role="tablist"
                        aria-label={lang === 'pt' ? 'Navegar recomendações' : 'Navigate recommendations'}
                    >
                        {Array.from({ length: slideCount }).map((_, idx) => {
                            const active = currentIndex === idx;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    aria-current={active ? 'true' : undefined}
                                    aria-label={goToLabel(idx)}
                                    className={`rec-controls__dot${active ? ' is-active' : ''}`}
                                    onClick={() => onGoTo(idx)}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Next button */}
                <button
                    className="rec-controls__btn"
                    type="button"
                    onClick={onNext}
                    aria-label={nextLabel}
                    disabled={slideCount <= 1}
                >
                    <svg viewBox="0 0 24 24" width={18} height={18} fill="none"
                         stroke="currentColor" strokeWidth={2}
                         strokeLinecap="round" strokeLinejoin="round"
                         aria-hidden="true">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>

                {/* SR-only: ensure status is announced */}
                <span className="rec-controls__sr" aria-live="polite">
                    {lang === 'pt'
                        ? `Recomendação ${currentIndex + 1} de ${slideCount}`
                        : `Recommendation ${currentIndex + 1} of ${slideCount}`}
                </span>

            </div>
        );
    },
);

CarouselControls.displayName = 'CarouselControls';
