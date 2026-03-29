import React from "react";
import "./Work.css";
import { useLang } from "@/shared/hooks/useLang";
import { WorkProject } from "./Work.types";
import { IconExternalLink, IconGitHub } from "@/shared/ui/Icons";

const PROJECTS: WorkProject[] = [
    {
        id: "webchat",
        emoji: "💬",
        title: "💬 Web Chat",
        desc: "Aplicação de chat em tempo real utilizando WebSocket, com suporte a múltiplas salas e interação direta no navegador.",
        imageUrl:
            "https://raw.githubusercontent.com/https-shini/AuthService/main/read-model/img/Login01.png",
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
        title: "🔐 Auth Service",
        desc: "Serviço de autenticação com foco em segurança, gerenciamento de usuários e implementação de fluxo com JWT.",
        imageUrl:
            "https://raw.githubusercontent.com/https-shini/AuthService/main/read-model/img/Login01.png",
        tech: [
            { label: "Node.js", variant: "accent" },
            { label: "TypeScript", variant: "brand" },
            { label: "JWT", variant: "neutral" },
        ],
        demoUrl: "https://github.com/https-shini/AuthService",
        repoUrl: "https://github.com/https-shini/AuthService",
    },
    {
        id: "financas",
        emoji: "💰",
        title: "💰 Controle Financeiro",
        desc: "Aplicação para gestão financeira pessoal com controle de entradas, saídas e visualização de saldo em tempo real.",
        imageUrl:
            "https://raw.githubusercontent.com/https-shini/AuthService/main/read-model/img/Login01.png",
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
    const { t } = useLang();

    return (
        <section
            id="work"
            className="work section"
            aria-labelledby="work-title"
            data-reveal
        >
            <div className="container">
                {/* Header */}
                <header className="section-header">
                    <span className="section-eyebrow">Projetos</span>

                    <h2 className="section-title" id="work-title">
                        {t("work.title")}
                    </h2>

                    <p className="section-subtitle">{t("work.sub")}</p>
                </header>

                {/* Grid */}
                <div className="work__grid">
                    {PROJECTS.map((project) => (
                        <article
                            className="work-card"
                            key={project.id}
                            aria-labelledby={`project-${project.id}`}
                        >
                            {/* Thumbnail */}
                            <div className="work-card__thumb">
                                <img
                                    src={project.imageUrl}
                                    alt={`Preview do projeto ${project.title}`}
                                    loading="lazy"
                                />

                                {/* Overlay */}
                                <div
                                    className="work-card__overlay"
                                    aria-hidden="true"
                                >
                                    <a
                                        href={project.demoUrl}
                                        className="work-card__overlay-btn"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Abrir demo de ${project.title}`}
                                    >
                                        <IconExternalLink
                                            width={18}
                                            height={18}
                                        />
                                    </a>

                                    <a
                                        href={project.repoUrl}
                                        className="work-card__overlay-btn"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Abrir repositório de ${project.title}`}
                                    >
                                        <IconGitHub width={18} height={18} />
                                    </a>
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div className="work-card__body">
                                <h3
                                    className="work-card__title"
                                    id={`project-${project.id}`}
                                >
                                    {project.title}
                                </h3>

                                <p className="work-card__desc">
                                    {project.desc}
                                </p>

                                {/* Tecnologias */}
                                <div className="work-card__tech">
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
                                >
                                    Acessar Projeto
                                </a>

                                <a
                                    href={project.repoUrl}
                                    className="work-btn work-btn--outline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Acessar Repositório
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
