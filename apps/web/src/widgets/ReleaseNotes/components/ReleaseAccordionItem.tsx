import React from "react";
import { useLang } from "@/shared/hooks/useLang";
import { useRoute } from "@/shared/hooks/useRoute";
import { Accordion } from "@/shared/ui/Accordion/Accordion";
import { IconChevronDown, IconArrowRight } from "@/shared/ui/Icons";
import { releaseNotePath } from "@/shared/config/routes";
import type { ReleaseEntry } from "@/shared/config/releaseNotes";
import { ChangeList } from "./ChangeList";
import { ReleaseMeta } from "./ReleaseMeta";
import { versionSlug } from "../ReleaseNotes.types";

interface ReleaseAccordionItemProps {
    entry: ReleaseEntry;
    /**
     * Nível dos rótulos de categoria dentro do painel. O gatilho é um
     * botão, não um título, então quem manda é o cabeçalho do histórico
     * logo acima — ver `headingLevel` em ReleaseNotes.tsx.
     */
    headingLevel?: number;
}

/**
 * ReleaseAccordionItem — uma versão do histórico, colapsada.
 * Toda a mecânica (estado, ids, altura, ARIA) vem do Accordion
 * compartilhado; aqui fica só o conteúdo.
 */
export const ReleaseAccordionItem: React.FC<ReleaseAccordionItemProps> = ({
    entry,
    headingLevel = 4,
}) => {
    const { t, lang } = useLang();
    const { navigate } = useRoute();

    const trigger = (
        <>
            <ReleaseMeta entry={entry} />

            {/* Toda versão tem título — é o que dá nome à página dela. */}
            <p className="release-item__title">{entry.title[lang]}</p>

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
                <ChangeList
                    changes={entry.changes}
                    headingLevel={headingLevel}
                />

                {/* Link de verdade: o painel é um resumo, a página da
                    versão é o conteúdo completo. */}
                <a
                    className="release-item__full"
                    href={releaseNotePath(entry.version)}
                    onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                        e.preventDefault();
                        navigate(releaseNotePath(entry.version));
                    }}
                >
                    {t("releaseNotes.readFull")}
                    <IconArrowRight width={14} height={14} aria-hidden="true" />
                </a>
            </Accordion>
        </li>
    );
};
