import React from "react";
import "./Timeline.css";
import { useLang } from "@/shared/hooks/useLang";
import { SECTION_IDS } from "@/shared/config/constants";
import { careerCompanies } from "./Timeline.data";
import { CareerNode } from "./components/CareerNode";
import { CareerStats } from "./components/CareerStats";

/* ─────────────────────────────────────────────────────────
   Timeline → "Carreira"
   ─────────────────────
   Layout: faixa de visão geral (CareerStats) + card de
   destaque por empresa (CareerNode), cada um contendo uma
   trilha interna de progressão de cargos com a narrativa de
   evolução (estágio → efetivação) explicitada.

   ┌──── eyebrow + title + sub ────────────────┐
   │  ⏱ experiência  🏢 empresas  📈 cargos     │
   │                                            │
   │  ┌─ Wise System ───────────────[Atual]─┐  │
   │  │ ● Analista N1 · CLT      ↗ Efetivado │  │
   │  │ │   detalhes (acordeão)              │  │
   │  │ ● Analista · Estágio                 │  │
   │  └──────────────────────────────────────┘  │
   └────────────────────────────────────────────┘
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

                <div className="career__layout">
                    <div className="career__companies">
                        {careerCompanies.map((company, idx) => (
                            <CareerNode key={company.id} company={company} index={idx} />
                        ))}
                    </div>

                    <CareerStats companies={careerCompanies} />
                </div>
            </div>
        </section>
    );
};
