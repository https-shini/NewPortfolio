import React, { useMemo } from "react";
import "./RecommendationCard.css";
import {
    type RecommendationItem,
    summarize,
    formatRecommendationDate,
} from "../Recommendations.types";
import { useLang } from "@/shared/hooks/useLang";
import { useRevealOnScroll } from "@/shared/hooks/useRevealOnScroll";
import { getInitials } from "@/shared/lib/text";
import { IconArrowRight } from "@/shared/ui/Icons";

interface RecommendationCardProps {
    item: RecommendationItem;
    index: number;
    onOpen: (item: RecommendationItem, trigger: HTMLElement) => void;
    tabbable?: boolean;
}

const PREVIEW_CHARS = 360;
const MAX_VISIBLE_TAGS = 3;

export const RecommendationCard = React.memo<RecommendationCardProps>(
    ({ item, index, onOpen, tabbable = true }) => {
        const { lang } = useLang();
        const ref = useRevealOnScroll<HTMLButtonElement>(index, 110);

        const summary = useMemo(
            () => summarize(item.text[lang], PREVIEW_CHARS),
            [item.text, lang],
        );

        const visibleTags = (item.tags ?? []).slice(0, MAX_VISIBLE_TAGS);
        const remainingTags = (item.tags?.length ?? 0) - visibleTags.length;

        const readMore =
            lang === "pt"
                ? "Ler recomendação completa"
                : "Read full recommendation";
        const readMoreShort = lang === "pt" ? "Ler completo" : "Read full";

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
                {/* Decorative glow */}
                <span className="rec-card__glow" aria-hidden="true" />

                {/* Decorative opening quote */}
                <span className="rec-card__quote" aria-hidden="true">
                    "
                </span>

                {/* Date pill */}
                <time className="rec-card__date" dateTime={item.date}>
                    {formatRecommendationDate(item.date, lang)}
                </time>

                {/* Summary */}
                <p className="rec-card__summary">{summary}</p>

                {/* Tags */}
                {visibleTags.length > 0 && (
                    <ul
                        className="rec-card__tags"
                        aria-label={lang === "pt" ? "Tópicos" : "Topics"}
                    >
                        {visibleTags.map((tag, i) => (
                            <li key={i} className="rec-card__tag">
                                {tag[lang]}
                            </li>
                        ))}
                        {remainingTags > 0 && (
                            <li className="rec-card__tag rec-card__tag--more">
                                +{remainingTags}
                            </li>
                        )}
                    </ul>
                )}

                {/* Divider */}
                <span className="rec-card__divider" aria-hidden="true" />

                {/* Footer */}
                <div className="rec-card__footer">
                    <div className="rec-card__avatar" aria-hidden="true">
                        {item.authorPhoto ? (
                            <img
                                src={item.authorPhoto}
                                alt={item.authorName}
                                loading="lazy"
                                decoding="async"
                                width={44}
                                height={44}
                                className="rec-card__avatar-img"
                            />
                        ) : (
                            <span className="rec-card__initials">
                                {getInitials(item.authorName)}
                            </span>
                        )}
                    </div>

                    <div className="rec-card__author">
                        <span className="rec-card__name">
                            {item.authorName}
                        </span>
                        <span className="rec-card__role">
                            {item.authorRole[lang]}
                        </span>
                    </div>

                    <span className="rec-card__cta" aria-hidden="true">
                        {readMoreShort}
                        <IconArrowRight
                            width={12}
                            height={12}
                            aria-hidden="true"
                        />
                    </span>
                </div>
            </button>
        );
    },
);

RecommendationCard.displayName = "RecommendationCard";
