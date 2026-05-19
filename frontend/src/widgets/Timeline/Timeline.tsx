import React from "react";
import "./Timeline.css";
import { useLang } from "@/shared/hooks/useLang";
import { SECTION_IDS } from "@/shared/config/constants";
import { careerCompanies } from "./Timeline.data";
import { CareerNode } from "./components/CareerNode";

/* ─────────────────────────────────────────────────────────
   Timeline → "Carreira"
   ─────────────────────
   Layout: spine vertical com nós por empresa, posições
   expandem inline em acordeão (sem modal).

   ┌──── eyebrow + title + sub ────┐
   │                                │
   │  ●━━━━━━━━━━━━ Empresa         │
   │  │   meta · duração            │
   │  │                             │
   │  │  ┌─ Posição (acordeão) ─┐   │
   │  │  └──────────────────────┘   │
   │  │  ┌─ Posição (acordeão) ─┐   │
   │  │  └──────────────────────┘   │
   │  │                             │
   │  ●  Próxima empresa…          │
   └────────────────────────────────┘
───────────────────────────────────────────────────────── */
export const Timeline: React.FC = () => {
    const { t } = useLang();

    return (
        <section
            id={SECTION_IDS.CAREER}
            className="career section"
            aria-labelledby="career-title"
            data-reveal
        >
            <div className="container">
                <header className="section-header">
                    <span className="section-eyebrow">{t("timeline.eyebrow")}</span>
                    <h2 className="section-title" id="career-title">
                        {t("timeline.title")}
                    </h2>
                    <p className="section-subtitle">{t("timeline.sub")}</p>
                </header>

                <ol className="career__timeline" aria-label={t("timeline.title")}>
                    {careerCompanies.map((company, idx) => (
                        <CareerNode
                            key={company.id}
                            company={company}
                            index={idx}
                            isLast={idx === careerCompanies.length - 1}
                        />
                    ))}
                </ol>
            </div>
        </section>
    );
};
