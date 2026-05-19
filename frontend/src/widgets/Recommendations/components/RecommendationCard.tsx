import React, { useMemo } from 'react';
import './RecommendationCard.css';
import {
    RecommendationItem,
    summarize,
    formatRecommendationDate,
} from '../Recommendations.types';
import { useLang } from '@/shared/hooks/useLang';
import { useRevealOnScroll } from '@/shared/hooks/useRevealOnScroll';
import { getInitials } from '@/shared/lib/text';

interface RecommendationCardProps {
    item:      RecommendationItem;
    index:     number;
    onOpen:    (item: RecommendationItem, trigger: HTMLElement) => void;
    tabbable?: boolean;
}

/**
 * RecommendationCard — visão essencial.
 * Exibe apenas: resumo curto + autor + cargo + data.
 * Tags e relação completa ficam reservadas para o modal.
 */
export const RecommendationCard = React.memo<RecommendationCardProps>(
    ({ item, index, onOpen, tabbable = true }) => {
        const { lang } = useLang();
        const ref = useRevealOnScroll<HTMLButtonElement>(index, 100);

        // Resumo mais enxuto no card (≈ 420 chars) — hierarquia visual clara
        const summary = useMemo(() => summarize(item.text, 420), [item.text]);

        const readMore = lang === 'pt'
            ? 'Ler recomendação completa'
            : 'Read full recommendation';

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onOpen(item, e.currentTarget);
        };

        return (
            <button
                ref={ref}
                type="button"
                className="rec-card"
                tabIndex={tabbable ? 0 : -1}
                onClick={handleClick}
                aria-label={`${readMore} — ${item.authorName}`}
            >
                {/* Decorative opening quote */}
                <span className="rec-card__quote" aria-hidden="true">“</span>

                {/* Summary (clean, no keyword highlights — focus on legibility) */}
                <p className="rec-card__summary">{summary}</p>

                {/* Divider */}
                <span className="rec-card__divider" aria-hidden="true" />

                {/* Footer: avatar + author */}
                <div className="rec-card__footer">
                    <div className="rec-card__avatar" aria-hidden="true">
                        {item.authorPhoto ? (
                            <img
                                src={item.authorPhoto}
                                alt={item.authorName}
                                loading="lazy"
                                className="rec-card__avatar-img"
                            />
                        ) : (
                            <span className="rec-card__initials">
                                {getInitials(item.authorName)}
                            </span>
                        )}
                    </div>

                    <div className="rec-card__author">
                        <span className="rec-card__name">{item.authorName}</span>
                        <span className="rec-card__role">{item.authorRole}</span>
                    </div>

                    <time className="rec-card__date" dateTime={item.date}>
                        {formatRecommendationDate(item.date, lang)}
                    </time>
                </div>

                {/* Read-more hint (arrow only — subtle) */}
                <span className="rec-card__hint" aria-hidden="true">
                    <svg
                        viewBox="0 0 24 24"
                        width={16}
                        height={16}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </span>
            </button>
        );
    },
);

RecommendationCard.displayName = 'RecommendationCard';
