type Lang = "pt" | "en";

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

export function formatMonthYear(date: string, lang: Lang = "pt"): string {
    const p = date.split("-").map(Number);
    const d = new Date(p[0], p[1] - 1, 1);
    return d.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
        month: "short",
        year: "numeric",
    });
}
