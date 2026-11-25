import { useCommercialMeta } from "@/shared/hooks/useCommercialMeta";
import { useState } from "react";
import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { useLang } from "@/shared/hooks/useLang";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import { ROUTES, withLang } from "@/shared/config/routes";
import { readQuote, QUOTE_META } from "@/shared/config/quote";
import { COPY } from "@/shared/config/servicesContent";
import { QuoteForm } from "./QuoteForm";
import { Estimate } from "./Estimate";
import { BUSINESS_CONTACT } from "./contact";
import "@/shared/ui/Commercial/Commercial.css";
import "./Quote.css";

const copy = {
    pt: {
        back: "← Voltar aos serviços",
        title: "Vamos dar forma ao seu projeto.",
        intro: "Escolha os serviços, confira a estimativa e conte o que precisa. A viabilidade, o escopo, o prazo e o investimento serão alinhados por e-mail. A solicitação não gera contratação automática.",
        configure: "1. Configure sua solicitação",
        details: "2. Conte sobre sua necessidade",
        note: "Você pode incluir links de referência na descrição. Arquivos podem ser compartilhados na conversa por e-mail; esta página não recebe anexos.",
        standalone:
            "Adicionais avulsos dependem de avaliação do projeto existente. Os preços de referência não confirmam compatibilidade nem constituem orçamento definitivo.",
    },
    en: {
        back: "← Back to services",
        title: "Let's shape your project.",
        intro: "Choose services, review the estimate and tell me what you need. Feasibility, scope, timeline and investment will be discussed by email. A request does not automatically create a contract.",
        configure: "1. Configure your request",
        details: "2. Tell me what you need",
        note: "You can include reference links in the description. Files can be shared in the email conversation; this page does not accept attachments.",
        standalone:
            "Standalone add-ons require assessment of the existing project. Reference prices do not confirm compatibility or constitute a final quote.",
    },
};
export function QuotePage() {
    const { lang } = useLang();
    const c = COPY[lang],
        t = copy[lang];
    const [initial] = useState(() => readQuote(window.location.search));
    const [selection, setSelection] = useState(initial.selection);
    const [interest, setInterest] = useState(initial.interest);
    const back = useLinkProps(withLang(ROUTES.SERVICES, lang));
    useCommercialMeta(lang, true);
    useDocumentMeta({
        ...QUOTE_META[lang],
        path: ROUTES.QUOTE,
        robots: "noindex, follow",
    });
    return (
        <>
            <a className="skip-link" href="#main-content">
                {c.skip}
            </a>
            <Header />
            <main
                id="main-content"
                tabIndex={-1}
                className="services-page quote-page container"
            >
                <header className="quote-heading">
                    <a {...back.anchorProps}>{t.back}</a>
                    <p className="services-eyebrow">{c.interests[interest]}</p>
                    <h1>{t.title}</h1>
                    <p className="services-lead">{t.intro}</p>
                </header>
                {interest === "quote" && (
                    <section aria-labelledby="configure-title">
                        <h2 id="configure-title">{t.configure}</h2>
                        {selection.offerId === "addons-only" && (
                            <p className="services-notice">{t.standalone}</p>
                        )}
                        <Estimate
                            selection={selection}
                            onChange={setSelection}
                            onRequest={() =>
                                document.getElementById("quote-name")?.focus()
                            }
                        />
                    </section>
                )}
                <section
                    id="orcamento"
                    className="services-section services-contact"
                    aria-labelledby="quote-title"
                >
                    <div>
                        <h2 id="quote-title">{t.details}</h2>
                        <p>{t.note}</p>
                        <a href={BUSINESS_CONTACT}>
                            {BUSINESS_CONTACT.startsWith("https://wa.me/")
                                ? c.whatsapp
                                : c.email}
                        </a>
                    </div>
                    <QuoteForm
                        selection={selection}
                        onSelection={setSelection}
                        interest={interest}
                        onInterest={setInterest}
                    />
                </section>
            </main>
            <Footer />
        </>
    );
}
