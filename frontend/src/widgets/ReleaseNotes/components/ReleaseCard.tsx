import React from "react";
import { useLang } from "@/shared/hooks/useLang";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import { renderRichParagraphs } from "@/shared/lib/richText";
import { IconExternalLink, IconArrowRight } from "@/shared/ui/Icons";
import type { ReleaseEntry, ReleaseLink } from "@/shared/config/releaseNotes";
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
    entry: ReleaseEntry;
}

/**
 * ReleaseCard — a versão do topo, sempre expandida.
 * Traz o tratamento editorial completo: capa, título, texto,
 * mídia e, no rodapé, a lista estruturada.
 */
export const ReleaseCard: React.FC<ReleaseCardProps> = ({ entry }) => {
    const { lang } = useLang();
    const titleId = `${versionSlug(entry.version)}-title`;

    return (
        <article
            className="release-card"
            id={versionSlug(entry.version)}
            aria-labelledby={entry.title ? titleId : undefined}
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

            <ReleaseMeta entry={entry} isLatest />

            {entry.title && (
                <h3 className="release-card__title" id={titleId}>
                    {entry.title[lang]}
                </h3>
            )}

            {entry.body && (
                <div className="release-card__body">
                    {renderRichParagraphs(
                        entry.body[lang],
                        "release-card__paragraph",
                    )}
                </div>
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

            <ChangeList changes={entry.changes} />

            {entry.links && entry.links.length > 0 && (
                <div className="release-card__links">
                    {entry.links.map((link) => (
                        <ReleaseLinkItem key={link.href} link={link} />
                    ))}
                </div>
            )}
        </article>
    );
};
