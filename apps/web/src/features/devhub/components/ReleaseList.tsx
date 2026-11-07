import React from "react";
import { formatDate, formatNumber } from "@/features/devhub/format";
import type { Repository, RepositoryStats } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import { IconExternalLink } from "@/shared/ui/Icons";

interface Props {
    repo: Repository;
    releases: RepositoryStats["releases"];
}

/** Aba "Releases": as 5 mais recentes, com link para todas. */
export const ReleaseList: React.FC<Props> = ({ repo, releases }) => {
    const { lang, t } = useLang();
    if (releases.total === 0) {
        return <p className="devhub-empty">{t("devhub.releases.empty")}</p>;
    }
    return (
        <div className="devhub-releases">
            <ol className="devhub-releases__list">
                {releases.latest.map((r) => (
                    <li key={r.tag} className="devhub-releases__item">
                        <a
                            className="devhub-releases__name"
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {r.name || r.tag}
                        </a>
                        <span className="devhub-releases__meta">
                            <code>{r.tag}</code>
                            {r.prerelease && (
                                <span className="devhub-chip devhub-chip--warn">
                                    {t("devhub.releases.prerelease")}
                                </span>
                            )}
                            {r.publishedAt && (
                                <time dateTime={r.publishedAt}>
                                    {formatDate(r.publishedAt, lang)}
                                </time>
                            )}
                        </span>
                    </li>
                ))}
            </ol>
            {releases.total > releases.latest.length && (
                <a
                    className="devhub-link"
                    href={`${repo.url}/releases`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {t("devhub.releases.all").replace(
                        "{n}",
                        formatNumber(releases.total, lang),
                    )}
                    <IconExternalLink width={12} height={12} aria-hidden />
                </a>
            )}
        </div>
    );
};
