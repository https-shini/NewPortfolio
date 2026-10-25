import { useState } from "react";
import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { LinkedInNotice } from "@/shared/ui/LinkedInNotice/LinkedInNotice";
import { useLang } from "@/shared/hooks/useLang";
import { useRoute } from "@/shared/hooks/useRoute";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import {
    LINKEDIN_NOTICE_COPY,
    linkedInDestination,
} from "@/shared/config/linkedin";
import { PROFILE } from "@/shared/config/profile";
import { ROUTES } from "@/shared/config/routes";

/** Destino seguro de abrir em nova aba/copiar link: nunca salta o aviso. */
export function LinkedInNoticePage() {
    const { lang } = useLang();
    const { navigate } = useRoute();
    const [open, setOpen] = useState(true);
    const copy = LINKEDIN_NOTICE_COPY[lang];
    useDocumentMeta({
        title: `${copy.title} | ${PROFILE.name}`,
        description: copy.body,
        path: ROUTES.LINKEDIN_NOTICE,
        robots: "noindex, follow",
    });
    return (
        <>
            <Header />
            <main
                id="main-content"
                className="container section"
                style={{
                    paddingTop: "calc(var(--header-height) + var(--space-16))",
                    minHeight: "65svh",
                }}
            >
                <h1 className="section-title">{copy.title}</h1>
                <p className="section-subtitle">{copy.body}</p>
                <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => navigate(ROUTES.HOME)}
                >
                    {copy.stay}
                </button>
            </main>
            <Footer />
            {open && (
                <LinkedInNotice
                    destination={linkedInDestination(window.location.search)}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}
