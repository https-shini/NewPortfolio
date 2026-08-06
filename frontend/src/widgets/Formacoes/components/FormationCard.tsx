import React, { useMemo } from "react";
import "./FormationCard.css";
import { useLang } from "@/shared/hooks/useLang";
import {
    IconGraduationCap,
    IconBadge,
    IconExternalLink,
    IconLocation,
    IconCheck,
} from "@/shared/ui/Icons";
import type { TimelineItem } from "@/widgets/Timeline/Timeline.types";

interface FormationCardProps {
    item: TimelineItem;
    /** Índice usado para animação stagger */
    staggerIndex?: number;
}

/** Calcula o progresso (0..1) entre startDate e endDate, baseado em hoje. */
function calcProgress(startDate: string, endDate?: string): number {
    if (!endDate) return 0;
    const [sy, sm] = startDate.split("-").map(Number);
    const [ey, em] = endDate.split("-").map(Number);
    const now = new Date();
    const ny = now.getFullYear();
    const nm = now.getMonth() + 1;

    const start = sy! * 12 + sm!;
    const end = ey! * 12 + em!;
    const today = ny * 12 + nm;

    const total = end - start;
    const elapsed = today - start;
    if (total <= 0) return 1;
    return Math.max(0, Math.min(1, elapsed / total));
}

const SKILLICONS_BASE = "https://skillicons.dev/icons?i=";

export const FormationCard: React.FC<FormationCardProps> = ({
    item,
    staggerIndex = 0,
}) => {
    const { t, lang } = useLang();

    const isEdu = item.category === "edu";
    const isActive = item.statusType === "active";

    const progress = useMemo(
        () => (isActive ? calcProgress(item.startDate, item.endDate) : 0),
        [item.startDate, item.endDate, isActive],
    );
    const progressPct = Math.round(progress * 100);

    // Limita tags para clareza visual
    const visibleTags = item.tags.slice(0, 4);
    const remainingTags = item.tags.length - visibleTags.length;

    return (
        <article
            className={`formation-card formation-card--${item.category} formation-card--${item.statusType}`}
            style={{ ["--stagger-index" as string]: staggerIndex }}
        >
            {/* ─── Glow decorativo (apenas active) ─── */}
            {isActive && (
                <span className="formation-card__glow" aria-hidden="true" />
            )}

            {/* ─── Header ─── */}
            <header className="formation-card__head">
                <span className="formation-card__icon" aria-hidden="true">
                    {isEdu ? (
                        <IconGraduationCap width={18} height={18} />
                    ) : (
                        <IconBadge width={18} height={18} />
                    )}
                </span>

                <span
                    className="formation-card__category-label"
                    aria-hidden="true"
                >
                    {isEdu
                        ? t("education.edu.label")
                        : t("education.cert.label")}
                </span>

                <span className="formation-card__period">
                    {item.period[lang]}
                </span>
            </header>

            {/* ─── Status badge / progress ─── */}
            <div className="formation-card__status-row">
                <span
                    className={`formation-card__status formation-card__status--${item.statusType}`}
                >
                    {item.statusType === "active" ? (
                        <span
                            className="formation-card__status-dot"
                            aria-hidden="true"
                        />
                    ) : (
                        <IconCheck width={12} height={12} aria-hidden="true" />
                    )}
                    {item.statusType === "active"
                        ? t("education.status.active")
                        : t("education.status.done")}
                </span>

                {isActive && item.endDate && (
                    <span
                        className="formation-card__progress-pct"
                        aria-label={`${progressPct}% ${t("education.progress")}`}
                    >
                        {progressPct}%
                    </span>
                )}
            </div>

            {/* ─── Progress bar (apenas active) ─── */}
            {isActive && item.endDate && (
                <div className="formation-card__progress" aria-hidden="true">
                    <span
                        className="formation-card__progress-fill"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            )}

            {/* ─── Title ─── */}
            <h3 className="formation-card__title">{item.title[lang]}</h3>

            {/* ─── Institution ─── */}
            <p className="formation-card__institution">
                {item.institutionUrl ? (
                    <a
                        href={item.institutionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="formation-card__inst-link"
                    >
                        {item.institution}
                        <IconExternalLink
                            width={11}
                            height={11}
                            aria-hidden="true"
                        />
                    </a>
                ) : (
                    item.institution
                )}
            </p>

            {/* ─── Description ─── */}
            <p className="formation-card__desc">{item.description[lang]}</p>

            {/* ─── Tech icons ─── */}
            {item.techIcons && item.techIcons.length > 0 && (
                /* Um div sem papel não aceita aria-label, e os ícones dentro
                   são todos decorativos — o leitor de tela recebia um rótulo
                   sobre nada. Como grupo de imagem, o rótulo enumera as
                   tecnologias e passa a informar de fato. */
                <div
                    className="formation-card__tech"
                    role="img"
                    aria-label={`${t("education.tech.label")}: ${item.techIcons
                        .slice(0, 8)
                        .join(", ")}`}
                >
                    {item.techIcons.slice(0, 8).map((icon) => (
                        <span
                            key={icon}
                            className="formation-card__tech-icon"
                            aria-hidden="true"
                        >
                            <img
                                src={`${SKILLICONS_BASE}${icon}`}
                                alt=""
                                width={20}
                                height={20}
                                loading="lazy"
                                decoding="async"
                            />
                        </span>
                    ))}
                </div>
            )}

            {/* ─── Tags ─── */}
            {visibleTags.length > 0 && (
                <ul
                    className="formation-card__tags"
                    aria-label={t("education.skills.label")}
                >
                    {visibleTags.map((tag, i) => (
                        <li key={i} className="formation-card__tag">
                            {tag[lang]}
                        </li>
                    ))}
                    {remainingTags > 0 && (
                        <li className="formation-card__tag formation-card__tag--more">
                            +{remainingTags}
                        </li>
                    )}
                </ul>
            )}

            {/* ─── Footer ─── */}
            <footer className="formation-card__footer">
                {item.location && (
                    <span className="formation-card__location">
                        <IconLocation
                            width={12}
                            height={12}
                            aria-hidden="true"
                        />
                        {item.location}
                    </span>
                )}

                {item.certUrl && (
                    <a
                        href={item.certUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="formation-card__cert-link"
                        aria-label={`${t("education.cert.link")}: ${item.title[lang]}`}
                    >
                        {t("education.cert.link")}
                        <IconExternalLink
                            width={12}
                            height={12}
                            aria-hidden="true"
                        />
                    </a>
                )}
            </footer>
        </article>
    );
};
