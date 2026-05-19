import React from 'react';
import './Formacoes.css';
import { useLang } from '@/shared/hooks/useLang';
import { SECTION_IDS } from '@/shared/config/constants';
import {
    educationItems,
    certificationItems,
} from '@/widgets/Timeline/Timeline.data';
import { FormationCard } from './components/FormationCard';
import { IconGraduationCap, IconBadge } from '@/shared/ui/Icons';

/**
 * Formacoes — "Formações"
 * Trajetória acadêmica + certificações em dois subgrupos.
 * Layout: subseção com eyebrow/título + grid responsivo de cards.
 */
export const Formacoes: React.FC = () => {
    const { t } = useLang();

    return (
        <section
            id={SECTION_IDS.EDUCATION}
            className="formations section"
            aria-labelledby="formations-title"
            data-reveal
        >
            <div className="container">
                <header className="section-header">
                    <span className="section-eyebrow">{t('education.eyebrow')}</span>
                    <h2 className="section-title" id="formations-title">
                        {t('education.title')}
                    </h2>
                    <p className="section-subtitle">{t('education.sub')}</p>
                </header>

                {/* Academic education */}
                {educationItems.length > 0 && (
                    <section
                        className="formations__group"
                        aria-labelledby="formations-edu-title"
                    >
                        <header className="formations__group-head">
                            <span className="formations__group-icon" aria-hidden="true">
                                <IconGraduationCap width={16} height={16} />
                            </span>
                            <h3
                                className="formations__group-title"
                                id="formations-edu-title"
                            >
                                {t('education.edu.title')}
                            </h3>
                            <span className="formations__group-count" aria-hidden="true">
                                {String(educationItems.length).padStart(2, '0')}
                            </span>
                        </header>

                        <div
                            className="formations__grid formations__grid--edu"
                            role="list"
                        >
                            {educationItems.map((item, idx) => (
                                <div key={item.id} role="listitem" className="formations__cell">
                                    <FormationCard item={item} index={idx} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certifications */}
                {certificationItems.length > 0 && (
                    <section
                        className="formations__group"
                        aria-labelledby="formations-cert-title"
                    >
                        <header className="formations__group-head">
                            <span className="formations__group-icon" aria-hidden="true">
                                <IconBadge width={16} height={16} />
                            </span>
                            <h3
                                className="formations__group-title"
                                id="formations-cert-title"
                            >
                                {t('education.cert.title')}
                            </h3>
                            <span className="formations__group-count" aria-hidden="true">
                                {String(certificationItems.length).padStart(2, '0')}
                            </span>
                        </header>

                        <div
                            className="formations__grid formations__grid--cert"
                            role="list"
                        >
                            {certificationItems.map((item, idx) => (
                                <div key={item.id} role="listitem" className="formations__cell">
                                    <FormationCard
                                        item={item}
                                        index={idx + educationItems.length}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </section>
    );
};
