import { useEffect, useState } from "react";
import { readCache, writeCache } from "@/shared/lib/cache";
import type { GithubRelease } from "@/shared/lib/mergeReleaseNotes";

/* ─────────────────────────────────────────────────────────
   useReleaseNotes — releases publicadas no GitHub
   ─────────────────────────────────────────────────────────
   Consome /api/release-notes, que já busca com token e devolve
   o corpo convertido em HTML seguro. Espelha o padrão de
   useGithubStats: cache de sessão com validade e degradação
   silenciosa.

   Em `error`, quem consome usa apenas a camada local — a
   timeline nunca fica vazia por causa da rede.
───────────────────────────────────────────────────────── */

export type ReleaseStatus = "loading" | "ok" | "error";

const CACHE_KEY = "release-notes";
const ENDPOINT = "/api/release-notes";
/* 1 h, alinhado ao s-maxage da própria função. */
const TTL = 1000 * 60 * 60;

interface UseReleaseNotesOptions {
    /** Desliga a busca — usado quando as entradas vêm de fora (testes). */
    enabled?: boolean;
}

interface UseReleaseNotesResult {
    releases: GithubRelease[];
    status: ReleaseStatus;
}

export function useReleaseNotes({
    enabled = true,
}: UseReleaseNotesOptions = {}): UseReleaseNotesResult {
    const cached = enabled ? readCache<GithubRelease[]>(CACHE_KEY, TTL) : null;

    const [releases, setReleases] = useState<GithubRelease[]>(cached ?? []);
    const [status, setStatus] = useState<ReleaseStatus>(
        !enabled || cached ? "ok" : "loading",
    );

    useEffect(() => {
        if (!enabled) return;
        if (readCache<GithubRelease[]>(CACHE_KEY, TTL)) return;

        let cancelled = false;

        fetch(ENDPOINT)
            .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
            .then((data: { releases?: GithubRelease[] }) => {
                if (cancelled) return;
                const list = data.releases ?? [];
                setReleases(list);
                setStatus("ok");
                writeCache(CACHE_KEY, list);
            })
            .catch(() => {
                if (!cancelled) setStatus("error");
            });

        return () => {
            cancelled = true;
        };
    }, [enabled]);

    return { releases, status };
}
