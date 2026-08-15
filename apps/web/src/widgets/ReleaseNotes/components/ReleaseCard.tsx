import React from "react";
import { useLang } from "@/shared/hooks/useLang";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import { useRoute } from "@/shared/hooks/useRoute";
import { renderRichParagraphs } from "@/shared/lib/richText";
import { releaseNotePath } from "@/shared/config/routes";
import {
    IconExternalLink,
    IconArrowRight,
    IconGitHub,
} from "@/shared/ui/Icons";
import type { ReleaseLink } from "@/shared/config/releaseNotes";
import type { MergedRelease } from "@/shared/lib/mergeReleaseNotes";
import { ChangeList } from "./ChangeList";
import { ReleaseMeta } from "./ReleaseMeta";
import { versionSlug } from "../ReleaseNotes.types";

/** Link do rodapé do post — decide sozinho como abrir o destino. */
const ReleaseLinkItem: React.FC<{ link: ReleaseLink }> = ({ link }) => {
    const { lang } = useLang();
    const { opensNewTab, anchorProps } = useLinkProps(link.href);

    return (
        <a className="release-card__link" {...anchorProps}>
            {link.label[lang]}
            {opensNewTab ? (
                <IconExternalLink width={13} height={13} aria-hidden="true" />
            ) : (
                <IconArrowRight width={14} height={14} aria-hidden="true" />
            )}
        </a>
    );
};

interface ReleaseCardProps {
    entry: MergedRelease;
    /** Acompanha o nível do título da timeline — ver ReleaseNotes.tsx. */
    headingLevel?: number;
    /**
     * Como a lista de mudanças se apresenta. `grade` no índice, onde ela é
     * um resumo ao lado de outras versões; `editorial` na página da versão,
     * onde é o conteúdo principal. Ver ChangeList.
     */
    changesVariant?: "grade" | "editorial";
    /**
     * Oferece o caminho para a página da versão. Ligado no índice; desligado
     * na própria página da versão, onde o link apontaria para onde já se está.
     */
    showPermalink?: boolean;
    /**
     * Suprime o título e a faixa de metadados. A página da versão já os traz
     * no cabeçalho dela — repetir aqui daria dois títulos para o mesmo texto.
     */
    hideHeading?: boolean;
}

/**
 * ReleaseCard — a versão do topo, sempre expandida.
 * Traz o tratamento editorial completo: capa, título, texto,
 * mídia e, no rodapé, a lista estruturada.
 */
export const ReleaseCard: React.FC<ReleaseCardProps> = ({
    entry,
    headingLevel = 3,
    changesVariant = "grade",
    showPermalink = false,
    hideHeading = false,
}) => {
    const { t, lang } = useLang();
    const { navigate } = useRoute();
    const titleId = `${versionSlug(entry.version)}-title`;
    const Heading = `h${headingLevel}` as "h2" | "h3";

    const permalink = releaseNotePath(entry.version);

    return (
        <article
            className="release-card"
            id={versionSlug(entry.version)}
            aria-labelledby={entry.title && !hideHeading ? titleId : undefined}
        >
            {entry.cover && (
                <img
                    className="release-card__cover"
                    src={entry.cover}
                    alt=""
                    loading="lazy"
                    decoding="async"
                />
            )}

            {!hideHeading && (
                <>
                    <ReleaseMeta entry={entry} isLatest />

                    {entry.title && (
                        <Heading className="release-card__title" id={titleId}>
                            {entry.title[lang]}
                        </Heading>
                    )}
                </>
            )}

            {entry.body ? (
                <div className="release-card__body">
                    {renderRichParagraphs(
                        entry.body[lang],
                        "release-card__paragraph",
                    )}
                </div>
            ) : (
                entry.html && (
                    /* HTML produzido pela própria serverless, que escapa o
                       texto antes de converter — as únicas tags presentes
                       são as que ela emite. Ver api/_markdown.ts. */
                    <div
                        className="release-card__body release-card__body--html"
                        dangerouslySetInnerHTML={{ __html: entry.html }}
                    />
                )
            )}

            {entry.media && entry.media.length > 0 && (
                <div className="release-card__media">
                    {entry.media.map((m, i) => (
                        <figure key={i} className="release-card__figure">
                            {m.type === "image" ? (
                                <img
                                    src={m.src}
                                    alt={m.alt?.[lang] ?? ""}
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                <video src={m.src} controls preload="none">
                                    {/* O tipo exige `captions`; sem faixa o
                                        vídeo não chega a ser publicável. */}
                                    <track
                                        kind="captions"
                                        src={m.captions}
                                        srcLang={lang}
                                        default
                                    />
                                </video>
                            )}
                            {m.caption && (
                                <figcaption>{m.caption[lang]}</figcaption>
                            )}
                        </figure>
                    ))}
                </div>
            )}

            <ChangeList
                changes={entry.changes}
                headingLevel={headingLevel + 1}
                variant={changesVariant}
            />

            {(showPermalink || entry.links?.length || entry.url) && (
                <div className="release-card__links">
                    {/* Primeiro da fila e destacado: no índice, a saída
                        natural do cartão é a página inteira da versão. */}
                    {showPermalink && (
                        <a
                            className="release-card__link release-card__link--lead"
                            href={permalink}
                            onClick={(e) => {
                                if (e.metaKey || e.ctrlKey || e.shiftKey)
                                    return;
                                e.preventDefault();
                                navigate(permalink);
                            }}
                        >
                            {t("releaseNotes.readFull")}
                            <IconArrowRight
                                width={14}
                                height={14}
                                aria-hidden="true"
                            />
                        </a>
                    )}

                    {entry.links?.map((link) => (
                        <ReleaseLinkItem key={link.href} link={link} />
                    ))}

                    {entry.url && (
                        <a
                            className="release-card__link"
                            href={entry.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <IconGitHub
                                width={13}
                                height={13}
                                aria-hidden="true"
                            />
                            {t("releaseNotes.viewOnGithub")}
                        </a>
                    )}
                </div>
            )}
        </article>
    );
};
