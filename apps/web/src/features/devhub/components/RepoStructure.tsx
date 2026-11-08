import React from "react";
import type { Repository, RepoTreeEntry } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import type { TranslationKey } from "@/shared/lib/translations";

/* ─────────────────────────────────────────────────────────
   RepoStructure — aba "Estrutura": a raiz do branch padrão
   ─────────────────────────────────────────────────────────
   Pastas primeiro, depois arquivos, em ordem alfabética (como o
   GitHub). Cada item abre no GitHub; submódulos não têm link porque
   apontam para outro repositório.
───────────────────────────────────────────────────────── */

const TIPO: Record<RepoTreeEntry["type"], TranslationKey> = {
    tree: "devhub.structure.folder",
    blob: "devhub.structure.file",
    commit: "devhub.structure.submodule",
};

interface Props {
    repo: Repository;
    tree: RepoTreeEntry[] | null;
}

export const RepoStructure: React.FC<Props> = ({ repo, tree }) => {
    const { t } = useLang();
    if (!tree) {
        return (
            <p className="devhub-empty">{t("devhub.stats.unavailableNote")}</p>
        );
    }
    if (tree.length === 0) {
        return <p className="devhub-empty">{t("devhub.structure.empty")}</p>;
    }

    const ordem = { tree: 0, commit: 1, blob: 2 } as const;
    const itens = [...tree].sort(
        (a, b) => ordem[a.type] - ordem[b.type] || a.name.localeCompare(b.name),
    );
    const branch = encodeURIComponent(repo.defaultBranch ?? "HEAD");

    return (
        <div className="devhub-tree">
            <p className="devhub-tree__path">
                <code>
                    {repo.name}/
                    {repo.defaultBranch ? ` (${repo.defaultBranch})` : ""}
                </code>
            </p>
            <ul className="devhub-tree__list">
                {itens.map((e) => {
                    const rotulo = (
                        <>
                            <span
                                className="devhub-tree__icon"
                                data-type={e.type}
                                aria-hidden="true"
                            />
                            <span className="devhub-tree__name">
                                {e.name}
                                {e.type === "tree" ? "/" : ""}
                            </span>
                            <span className="sr-only">({t(TIPO[e.type])})</span>
                        </>
                    );
                    return (
                        <li key={e.name}>
                            {e.type === "commit" ? (
                                <span className="devhub-tree__item">
                                    {rotulo}
                                </span>
                            ) : (
                                <a
                                    className="devhub-tree__item"
                                    href={`${repo.url}/${e.type === "tree" ? "tree" : "blob"}/${branch}/${encodeURIComponent(e.name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {rotulo}
                                </a>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
