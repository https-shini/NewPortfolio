/* ─────────────────────────────────────────────────────────
   Timeline.types — Carreira + Formação + Certificações
   ──────────────
   Conteúdo textual bilíngue usa `Localized` ({ pt, en }),
   resolvido no render via `valor[lang]`. Tokens estáveis
   (employmentType, modality, statusType) são traduzidos via
   `t('career.*')` no idioma corrente.
───────────────────────────────────────────────────────── */
import type { Localized } from "@/shared/lib/localized";

/* ── Enumerations ──────────────────────────────────────── */
export type TimelineStatusType = "active" | "done" | "planned";
export type TimelineCategory = "edu" | "cert" | "exp";

/** Modalidade de trabalho/estudo — token estável, traduzido no render. */
export type Modality = "ON_SITE" | "REMOTE" | "HYBRID" | "EAD";

/** Tipo de contrato/vínculo — token estável, traduzido no render. */
export type EmploymentType =
    | "FULL_TIME"
    | "PART_TIME"
    | "INTERNSHIP"
    | "CLT"
    | "FREELANCER"
    | "CONTRACTOR"
    | "TEMPORARY";

/* ── Estruturas auxiliares ─────────────────────────────── */
export interface TimelineProjectLink {
    label: string;
    url: string;
}

/** Bullet de uma posição de carreira (texto bilíngue). */
export interface CareerBullet {
    text: Localized;
    /** Quando true, aparece também na seção "Destaques". */
    highlight?: boolean;
}

/* ── Formação Acadêmica + Certificações ────────────────── */
export interface TimelineItem {
    id: string;
    category: TimelineCategory;

    /** Título/curso (bilíngue). */
    title: Localized;
    /** Nome da instituição (nome próprio — não traduzido). */
    institution: string;
    institutionUrl?: string;
    institutionLogo?: string;

    /** Período display (bilíngue — meses localizados). */
    period: Localized;
    startDate: string; // ISO "YYYY-MM"
    endDate?: string; // undefined = em andamento

    location?: string;
    modality?: Modality;

    statusType: TimelineStatusType;

    /** Descrição (bilíngue). */
    description: Localized;

    /** Tags/competências (bilíngue). */
    tags: Localized[];
    techIcons?: string[];

    certUrl?: string | null;
    projectLinks?: TimelineProjectLink[];
}

export type TimelineRawData = TimelineItem[];
export type TimelineGrouped = Record<TimelineCategory, TimelineItem[]>;

/* ── Carreira — uma posição dentro de uma empresa ──────── */
export interface CareerPosition {
    id: string;

    /** Cargo/função (bilíngue). */
    title: Localized;
    /** Tipo de contrato — token i18n. */
    employmentType: EmploymentType;

    /** Display de período — opcional; derivado de start/end se ausente. */
    period?: string;
    /** Display de duração — opcional; derivado de start/end se ausente. */
    duration?: string;
    startDate: string; // ISO "YYYY-MM" — fonte de verdade
    endDate?: string; // undefined = atual

    modality?: Modality;
    statusType: TimelineStatusType;

    /** Resumo curto (bilíngue). */
    summary?: Localized;
    /** Atividades/responsabilidades (bilíngue). */
    bullets: CareerBullet[];
    /** Competências/tecnologias (bilíngue). */
    tags: Localized[];
}

/** Empresa — agrupa uma ou mais posições. */
export interface CareerCompany {
    id: string;

    name: string;
    url?: string;
    logo?: string;

    totalDuration?: string;
    /** Localização principal (bilíngue). */
    location: Localized;

    /** Posições, mais recentes primeiro. */
    positions: CareerPosition[];
}
