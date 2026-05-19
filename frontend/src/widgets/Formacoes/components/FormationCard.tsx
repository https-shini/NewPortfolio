import React from 'react';
import './FormationCard.css';
import { TimelineItem } from '../Formacoes.types';
import { IconExternalLink, IconGraduationCap, IconBadge } from '@/shared/ui/Icons';
import { useLang } from '@/shared/hooks/useLang';
import { useRevealOnScroll } from '@/shared/hooks/useRevealOnScroll';

interface FormationCardProps {
    item:  TimelineItem;
    index: number;
}

/**
 * FormationCard — card único usado em ambas as subseções
 * (Formação Acadêmica e Certificações). A variação é feita via
 * `item.category`, que define cor do ícone e presença do link de cert.
 */
export const FormationCard = React.memo<FormationCardProps>(({ item, index }) => {
    const { lang, t } = useLang();
    const ref = useRevealOnScroll<HTMLElement>(index, 80);
    const isCert = item.category === 'cert';

    const certLabel = t('education.cert.link');
    const certAria  = lang === 'pt'
        ? `${certLabel}: ${item.title} (abre em nova aba)`
        : `${certLabel}: ${item.title} (opens in new tab)`;

    const Icon = isCert ? IconBadge : IconGraduationCap;

    const statusCls = `formation-card__status formation-card__status--${item.statusType}`;
    const tagsLabel = lang === 'pt' ? 'Competências' : 'Skills';

    return (
        <article
            ref={ref}
            className={`formation-card formation-card--${item.category}`}
            aria-label={`${item.title} — ${item.institution}`}
        >
            {/* Header: icon badge + period */}
            <div className="formation-card__head">
                <span className="formation-card__icon" aria-hidden="true">
                    <Icon width={16} height={16} />
                </span>
                <time className="formation-card__period" dateTime={item.startDate}>
                    {item.period}
                </time>
                <span className={statusCls}>
                    <span className="formation-card__status-dot" aria-hidden="true" />
                    {item.status}
                </span>
            </div>

            {/* Title */}
            <h4 className="formation-card__title">{item.title}</h4>

            {/* Institution */}
            <p className="formation-card__institution">
                {item.institutionUrl ? (
                    <a
                        href={item.institutionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="formation-card__inst-link"
                    >
                        {item.institution}
                    </a>
                ) : (
                    item.institution
                )}
            </p>

            {/* Description */}
            <p className="formation-card__desc">{item.description}</p>

            {/* Tags */}
            {item.tags.length > 0 && (
                <ul className="formation-card__tags" aria-label={tagsLabel}>
                    {item.tags.slice(0, 6).map(tag => (
                        <li key={tag} className="formation-card__tag">{tag}</li>
                    ))}
                </ul>
            )}

            {/* Cert link */}
            {isCert && item.certUrl && (
                <a
                    href={item.certUrl}
                    className="formation-card__cert-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={certAria}
                >
                    {certLabel}
                    <IconExternalLink width={12} height={12} aria-hidden />
                </a>
            )}
        </article>
    );
});

FormationCard.displayName = 'FormationCard';
