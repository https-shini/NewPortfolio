type Lang = "pt" | "en";

/**
 * monthsSince — meses inteiros decorridos entre `startDate` ("YYYY-MM") e `now`.
 * Base numérica reutilizável para durações (evita parsear strings localizadas).
 */
export function monthsSince(startDate: string, now: Date = new Date()): number {
    const [sy, sm] = startDate.split("-").map(Number);
    return (now.getFullYear() - sy) * 12 + (now.getMonth() + 1 - sm);
}

/** yearsSince — anos inteiros decorridos desde `startDate` ("YYYY-MM"). */
export function yearsSince(startDate: string, now: Date = new Date()): number {
    return Math.floor(monthsSince(startDate, now) / 12);
}

export function calculateDuration(
    startDate: string,
    endDate: string | undefined,
    lang: Lang = "pt",
): string {
    const parts = startDate.split("-").map(Number);
    const sy = parts[0];
    const sm = parts[1];

    const now = new Date();
    let ey: number;
    let em: number;

    if (endDate) {
        const ep = endDate.split("-").map(Number);
        ey = ep[0];
        em = ep[1];
    } else {
        ey = now.getFullYear();
        em = now.getMonth() + 1;
    }

    const totalMonths = (ey - sy) * 12 + (em - sm);
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const labels = {
        pt: {
            year: (n: number): string => `${n} ano${n > 1 ? "s" : ""}`,
            month: (n: number): string => `${n} ${n > 1 ? "meses" : "mês"}`,
            and: "e",
            ongoing: "Em andamento",
            less: "menos de 1 mês",
        },
        en: {
            year: (n: number): string => `${n} year${n > 1 ? "s" : ""}`,
            month: (n: number): string => `${n} month${n > 1 ? "s" : ""}`,
            and: "and",
            ongoing: "Ongoing",
            less: "less than 1 month",
        },
    };

    const s = labels[lang];
    const result: string[] = [];

    if (years > 0) result.push(s.year(years));
    if (months > 0) result.push(s.month(months));

    const duration = result.join(` ${s.and} `) || s.less;

    return endDate ? duration : `${s.ongoing} · ${duration}`;
}

/**
 * formatFullDate — data ISO completa por extenso, no idioma corrente.
 *
 * Ex.: "2026-04-06" + "pt" → "6 de abril de 2026"
 *      "2026-04-06" + "en" → "April 6, 2026"
 *
 * Aceita "YYYY-MM-DD" e timestamps ISO completos (o `published_at` das
 * releases do GitHub, por exemplo). A data é construída em horário local
 * a partir dos componentes, evitando o deslocamento de fuso que `new
 * Date("2026-04-06")` causaria.
 */
export function formatFullDate(iso: string, lang: Lang = "pt"): string {
    const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
    const date = new Date(y!, (m ?? 1) - 1, d ?? 1);

    return new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

export function formatMonthYear(date: string, lang: Lang = "pt"): string {
    const p = date.split("-").map(Number);
    const d = new Date(p[0], p[1] - 1, 1);
    return d.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
        month: "short",
        year: "numeric",
    });
}
