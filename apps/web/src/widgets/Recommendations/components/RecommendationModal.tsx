import React, { useEffect, useRef, useState } from "react";
import "./RecommendationModal.css";
import {
    type RecommendationItem,
    formatRecommendationDate,
} from "../Recommendations.types";
import { useLang } from "@/shared/hooks/useLang";
import { getInitials } from "@/shared/lib/text";
import { Modal } from "@/shared/ui/Modal/Modal";

/* Espelha o breakpoint do CSS deste modal. O `.98` guarda o último pixel
   da faixa menor, como o resto da escala do projeto. */
const EMPILHADO = "(max-width: 768.98px)";

/**
 * Layout empilhado (celular) ou em duas colunas (a partir de 769px).
 *
 * Só existe por causa do foco: quem rola muda de elemento conforme o
 * formato — o painel inteiro no empilhado, a coluna de texto no outro —
 * e a área rolável precisa ser alcançável pelo teclado (WCAG 2.1.1).
 * Marcar as duas deixaria um ponto de tabulação morto em cada formato.
 *
 * O modal é carregado sob demanda e nunca existe na prerrenderização,
 * então não há risco de divergência com o HTML do servidor.
 */
function useEmpilhado(): boolean {
    const [empilhado, setEmpilhado] = useState(
        () =>
            typeof window !== "undefined" &&
            window.matchMedia(EMPILHADO).matches,
    );

    useEffect(() => {
        const mq = window.matchMedia(EMPILHADO);
        const update = () => setEmpilhado(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    return empilhado;
}

interface RecommendationModalProps {
    /** Todas as recomendações — a navegação percorre esta lista. */
    items: RecommendationItem[];
    /** Índice da recomendação em exibição. */
    index: number;
    /** Avança (+1) ou volta (-1), circulando nas pontas. */
    onNavigate: (delta: number) => void;
    onClose: () => void;
}

const Seta: React.FC<{ direcao: "anterior" | "proxima" }> = ({ direcao }) => (
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
        <path
            d={direcao === "anterior" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
        />
    </svg>
);

/**
 * RecommendationModal — a recomendação inteira, em três blocos.
 *
 *  ┌──────────────────────────┬────────────────────┐
 *  │ texto completo           │ autor              │
 *  │                          ├────────────────────┤
 *  │                          │ data · contexto ·  │
 *  │                          │ tópicos            │
 *  ├──────────────────────────┴────────────────────┤
 *  │ anterior · 02/04 · próxima                    │
 *  └───────────────────────────────────────────────┘
 *
 * No celular os três viram uma coluna só, na ordem de leitura — quem
 * falou, o que falou, quando e sobre o quê — e **uma única** área de
 * rolagem. Eram duas, aninhadas, e as tags ficavam abaixo da rolagem
 * própria da barra lateral: não apareciam em momento nenhum.
 *
 * Portal, trava de rolagem, foco, Esc e a casca do diálogo são do Modal
 * base (shared/ui/Modal) — aqui vive só o conteúdo e o layout interno.
 */
export const RecommendationModal: React.FC<RecommendationModalProps> = ({
    items,
    index,
    onNavigate,
    onClose,
}) => {
    const { lang } = useLang();
    const empilhado = useEmpilhado();
    const textoRef = useRef<HTMLDivElement>(null);
    const painelRef = useRef<HTMLDivElement>(null);

    const item = items[index];
    const total = items.length;
    const navegavel = total > 1;

    const closeLabel = lang === "pt" ? "Fechar modal" : "Close modal";
    const tagsLabel = lang === "pt" ? "Tópicos" : "Topics";
    const dateLabel = lang === "pt" ? "Data" : "Date";
    const contextLabel = lang === "pt" ? "Contexto" : "Context";
    const prevLabel =
        lang === "pt" ? "Recomendação anterior" : "Previous recommendation";
    const nextLabel =
        lang === "pt" ? "Próxima recomendação" : "Next recommendation";

    /* Cada recomendação começa do começo: sem isto a seguinte abre na
       altura em que a anterior tinha parado. */
    useEffect(() => {
        if (textoRef.current) textoRef.current.scrollTop = 0;
        if (painelRef.current) painelRef.current.scrollTop = 0;
    }, [index]);

    /* ← → percorrem as recomendações. Esc e Tab continuam sendo do
       focus-trap do Modal base.

       No documento, e não no painel: o foco inicial cai no botão de
       fechar, que fica fora dele — preso ao painel, a seta só
       funcionaria depois de o usuário ter clicado em algum lugar de
       dentro. O fundo está inerte enquanto o diálogo existe. */
    useEffect(() => {
        if (!navegavel) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                onNavigate(-1);
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                onNavigate(1);
            }
        };

        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [navegavel, onNavigate]);

    if (!item) return null;

    const paragraphs = item.text[lang]
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);

    /* A região rolável precisa de nome e de foco — e ela troca de
       elemento conforme o formato. Ver `useEmpilhado`. */
    const regiao = {
        role: "region",
        tabIndex: 0,
        "aria-label":
            lang === "pt" ? "Texto da recomendação" : "Recommendation text",
    } as const;

    return (
        <Modal
            isOpen
            onClose={onClose}
            labelledBy="rec-modal-author"
            describedBy="rec-modal-body"
            className="rec-modal"
        >
            {/* Primeiro focável do diálogo — é nele que o foco inicial cai. */}
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

            <div
                ref={painelRef}
                className="rec-modal__panel"
                {...(empilhado ? regiao : {})}
            >
                {/* ── Quem falou ───────────────────────────────── */}
                <header className="rec-modal__identity">
                    <div className="rec-modal__avatar" aria-hidden="true">
                        {item.authorPhoto ? (
                            <img
                                src={item.authorPhoto}
                                alt=""
                                className="rec-modal__avatar-img"
                            />
                        ) : (
                            <span className="rec-modal__initials">
                                {getInitials(item.authorName)}
                            </span>
                        )}
                    </div>

                    <div className="rec-modal__identity-text">
                        <h3 id="rec-modal-author" className="rec-modal__name">
                            {item.authorName}
                        </h3>
                        <p className="rec-modal__role">
                            {item.authorRole[lang]}
                        </p>
                    </div>
                </header>

                {/* ── O que falou ──────────────────────────────── */}
                <div
                    ref={textoRef}
                    id="rec-modal-body"
                    className="rec-modal__text"
                    {...(empilhado ? {} : regiao)}
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

                {/* ── Quando, e sobre o quê ────────────────────── */}
                {/* Focável de propósito: em tela larga e baixa (celular
                    deitado) esta coluna rola por dentro, e área rolável
                    precisa ser alcançável pelo teclado — WCAG 2.1.1, que o
                    axe cobra como `scrollable-region-focusable`. A regra do
                    lint não sabe distinguir esse caso do `tabindex` solto
                    em elemento decorativo. */}
                {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
                <aside
                    className="rec-modal__meta"
                    tabIndex={0}
                    aria-label={
                        lang === "pt"
                            ? "Contexto da recomendação"
                            : "Recommendation context"
                    }
                >
                    <dl className="rec-modal__facts">
                        <div className="rec-modal__fact">
                            <dt className="rec-modal__fact-label">
                                {dateLabel}
                            </dt>
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
                            <ul
                                className="rec-modal__tags"
                                aria-label={tagsLabel}
                            >
                                {item.tags.map((tag, i) => (
                                    <li key={i} className="rec-modal__tag">
                                        {tag[lang]}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </aside>
                {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
            </div>

            {/* ── Percorrer as recomendações sem fechar ─────────── */}
            {navegavel && (
                <nav
                    className="rec-modal__nav"
                    aria-label={
                        lang === "pt"
                            ? "Navegar recomendações"
                            : "Navigate recommendations"
                    }
                >
                    <button
                        type="button"
                        className="rec-modal__nav-btn"
                        onClick={() => onNavigate(-1)}
                        aria-label={prevLabel}
                    >
                        <Seta direcao="anterior" />
                    </button>

                    <span className="rec-modal__counter" aria-hidden="true">
                        <strong>{String(index + 1).padStart(2, "0")}</strong>
                        <span className="rec-modal__counter-sep">/</span>
                        <span className="rec-modal__counter-total">
                            {String(total).padStart(2, "0")}
                        </span>
                    </span>

                    <button
                        type="button"
                        className="rec-modal__nav-btn"
                        onClick={() => onNavigate(1)}
                        aria-label={nextLabel}
                    >
                        <Seta direcao="proxima" />
                    </button>
                </nav>
            )}

            {/* Trocar de recomendação muda o conteúdo do `aria-labelledby`,
                e isso sozinho não é anunciado. */}
            <span className="sr-only" aria-live="polite">
                {lang === "pt"
                    ? `${item.authorName}, recomendação ${index + 1} de ${total}`
                    : `${item.authorName}, recommendation ${index + 1} of ${total}`}
            </span>
        </Modal>
    );
};
