/* ─────────────────────────────────────────────────────────
   Timeline.types
   ──────────────
   Tipos centrais de "Carreira" + Formação + Certificações.

   PRINCÍPIO: enums i18n usam tokens estáveis (UPPER_SNAKE).
   O texto display é resolvido via `t('career.employment.*')`
   / `t('career.modality.*')` no idioma corrente — o data
   permanece desacoplado de idioma.

   ──────────────────────────────────────────────────────────
   I18N KEYS REQUIRED (registrar no arquivo de traduções):

   timeline.eyebrow / timeline.title / timeline.sub

   career.visit
   career.positions
   career.openDetails
   career.present
   career.modalOpened
   career.close
   career.activities
   career.summary           ← NOVO
   career.highlights        ← NOVO
   career.about             ← NOVO
   career.skills

   career.employment.FULL_TIME      ← NOVO ("Tempo integral" / "Full-time")
   career.employment.PART_TIME      ← NOVO ("Meio período" / "Part-time")
   career.employment.INTERNSHIP     ← NOVO ("Estágio" / "Internship")
   career.employment.CLT            ← NOVO ("CLT" / "CLT (Full-time)")
   career.employment.FREELANCER     ← NOVO ("Freelancer" / "Freelancer")
   career.employment.CONTRACTOR     ← NOVO ("Prestador de serviços" / "Contractor")
   career.employment.TEMPORARY      ← NOVO ("Temporário" / "Temporary")

   career.modality.ON_SITE          ← NOVO ("Presencial" / "On-site")
   career.modality.REMOTE           ← NOVO ("Remoto" / "Remote")
   career.modality.HYBRID           ← NOVO ("Híbrido" / "Hybrid")
   career.modality.EAD              ← NOVO ("EAD" / "Distance learning")

   (career.fact.* foram REMOVIDAS — o sidebar foi consolidado
   no novo design e não precisa mais desses labels duplicados.)
───────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────
   ENUMERATIONS
───────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────
   NESTED STRUCTURES
───────────────────────────────────────────────────────── */
export interface TimelineResponsibility {
    /** Texto descritivo */
    text: string;
    /** Quando true, renderiza com ênfase mais forte (cor accent, bold) */
    highlight?: boolean;
}

export interface TimelineProjectLink {
    label: string;
    url: string;
}

/** Bullet de uma posição de carreira — pode ser destacado para a seção
 *  "Destaques" do modal. Mantém paridade com `TimelineResponsibility`. */
export interface CareerBullet {
    text: string;
    /** Quando true, aparece também na seção "Destaques" no topo do modal */
    highlight?: boolean;
}

/* ─────────────────────────────────────────────────────────
   TIMELINE ITEM (Formação Acadêmica + Certificações)
───────────────────────────────────────────────────────── */
export interface TimelineItem {
    id: string;
    category: TimelineCategory;

    /* Identificação */
    title: string;
    institution: string;
    institutionUrl?: string;
    institutionLogo?: string;

    /* Período */
    period: string;
    startDate: string; // ISO "YYYY-MM"
    endDate?: string; // undefined = em andamento

    /* Localização */
    location?: string;
    modality?: Modality; // ← agora usa o mesmo enum de carreira

    /* Status */
    status: string;
    statusType: TimelineStatusType;

    /* Conteúdo */
    description: string;
    longDescription?: string;
    responsibilities?: TimelineResponsibility[];

    /* Tags & skills */
    tags: string[];
    techIcons?: string[];

    /* Links */
    certUrl?: string | null;
    projectLinks?: TimelineProjectLink[];
}

export type TimelineRawData = TimelineItem[];
export type TimelineGrouped = Record<TimelineCategory, TimelineItem[]>;

/* ─────────────────────────────────────────────────────────
   CAREER — uma posição dentro de uma empresa
───────────────────────────────────────────────────────── */
export interface CareerPosition {
    id: string;

    /** Cargo/função */
    title: string;
    /** Tipo de contrato — token i18n */
    employmentType: EmploymentType;

    /**
     * Display do período. **Opcional** — se ausente, derivado de
     * startDate/endDate via `careerDates.ts` no idioma corrente.
     */
    period?: string;
    /**
     * Duração display. **Opcional** — se ausente, derivada de
     * startDate/endDate (ex.: "4 meses", "1 ano e 2 meses").
     */
    duration?: string;
    /** ISO "YYYY-MM" — fonte de verdade */
    startDate: string;
    /** ISO "YYYY-MM" — undefined = atual */
    endDate?: string;

    /** Modalidade — token i18n */
    modality?: Modality;

    /** Status textual + tipo (para cor) */
    status: string;
    statusType: TimelineStatusType;

    /** Resumo curto (1-2 frases). Aparece no card e no modal. */
    summary?: string;
    /** Lista de atividades/responsabilidades. Itens com `highlight: true`
     *  também aparecem na seção "Destaques" no topo do modal. */
    bullets: CareerBullet[];

    /** Tags de competências/tecnologias */
    tags: string[];
}

/** Empresa — agrupa uma ou mais posições */
export interface CareerCompany {
    id: string;

    name: string;
    /** URL do site / LinkedIn */
    url?: string;
    /** URL do logo (opcional — fallback usa iniciais) */
    logo?: string;

    /**
     * Duração total na empresa. **Opcional** — se ausente, calculada
     * automaticamente da posição mais antiga até a mais recente
     * (ou "agora" se houver posição ativa).
     */
    totalDuration?: string;
    /** Localização principal */
    location: string;

    /** Posições, mais recentes primeiro */
    positions: CareerPosition[];
}
