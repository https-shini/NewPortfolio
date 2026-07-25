import { useEffect, useState } from "react";

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
const EMPTY: GithubStats = { commits: null, repos: null };

function readCache(): GithubStats | null {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        return raw ? (JSON.parse(raw) as GithubStats) : null;
    } catch {
        return null;
    }
}

export function useGithubStats(): GithubStats {
    const [stats, setStats] = useState<GithubStats>(() => readCache() ?? EMPTY);

    useEffect(() => {
        /* Já resolvido nesta sessão → não refaz a chamada. */
        if (readCache()) return;

        let cancelled = false;

        fetch(ENDPOINT)
            .then((r) => (r.ok ? (r.json() as Promise<GithubStats>) : null))
            .then((data) => {
                if (cancelled || !data) return;
                setStats(data);
                try {
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
                } catch {
                    /* sessionStorage indisponível — segue sem cache */
                }
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
