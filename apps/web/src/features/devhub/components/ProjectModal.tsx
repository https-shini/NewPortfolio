import React, { useId, useMemo } from "react";
import "./ProjectModal.css";
import { ProjectGallery } from "@/features/devhub/components/ProjectGallery";
import { TechList } from "@/features/devhub/components/TechList";
import { displayName } from "@/features/devhub/catalog";
import {
    formatDate,
    formatNumber,
    formatRelativeDate,
} from "@/features/devhub/format";
import { extractReadme } from "@/features/devhub/readme";
import { lastActivity } from "@/features/devhub/selectors";
import { techsForDetail } from "@/features/devhub/tech";
import {
    NEUTRAL_LANGUAGE_COLOR,
    type Repository,
} from "@/features/devhub/types";
import { useDevhubProject } from "@/features/devhub/useDevhub";
import { useLang } from "@/shared/hooks/useLang";
import {
    IconCheck,
    IconClose,
    IconExternalLink,
    IconGitHub,
} from "@/shared/ui/Icons";
import { Modal } from "@/shared/ui/Modal/Modal";

/* ─────────────────────────────────────────────────────────
   ProjectModal — a documentação do projeto, sem sair da página
   ─────────────────────────────────────────────────────────
   Aberto pelo cartão (título, mídia ou "Documentação do projeto").
   Carregado sob demanda (React.lazy em ProjectCard), então nada daqui
   pesa no documento da home.

     esquerda → galeria com as capturas do README (ProjectGallery)
     direita  → meta · nome · descrição · funcionalidades ·
                tecnologias · números · ações

   O cartão já tem o repositório; o detalhe (`op=project`, com o
   README sanitizado no servidor) só acrescenta galeria, descrição
   longa, funcionalidades e a stack declarada. Enquanto ele carrega —
   ou se falhar — o modal mostra o que o cartão sabia: nunca uma tela
   vazia por causa de um fetch.

   As ações são as mesmas do cartão: "Acessar projeto" (aplicação
   publicada) e "Acessar repositório" (GitHub). Não há link para a
   página interna: o repositório é o destino do projeto.

   Mecânica de diálogo (foco preso, Esc, inerte, trava de rolagem,
   foco devolvido ao gatilho) é do Modal compartilhado.
───────────────────────────────────────────────────────── */

interface Props {
    repo: Repository;
    /** Posição na vitrine — "01 / PROJETO". Ausente no catálogo. */
    index?: number;
    onClose: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

export const ProjectModal: React.FC<Props> = ({ repo, index, onClose }) => {
    const { lang, t } = useLang();
    const tituloId = useId();
    const descId = useId();
    const detalhe = useDevhubProject(repo.name);
    const readme = useMemo(
        () => extractReadme(detalhe.data?.readmeHtml ?? null),
        [detalhe.data],
    );
    const fonte = detalhe.data ?? repo;
    const nome = displayName(repo.name);
    const demo = fonte.homepageUrl;
    const techs = techsForDetail(fonte, readme.techs);
    const descricao = readme.lead ?? fonte.description;
    const atividade = new Date(lastActivity(fonte)).toISOString();
    const tinta = fonte.primaryLanguage?.color ?? NEUTRAL_LANGUAGE_COLOR;

    return (
        <Modal
            isOpen
            onClose={onClose}
            labelledBy={tituloId}
            describedBy={descricao ? descId : undefined}
            className="pmodal"
        >
            <div className="pmodal__grid">
                {/* Primeiro no DOM: é o foco inicial, e Esc/fechar fica a
                    um Tab de distância de qualquer ponto. */}
                <button
                    type="button"
                    className="pmodal__close"
                    onClick={onClose}
                    aria-label={t("modal.close")}
                >
                    <span className="pmodal__close-text">
                        {t("modal.close")}
                    </span>
                    <kbd className="pmodal__kbd" aria-hidden="true">
                        Esc
                    </kbd>
                    <IconClose width={18} height={18} aria-hidden />
                </button>

                <ProjectGallery
                    repo={fonte}
                    images={readme.images}
                    loading={detalhe.loading}
                    name={nome}
                />

                <div className="pmodal__info">
                    {/* Rola sozinha no desktop: precisa ser focável para
                        quem só usa teclado conseguir rolar (WCAG 2.1.1). */}
                    <div
                        className="pmodal__scroll"
                        tabIndex={0}
                        role="region"
                        aria-labelledby={tituloId}
                    >
                        <p className="pmodal__meta">
                            {index !== undefined && (
                                <span className="pmodal__index">
                                    {pad(index + 1)} / {t("card.project")}
                                </span>
                            )}
                            {fonte.primaryLanguage && (
                                <span className="pmodal__lang">
                                    <span
                                        className="pmodal__dot"
                                        style={{ background: tinta }}
                                        aria-hidden="true"
                                    />
                                    {fonte.primaryLanguage.name}
                                </span>
                            )}
                            <span>
                                {t("devhub.detail.created")}{" "}
                                <time dateTime={fonte.createdAt}>
                                    {formatDate(fonte.createdAt, lang)}
                                </time>
                            </span>
                        </p>

                        <h2 className="pmodal__title" id={tituloId}>
                            {nome}
                        </h2>

                        <p className="pmodal__desc" id={descId}>
                            {descricao ?? (
                                <span className="pmodal__muted">
                                    {t("card.noDescription")}
                                </span>
                            )}
                        </p>

                        {detalhe.error && (
                            <p className="pmodal__notice" role="status">
                                {t("modal.error")}
                            </p>
                        )}

                        {readme.features.length > 0 && (
                            <section
                                className="pmodal__block"
                                aria-labelledby={`${tituloId}-f`}
                            >
                                <h3
                                    className="pmodal__heading"
                                    id={`${tituloId}-f`}
                                >
                                    {t("modal.features")}
                                </h3>
                                <ul className="pmodal__features">
                                    {readme.features.map((f) => (
                                        <li key={f}>
                                            <IconCheck
                                                width={15}
                                                height={15}
                                                aria-hidden
                                            />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {techs.length > 0 && (
                            <section
                                className="pmodal__block"
                                aria-labelledby={`${tituloId}-t`}
                            >
                                <h3
                                    className="pmodal__heading"
                                    id={`${tituloId}-t`}
                                >
                                    {t("modal.techs")}
                                </h3>
                                <TechList
                                    techs={techs}
                                    size="lg"
                                    label={t("modal.techs")}
                                />
                            </section>
                        )}

                        <dl
                            className="pmodal__facts"
                            aria-label={t("modal.facts")}
                        >
                            <div>
                                <dt>{t("devhub.detail.stars")}</dt>
                                <dd>
                                    {formatNumber(fonte.stargazerCount, lang)}
                                </dd>
                            </div>
                            <div>
                                <dt>{t("devhub.detail.forks")}</dt>
                                <dd>{formatNumber(fonte.forkCount, lang)}</dd>
                            </div>
                            <div>
                                <dt>{t("devhub.detail.license")}</dt>
                                <dd>{fonte.licenseName ?? "—"}</dd>
                            </div>
                            <div>
                                <dt>{t("devhub.card.updated")}</dt>
                                <dd>
                                    <time dateTime={atividade}>
                                        {formatRelativeDate(atividade, lang)}
                                    </time>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="pmodal__actions">
                        {demo && (
                            <a
                                href={demo}
                                className="pcard__btn pcard__btn--primary"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${t("card.access")}: ${nome} (${t("card.newTab")})`}
                            >
                                <IconExternalLink
                                    width={15}
                                    height={15}
                                    aria-hidden
                                />
                                {t("card.access")}
                            </a>
                        )}
                        <a
                            href={fonte.url}
                            className="pcard__btn pcard__btn--secondary"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${t("card.repo")}: ${nome} (${t("card.newTab")})`}
                        >
                            <IconGitHub width={16} height={16} aria-hidden />
                            {t("card.repo")}
                        </a>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ProjectModal;
