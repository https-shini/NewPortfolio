import React from "react";
import { useLang } from "@/shared/hooks/useLang";
import { formatFullDate, formatShortDate } from "@/shared/lib/dateUtils";
import type { ReleaseEntry } from "@/shared/config/releaseNotes";
import { TAG_LABELS, isPrerelease } from "../ReleaseNotes.types";

interface ReleaseMetaProps {
    entry: ReleaseEntry;
    /** Marca a versão do topo com o selo "mais recente". */
    isLatest?: boolean;
}

/**
 * ReleaseMeta — pill de versão, data exata e tags.
 * Compartilhado entre o post de destaque e o item do histórico,
 * para que os dois falem a mesma língua visual.
 */
export const ReleaseMeta: React.FC<ReleaseMetaProps> = ({
    entry,
    isLatest = false,
}) => {
    const { t, lang } = useLang();

    return (
        <div className="release-meta">
            <span
                className={`release-meta__version${isPrerelease(entry.version) ? " release-meta__version--pre" : ""}`}
            >
                v{entry.version}
            </span>

            {isLatest && (
                <span className="release-meta__latest">
                    {t("releaseNotes.latest")}
                </span>
            )}

            {/* As duas formas da mesma data, uma escondida por CSS no
                breakpoint: quem lê a tela recebe só a que está visível, e
                a data legível por máquina segue no `dateTime`. Trocar por
                JS exigiria um hook de media query que o projeto não tem —
                e faria a data depender de hidratação. */}
            <time className="release-meta__date" dateTime={entry.date}>
                <span className="release-meta__date-full">
                    {formatFullDate(entry.date, lang)}
                </span>
                <span className="release-meta__date-short">
                    {formatShortDate(entry.date)}
                </span>
            </time>

            {entry.tags?.map((tag) => (
                <span key={tag} className="release-meta__tag">
                    {t(TAG_LABELS[tag])}
                </span>
            ))}
        </div>
    );
};
