import React from "react";
import { Header } from "@/widgets/Header/Header";
import { Hero } from "@/widgets/Hero/Hero";
import { About } from "@/widgets/About/About";
import { Timeline } from "@/widgets/Timeline/Timeline";
import { Formacoes } from "@/widgets/Formacoes/Formacoes";
import { Featured } from "@/widgets/Featured/Featured";
import { Work } from "@/widgets/Work/Work";
import { Recommendations } from "@/widgets/Recommendations/Recommendations";
import { Contact } from "@/widgets/Contact/Contact";
import { Footer } from "@/widgets/Footer/Footer";
import { ScrollUtils } from "@/shared/ui/ScrollUtils";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { useLang } from "@/shared/hooks/useLang";

export const HomePage: React.FC = () => {
    const { lang } = useLang();
    useReducedMotion();
    useScrollReveal();

    return (
        <>
            <a href="#main-content" className="skip-link">
                {lang === "pt"
                    ? "Ir para o conteúdo principal"
                    : "Skip to main content"}
            </a>

            <ScrollUtils
                label={lang === "pt" ? "Voltar ao topo" : "Back to top"}
            />

            <Header />
            <main id="main-content">
                <Hero />
                <About />
                <Timeline />
                <Formacoes />
                <Featured />
                <Work />
                <Recommendations />
                <Contact />
            </main>
            <Footer />
            <div
                id="aria-live-region"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            />
        </>
    );
};
