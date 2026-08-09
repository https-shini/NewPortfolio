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
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { ROUTES } from "@/shared/config/routes";

/* Título e descrição da home — os mesmos do index.html, declarados aqui
   para que voltar de outra rota restaure exatamente este estado. */
const META = {
    pt: {
        title: "Guilherme Cruz — Desenvolvedor de Software | React, TypeScript & Node.js",
        description:
            "Portfólio profissional de Guilherme Cruz — Desenvolvedor Full Stack especializado em React, TypeScript, Node.js e Python. Projetos reais, experiência e formação.",
    },
    en: {
        title: "Guilherme Cruz — Software Developer | React, TypeScript & Node.js",
        description:
            "Professional portfolio of Guilherme Cruz — Full Stack Developer specialized in React, TypeScript, Node.js and Python. Real projects, experience and education.",
    },
} as const;

export const HomePage: React.FC = () => {
    const { lang } = useLang();
    useReducedMotion();
    useScrollReveal();
    useDocumentMeta({ ...META[lang], path: ROUTES.HOME });

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
