import React, { useState, useCallback } from "react";
import "./Links.css";
import { LinkCard } from "./components/LinkCard";
import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { ScrollUtils } from "@/shared/ui/ScrollUtils";
import { useLang } from "@/shared/hooks/useLang";
import { useTheme } from "@/shared/hooks/useTheme";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { IconShare, IconCheck, IconDownload } from "@/shared/ui/Icons";
import { PROFILE } from "@/shared/config/profile";
import { ROUTES } from "@/shared/config/routes";
import { getCvUrl } from "@/shared/config/constants";
import { PRIMARY_LINKS } from "@/shared/config/links";
import avatarImg from "@/assets/hero.webp";

/* Ícones de tecnologia — skill-icons (tandpfun, MIT); sql-* criado no
   mesmo modelo. Variante por tema (dark/light); Docker e Git têm fundo
   de marca próprio e não variam. Ver src/assets/skills/CREDITS.md. */
import reactDark from "@/assets/skills/react-dark.svg";
import reactLight from "@/assets/skills/react-light.svg";
import nodejsDark from "@/assets/skills/nodejs-dark.svg";
import nodejsLight from "@/assets/skills/nodejs-light.svg";
import pythonDark from "@/assets/skills/python-dark.svg";
import pythonLight from "@/assets/skills/python-light.svg";
import sqlDark from "@/assets/skills/sql-dark.svg";
import sqlLight from "@/assets/skills/sql-light.svg";
import dockerIcon from "@/assets/skills/docker.svg";
import gitIcon from "@/assets/skills/git.svg";

/* ─────────────────────────────────────────────────────────
   /links — a social tree dentro da casca do site
   ─────────────────────────────────────────────────────────
   Esta página monta o mesmo Header e o mesmo Footer da home e da
   /release-notes. Isso é composição, não decoração, e três coisas
   saíram daqui quando a casca entrou:

   · os controles fixos de idioma e tema — o Header carrega os dois;
   · a linha de redes secundárias — a coluna Marca do rodapé já lista
     as mesmas redes, e `SOCIAL_LINKS` está vazio de todo modo;
   · o rodapé próprio — nome, domínio, e-mail, "feito com ♥" e
     copyright estavam todos no Footer também, e a página imprimia o
     copyright duas vezes.

   O que sobrou é o que só existe aqui: identidade, stack, os cartões
   e as duas ações. No desktop os dois blocos ficam lado a lado, para
   que o corpo ocupe a mesma medida do Header e do Footer — ver o
   comentário da grade em Links.css.
───────────────────────────────────────────────────────── */

/* Stack em destaque — ícones skill-icons, variante conforme o tema.
   `light`/`dark` apontam para o mesmo asset quando não há variante. */
interface Tech {
    label: string;
    dark: string;
    light: string;
}

const TECH_STACK: readonly Tech[] = [
    { label: "React", dark: reactDark, light: reactLight },
    { label: "Node.js", dark: nodejsDark, light: nodejsLight },
    { label: "Python", dark: pythonDark, light: pythonLight },
    { label: "SQL", dark: sqlDark, light: sqlLight },
    { label: "Docker", dark: dockerIcon, light: dockerIcon },
    { label: "Git", dark: gitIcon, light: gitIcon },
];

export const LinksPage: React.FC = () => {
    const { lang, t } = useLang();
    /* Só para escolher a variante do ícone de stack — a troca de tema
       agora é botão do Header. */
    const { theme } = useTheme();
    const [copied, setCopied] = useState(false);

    const isDark = theme === "dark";
    const shareUrl = `${PROFILE.siteUrl}${ROUTES.LINKS}`;

    useDocumentMeta({
        title: `${t("links.pageTitle")} — ${PROFILE.name}`,
        description: t("links.meta.description"),
        path: ROUTES.LINKS,
    });

    const handleShare = useCallback(async () => {
        /* Share nativo quando existe: o próprio SO confirma a ação, então
           não há o que sinalizar aqui. Cancelar não é erro — e não pode
           acender o "Copiado!", que era o bug do protótipo. */
        if (navigator.share) {
            try {
                await navigator.share({
                    title: PROFILE.name,
                    url: shareUrl,
                });
            } catch {
                /* usuário cancelou o compartilhamento */
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            /* clipboard indisponível (contexto inseguro ou sem permissão) */
        }
    }, [shareUrl]);

    return (
        <>
            <a href="#main-content" className="skip-link">
                {t("links.skip")}
            </a>

            <ScrollUtils
                label={lang === "pt" ? "Voltar ao topo" : "Back to top"}
            />

            <Header />

            <main id="main-content" className="linktree">
                <div className="linktree__palco">
                    {/* ── Identidade ── */}
                    <div className="linktree__identidade">
                        <div
                            className="linktree__avatar reveal-item"
                            style={{ "--reveal-i": 0 } as React.CSSProperties}
                        >
                            <span
                                className="linktree__avatar-glow"
                                aria-hidden="true"
                            />
                            <span
                                className="linktree__avatar-ring"
                                aria-hidden="true"
                            />
                            <div className="linktree__avatar-frame">
                                <img
                                    src={avatarImg}
                                    alt={PROFILE.name}
                                    className="linktree__avatar-img"
                                    width={120}
                                    height={120}
                                    loading="eager"
                                    decoding="async"
                                />
                            </div>
                        </div>

                        {/* O ponto verde morava na borda do avatar, com o
                            rótulo num `title` — e `title` em <span> não é
                            anunciado por leitor de tela, muito menos com o
                            elemento marcado `aria-hidden`. A tradução de
                            `links.available` existia nos dois idiomas e não
                            chegava a ninguém. Como pill acima do nome ela
                            vira texto de verdade, lido e visto. */}
                        <p
                            className="linktree__disponivel reveal-item"
                            style={{ "--reveal-i": 1 } as React.CSSProperties}
                        >
                            <span
                                className="linktree__disponivel-dot"
                                aria-hidden="true"
                            />
                            {t("links.available")}
                        </p>

                        <h1
                            className="linktree__name reveal-item"
                            style={{ "--reveal-i": 2 } as React.CSSProperties}
                        >
                            {PROFILE.name}
                        </h1>

                        <p
                            className="linktree__handle reveal-item"
                            style={{ "--reveal-i": 3 } as React.CSSProperties}
                        >
                            {PROFILE.handle}
                        </p>

                        <p
                            className="linktree__roles reveal-item"
                            style={{ "--reveal-i": 4 } as React.CSSProperties}
                        >
                            {/* O separador era um <i> solto entre os papéis.
                                Quando a linha quebrava — e a 390px ela
                                quebra — o ponto sobrava no fim da primeira
                                linha, órfão, sugerindo que faltava algo. Ele
                                virou um ::before do papel seguinte: viaja
                                junto com o texto dele e nunca fecha uma
                                linha sozinho. */}
                            {PROFILE.roles.map((role) => (
                                <span key={role} className="linktree__role">
                                    {role}
                                </span>
                            ))}
                        </p>

                        <p
                            className="linktree__bio reveal-item"
                            style={{ "--reveal-i": 5 } as React.CSSProperties}
                        >
                            {t("links.bio")}
                        </p>

                        <ul
                            className="linktree__chips reveal-item"
                            style={{ "--reveal-i": 6 } as React.CSSProperties}
                            aria-label={t("links.techLabel")}
                        >
                            {TECH_STACK.map((tech) => (
                                <li key={tech.label} className="linktree__chip">
                                    <img
                                        className="linktree__chip-ic"
                                        src={isDark ? tech.dark : tech.light}
                                        alt=""
                                        width={18}
                                        height={18}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    {tech.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Acervo: os cartões e as duas ações ──
                        As ações moram aqui, e não sob a identidade, para
                        equilibrar as duas colunas no desktop. */}
                    <div className="linktree__acervo">
                        {/* Fora do <nav>, e não dentro: o nav já se nomeia
                            por aria-label, e uma frase corrida como primeiro
                            conteúdo de uma landmark de navegação seria lida
                            como parte da navegação. Aqui ela é o parágrafo
                            que apresenta a região seguinte. */}
                        <p
                            className="linktree__intro reveal-item"
                            style={{ "--reveal-i": 7 } as React.CSSProperties}
                        >
                            {t("links.intro")}
                        </p>

                        <nav
                            className="linktree__links"
                            aria-label={t("links.mainLinks")}
                        >
                            {PRIMARY_LINKS.map((link, i) => (
                                <LinkCard
                                    key={link.id}
                                    link={link}
                                    index={i + 8}
                                />
                            ))}
                        </nav>

                        <div
                            className="linktree__actions reveal-item"
                            style={
                                {
                                    "--reveal-i": 8 + PRIMARY_LINKS.length,
                                } as React.CSSProperties
                            }
                        >
                            <a
                                className="btn btn--primary"
                                href={getCvUrl(lang)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <IconDownload width={16} height={16} />
                                <span>{t("links.cv")}</span>
                            </a>

                            <button
                                type="button"
                                className={`btn btn--outline${copied ? " is-copied" : ""}`}
                                onClick={handleShare}
                            >
                                {copied ? (
                                    <IconCheck width={16} height={16} />
                                ) : (
                                    <IconShare width={16} height={16} />
                                )}
                                <span>
                                    {copied
                                        ? t("links.copied")
                                        : t("links.share")}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
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
