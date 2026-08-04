import React, { useMemo, useState } from "react";
import "./ReleaseNotes.css";
import { useLang } from "@/shared/hooks/useLang";
import { useReleaseNotes } from "@/shared/hooks/useReleaseNotes";
import { RELEASE_NOTES, getUsedTags } from "@/shared/config/releaseNotes";
import {
    mergeReleaseNotes,
    type MergedRelease,
} from "@/shared/lib/mergeReleaseNotes";
import { IconGitBranch } from "@/shared/ui/Icons";
import { ReleaseCard } from "./components/ReleaseCard";
import { ReleaseAccordionItem } from "./components/ReleaseAccordionItem";
import { TagFilter } from "./components/TagFilter";
import { SyncBadge } from "./components/SyncBadge";
import type { ReleaseFilter } from "./ReleaseNotes.types";

/** Quantos itens do histórico aparecem antes de "ver mais antigas". */
const PAGE_SIZE = 3;

interface ReleaseNotesProps {
    /**
     * Entradas prontas. Quando informado, desliga a busca no GitHub —
     * é o caminho usado pelos testes e por quem já tem os dados.
     */
    entries?: MergedRelease[];
    /** id do título, para o `aria-labelledby` do modal que a envolve. */
    titleId?: string;
    /** Ação extra no cabeçalho (ex.: "ver todas" no modal). */
    action?: React.ReactNode;
    /**
     * Nível do título da timeline. `2` no modal, onde a página já tem o
     * seu `h1`; `1` na rota dedicada, onde esta É a manchete. Os títulos
     * internos acompanham, para que a hierarquia nunca pule um nível.
     */
    headingLevel?: 1 | 2;
}

/**
 * ReleaseNotes — linha do tempo das versões.
 *
 * A entrada mais recente ocupa o topo, sempre expandida; as demais
 * viram itens colapsáveis, filtráveis por tema e revelados aos poucos.
 */
export const ReleaseNotes: React.FC<ReleaseNotesProps> = ({
    entries,
    titleId,
    action,
    headingLevel = 2,
}) => {
    const { t } = useLang();
    const Heading = `h${headingLevel}` as "h1" | "h2";
    const SubHeading = `h${headingLevel + 1}` as "h2" | "h3";
    const [filter, setFilter] = useState<ReleaseFilter>("all");
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const { releases, status } = useReleaseNotes({ enabled: !entries });

    /* GitHub manda na estrutura; a camada local sobrepõe o editorial.
       Em erro, `releases` fica vazio e sobra só o local — a timeline
       continua completa. */
    const resolved = useMemo(
        () => entries ?? mergeReleaseNotes(RELEASE_NOTES, releases),
        [entries, releases],
    );

    const [latest, ...history] = resolved;

    const tags = useMemo(() => getUsedTags(resolved), [resolved]);

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
                <div className="release-notes__eyebrow-row">
                    <span className="release-notes__eyebrow">
                        <IconGitBranch
                            width={14}
                            height={14}
                            aria-hidden="true"
                        />
                        v{latest.version}
                    </span>
                    {!entries && <SyncBadge status={status} />}
                </div>

                <Heading className="release-notes__title" id={titleId}>
                    {t("releaseNotes.title")}
                </Heading>

                <p className="release-notes__subtitle">
                    {t("releaseNotes.subtitle")}
                </p>

                {action}
            </header>

            <div className="release-notes__timeline">
                {/* Trilha decorativa — a estrutura real é a lista abaixo. */}
                <span className="release-notes__rail" aria-hidden="true" />

                <ol className="release-notes__list">
                    <li className="release-notes__entry release-notes__entry--latest">
                        <ReleaseCard
                            entry={latest}
                            headingLevel={headingLevel + 1}
                        />
                    </li>
                </ol>

                {history.length > 0 && (
                    <>
                        <div className="release-notes__history-header">
                            <SubHeading className="release-notes__history-title">
                                {t("releaseNotes.previous")}
                            </SubHeading>
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
                                        headingLevel={headingLevel + 2}
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
