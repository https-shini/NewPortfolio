import React, { useMemo } from "react";
import "./CareerStats.css";
import { useLang } from "@/shared/hooks/useLang";
import { useRevealOnScroll } from "@/shared/hooks/useRevealOnScroll";
import { IconClock, IconBriefcase, IconTrendingUp } from "@/shared/ui/Icons";
import type { CareerCompany } from "../Timeline.types";
import { buildDuration } from "../careerDates";

interface CareerStatsProps {
    companies: CareerCompany[];
}

/**
 * CareerStats — painel lateral (dashboard) da trajetória profissional.
 *
 * Reposicionado ao lado da timeline, agrega:
 *   • Status profissional + nível de experiência
 *   • Métricas derivadas (experiência total, empresas, cargos)
 *   • Competências (tags únicas agregadas dos cargos)
 *
 * Todos os números/competências são derivados dos dados — sem hardcode.
 */
export const CareerStats: React.FC<CareerStatsProps> = ({ companies }) => {
    const { lang, t } = useLang();
    const ref = useRevealOnScroll<HTMLElement>(0, 0);

    const { experience, companiesCount, positionsCount, competencies } = useMemo(() => {
        const allPositions = companies.flatMap(c => c.positions);

        let earliestStart = allPositions[0]?.startDate ?? "";
        let latestEnd: string | undefined = allPositions[0]?.endDate;
        let hasActive = false;

        for (const p of allPositions) {
            if (p.startDate < earliestStart) earliestStart = p.startDate;
            if (!p.endDate) {
                hasActive = true;
            } else if (latestEnd && p.endDate > latestEnd) {
                latestEnd = p.endDate;
            }
        }

        const exp = earliestStart
            ? buildDuration(earliestStart, hasActive ? undefined : latestEnd, lang)
            : "—";

        const comps = [...new Set(allPositions.flatMap(p => p.tags))];

        return {
            experience: exp,
            companiesCount: companies.length,
            positionsCount: allPositions.length,
            competencies: comps,
        };
    }, [companies, lang]);

    const metrics = [
        {
            icon: <IconClock width={16} height={16} aria-hidden="true" />,
            label: t("career.stats.experience"),
            value: experience,
            variant: "brand" as const,
        },
        {
            icon: <IconBriefcase width={16} height={16} aria-hidden="true" />,
            label: companiesCount === 1 ? t("career.stats.company") : t("career.stats.companies"),
            value: String(companiesCount).padStart(2, "0"),
            variant: "accent" as const,
        },
        {
            icon: <IconTrendingUp width={16} height={16} aria-hidden="true" />,
            label: positionsCount === 1 ? t("career.stats.role") : t("career.stats.roles"),
            value: String(positionsCount).padStart(2, "0"),
            variant: "brand" as const,
        },
    ];

    return (
        <aside
            ref={ref}
            className="career-aside"
            data-reveal
            aria-label={t("career.aside.label")}
        >
            {/* Status profissional */}
            <div className="career-aside__card career-aside__status" style={{ ["--card-i" as string]: 0 }}>
                <div className="career-aside__available">
                    <span className="career-aside__pulse" aria-hidden="true" />
                    <span>{t("hero.status")}</span>
                </div>
                <div className="career-aside__level">
                    <span className="career-aside__level-label">{t("career.aside.level")}</span>
                    <span className="career-aside__level-value">{t("career.aside.seniority")}</span>
                </div>
            </div>

            {/* Métricas */}
            <div className="career-aside__card" style={{ ["--card-i" as string]: 1 }}>
                <h3 className="career-aside__title">{t("career.aside.overview")}</h3>
                <ul className="career-aside__metrics">
                    {metrics.map((m, i) => (
                        <li
                            key={m.label}
                            className={`career-aside__metric career-aside__metric--${m.variant}`}
                            style={{ ["--metric-i" as string]: i }}
                        >
                            <span className="career-aside__metric-icon" aria-hidden="true">
                                {m.icon}
                            </span>
                            <span className="career-aside__metric-label">{m.label}</span>
                            <span className="career-aside__metric-value">{m.value}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Competências */}
            {competencies.length > 0 && (
                <div className="career-aside__card" style={{ ["--card-i" as string]: 2 }}>
                    <h3 className="career-aside__title">{t("career.skills")}</h3>
                    <ul className="career-aside__tags">
                        {competencies.map(tag => (
                            <li key={tag} className="career-aside__tag">
                                {tag}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </aside>
    );
};
