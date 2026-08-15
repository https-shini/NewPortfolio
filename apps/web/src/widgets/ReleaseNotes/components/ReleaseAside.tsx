import React from "react";
import { useLang } from "@/shared/hooks/useLang";
import { formatFullDate } from "@/shared/lib/dateUtils";
import { CHANGE_TYPES } from "@/shared/config/releaseNotes";
import type { MergedRelease } from "@/shared/lib/mergeReleaseNotes";
import { IconGitBranch } from "@/shared/ui/Icons";
import {
    CATEGORY_LABELS,
    TAG_LABELS,
    isPrerelease,
} from "../ReleaseNotes.types";

interface ReleaseAsideProps {
    entry: MergedRelease;
}

/* ─────────────────────────────────────────────────────────
   ReleaseAside — a ficha da versão, ao lado do texto
   ─────────────────────────────────────────────────────────
   Existe só na página de uma versão, e não no índice: ali as
   entradas se comparam entre si e a ficha viraria ruído repetido;
   aqui a versão é o assunto, e quem chega de um link externo
   precisa dos dados de contexto sem rolar o artigo inteiro.

   Fica grudada ao rolar (`position: sticky`), o que é a razão de
   ser dela — a ficha some da vista num artigo longo se acompanhar
   o fluxo, e é justamente no fim do texto que alguém quer o link
   do GitHub ou conferir a data.
───────────────────────────────────────────────────────── */

export const ReleaseAside: React.FC<ReleaseAsideProps> = ({ entry }) => {
    const { lang, t } = useLang();

    /* Quantas mudanças a versão traz, somando as categorias. É o número
       que responde "o quanto isso mexeu" antes de a lista ser lida. */
    const total = CHANGE_TYPES.reduce(
        (soma, tipo) => soma + (entry.changes?.[tipo]?.length ?? 0),
        0,
    );

    /* Só as categorias presentes, na ordem canônica. */
    const categorias = CHANGE_TYPES.filter(
        (tipo) => (entry.changes?.[tipo]?.length ?? 0) > 0,
    );

    return (
        <aside
            className="release-aside"
            aria-label={lang === "pt" ? "Dados da versão" : "Version details"}
        >
            <dl className="release-aside__list">
                <div className="release-aside__row">
                    <dt className="release-aside__term">
                        {lang === "pt" ? "Versão" : "Version"}
                    </dt>
                    <dd
                        className={`release-aside__value release-aside__version${
                            isPrerelease(entry.version)
                                ? " release-aside__version--pre"
                                : ""
                        }`}
                    >
                        v{entry.version}
                    </dd>
                </div>

                <div className="release-aside__row">
                    <dt className="release-aside__term">
                        {lang === "pt" ? "Publicada em" : "Published"}
                    </dt>
                    <dd className="release-aside__value">
                        <time dateTime={entry.date}>
                            {formatFullDate(entry.date, lang)}
                        </time>
                    </dd>
                </div>

                {total > 0 && (
                    <div className="release-aside__row">
                        <dt className="release-aside__term">
                            {lang === "pt" ? "Mudanças" : "Changes"}
                        </dt>
                        <dd className="release-aside__value">
                            {total}
                            <span className="release-aside__breakdown">
                                {categorias.map((tipo) => (
                                    <span
                                        key={tipo}
                                        className={`release-aside__pip release-changes__group--${tipo}`}
                                        /* O rótulo vai no title E no texto
                                           acessível: o pip sozinho é cor, e
                                           cor não é informação. */
                                        title={t(CATEGORY_LABELS[tipo].label)}
                                    >
                                        <span className="sr-only">
                                            {t(CATEGORY_LABELS[tipo].label)}
                                        </span>
                                    </span>
                                ))}
                            </span>
                        </dd>
                    </div>
                )}

                {entry.tags && entry.tags.length > 0 && (
                    <div className="release-aside__row">
                        <dt className="release-aside__term">
                            {lang === "pt" ? "Assuntos" : "Topics"}
                        </dt>
                        <dd className="release-aside__value release-aside__tags">
                            {entry.tags.map((tag) => (
                                <span key={tag} className="release-meta__tag">
                                    {t(TAG_LABELS[tag])}
                                </span>
                            ))}
                        </dd>
                    </div>
                )}
            </dl>

            {entry.url && (
                <a
                    className="release-aside__link"
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <IconGitBranch width={13} height={13} aria-hidden="true" />
                    {t("releaseNotes.viewOnGithub")}
                </a>
            )}
        </aside>
    );
};
