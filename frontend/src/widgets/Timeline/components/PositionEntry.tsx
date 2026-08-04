import React from "react";
import "./PositionEntry.css";
import { useLang } from "@/shared/hooks/useLang";
import { Accordion } from "@/shared/ui/Accordion/Accordion";
import {
    IconChevronDown,
    IconSparkles,
    IconBriefcase,
    IconCalendar,
    IconClock,
    IconLocation,
    IconTrendingUp,
} from "@/shared/ui/Icons";
import type { CareerPosition } from "../Timeline.types";
import { resolvePeriod, resolveDuration } from "../careerDates";

type Lang = "pt" | "en";

const EMPLOYMENT_LABEL: Record<string, Record<Lang, string>> = {
    CLT: { pt: "CLT", en: "Full-time" },
    FULL_TIME: { pt: "Tempo integral", en: "Full-time" },
    PART_TIME: { pt: "Meio período", en: "Part-time" },
    INTERNSHIP: { pt: "Estágio", en: "Internship" },
    FREELANCER: { pt: "Freelancer", en: "Freelancer" },
    CONTRACTOR: { pt: "Prestador de serviços", en: "Contractor" },
    TEMPORARY: { pt: "Temporário", en: "Temporary" },
};

const MODALITY_LABEL: Record<string, Record<Lang, string>> = {
    ON_SITE: { pt: "Presencial", en: "On-site" },
    REMOTE: { pt: "Remoto", en: "Remote" },
    HYBRID: { pt: "Híbrido", en: "Hybrid" },
    EAD: { pt: "EAD", en: "Distance" },
};

interface PositionEntryProps {
    position: CareerPosition;
    /** índice relativo à animação stagger */
    staggerIndex?: number;
    /** abre o acordeão por padrão (usado no cargo atual) */
    defaultOpen?: boolean;
    /** marca o cargo como efetivação/promoção (estágio → efetivo) */
    isPromotion?: boolean;
}

export const PositionEntry: React.FC<PositionEntryProps> = ({
    position,
    staggerIndex = 0,
    defaultOpen = false,
    isPromotion = false,
}) => {
    const { lang, t } = useLang();

    const present = t("career.present");
    const period = resolvePeriod(position, lang, present);
    const duration = resolveDuration(position, lang);
    const employment =
        EMPLOYMENT_LABEL[position.employmentType]?.[lang] ??
        position.employmentType;
    const modality = position.modality
        ? MODALITY_LABEL[position.modality]?.[lang]
        : null;
    const statusLabel =
        position.statusType === "active"
            ? t("career.status.active")
            : t("career.status.done");

    const highlights = position.bullets.filter((b) => b.highlight);
    const rest = position.bullets.filter((b) => !b.highlight);
    // Quando não há destaques marcados, "Atividades" recebe a lista completa.
    const activities = highlights.length > 0 ? rest : position.bullets;

    /* Estado, ids, medição de altura e ARIA vivem no Accordion compartilhado. */
    const trigger = (
        <>
            {/* Header row: title + status */}
            <div className="position-entry__title-row">
                <h4 className="position-entry__title">
                    {position.title[lang]}
                </h4>
                <span
                    className={`position-entry__status position-entry__status--${position.statusType}`}
                >
                    <span
                        className="position-entry__status-dot"
                        aria-hidden="true"
                    />
                    {statusLabel}
                </span>
            </div>

            {/* Meta row — chips estruturados com ícones */}
            <div className="position-entry__meta">
                <span className="position-entry__chip">
                    <IconBriefcase width={12} height={12} aria-hidden="true" />
                    {employment}
                </span>
                <span className="position-entry__chip position-entry__chip--period">
                    <IconCalendar width={12} height={12} aria-hidden="true" />
                    {period}
                </span>
                <span className="position-entry__chip">
                    <IconClock width={12} height={12} aria-hidden="true" />
                    {duration}
                </span>
                {modality && (
                    <span className="position-entry__chip">
                        <IconLocation
                            width={12}
                            height={12}
                            aria-hidden="true"
                        />
                        {modality}
                    </span>
                )}
                {isPromotion && (
                    <span className="position-entry__chip position-entry__chip--promo">
                        <IconTrendingUp
                            width={12}
                            height={12}
                            aria-hidden="true"
                        />
                        {t("career.promoted")}
                    </span>
                )}
            </div>

            {/* Summary (sempre visível como tagline do cargo) */}
            {position.summary && (
                <p className="position-entry__summary">
                    {position.summary[lang]}
                </p>
            )}

            <span className="position-entry__chevron" aria-hidden="true">
                <IconChevronDown width={18} height={18} />
            </span>
        </>
    );

    return (
        <Accordion
            as="article"
            classPrefix="position-entry"
            className={`position-entry--${position.statusType}`}
            defaultOpen={defaultOpen}
            style={{ ["--stagger-index" as string]: staggerIndex }}
            trigger={trigger}
        >
            {/* Destaques */}
            {highlights.length > 0 && (
                <section className="position-entry__section position-entry__section--highlights">
                    <h5 className="position-entry__section-title">
                        <IconSparkles
                            width={14}
                            height={14}
                            aria-hidden="true"
                        />
                        {t("career.highlights")}
                    </h5>
                    <ul className="position-entry__highlights">
                        {highlights.map((h, i) => (
                            <li key={i} className="position-entry__highlight">
                                {h.text[lang]}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Demais atividades */}
            {activities.length > 0 && (
                <section className="position-entry__section">
                    <h5 className="position-entry__section-title">
                        {t("career.activities")}
                    </h5>
                    <ul className="position-entry__bullets">
                        {activities.map((b, i) => (
                            <li key={i} className="position-entry__bullet">
                                {b.text[lang]}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Competências */}
            {position.tags.length > 0 && (
                <section className="position-entry__section">
                    <h5 className="position-entry__section-title">
                        {t("career.skills")}
                    </h5>
                    <ul className="position-entry__tags">
                        {position.tags.map((tag, i) => (
                            <li key={i} className="position-entry__tag">
                                {tag[lang]}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </Accordion>
    );
};
