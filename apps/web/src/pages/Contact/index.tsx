import React from "react";
import "@/widgets/Contact/Contact.css";
import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { ScrollUtils } from "@/shared/ui/ScrollUtils";
import { Contact } from "@/widgets/Contact/Contact";
import { useLang } from "@/shared/hooks/useLang";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { ROUTES } from "@/shared/config/routes";
import { PROFILE } from "@/shared/config/profile";

/* ─────────────────────────────────────────────────────────
   /contato — a seção de contato com endereço próprio
   ─────────────────────────────────────────────────────────
   Página DO SITE, e não autônoma como a /links: monta o mesmo
   Header e o mesmo Footer. A diferença é proposital — a /links
   existe para quem chega de uma bio e pode não conhecer o site;
   esta existe para quem já está aqui, ou para ser compartilhada
   como endereço direto.

   O widget Contact é reaproveitado inteiro, não recriado. Ele
   recebe `headingLevel={1}` porque aqui é a manchete do
   documento, e não uma seção entre outras — mesmo arranjo que o
   ReleaseNotes usa em /release-notes.

   Reaproveitar a seção inteira, e não só o formulário, é o que
   mantém uma fonte só: os caminhos alternativos (e-mail,
   LinkedIn, GitHub, central de links, tempo de resposta,
   localização) são os mesmos nos dois lugares, e uma cópia aqui
   envelheceria em ritmo próprio.

   ── O que esta página mostra hoje ───────────────────────

   O `ContactForm` só renderiza com `VITE_FORM_ENDPOINT`
   configurada, e ela NÃO está configurada no projeto da Vercel —
   ele declara uma variável, GITHUB_TOKEN. Então a página sobe com
   o fluxo de e-mail e os caminhos alternativos, sem o formulário,
   até a #45 publicar `api/contact.ts` e a variável.

   Isso não a torna provisória: o conteúdo é real e completo para
   o que oferece. Por isso não recebe `robots: "noindex"`.
───────────────────────────────────────────────────────── */

export const ContactPage: React.FC = () => {
    const { lang, t } = useLang();
    useReducedMotion();

    useDocumentMeta({
        title: `${t("contact.title")} — ${PROFILE.name}`,
        description: t("contact.meta.description"),
        path: ROUTES.CONTACT,
    });

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
            <main id="main-content" className="contact-page">
                <Contact headingLevel={1} />
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
