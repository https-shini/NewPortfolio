import React, { useMemo, useState } from "react";
import "./ReleaseNotes.css";
import { useLang } from "@/shared/hooks/useLang";
import { useRoute } from "@/shared/hooks/useRoute";
import { useReleaseNotes } from "@/shared/hooks/useReleaseNotes";
import {
    releaseNotesPagePath,
    RELEASE_NOTES_PAGE_SIZE,
} from "@/shared/config/routes";
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

/**
 * Quantas versões do histórico cabem numa página do índice.
 *
 * A mais recente fica fora da conta: ela ocupa o topo, sempre aberta.
 * Com o histórico curto de hoje a paginação nem aparece — o número
 * existe para quando aparecer.
 */
export const PAGE_SIZE = RELEASE_NOTES_PAGE_SIZE;

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
    /** Página do histórico, 1-based. Vem da rota. */
    page?: number;
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
    page = 1,
}) => {
    const { t } = useLang();
    const { navigate } = useRoute();
    const Heading = `h${headingLevel}` as "h1" | "h2";
    const SubHeading = `h${headingLevel + 1}` as "h2" | "h3";
    const [filter, setFilter] = useState<ReleaseFilter>("all");

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

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    /* Página fora do intervalo (link velho, histórico encurtado por um
       filtro) cai na última existente, em vez de mostrar lista vazia. */
    const current = Math.min(Math.max(page, 1), totalPages);
    const visible = filtered.slice(
        (current - 1) * PAGE_SIZE,
        current * PAGE_SIZE,
    );

    const handleFilter = (next: ReleaseFilter) => {
        setFilter(next);
        /* Trocar de filtro recomeça o histórico — senão o usuário cairia
           numa página que talvez nem exista no recorte novo. */
        if (current !== 1) navigate(releaseNotesPagePath(1));
    };

    /* Links de verdade, com href: abrem em nova aba, aparecem no menu de
       contexto e funcionam sem JS. O clique comum é interceptado para
       navegar pelo router, sem recarregar. */
    const goToPage = (target: number) => (e: React.MouseEvent) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        navigate(releaseNotesPagePath(target));
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
                    {!entries && (
                        <SyncBadge status={status} count={releases.length} />
                    )}
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
                            showPermalink
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
                            /* Estado vazio com saída: um filtro sem
                               resultado é beco sem saída se a única forma
                               de voltar for adivinhar qual chip desmarcar. */
                            <div
                                className="release-notes__empty"
                                role="status"
                                aria-live="polite"
                            >
                                <span
                                    className="release-notes__empty-glyph"
                                    aria-hidden="true"
                                >
                                    0
                                </span>
                                <p className="release-notes__empty-text">
                                    {t("releaseNotes.empty")}
                                </p>
                                <button
                                    type="button"
                                    className="btn btn--outline btn--sm"
                                    onClick={() => handleFilter("all")}
                                >
                                    {t("releaseNotes.filterAll")}
                                </button>
                            </div>
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

                        {totalPages > 1 && (
                            <nav
                                className="release-notes__pagination"
                                aria-label={t("releaseNotes.previous")}
                            >
                                <a
                                    className="btn btn--outline btn--sm"
                                    href={releaseNotesPagePath(current - 1)}
                                    onClick={goToPage(current - 1)}
                                    aria-disabled={current === 1}
                                    hidden={current === 1}
                                >
                                    {t("releaseNotes.page.previous")}
                                </a>

                                {/* Os pontos são o mesmo dado do texto ao
                                    lado, em forma visual — daí ficarem fora
                                    da árvore de acessibilidade: quem ouve
                                    recebe "página 1 de 2", e ouvir dois
                                    marcadores sem rótulo não acrescenta. */}
                                <span
                                    className="release-notes__dots"
                                    aria-hidden="true"
                                >
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => (
                                            <span
                                                key={i}
                                                className={`release-notes__dot${
                                                    i + 1 === current
                                                        ? " is-current"
                                                        : ""
                                                }`}
                                            />
                                        ),
                                    )}
                                </span>

                                <span
                                    className="release-notes__page-status"
                                    role="status"
                                    aria-live="polite"
                                >
                                    {t("releaseNotes.page.status")
                                        .replace("{current}", String(current))
                                        .replace("{total}", String(totalPages))}
                                </span>

                                <a
                                    className="btn btn--outline btn--sm"
                                    href={releaseNotesPagePath(current + 1)}
                                    onClick={goToPage(current + 1)}
                                    aria-disabled={current === totalPages}
                                    hidden={current === totalPages}
                                >
                                    {t("releaseNotes.page.next")}
                                </a>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};
