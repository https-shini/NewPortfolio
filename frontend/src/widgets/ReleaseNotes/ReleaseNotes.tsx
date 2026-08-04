import React, { useMemo, useState } from "react";
import "./ReleaseNotes.css";
import { useLang } from "@/shared/hooks/useLang";
import {
    RELEASE_NOTES,
    getUsedTags,
    type ReleaseEntry,
} from "@/shared/config/releaseNotes";
import { IconGitBranch } from "@/shared/ui/Icons";
import { ReleaseCard } from "./components/ReleaseCard";
import { ReleaseAccordionItem } from "./components/ReleaseAccordionItem";
import { TagFilter } from "./components/TagFilter";
import type { ReleaseFilter } from "./ReleaseNotes.types";

/** Quantos itens do histórico aparecem antes de "ver mais antigas". */
const PAGE_SIZE = 3;

interface ReleaseNotesProps {
    /** Entradas a exibir; por padrão, a camada local. */
    entries?: ReleaseEntry[];
    /** id do título, para o `aria-labelledby` do modal que a envolve. */
    titleId?: string;
}

/**
 * ReleaseNotes — linha do tempo das versões.
 *
 * A entrada mais recente ocupa o topo, sempre expandida; as demais
 * viram itens colapsáveis, filtráveis por tema e revelados aos poucos.
 */
export const ReleaseNotes: React.FC<ReleaseNotesProps> = ({
    entries = RELEASE_NOTES,
    titleId,
}) => {
    const { t } = useLang();
    const [filter, setFilter] = useState<ReleaseFilter>("all");
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const [latest, ...history] = entries;

    const tags = useMemo(() => getUsedTags(entries), [entries]);

    const filtered = useMemo(
        () =>
            filter === "all"
                ? history
                : history.filter((e) => e.tags?.includes(filter)),
        [history, filter],
    );

    const visible = filtered.slice(0, visibleCount);
    const remaining = filtered.length - visible.length;

    const handleFilter = (next: ReleaseFilter) => {
        setFilter(next);
        /* Trocar de filtro recomeça a paginação — senão o usuário veria
           uma lista já "aberta" por uma escolha anterior. */
        setVisibleCount(PAGE_SIZE);
    };

    if (!latest) return null;

    return (
        /* <section>, e não <div>: dentro de um elemento de seccionamento o
           <header> abaixo é apenas um cabeçalho, não um landmark `banner`
           — que já existe uma vez na página, no Header do site. */
        <section className="release-notes" aria-labelledby={titleId}>
            <header className="release-notes__header">
                <span className="release-notes__eyebrow">
                    <IconGitBranch width={14} height={14} aria-hidden="true" />v
                    {latest.version}
                </span>

                <h2 className="release-notes__title" id={titleId}>
                    {t("releaseNotes.title")}
                </h2>

                <p className="release-notes__subtitle">
                    {t("releaseNotes.subtitle")}
                </p>
            </header>

            <div className="release-notes__timeline">
                {/* Trilha decorativa — a estrutura real é a lista abaixo. */}
                <span className="release-notes__rail" aria-hidden="true" />

                <ol className="release-notes__list">
                    <li className="release-notes__entry release-notes__entry--latest">
                        <ReleaseCard entry={latest} />
                    </li>
                </ol>

                {history.length > 0 && (
                    <>
                        <div className="release-notes__history-header">
                            <h3 className="release-notes__history-title">
                                {t("releaseNotes.previous")}
                            </h3>
                            <TagFilter
                                tags={tags}
                                active={filter}
                                onChange={handleFilter}
                            />
                        </div>

                        {visible.length === 0 ? (
                            <p
                                className="release-notes__empty"
                                role="status"
                                aria-live="polite"
                            >
                                {t("releaseNotes.empty")}
                            </p>
                        ) : (
                            <ol className="release-notes__list">
                                {visible.map((entry) => (
                                    <ReleaseAccordionItem
                                        key={entry.version}
                                        entry={entry}
                                    />
                                ))}
                            </ol>
                        )}

                        {remaining > 0 && (
                            <div className="release-notes__more">
                                <button
                                    type="button"
                                    className="btn btn--outline btn--sm"
                                    onClick={() =>
                                        setVisibleCount((v) => v + PAGE_SIZE)
                                    }
                                >
                                    {t("releaseNotes.loadOlder")}
                                    <span className="release-notes__more-count">
                                        {remaining}{" "}
                                        {t("releaseNotes.remaining")}
                                    </span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};
