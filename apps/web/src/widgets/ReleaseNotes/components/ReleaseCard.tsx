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
     * O que o cartão mostra, e por quê.
     *
     * `resumo` — no índice. Metadados, título, resumo e a grade de
     * mudanças. **Sem o corpo do artigo**: ali as versões se comparam
     * entre si, e uma delas abrir cinco parágrafos enquanto as outras
     * mostram uma linha desequilibra a página e enterra o histórico.
     *
     * `completo` — na página da versão, onde a versão é o assunto: corpo,
     * mídia e as mudanças em formato editorial. Título e metadados ficam
     * de fora porque o cabeçalho da página já os traz.
     *
     * Era um trio de booleanos (`changesVariant`, `showPermalink`,
     * `hideHeading`) que sempre variavam juntos — só duas das oito
     * combinações faziam sentido. Como um campo só, as outras seis deixam
     * de ser representáveis.
     */
    variant?: "resumo" | "completo";
    /**
     * Se esta é a versão corrente. Vale no `completo`: o tratamento
     * crimson do cartão significa "é esta que está no ar", e aplicá-lo a
     * uma versão de dois anos atrás diria uma coisa que não é verdade.
     */
    isLatest?: boolean;
}

/**
 * ReleaseCard — uma versão, nos dois lugares onde ela aparece por inteiro:
 * no topo da timeline e na página dedicada. Ver `variant`.
 */
export const ReleaseCard: React.FC<ReleaseCardProps> = ({
    entry,
    headingLevel = 3,
    variant = "resumo",
    isLatest = false,
}) => {
    const { t, lang } = useLang();
    const { navigate } = useRoute();
    const titleId = `${versionSlug(entry.version)}-title`;
    const Heading = `h${headingLevel}` as "h2" | "h3";

    const resumo = variant === "resumo";
    const permalink = releaseNotePath(entry.version);

    /* Sem o título dentro do cartão, o `aria-labelledby` não tem para onde
       apontar e o artigo ficaria sem nome na árvore de acessibilidade. A
       versão é o nome curto e previsível para ele. */
    const nome = resumo
        ? { "aria-labelledby": entry.title ? titleId : undefined }
        : { "aria-label": `v${entry.version}` };

    return (
        <article
            className={`release-card${
                !resumo && !isLatest ? " release-card--arquivo" : ""
            }`}
            id={versionSlug(entry.version)}
            {...nome}
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

            {resumo ? (
                <>
                    <ReleaseMeta entry={entry} isLatest />

                    {entry.title && (
                        <Heading className="release-card__title" id={titleId}>
                            {entry.title[lang]}
                        </Heading>
                    )}

                    {entry.summary && (
                        <p className="release-card__summary">
                            {entry.summary[lang]}
                        </p>
                    )}
                </>
            ) : (
                <>
                    {entry.body ? (
                        <div className="release-card__body">
                            {renderRichParagraphs(
                                entry.body[lang],
                                "release-card__paragraph",
                            )}
                        </div>
                    ) : (
                        entry.html && (
                            /* HTML produzido pela própria serverless, que
                               escapa o texto antes de converter — as únicas
                               tags presentes são as que ela emite. Ver
                               api/_markdown.ts. */
                            <div
                                className="release-card__body release-card__body--html"
                                dangerouslySetInnerHTML={{ __html: entry.html }}
                            />
                        )
                    )}

                    {entry.media && entry.media.length > 0 && (
                        <div className="release-card__media">
                            {entry.media.map((m, i) => (
                                <figure
                                    key={i}
                                    className="release-card__figure"
                                >
                                    {m.type === "image" ? (
                                        <img
                                            src={m.src}
                                            alt={m.alt?.[lang] ?? ""}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ) : (
                                        <video
                                            src={m.src}
                                            controls
                                            preload="none"
                                        >
                                            {/* O tipo exige `captions`; sem
                                                faixa o vídeo não chega a ser
                                                publicável. */}
                                            <track
                                                kind="captions"
                                                src={m.captions}
                                                srcLang={lang}
                                                default
                                            />
                                        </video>
                                    )}
                                    {m.caption && (
                                        <figcaption>
                                            {m.caption[lang]}
                                        </figcaption>
                                    )}
                                </figure>
                            ))}
                        </div>
                    )}
                </>
            )}

            <ChangeList
                changes={entry.changes}
                headingLevel={headingLevel + 1}
                variant={resumo ? "grade" : "editorial"}
            />

            {(resumo || entry.links?.length || entry.url) && (
                <div className="release-card__links">
                    {/* Primeiro da fila e destacado: no índice, a saída
                        natural do cartão é a página inteira da versão. */}
                    {resumo && (
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
