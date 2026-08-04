import React from "react";
import { useLang } from "@/shared/hooks/useLang";
import { IconGitHub } from "@/shared/ui/Icons";
import type { ReleaseStatus } from "@/shared/hooks/useReleaseNotes";

interface SyncBadgeProps {
    status: ReleaseStatus;
}

/**
 * SyncBadge — de onde vieram os dados da timeline.
 *
 * O estado de erro é informativo, não alarmante: a página continua
 * inteira, só sem as releases do GitHub. Por isso o texto fala do que
 * está sendo exibido, e não do que falhou.
 */
export const SyncBadge: React.FC<SyncBadgeProps> = ({ status }) => {
    const { t } = useLang();

    if (status === "loading") {
        return (
            <span
                className="release-notes__sync release-notes__sync--loading"
                role="status"
            >
                <span className="release-notes__sync-dot" aria-hidden="true" />
                {t("releaseNotes.sync.loading")}
            </span>
        );
    }

    if (status === "error") {
        return (
            <span
                className="release-notes__sync release-notes__sync--local"
                role="status"
            >
                <span className="release-notes__sync-dot" aria-hidden="true" />
                {t("releaseNotes.sync.local")}
            </span>
        );
    }

    return (
        <span className="release-notes__sync release-notes__sync--ok">
            <IconGitHub width={12} height={12} aria-hidden="true" />
            <span className="release-notes__sync-dot" aria-hidden="true" />
            {t("releaseNotes.sync.ok")}
        </span>
    );
};
