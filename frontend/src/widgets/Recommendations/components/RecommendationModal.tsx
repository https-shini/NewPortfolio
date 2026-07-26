import React from "react";
import "./RecommendationModal.css";
import {
    type RecommendationItem,
    formatRecommendationDate,
} from "../Recommendations.types";
import { useLang } from "@/shared/hooks/useLang";
import { getInitials } from "@/shared/lib/text";
import { Modal } from "@/shared/ui/Modal/Modal";

interface RecommendationModalProps {
    item: RecommendationItem;
    onClose: () => void;
}

/**
 * RecommendationModal — visualização detalhada em duas colunas.
 *  ┌───────────────────────────────┬───────────────────┐
 *  │  texto completo (coluna main) │  autor · contexto │
 *  │                               │  · data · tags    │
 *  └───────────────────────────────┴───────────────────┘
 *
 * Portal, scroll-lock, focus-trap, Esc e overlay são do Modal base
 * (shared/ui/Modal) — aqui vive apenas o conteúdo e o layout interno.
 */
export const RecommendationModal: React.FC<RecommendationModalProps> = ({
    item,
    onClose,
}) => {
    const { lang } = useLang();

    const closeLabel = lang === "pt" ? "Fechar modal" : "Close modal";
    const tagsLabel = lang === "pt" ? "Tópicos" : "Topics";
    const dateLabel = lang === "pt" ? "Data" : "Date";
    const contextLabel = lang === "pt" ? "Contexto" : "Context";

    const paragraphs = item.text[lang]
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);

    return (
        <Modal
            isOpen
            onClose={onClose}
            labelledBy="rec-modal-author"
            describedBy="rec-modal-body"
            className="rec-modal"
        >
            {/* Close button (floats top-right of dialog) */}
            <button
                type="button"
                className="rec-modal__close"
                onClick={onClose}
                aria-label={closeLabel}
            >
                <svg
                    viewBox="0 0 24 24"
                    width={18}
                    height={18}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>

            {/* ── LEFT — full recommendation text ─────────── */}
            {/* Região rolável — precisa ser focável para navegação por teclado (WCAG 2.1.1) */}
            <div
                id="rec-modal-body"
                className="rec-modal__text"
                role="region"
                aria-label={
                    lang === "pt"
                        ? "Texto da recomendação"
                        : "Recommendation text"
                }
                tabIndex={0}
            >
                <span className="rec-modal__quote" aria-hidden="true">
                    “
                </span>
                {paragraphs.map((p, i) => (
                    <p key={i} className="rec-modal__paragraph">
                        {p}
                    </p>
                ))}
            </div>

            {/* ── RIGHT — author / context / tags ─────────── */}
            <aside
                className="rec-modal__sidebar"
                aria-label={
                    lang === "pt" ? "Informações do autor" : "Author info"
                }
            >
                <div className="rec-modal__author-block">
                    <div className="rec-modal__avatar" aria-hidden="true">
                        {item.authorPhoto ? (
                            <img
                                src={item.authorPhoto}
                                alt={item.authorName}
                                className="rec-modal__avatar-img"
                            />
                        ) : (
                            <span className="rec-modal__initials">
                                {getInitials(item.authorName)}
                            </span>
                        )}
                    </div>

                    <h3 id="rec-modal-author" className="rec-modal__name">
                        {item.authorName}
                    </h3>
                    <p className="rec-modal__role">{item.authorRole[lang]}</p>
                </div>

                <dl className="rec-modal__facts">
                    <div className="rec-modal__fact">
                        <dt className="rec-modal__fact-label">{dateLabel}</dt>
                        <dd className="rec-modal__fact-value">
                            <time dateTime={item.date}>
                                {formatRecommendationDate(item.date, lang)}
                            </time>
                        </dd>
                    </div>

                    <div className="rec-modal__fact">
                        <dt className="rec-modal__fact-label">
                            {contextLabel}
                        </dt>
                        <dd className="rec-modal__fact-value">
                            {item.relationship[lang]}
                        </dd>
                    </div>
                </dl>

                {item.tags && item.tags.length > 0 && (
                    <div className="rec-modal__tags-block">
                        <span className="rec-modal__tags-label">
                            {tagsLabel}
                        </span>
                        <ul className="rec-modal__tags" aria-label={tagsLabel}>
                            {item.tags.map((tag, i) => (
                                <li key={i} className="rec-modal__tag">
                                    {tag[lang]}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </aside>
        </Modal>
    );
};
