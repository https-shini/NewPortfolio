import React, { useState, useMemo, useCallback, useRef } from "react";
import "./Formacoes.css";
import { useLang } from "@/shared/hooks/useLang";
import { SECTION_IDS } from "@/shared/config/constants";
import {
    educationItems,
    certificationItems,
} from "@/widgets/Timeline/Timeline.data";
import { FormationCard } from "./components/FormationCard";
import {
    IconGraduationCap,
    IconBadge,
    IconSparkles,
    IconChevronDown,
} from "@/shared/ui/Icons";

type FilterKey = "all" | "edu" | "cert";

const ALL_ITEMS = [...educationItems, ...certificationItems];
const INITIAL_LIMIT = 4;

export const Formacoes: React.FC = () => {
    const { t } = useLang();
    const [filter, setFilter] = useState<FilterKey>("all");
    const [showAll, setShowAll] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    const sourceItems = useMemo(() => {
        if (filter === "all") return ALL_ITEMS;
        return ALL_ITEMS.filter((item) => item.category === filter);
    }, [filter]);

    // Limite só se aplica ao filtro "Todos"
    const shouldLimit =
        filter === "all" && !showAll && sourceItems.length > INITIAL_LIMIT;
    const visibleItems = shouldLimit
        ? sourceItems.slice(0, INITIAL_LIMIT)
        : sourceItems;
    const hiddenCount = sourceItems.length - INITIAL_LIMIT;
    const canExpand = filter === "all" && sourceItems.length > INITIAL_LIMIT;

    const handleFilter = useCallback((key: FilterKey) => {
        setFilter(key);
        // Trocar de filtro recolhe a lista expandida
        setShowAll(false);
    }, []);

    const toggleShowAll = useCallback(() => {
        setShowAll((v) => {
            const next = !v;
            // Ao recolher, suavemente reposiciona o usuário no início da seção
            if (v && sectionRef.current) {
                const noMotion = window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                ).matches;
                const top =
                    sectionRef.current.getBoundingClientRect().top +
                    window.scrollY -
                    80;
                window.scrollTo({
                    top,
                    behavior: noMotion ? "auto" : "smooth",
                });
            }
            return next;
        });
    }, []);

    const totalCount = ALL_ITEMS.length;
    const eduCount = educationItems.length;
    const certCount = certificationItems.length;

    return (
        <section
            ref={sectionRef}
            id={SECTION_IDS.EDUCATION}
            className="formations section"
            aria-labelledby="formations-title"
            data-reveal
        >
            <div className="container">
                <header className="section-header">
                    <span className="section-eyebrow">
                        {t("education.eyebrow")}
                    </span>
                    <h2 className="section-title" id="formations-title">
                        {t("education.title")}
                    </h2>
                    <p className="section-subtitle">{t("education.sub")}</p>
                </header>

                <div
                    className="formations__stats"
                    role="status"
                    aria-live="polite"
                >
                    <div className="formations__stats-counter">
                        <span className="formations__stats-num">
                            {String(totalCount).padStart(2, "0")}
                        </span>
                        <span className="formations__stats-label">
                            <IconSparkles
                                width={12}
                                height={12}
                                aria-hidden="true"
                            />
                            {t("education.achievements")}
                        </span>
                    </div>

                    <div
                        className="formations__filters"
                        role="tablist"
                        aria-label={t("education.filterLabel")}
                    >
                        <FilterPill
                            label={t("education.filter.all")}
                            count={totalCount}
                            active={filter === "all"}
                            onClick={() => handleFilter("all")}
                        />
                        <FilterPill
                            icon={<IconGraduationCap width={13} height={13} />}
                            label={t("education.filter.edu")}
                            count={eduCount}
                            active={filter === "edu"}
                            onClick={() => handleFilter("edu")}
                        />
                        <FilterPill
                            icon={<IconBadge width={13} height={13} />}
                            label={t("education.filter.cert")}
                            count={certCount}
                            active={filter === "cert"}
                            onClick={() => handleFilter("cert")}
                        />
                    </div>
                </div>

                <div
                    className={`formations__grid formations__grid--${filter}`}
                    role="region"
                    aria-label={t("education.title")}
                    aria-live="polite"
                >
                    {visibleItems.map((item, idx) => (
                        <FormationCard
                            key={`${filter}-${item.id}`}
                            item={item}
                            staggerIndex={idx}
                        />
                    ))}
                </div>

                {/* Botão Ver mais / Ver menos — apenas filtro "Todos" */}
                {canExpand && (
                    <div className="formations__expand">
                        <button
                            type="button"
                            className={`formations__expand-btn${showAll ? " is-expanded" : ""}`}
                            onClick={toggleShowAll}
                            aria-expanded={showAll}
                            aria-controls="formations-grid"
                        >
                            <span className="formations__expand-label">
                                {showAll
                                    ? t("education.showLess")
                                    : t("education.showMore")}
                            </span>
                            {!showAll && (
                                <span
                                    className="formations__expand-count"
                                    aria-hidden="true"
                                >
                                    +{hiddenCount}
                                </span>
                            )}
                            <span
                                className="formations__expand-icon"
                                aria-hidden="true"
                            >
                                <IconChevronDown width={16} height={16} />
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

/* ─── FilterPill subcomponent ─────────────────────────────── */
interface FilterPillProps {
    icon?: React.ReactNode;
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
}

const FilterPill: React.FC<FilterPillProps> = ({
    icon,
    label,
    count,
    active,
    onClick,
}) => (
    <button
        type="button"
        role="tab"
        aria-selected={active}
        className={`formations__filter${active ? " is-active" : ""}`}
        onClick={onClick}
    >
        {icon && <span className="formations__filter-icon">{icon}</span>}
        <span className="formations__filter-label">{label}</span>
        <span className="formations__filter-count">{count}</span>
    </button>
);
