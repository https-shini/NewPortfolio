import React from "react";
import { useLang } from "@/shared/hooks/useLang";
import { Accordion } from "@/shared/ui/Accordion/Accordion";
import { IconChevronDown } from "@/shared/ui/Icons";
import type { ReleaseEntry } from "@/shared/config/releaseNotes";
import { ChangeList } from "./ChangeList";
import { ReleaseMeta } from "./ReleaseMeta";
import { versionSlug } from "../ReleaseNotes.types";

interface ReleaseAccordionItemProps {
    entry: ReleaseEntry;
}

/**
 * ReleaseAccordionItem — uma versão do histórico, colapsada.
 * Toda a mecânica (estado, ids, altura, ARIA) vem do Accordion
 * compartilhado; aqui fica só o conteúdo.
 */
export const ReleaseAccordionItem: React.FC<ReleaseAccordionItemProps> = ({
    entry,
}) => {
    const { t, lang } = useLang();

    const trigger = (
        <>
            <ReleaseMeta entry={entry} />

            {entry.summary && (
                <p className="release-item__summary">{entry.summary[lang]}</p>
            )}

            <span className="release-item__chevron" aria-hidden="true">
                <IconChevronDown width={16} height={16} />
            </span>
        </>
    );

    /* O conteúdo do cabeçalho é rico (pill, data, tags); um rótulo
       explícito dá ao botão um nome curto e previsível. */
    const label = `v${entry.version} — ${t("releaseNotes.expand")}`;

    return (
        <li className="release-item__wrapper" id={versionSlug(entry.version)}>
            <Accordion
                as="article"
                classPrefix="release-item"
                trigger={trigger}
                triggerLabel={label}
            >
                <ChangeList changes={entry.changes} />
            </Accordion>
        </li>
    );
};
