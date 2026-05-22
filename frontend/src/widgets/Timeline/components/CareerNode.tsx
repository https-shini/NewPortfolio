import React, { useMemo } from "react";
import "./CareerNode.css";
import { useLang } from "@/shared/hooks/useLang";
import { useRevealOnScroll } from "@/shared/hooks/useRevealOnScroll";
import { IconLocation, IconExternalLink, IconClock, IconBriefcase } from "@/shared/ui/Icons";
import { PositionEntry } from "./PositionEntry";
import type { CareerCompany } from "../Timeline.types";
import { resolveTotalDuration } from "../careerDates";

interface CareerNodeProps {
    company: CareerCompany;
    index: number;
}

/** Iniciais a partir do nome — fallback quando não há logo. */
function getInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
    return (words[0]![0]! + words[words.length - 1]![0]!).toUpperCase();
}

/**
 * CareerNode — card de destaque de uma empresa.
 *
 * Contém uma trilha interna de progressão de cargos (mais recente no
 * topo). Quando um cargo efetivo sucede um estágio na mesma empresa, ele
 * é marcado como "promoção", tornando a narrativa de evolução explícita.
 */
export const CareerNode: React.FC<CareerNodeProps> = ({ company, index }) => {
    const { lang, t } = useLang();
    const ref = useRevealOnScroll<HTMLElement>(index, 120);

    const totalDuration = useMemo(
        () => resolveTotalDuration(company, lang),
        [company, lang],
    );

    const positions = company.positions;
    const hasActivePosition = positions.some(p => p.statusType === "active");
    const initials = getInitials(company.name);
    const roleCount = positions.length;

    // Detecta promoção: um cargo (mais recente) que sucede um estágio
    // (mais antigo, logo abaixo na lista) com vínculo diferente de estágio.
    const promotionFlags = useMemo(
        () =>
            positions.map((pos, i) => {
                const older = positions[i + 1];
                return (
                    !!older &&
                    older.employmentType === "INTERNSHIP" &&
                    pos.employmentType !== "INTERNSHIP"
                );
            }),
        [positions],
    );

    return (
        <article
            ref={ref}
            className={`career-company${hasActivePosition ? " is-active" : ""}`}
            data-reveal
            style={{ ["--company-index" as string]: index }}
        >
            <span className="career-company__glow" aria-hidden="true" />

            {/* Header da empresa */}
            <header className="career-company__header">
                <span className="career-company__avatar" aria-hidden="true">
                    {company.logo ? (
                        <img src={company.logo} alt="" />
                    ) : (
                        <span className="career-company__initials">{initials}</span>
                    )}
                </span>

                <div className="career-company__identity">
                    <div className="career-company__name-row">
                        <h3 className="career-company__name">
                            {company.url ? (
                                <a
                                    href={company.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="career-company__name-link"
                                >
                                    {company.name}
                                    <IconExternalLink width={14} height={14} aria-hidden="true" />
                                </a>
                            ) : (
                                company.name
                            )}
                        </h3>
                        {hasActivePosition && (
                            <span className="career-company__active" aria-label={t("career.status.active")}>
                                <span className="career-company__active-dot" aria-hidden="true" />
                                {t("career.status.active")}
                            </span>
                        )}
                    </div>

                    <div className="career-company__meta">
                        <span className="career-company__meta-item">
                            <IconLocation width={13} height={13} aria-hidden="true" />
                            {company.location}
                        </span>
                        <span className="career-company__meta-sep" aria-hidden="true">·</span>
                        <span className="career-company__meta-item">
                            <IconClock width={13} height={13} aria-hidden="true" />
                            {totalDuration}
                        </span>
                        <span className="career-company__meta-sep" aria-hidden="true">·</span>
                        <span className="career-company__meta-item">
                            <IconBriefcase width={13} height={13} aria-hidden="true" />
                            {roleCount}{" "}
                            {roleCount === 1 ? t("career.stats.role") : t("career.stats.roles")}
                        </span>
                    </div>
                </div>
            </header>

            {/* Trilha de progressão de cargos */}
            <ol className="career-company__roles" aria-label={t("career.positions")}>
                {positions.map((pos, i) => (
                    <li
                        key={pos.id}
                        className={`career-role-row${pos.statusType === "active" ? " is-active" : ""}`}
                    >
                        <span className="career-role-row__node" aria-hidden="true" />
                        <PositionEntry
                            position={pos}
                            staggerIndex={i}
                            defaultOpen={i === 0}
                            isPromotion={promotionFlags[i]}
                        />
                    </li>
                ))}
            </ol>
        </article>
    );
};
