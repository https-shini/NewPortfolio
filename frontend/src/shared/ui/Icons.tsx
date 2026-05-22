import React from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */

export interface IconProps {
    className?: string;
    width?: number;
    height?: number;
    /** Aceita boolean ou string "true"/"false" — compatível com uso JSX literal */
    "aria-hidden"?: boolean | "true" | "false";
    "aria-label"?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Internal base components
───────────────────────────────────────────────────────────────────────────── */

interface FillIconProps extends IconProps {
    size?: number;
    viewBox?: string;
}

/** Filled / solid icons (fill="currentColor") */
const F: React.FC<React.PropsWithChildren<FillIconProps>> = ({
    children,
    className,
    width,
    height,
    size = 18,
    viewBox = "0 0 24 24",
    "aria-hidden": ariaHidden = true,
    "aria-label": ariaLabel,
}) => (
    <svg
        viewBox={viewBox}
        className={className}
        width={width ?? size}
        height={height ?? size}
        fill="currentColor"
        aria-hidden={ariaHidden ? "true" : "false"}
        {...(ariaLabel && { role: "img" })}
        aria-label={ariaLabel}
    >
        {children}
    </svg>
);

interface StrokeIconProps extends IconProps {
    size?: number;
    viewBox?: string;
    strokeWidth?: number;
}

/** Outlined / stroke icons */
const S: React.FC<React.PropsWithChildren<StrokeIconProps>> = ({
    children,
    className,
    width,
    height,
    size = 18,
    viewBox = "0 0 24 24",
    strokeWidth = 2,
    "aria-hidden": ariaHidden = true,
    "aria-label": ariaLabel,
}) => (
    <svg
        viewBox={viewBox}
        className={className}
        width={width ?? size}
        height={height ?? size}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={ariaHidden ? "true" : "false"}
        {...(ariaLabel && { role: "img" })}
        aria-label={ariaLabel}
    >
        {children}
    </svg>
);

/* ─────────────────────────────────────────────────────────────────────────────
   ☀ / ☽  Theme toggles  (Heroicons)
───────────────────────────────────────────────────────────────────────────── */

export const IconSun: React.FC<IconProps> = (props) => (
    <F {...props} size={16}>
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
    </F>
);

export const IconMoon: React.FC<IconProps> = (props) => (
    <F {...props} size={16}>
        <path
            fillRule="evenodd"
            d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
            clipRule="evenodd"
        />
    </F>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Social / Brand  (SimpleIcons paths)
───────────────────────────────────────────────────────────────────────────── */

export const IconGitHub: React.FC<IconProps> = (props) => (
    <F {...props} aria-label="GitHub" aria-hidden={false}>
        <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.51 11.51 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </F>
);

export const IconLinkedIn: React.FC<IconProps> = (props) => (
    <F {...props} aria-label="LinkedIn" aria-hidden={false}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </F>
);

export const IconTwitterX: React.FC<IconProps> = (props) => (
    <F {...props} aria-label="X (Twitter)" aria-hidden={false}>
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </F>
);

export const IconInstagram: React.FC<IconProps> = (props) => (
    <F {...props} aria-label="Instagram" aria-hidden={false}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </F>
);

export const IconDevTo: React.FC<IconProps> = (props) => (
    <F {...props} aria-label="DEV.to" aria-hidden={false} viewBox="0 0 448 512">
        <path d="M120.12 208.29c-3.88-2.9-7.77-4.35-11.65-4.35H91.03v104.47h17.45c3.88 0 7.77-1.45 11.65-4.35 3.88-2.9 5.82-7.25 5.82-13.06v-69.65c-.01-5.8-1.96-10.16-5.83-13.06zM404.1 32H43.9C19.7 32 .06 51.59 0 75.8v360.4C.06 460.41 19.7 480 43.9 480h360.2c24.21 0 43.84-19.59 43.9-43.8V75.8c-.06-24.21-19.7-43.8-43.9-43.8zM154.2 291.19c0 18.81-11.61 47.31-48.36 47.25h-46.4V172.98h47.38c35.44 0 47.36 28.46 47.37 47.28l.01 70.93zm100.68-88.66H201.6v38.42h32.57v29.57H201.6v38.41h53.29v29.57h-62.18c-11.16.29-20.44-8.53-20.72-19.69V193.7c-.27-11.15 8.56-20.41 19.71-20.69h63.19l-.01 29.52zm103.64 115.29c-13.2 30.75-36.85 24.63-47.44 0l-38.53-144.8h32.57l29.71 113.72 29.57-113.72h32.58l-38.46 144.8z" />
    </F>
);

export const IconTranslate: React.FC<IconProps> = (props) => (
    <F
        {...props}
        aria-hidden={true}
        viewBox="0 0 24 24"
    >
        <path d="M12.87 15.07l-2.54-2.54.02-.02A7.49 7.49 0 0013.5 6h2V4h-5V2h-2v2H3v2h7.17a5.48 5.48 0 01-1.64 3.54c-.63-.63-1.17-1.33-1.62-2.08H5.1c.57 1.22 1.37 2.33 2.34 3.25L3 17h2l3.66-3.66 2.28 2.28.93-.55zM18.5 10h-2l-4 10h2l1-2.5h4l1 2.5h2l-4-10zm-2.5 5.5l1.5-4 1.5 4h-3z" />
    </F>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Communication
───────────────────────────────────────────────────────────────────────────── */

/** Two-part envelope — Heroicons solid */
export const IconEmail: React.FC<IconProps> = (props) => (
    <F {...props}>
        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
    </F>
);

/** Gmail envelope (Material-style) */
export const IconGmail: React.FC<IconProps> = (props) => (
    <F {...props} aria-label="Gmail" aria-hidden={false}>
        <path d="M20 4H4C2.895 4 2 4.895 2 6v12c0 1.105.895 2 2 2h16c1.105 0 2-.895 2-2V6c0-1.105-.895-2-2-2zm0 4.236-8 4.882-8-4.882V6.764l8 4.882 8-4.882V8.236z" />
    </F>
);

/** Paper airplane — Heroicons solid */
export const IconSend: React.FC<IconProps> = (props) => (
    <F {...props}>
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </F>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Navigation / UI
───────────────────────────────────────────────────────────────────────────── */

export const IconChevronLeft: React.FC<IconProps> = (props) => (
    <S {...props} size={16}>
        <path d="M15 18L9 12L15 6" />
    </S>
);

export const IconChevronRight: React.FC<IconProps> = (props) => (
    <S {...props} size={16}>
        <path d="M9 18L15 12L9 6" />
    </S>
);

export const IconChevronDown: React.FC<IconProps> = (props) => (
    <S {...props} size={16}>
        <path d="M6 9L12 15L18 9" />
    </S>
);

export const IconChevronUp: React.FC<IconProps> = (props) => (
    <S {...props} size={16}>
        <path d="M18 15L12 9L6 15" />
    </S>
);

export const IconArrowLeft: React.FC<IconProps> = (props) => (
    <S {...props}>
        <path d="M19 12H5M5 12L12 19M5 12L12 5" />
    </S>
);

export const IconArrowRight: React.FC<IconProps> = (props) => (
    <S {...props}>
        <path d="M5 12H19M19 12L12 5M19 12L12 19" />
    </S>
);

export const IconArrowUp: React.FC<IconProps> = (props) => (
    <S {...props}>
        <path d="M12 19V5M5 12L12 5L19 12" />
    </S>
);

export const IconMenu: React.FC<IconProps> = (props) => (
    <S {...props}>
        <path d="M4 6H20M4 12H20M4 18H20" />
    </S>
);

export const IconClose: React.FC<IconProps> = (props) => (
    <S {...props}>
        <path d="M18 6L6 18M6 6L18 18" />
    </S>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Developer / Code
───────────────────────────────────────────────────────────────────────────── */

/** Angle-bracket code icon — Heroicons solid */
export const IconCode: React.FC<IconProps> = (props) => (
    <F {...props} size={16}>
        <path
            fillRule="evenodd"
            d="M14.447 3.027a.75.75 0 01.527.92l-4.5 16.5a.75.75 0 01-1.448-.394l4.5-16.5a.75.75 0 01.921-.526zM16.72 6.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 010-1.06zm-9.44 0a.75.75 0 010 1.06L2.56 12l4.72 4.72a.75.75 0 11-1.06 1.06L.97 12.53a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z"
            clipRule="evenodd"
        />
    </F>
);

/** Stroke dev brackets */
export const IconDev: React.FC<IconProps> = (props) => (
    <S {...props}>
        <path d="M8 9L4 12L8 15" />
        <path d="M16 9L20 12L16 15" />
        <path d="M14 4L10 20" />
    </S>
);

/** Terminal prompt */
export const IconTerminal: React.FC<IconProps> = (props) => (
    <S {...props}>
        <path d="M4 17L10 11L4 5" />
        <path d="M12 19H20" />
    </S>
);

/** Git branch */
export const IconGitBranch: React.FC<IconProps> = (props) => (
    <S {...props}>
        <path d="M6 3v12" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 01-9 9" />
    </S>
);

/** Git commit */
export const IconGitCommit: React.FC<IconProps> = (props) => (
    <S {...props}>
        <circle cx="12" cy="12" r="3" />
        <line x1="3" y1="12" x2="9" y2="12" />
        <line x1="15" y1="12" x2="21" y2="12" />
    </S>
);

/** Git pull request */
export const IconGitPullRequest: React.FC<IconProps> = (props) => (
    <S {...props}>
        <circle cx="18" cy="18" r="3" />
        <circle cx="6" cy="6" r="3" />
        <path d="M13 6h3a2 2 0 012 2v7" />
        <line x1="6" y1="9" x2="6" y2="21" />
    </S>
);

/** CPU / processing chip */
export const IconCPU: React.FC<IconProps> = (props) => (
    <S {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="14" x2="23" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="14" x2="4" y2="14" />
    </S>
);

/** Database */
export const IconDatabase: React.FC<IconProps> = (props) => (
    <S {...props}>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </S>
);

/** Server / backend */
export const IconServer: React.FC<IconProps> = (props) => (
    <S {...props}>
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
    </S>
);

/** Layers / stack */
export const IconLayers: React.FC<IconProps> = (props) => (
    <S {...props}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </S>
);

/** Package */
export const IconPackage: React.FC<IconProps> = (props) => (
    <S {...props}>
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </S>
);

/** Shield (segurança / auth) */
export const IconShield: React.FC<IconProps> = (props) => (
    <S {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </S>
);

/** Lock (endpoint protegido / auth required) */
export const IconLock: React.FC<IconProps> = (props) => (
    <S {...props}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
    </S>
);

/** Calendar (período) */
export const IconCalendar: React.FC<IconProps> = (props) => (
    <S {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </S>
);

/** Clock (duração) */
export const IconClock: React.FC<IconProps> = (props) => (
    <S {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </S>
);

/** Trending up (crescimento / progressão de carreira) */
export const IconTrendingUp: React.FC<IconProps> = (props) => (
    <S {...props}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </S>
);

/** Wifi / connectivity */
export const IconWifi: React.FC<IconProps> = (props) => (
    <S {...props}>
        <path d="M5 12.55a11 11 0 0114.08 0" />
        <path d="M1.42 9a16 16 0 0121.16 0" />
        <path d="M8.53 16.11a6 16 0 016.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
    </S>
);

export const IconBolt: React.FC<IconProps> = (props) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={props.className}
        width={props.width ?? 18}
        height={props.height ?? 18}
        aria-hidden={props["aria-hidden"] ?? true}
    >
        <path d="M13 2L3 14h7v8l10-12h-7z" />
    </svg>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Specs / Stack Icons
───────────────────────────────────────────────────────────────────────────── */

/** Front-end (UI / layout / screens) */
export const IconFrontend: React.FC<IconProps> = (props) => (
    <S {...props}>
        {/* viewport */}
        <rect x="3" y="4" width="18" height="14" rx="2" />

        {/* grid/layout */}
        <line x1="9" y1="4" x2="9" y2="18" />
        <line x1="15" y1="4" x2="15" y2="18" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </S>
);

/** Back-end (server / processamento / API) */
export const IconBackend: React.FC<IconProps> = (props) => (
    <S {...props}>
        {/* nodes */}
        <rect x="4" y="10" width="4" height="4" rx="1" />
        <rect x="16" y="5" width="4" height="4" rx="1" />
        <rect x="16" y="15" width="4" height="4" rx="1" />

        {/* connections */}
        <line x1="8" y1="12" x2="16" y2="7" />
        <line x1="8" y1="12" x2="16" y2="17" />
    </S>
);

/** Banco de Dados */
export const IconDatabaseStack: React.FC<IconProps> = (props) => (
    <S {...props}>
        <ellipse cx="12" cy="5" rx="7" ry="3" />
        <path d="M5 5v10c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
        <path d="M5 10c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </S>
);

/** Qualidade de Software (QA / testes / validação) */
export const IconQuality: React.FC<IconProps> = (props) => (
    <S {...props}>
        {/* bug (problema) */}
        <circle cx="9" cy="10" r="2" />
        <line x1="9" y1="6" x2="9" y2="8" />
        <line x1="9" y1="12" x2="9" y2="14" />
        <line x1="6" y1="10" x2="4" y2="10" />
        <line x1="12" y1="10" x2="14" y2="10" />

        {/* check (resolução/qualidade) */}
        <path d="M14 16l2 2 4-4" />
    </S>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Actions / Status
───────────────────────────────────────────────────────────────────────────── */

/** Arrow down tray — Heroicons solid */
export const IconDownload: React.FC<IconProps> = (props) => (
    <F {...props} size={16}>
        <path
            fillRule="evenodd"
            d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"
            clipRule="evenodd"
        />
    </F>
);

/** Arrow top-right on square — Heroicons solid */
export const IconExternalLink: React.FC<IconProps> = (props) => (
    <F {...props}>
        <path d="M15.75 2.25H21a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V4.81L8.03 17.03a.75.75 0 01-1.06-1.06L19.19 3.75h-3.44a.75.75 0 010-1.5z" />
        <path d="M3.75 6.75A2.25 2.25 0 016 4.5h6a.75.75 0 010 1.5H6a.75.75 0 00-.75.75v13.5c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-6a.75.75 0 011.5 0v6A2.25 2.25 0 0119.5 22.5H6a2.25 2.25 0 01-2.25-2.25V6.75z" />
    </F>
);

/** Check circle — Heroicons solid */
export const IconCheck: React.FC<IconProps> = (props) => (
    <F {...props}>
        <path
            fillRule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
            clipRule="evenodd"
        />
    </F>
);

/** Simple checkmark (no circle) */
export const IconCheckmark: React.FC<IconProps> = (props) => (
    <S {...props}>
        <path d="M20 6L9 17L4 12" />
    </S>
);

/** Copy to clipboard */
export const IconCopy: React.FC<IconProps> = (props) => (
    <S {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </S>
);

/** Share */
export const IconShare: React.FC<IconProps> = (props) => (
    <S {...props}>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </S>
);

/** Search */
export const IconSearch: React.FC<IconProps> = (props) => (
    <S {...props}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </S>
);

/** Filter */
export const IconFilter: React.FC<IconProps> = (props) => (
    <S {...props}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </S>
);

/** Settings / gear */
export const IconSettings: React.FC<IconProps> = (props) => (
    <S {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </S>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Portfolio-specific
───────────────────────────────────────────────────────────────────────────── */

/** Map pin / location — Heroicons solid */
export const IconLocation: React.FC<IconProps> = (props) => (
    <F {...props}>
        <path
            fillRule="evenodd"
            d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.079 3.43-4.793 3.43-8.327a8.25 8.25 0 00-16.5 0c0 3.534 1.487 6.248 3.43 8.327a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
        />
    </F>
);

/** Chain link */
export const IconLink: React.FC<IconProps> = (props) => (
    <S {...props}>
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </S>
);

/** Briefcase / work experience */
export const IconBriefcase: React.FC<IconProps> = (props) => (
    <S {...props}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </S>
);

/** Graduation cap / education — Heroicons solid */
export const IconGraduationCap: React.FC<IconProps> = (props) => (
    <F {...props}>
        <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
        <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
    </F>
);

/** Verified badge — Heroicons solid */
export const IconBadge: React.FC<IconProps> = (props) => (
    <F {...props} size={14}>
        <path
            fillRule="evenodd"
            d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
            clipRule="evenodd"
        />
    </F>
);

/** Heart — Heroicons solid */
export const IconHeart: React.FC<IconProps> = (props) => (
    <F {...props} size={14}>
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </F>
);

/** Star */
export const IconStar: React.FC<IconProps> = (props) => (
    <F {...props} size={12} viewBox="0 0 16 16">
        <path d="M8 1L10.163 5.382L15 6.121L11.5 9.544L12.326 14.379L8 12.118L3.674 14.379L4.5 9.544L1 6.121L5.837 5.382L8 1Z" />
    </F>
);

/** Eye / preview */
export const IconEye: React.FC<IconProps> = (props) => (
    <S {...props}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </S>
);

/** Sparkles / AI / highlight — Heroicons solid */
export const IconSparkles: React.FC<IconProps> = (props) => (
    <F {...props}>
        <path
            fillRule="evenodd"
            d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036a2.63 2.63 0 001.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258a2.63 2.63 0 00-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.63 2.63 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.63 2.63 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395a1.5 1.5 0 00-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395a1.5 1.5 0 00.948-.948l.395-1.183A.75.75 0 0116.5 15z"
            clipRule="evenodd"
        />
    </F>
);

/** Rocket launch — Heroicons solid */
export const IconRocket: React.FC<IconProps> = (props) => (
    <F {...props}>
        <path
            fillRule="evenodd"
            d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
            clipRule="evenodd"
        />
        <path d="M5.26 17.242a.75.75 0 10-.897-1.203 5.243 5.243 0 00-2.05 5.022.75.75 0 00.625.627 5.243 5.243 0 005.022-2.051.75.75 0 10-1.202-.897 3.744 3.744 0 01-3.008 1.51c0-1.23.592-2.323 1.51-3.008z" />
    </F>
);

/** Info circle — Heroicons solid */
export const IconInfo: React.FC<IconProps> = (props) => (
    <F {...props}>
        <path
            fillRule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
            clipRule="evenodd"
        />
    </F>
);

/** Warning triangle — Heroicons solid */
export const IconWarning: React.FC<IconProps> = (props) => (
    <F {...props}>
        <path
            fillRule="evenodd"
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
            clipRule="evenodd"
        />
    </F>
);

/** Social (rede de conexões / presença online) */
export const IconSocial: React.FC<IconProps> = (props) => (
    <S {...props}>
        {/* centro (você) */}
        <circle cx="12" cy="12" r="2.2" />

        {/* nós externos */}
        <circle cx="12" cy="5" r="1.6" />
        <circle cx="5" cy="16" r="1.6" />
        <circle cx="19" cy="16" r="1.6" />

        {/* conexões */}
        <line x1="12" y1="9.8" x2="12" y2="6.6" />
        <line x1="10.2" y1="13.2" x2="6.8" y2="15.2" />
        <line x1="13.8" y1="13.2" x2="17.2" y2="15.2" />
    </S>
);
