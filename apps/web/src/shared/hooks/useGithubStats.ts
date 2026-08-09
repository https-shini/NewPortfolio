import { useEffect, useState } from "react";
import { readCache, writeCache } from "@/shared/lib/cache";

/* ─────────────────────────────────────────────────────────
   useGithubStats — consome /api/github-stats (serverless Vercel)
   ─────────────────────────────────────────────────────────
   Retorna métricas do GitHub já calculadas no servidor. Valores
   podem ser `null` (API indisponível / rate limit) — o consumidor
   deve aplicar um fallback local, nunca exibir erro ao usuário.

   · Cache de sessão (sessionStorage): não refaz a chamada a cada
     navegação/re-render dentro da mesma aba.
   · Resiliente: qualquer falha mantém o estado anterior/fallback.
───────────────────────────────────────────────────────── */

export interface GithubStats {
    commits: number | null;
    repos: number | null;
}

const CACHE_KEY = "github-stats";
const ENDPOINT = "/api/github-stats";
/* 1 h — a serverless já cacheia na CDN; isto evita a ida até ela. */
const TTL = 1000 * 60 * 60;
const EMPTY: GithubStats = { commits: null, repos: null };

export function useGithubStats(): GithubStats {
    const [stats, setStats] = useState<GithubStats>(
        () => readCache<GithubStats>(CACHE_KEY, TTL) ?? EMPTY,
    );

    useEffect(() => {
        /* Já resolvido e ainda válido → não refaz a chamada. */
        if (readCache<GithubStats>(CACHE_KEY, TTL)) return;

        let cancelled = false;

        fetch(ENDPOINT)
            .then((r) => (r.ok ? (r.json() as Promise<GithubStats>) : null))
            .then((data) => {
                if (cancelled || !data) return;
                setStats(data);
                writeCache(CACHE_KEY, data);
            })
            .catch(() => {
                /* mantém o fallback do consumidor */
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return stats;
}
