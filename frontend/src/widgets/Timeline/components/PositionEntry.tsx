import React, { useState, useRef, useEffect, useId, useCallback } from "react";
import "./PositionEntry.css";
import { useLang } from "@/shared/hooks/useLang";
import { IconChevronDown, IconSparkles } from "@/shared/ui/Icons";
import type { CareerPosition } from "../Timeline.types";
import { resolvePeriod, resolveDuration } from "../careerDates";

type Lang = "pt" | "en";

const EMPLOYMENT_LABEL: Record<string, Record<Lang, string>> = {
    CLT:         { pt: "CLT",                  en: "Full-time" },
    FULL_TIME:   { pt: "Tempo integral",       en: "Full-time" },
    PART_TIME:   { pt: "Meio período",         en: "Part-time" },
    INTERNSHIP:  { pt: "Estágio",              en: "Internship" },
    FREELANCER:  { pt: "Freelancer",           en: "Freelancer" },
    CONTRACTOR:  { pt: "Prestador de serviços", en: "Contractor" },
    TEMPORARY:   { pt: "Temporário",           en: "Temporary" },
};

const MODALITY_LABEL: Record<string, Record<Lang, string>> = {
    ON_SITE: { pt: "Presencial", en: "On-site" },
    REMOTE:  { pt: "Remoto",     en: "Remote" },
    HYBRID:  { pt: "Híbrido",    en: "Hybrid" },
    EAD:     { pt: "EAD",        en: "Distance" },
};

interface PositionEntryProps {
    position: CareerPosition;
    /** índice relativo à animação stagger */
    staggerIndex?: number;
}

export const PositionEntry: React.FC<PositionEntryProps> = ({ position, staggerIndex = 0 }) => {
    const { lang, t } = useLang();
    const [isOpen, setIsOpen] = useState(false);
    const bodyRef = useRef<HTMLDivElement>(null);
    const [bodyHeight, setBodyHeight] = useState<number | "auto">(0);
    const panelId = useId();
    const buttonId = useId();

    const present = t("career.present");
    const period = resolvePeriod(position, lang, present);
    const duration = resolveDuration(position, lang);
    const employment = EMPLOYMENT_LABEL[position.employmentType]?.[lang] ?? position.employmentType;
    const modality = position.modality ? MODALITY_LABEL[position.modality]?.[lang] : null;

    const highlights = position.bullets.filter(b => b.highlight);
    const allBullets = position.bullets;

    // Mede a altura do body para a transição suave
    useEffect(() => {
        if (!bodyRef.current) return;
        const measure = () => {
            if (!bodyRef.current) return;
            // Mede usando scrollHeight para pegar a altura real do conteúdo
            const h = bodyRef.current.scrollHeight;
            setBodyHeight(isOpen ? h : 0);
        };
        measure();
        // re-mede em resize (responsivo)
        const ro = new ResizeObserver(measure);
        ro.observe(bodyRef.current);
        return () => ro.disconnect();
    }, [isOpen, lang]);

    const toggle = useCallback(() => setIsOpen(v => !v), []);

    return (
        <article
            className={`position-entry${isOpen ? " is-open" : ""} position-entry--${position.statusType}`}
            style={{ ["--stagger-index" as string]: staggerIndex }}
        >
            <button
                id={buttonId}
                type="button"
                className="position-entry__trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={toggle}
            >
                {/* Header row 1: title + status */}
                <div className="position-entry__title-row">
                    <h4 className="position-entry__title">{position.title}</h4>
                    <span
                        className={`position-entry__status position-entry__status--${position.statusType}`}
                        aria-label={position.status}
                    >
                        <span className="position-entry__status-dot" aria-hidden="true" />
                        {position.status}
                    </span>
                </div>

                {/* Meta row */}
                <div className="position-entry__meta">
                    <span className="position-entry__meta-item">{employment}</span>
                    <span className="position-entry__meta-sep" aria-hidden="true">·</span>
                    <span className="position-entry__meta-item position-entry__meta-period">{period}</span>
                    <span className="position-entry__meta-sep" aria-hidden="true">·</span>
                    <span className="position-entry__meta-item position-entry__meta-duration">{duration}</span>
                    {modality && (
                        <>
                            <span className="position-entry__meta-sep" aria-hidden="true">·</span>
                            <span className="position-entry__meta-item">{modality}</span>
                        </>
                    )}
                </div>

                {/* Summary preview (closed state) */}
                {position.summary && (
                    <p className="position-entry__summary" aria-hidden={isOpen}>
                        {position.summary}
                    </p>
                )}

                <span className="position-entry__chevron" aria-hidden="true">
                    <IconChevronDown width={18} height={18} />
                </span>
            </button>

            {/* Expandable body */}
            <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="position-entry__panel"
                style={{ height: bodyHeight === "auto" ? "auto" : `${bodyHeight}px` }}
                aria-hidden={!isOpen}
            >
                <div ref={bodyRef} className="position-entry__panel-inner">
                    {/* Full summary (when open) */}
                    {position.summary && (
                        <p className="position-entry__about">{position.summary}</p>
                    )}

                    {/* Highlights */}
                    {highlights.length > 0 && (
                        <section className="position-entry__section position-entry__section--highlights">
                            <h5 className="position-entry__section-title">
                                <IconSparkles width={14} height={14} aria-hidden="true" />
                                {t("career.highlights")}
                            </h5>
                            <ul className="position-entry__highlights">
                                {highlights.map((h, i) => (
                                    <li key={i} className="position-entry__highlight">
                                        {h.text}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* All activities */}
                    {allBullets.length > 0 && (
                        <section className="position-entry__section">
                            <h5 className="position-entry__section-title">
                                {t("career.activities")}
                            </h5>
                            <ul className="position-entry__bullets">
                                {allBullets.map((b, i) => (
                                    <li key={i} className="position-entry__bullet">
                                        {b.text}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Tags */}
                    {position.tags.length > 0 && (
                        <section className="position-entry__section">
                            <h5 className="position-entry__section-title">
                                {t("career.skills")}
                            </h5>
                            <ul className="position-entry__tags">
                                {position.tags.map(tag => (
                                    <li key={tag} className="position-entry__tag">
                                        {tag}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </article>
    );
};
