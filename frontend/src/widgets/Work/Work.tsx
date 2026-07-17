import React from "react";
import "./Work.css";
import { useLang } from "@/shared/hooks/useLang";
import { type WorkProject } from "./Work.types";
import { IconGitHub, IconExternalLink } from "@/shared/ui/Icons";
import webchatImg from "@/assets/projects/webchat.webp";
import financasImg from "@/assets/projects/financas.webp";
import authLoginImg from "@/assets/authservice/login.webp";

const PROJECTS: WorkProject[] = [
    {
        id: "webchat",
        emoji: "💬",
        title: { pt: "Web Chat", en: "Web Chat" },
        desc: {
            pt: "Aplicação de chat em tempo real utilizando WebSocket, com suporte a múltiplas salas e interação direta no navegador.",
            en: "Real-time chat application built with WebSocket, supporting multiple rooms and direct in-browser interaction.",
        },
        imageUrl: webchatImg,
        tech: [
            { label: "Node.js", variant: "accent" },
            { label: "JavaScript", variant: "brand" },
            { label: "WebSocket", variant: "neutral" },
        ],
        demoUrl: "https://chat-frontend-g42t.onrender.com",
        repoUrl: "https://github.com/https-shini/web-chat",
    },
    {
        id: "auth",
        emoji: "🔐",
        title: { pt: "Auth Service", en: "Auth Service" },
        desc: {
            pt: "Serviço de autenticação com foco em segurança, gerenciamento de usuários e implementação de fluxo com JWT.",
            en: "Authentication service focused on security, user management and a complete JWT-based login flow.",
        },
        imageUrl: authLoginImg,
        tech: [
            { label: "Node.js", variant: "accent" },
            { label: "TypeScript", variant: "brand" },
            { label: "JWT", variant: "neutral" },
        ],
        demoUrl: "https://authservice-mbul.onrender.com/",
        repoUrl: "https://github.com/https-shini/AuthService",
    },
    {
        id: "financas",
        emoji: "💰",
        title: { pt: "Controle Financeiro", en: "Financial Control" },
        desc: {
            pt: "Aplicação para gestão financeira pessoal com controle de entradas, saídas e visualização de saldo em tempo real.",
            en: "Personal finance app for managing income and expenses with real-time balance tracking.",
        },
        imageUrl: financasImg,
        tech: [
            { label: "React", variant: "brand" },
            { label: "JavaScript", variant: "brand" },
            { label: "CSS3", variant: "neutral" },
        ],
        demoUrl: "https://financas-reactjs.vercel.app",
        repoUrl: "https://github.com/https-shini/financas-reactjs",
    },
];

export const Work: React.FC = () => {
    const { t, lang } = useLang();

    return (
        <section
            id="projetos"
            className="work section"
            aria-labelledby="work-title"
            data-reveal
        >
            <div className="container">
                {/* Header */}
                <header className="section-header">
                    <span className="section-eyebrow">{t("work.eyebrow")}</span>

                    <h2 className="section-title" id="work-title">
                        {t("work.title")}
                    </h2>

                    <p className="section-subtitle">{t("work.sub")}</p>
                </header>

                {/* Grid */}
                <div className="work__grid">
                    {PROJECTS.map((project, i) => (
                        <article
                            className="work-card"
                            key={project.id}
                            aria-labelledby={`project-${project.id}`}
                            style={{ ["--card-index" as string]: i }}
                        >
                            {/* Thumbnail */}
                            <div className="work-card__thumb">
                                <img
                                    src={project.imageUrl}
                                    alt={`${t("work.preview")} — ${project.title[lang]}`}
                                    loading="lazy"
                                    decoding="async"
                                />
                                <span
                                    className="work-card__thumb-grad"
                                    aria-hidden="true"
                                />
                                <span
                                    className="work-card__emoji"
                                    aria-hidden="true"
                                >
                                    {project.emoji}
                                </span>
                            </div>

                            {/* Conteúdo */}
                            <div className="work-card__body">
                                <h3
                                    className="work-card__title"
                                    id={`project-${project.id}`}
                                >
                                    {project.title[lang]}
                                </h3>

                                <p className="work-card__desc">
                                    {project.desc[lang]}
                                </p>

                                {/* Tecnologias */}
                                <div
                                    className="work-card__tech"
                                    aria-label={t("work.block.stack")}
                                >
                                    {project.tech.map((tech) => (
                                        <span
                                            key={tech.label}
                                            className={`badge badge--${tech.variant}`}
                                        >
                                            {tech.label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="work-card__footer">
                                <a
                                    href={project.demoUrl}
                                    className="work-btn work-btn--primary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${t("work.btn.demo")} — ${project.title[lang]}`}
                                >
                                    <IconExternalLink
                                        width={14}
                                        height={14}
                                        aria-hidden="true"
                                    />
                                    {t("work.btn.demo")}
                                </a>

                                <a
                                    href={project.repoUrl}
                                    className="work-btn work-btn--outline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${t("work.btn.repo")} — ${project.title[lang]}`}
                                >
                                    <IconGitHub
                                        width={15}
                                        height={15}
                                        aria-hidden="true"
                                    />
                                    {t("work.btn.repo")}
                                </a>
                            </div>
                        </article>
                    ))}
                </div>

                {/* CTA */}
                <div className="work__cta">
                    <a
                        href="https://github.com/https-shini"
                        className="btn btn--outline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t("work.more")}
                        <IconGitHub width={16} height={16} />
                    </a>
                </div>
            </div>
        </section>
    );
};
