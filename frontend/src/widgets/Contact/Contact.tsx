import React from "react";
import "./Contact.css";
import { useLang } from "@/shared/hooks/useLang";
import { ContactForm } from "@/features/contact/ui/ContactForm";
import { IconEmail, IconLinkedIn, IconGitHub } from "@/shared/ui/Icons";
import {
    AUTHOR_EMAIL,
    GITHUB_URL,
    LINKEDIN_URL,
} from "@/shared/config/constants";

export const Contact: React.FC = () => {
    const { t } = useLang();

    return (
        <section
            id="contact"
            className="contact section"
            aria-labelledby="contact-title"
            data-reveal
        >
            <div className="container">
                <header className="section-header section-header--center">
                    <span className="section-eyebrow">Contato</span>
                    <h2 className="section-title" id="contact-title">
                        {t("contact.title")}
                    </h2>
                    <p className="section-subtitle">{t("contact.sub")}</p>
                </header>

                <div className="contact__layout">
                    {/* Info column */}
                    <div className="contact__info">
                        <a
                            href={`mailto:${AUTHOR_EMAIL}`}
                            className="contact__info-card"
                        >
                            <div className="contact__info-icon">
                                <IconEmail width={18} height={18} />
                            </div>
                            <div className="contact__info-meta">
                                <span className="contact__info-label">
                                    E-mail
                                </span>
                                <span className="contact__info-value">
                                    {AUTHOR_EMAIL}
                                </span>
                                <span className="contact__info-note">
                                    Respondo em até 24h
                                </span>
                            </div>
                        </a>

                        <a
                            href={LINKEDIN_URL}
                            className="contact__info-card"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn (abre em nova aba)"
                        >
                            <div className="contact__info-icon">
                                <IconLinkedIn width={18} height={18} />
                            </div>
                            <div className="contact__info-meta">
                                <span className="contact__info-label">
                                    LinkedIn
                                </span>
                                <span className="contact__info-value">
                                    /in/oguilherme-cruz
                                </span>
                                <span className="contact__info-note">
                                    Conecte-se comigo
                                </span>
                            </div>
                        </a>

                        <a
                            href={GITHUB_URL}
                            className="contact__info-card"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub (abre em nova aba)"
                        >
                            <div
                                className="contact__info-icon"
                                style={{ background: "var(--color-surface-3)" }}
                            >
                                <IconGitHub width={18} height={18} />
                            </div>
                            <div className="contact__info-meta">
                                <span className="contact__info-label">
                                    GitHub
                                </span>
                                <span className="contact__info-value">
                                    /https-shini
                                </span>
                                <span className="contact__info-note">
                                    Veja meus repositórios
                                </span>
                            </div>
                        </a>

                        <div className="contact__info-block">
                            <p className="contact__info-label">Localização</p>
                            <p className="contact__info-value">
                                {t("footer.location")}
                            </p>
                            <p className="contact__info-note">
                                Presencial e remoto
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <ContactForm />
                </div>
            </div>
        </section>
    );
};
