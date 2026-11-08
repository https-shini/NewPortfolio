import React from "react";

/* ─────────────────────────────────────────────────────────
   Ícones do panorama — traço de 24×24, desenhados aqui
   ─────────────────────────────────────────────────────────
   Mesmo vocabulário dos favicons das abas: linha de 1,75, cantos
   arredondados, sem preenchimento. Cada desenho diz O QUE a métrica
   mede (um commit, um pull request, uma revisão…), nunca imita a
   marca de terceiros. Todos são decorativos: o texto ao lado já é o
   rótulo acessível.
───────────────────────────────────────────────────────── */

const Svg: React.FC<{ children: React.ReactNode; size?: number }> = ({
    children,
    size = 18,
}) => (
    <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        {children}
    </svg>
);

const DESENHOS = {
    /* ── Selos ── */
    contributions: (
        <>
            <rect x="3" y="3" width="5" height="5" rx="1" />
            <rect x="10" y="3" width="5" height="5" rx="1" />
            <rect x="17" y="3" width="4" height="5" rx="1" />
            <rect x="3" y="10" width="5" height="5" rx="1" />
            <rect x="10" y="10" width="5" height="5" rx="1" />
            <rect x="3" y="17" width="5" height="4" rx="1" />
        </>
    ),
    commits: (
        <>
            <circle cx="12" cy="12" r="3.5" />
            <path d="M2.5 12h6M15.5 12h6" />
        </>
    ),
    streak: (
        <path d="M12 2.5c.8 3 4.5 5.3 4.5 10a4.5 4.5 0 0 1-9 0c0-2 1-3.5 2.2-4.6.2 1.7 1 2.8 2.3 3.1-.4-3.3-.9-5.8 0-8.5Z" />
    ),
    pullRequests: (
        <>
            <circle cx="6" cy="6" r="2.5" />
            <circle cx="6" cy="18" r="2.5" />
            <circle cx="18" cy="18" r="2.5" />
            <path d="M6 8.5v7M13 6h3a2 2 0 0 1 2 2v7.5" />
            <path d="m15 3.5-2.5 2.5L15 8.5" />
        </>
    ),
    issues: (
        <>
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="1.5" />
        </>
    ),
    reviews: (
        <>
            <path d="M20 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
            <path d="m8.5 10 2.5 2.5 4.5-4.5" />
        </>
    ),
    repos: (
        <>
            <path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H19V3H7.5A2.5 2.5 0 0 0 5 5.5Z" />
            <path d="M5 19.5A2.5 2.5 0 0 0 7.5 22H19v-5" />
            <path d="M9 7h6" />
        </>
    ),
    languages: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />,
    stars: (
        <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />
    ),

    /* ── Grupos de selos ── */
    constancy: <path d="M3 12h4l3-8 4 16 3-8h4" />,
    collaboration: (
        <>
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
            <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20a6.5 6.5 0 0 0-4-6" />
        </>
    ),
    portfolio: (
        <>
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
            <path d="M3 11h18" />
        </>
    ),

    /* ── Aba "API do GitHub" ── */
    api: (
        <path d="M8 4H7a2 2 0 0 0-2 2v4l-2 2 2 2v4a2 2 0 0 0 2 2h1M16 4h1a2 2 0 0 1 2 2v4l2 2-2 2v4a2 2 0 0 1-2 2h-1" />
    ),
    source: (
        <>
            <ellipse cx="12" cy="5.5" rx="8" ry="3" />
            <path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
        </>
    ),
    updated: (
        <>
            <path d="M20 12a8 8 0 1 1-2.3-5.7L20 8.5" />
            <path d="M20 3.5v5h-5M12 8v4l2.5 2" />
        </>
    ),
    criteria: (
        <>
            <path d="M9 6h11M9 12h11M9 18h11" />
            <path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2" />
        </>
    ),
    filters: <path d="M3 5h18l-7 8.5V19l-4 2v-7.5Z" />,
    badges: (
        <>
            <circle cx="12" cy="9" r="6" />
            <path d="m8.5 14-1.5 8 5-3 5 3-1.5-8" />
        </>
    ),
    limits: (
        <>
            <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            <path d="M12 9v4.5M12 17h.01" />
        </>
    ),
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    minus: <path d="M6 12h12" />,
} as const;

export type NomeIcone = keyof typeof DESENHOS;

export const Icone: React.FC<{ nome: NomeIcone; size?: number }> = ({
    nome,
    size,
}) => <Svg size={size}>{DESENHOS[nome]}</Svg>;
