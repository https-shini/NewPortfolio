import React from "react";
import { Header } from "@/widgets/Header/Header";
import { Hero } from "@/widgets/Hero/Hero";
import { About } from "@/widgets/About/About";
import { Timeline } from "@/widgets/Timeline/Timeline";
import { Featured } from "@/widgets/Featured/Featured";
import { Work } from "@/widgets/Work/Work";
import { Contact } from "@/widgets/Contact/Contact";
import { Footer } from "@/widgets/Footer/Footer";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";

export const HomePage: React.FC = () => {
    useReducedMotion();
    useScrollReveal();

    return (
        <>
            <a href="#main-content" className="skip-link">
                Ir para o conteúdo principal
            </a>
            <Header />
            <main id="main-content">
                <Hero />
                <About />
                <Timeline />
                <Featured />
                <Work />
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
