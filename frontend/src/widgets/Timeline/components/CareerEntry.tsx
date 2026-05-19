import React from 'react';
import './CareerEntry.css';
import { TimelineItem } from '../Timeline.types';
import { IconLocation } from '@/shared/ui/Icons';
import { useRevealOnScroll } from '@/shared/hooks/useRevealOnScroll';
import { useLang } from '@/shared/hooks/useLang';

interface CareerEntryProps {
    item:  TimelineItem;
    index: number;
}

/**
 * CareerEntry — uma entrada da linha do tempo profissional.
 * Layout: rail à esquerda (marker) + card à direita.
 * Conteúdo: período · status / título / instituição · localização / descrição /
 * destaques (max 3) / tags.
 */
export const CareerEntry = React.memo<CareerEntryProps>(({ item, index }) => {
    const ref = useRevealOnScroll<HTMLLIElement>(index, 90);
    const { lang } = useLang();

    // Seleciona até 3 destaques mais relevantes
    const highlights = (item.responsibilities ?? [])
        .filter(r => r.highlight)
        .slice(0, 3);

    const tagsLabel = lang === 'pt' ? 'Competências e ferramentas' : 'Skills and tools';

    return (
        <li
            ref={ref}
            className="career-entry"
            aria-label={`${item.title} — ${item.institution}`}
        >
            {/* Rail marker */}
            <span className="career-entry__rail" aria-hidden="true">
                <span className={`career-entry__dot career-entry__dot--${item.statusType}`} />
            </span>

            {/* Card */}
            <article className="career-entry__card">
                {/* Meta: period + status */}
                <div className="career-entry__meta">
                    <time className="career-entry__period" dateTime={item.startDate}>
                        {item.period}
                    </time>
                    <span className={`career-entry__status career-entry__status--${item.statusType}`}>
                        <span className="career-entry__status-dot" aria-hidden="true" />
                        {item.status}
                    </span>
                </div>

                {/* Title */}
                <h3 className="career-entry__title">{item.title}</h3>

                {/* Institution + location */}
                <p className="career-entry__subhead">
                    {item.institutionUrl ? (
                        <a
                            href={item.institutionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="career-entry__inst-link"
                        >
                            {item.institution}
                        </a>
                    ) : (
                        <span>{item.institution}</span>
                    )}
                    {item.location && (
                        <>
                            <span className="career-entry__subhead-sep" aria-hidden="true">·</span>
                            <span className="career-entry__location">
                                <IconLocation width={12} height={12} aria-hidden />
                                {item.location}
                            </span>
                        </>
                    )}
                    {item.modality && (
                        <>
                            <span className="career-entry__subhead-sep" aria-hidden="true">·</span>
                            <span className="career-entry__modality">{item.modality}</span>
                        </>
                    )}
                </p>

                {/* Description */}
                <p className="career-entry__desc">{item.description}</p>

                {/* Highlights */}
                {highlights.length > 0 && (
                    <ul
                        className="career-entry__highlights"
                        aria-label={lang === 'pt' ? 'Destaques' : 'Highlights'}
                    >
                        {highlights.map((h, i) => (
                            <li key={i} className="career-entry__highlight">{h.text}</li>
                        ))}
                    </ul>
                )}

                {/* Tags */}
                {item.tags.length > 0 && (
                    <ul className="career-entry__tags" aria-label={tagsLabel}>
                        {item.tags.map(tag => (
                            <li key={tag} className="career-entry__tag">{tag}</li>
                        ))}
                    </ul>
                )}
            </article>
        </li>
    );
});

CareerEntry.displayName = 'CareerEntry';
