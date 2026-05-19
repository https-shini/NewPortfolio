import React, { useCallback, useRef, useState } from "react";
import "./Timeline.css";
import { useLang } from "@/shared/hooks/useLang";
import { SECTION_IDS } from "@/shared/config/constants";
import { careerCompanies } from "./Timeline.data";
import { CareerCompany } from "./components/CareerCompany";
import { CareerPositionModal } from "./components/CareerPositionModal";
import type {
    CareerCompany as CareerCompanyType,
    CareerPosition,
} from "./Timeline.types";

/* ─────────────────────────────────────────────────────────
   Timeline → "Carreira"
   Trajetória profissional agrupada por empresa.

   Estrutura:
   ┌─────────────────────────────────────────┐
   │  [logo]  Empresa ↗                      │  ← header da empresa
   │          São Paulo · 1 ano 1 mês        │
   ├─────────────────────────────────────────┤
   │ [▸ Posição 1 — clique abre o modal]     │  ← posição = botão
   │ [▸ Posição 2 — clique abre o modal]     │
   └─────────────────────────────────────────┘

   Card = somente essenciais (título, meta, resumo curto, tags).
   Modal = descrição completa + empresa + facts + tags.
───────────────────────────────────────────────────────── */

interface ModalState {
    company: CareerCompanyType;
    position: CareerPosition;
}

export const Timeline: React.FC = () => {
    const { t } = useLang();

    const [modal, setModal] = useState<ModalState | null>(null);
    const lastFocused = useRef<HTMLElement | null>(null);

    const openPosition = useCallback(
        (
            company: CareerCompanyType,
            position: CareerPosition,
            trigger: HTMLElement,
        ) => {
            lastFocused.current = trigger;
            setModal({ company, position });
        },
        [],
    );

    const closePosition = useCallback(() => {
        setModal(null);
        // devolve o foco para o gatilho após o DOM reconciliar
        requestAnimationFrame(() => {
            lastFocused.current?.focus();
        });
    }, []);

    return (
        <section
            id={SECTION_IDS.CAREER}
            className="career section"
            aria-labelledby="career-title"
            data-reveal
        >
            <div className="container">
                <header className="section-header">
                    <span className="section-eyebrow">
                        {t("timeline.eyebrow")}
                    </span>
                    <h2 className="section-title" id="career-title">
                        {t("timeline.title")}
                    </h2>
                    <p className="section-subtitle">{t("timeline.sub")}</p>
                </header>

                <ol className="career__list" aria-label={t("timeline.title")}>
                    {careerCompanies.map((company, idx) => (
                        <CareerCompany
                            key={company.id}
                            company={company}
                            index={idx}
                            onOpen={openPosition}
                        />
                    ))}
                </ol>
            </div>

            {modal && (
                <CareerPositionModal
                    company={modal.company}
                    position={modal.position}
                    onClose={closePosition}
                />
            )}
        </section>
    );
};
