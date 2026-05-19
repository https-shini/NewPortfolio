import React, { useMemo } from "react";
import "./CareerNode.css";
import { useLang } from "@/shared/hooks/useLang";
import { useRevealOnScroll } from "@/shared/hooks/useRevealOnScroll";
import { IconLocation, IconExternalLink } from "@/shared/ui/Icons";
import { PositionEntry } from "./PositionEntry";
import type { CareerCompany } from "../Timeline.types";
import { resolveTotalDuration } from "../careerDates";

interface CareerNodeProps {
    company: CareerCompany;
    index: number;
    /** Verdadeiro se for o último nó do timeline (oculta o ramo do spine abaixo) */
    isLast: boolean;
}

/** Iniciais a partir do nome — fallback quando não há logo. */
function getInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
    return (words[0]![0]! + words[words.length - 1]![0]!).toUpperCase();
}

export const CareerNode: React.FC<CareerNodeProps> = ({ company, index, isLast }) => {
    const { lang } = useLang();
    const ref = useRevealOnScroll<HTMLLIElement>(index, 140);

    const totalDuration = useMemo(
        () => resolveTotalDuration(company, lang),
        [company, lang],
    );

    const hasActivePosition = company.positions.some(p => p.statusType === "active");
    const initials = getInitials(company.name);

    return (
        <li
            ref={ref}
            className={`career-node${hasActivePosition ? " career-node--active" : ""}${isLast ? " career-node--last" : ""}`}
            data-reveal
        >
            <span className="career-node__rail" aria-hidden="true" />

            <span className="career-node__marker" aria-hidden="true">
                {company.logo ? (
                    <img src={company.logo} alt="" />
                ) : (
                    <span className="career-node__initials">{initials}</span>
                )}
                <span className="career-node__marker-glint" aria-hidden="true" />
            </span>

            <div className="career-node__content">
                <header className="career-node__header">
                    <div className="career-node__identity">
                        <h3 className="career-node__name">
                            {company.url ? (
                                <a
                                    href={company.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="career-node__name-link"
                                >
                                    {company.name}
                                    <IconExternalLink width={14} height={14} aria-hidden="true" />
                                </a>
                            ) : (
                                company.name
                            )}
                        </h3>
                        <div className="career-node__meta">
                            <span className="career-node__meta-item career-node__meta-duration">
                                {totalDuration}
                            </span>
                            <span className="career-node__meta-sep" aria-hidden="true">·</span>
                            <span className="career-node__meta-item">
                                <IconLocation width={12} height={12} aria-hidden="true" />
                                {company.location}
                            </span>
                        </div>
                    </div>
                </header>

                <ol className="career-node__positions" aria-label={company.name}>
                    {company.positions.map((pos, i) => (
                        <li key={pos.id} className="career-node__position-item">
                            <PositionEntry position={pos} staggerIndex={i} />
                        </li>
                    ))}
                </ol>
            </div>
        </li>
    );
};
