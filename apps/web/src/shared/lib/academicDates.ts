/* ─────────────────────────────────────────────────────────
   academicDates.ts
   ────────────────
   Derivações específicas da vida acadêmica (semestre da graduação),
   a partir das âncoras em profile.ts. Segue o padrão de careerDates.ts:
   datas absolutas "YYYY-MM" como fonte de verdade, display derivado.

   Convenção de semestres letivos (Brasil):
     · 1º semestre: Fev–Jun  (meses 1–6)
     · 2º semestre: Ago–Dez  (meses 7–12)
───────────────────────────────────────────────────────── */

/**
 * semestersElapsed — número (não limitado) de semestres desde o início do curso,
 * contando o semestre corrente como 1 no início. Pode exceder o total do curso.
 */
export function semestersElapsed(
    startDate: string,
    now: Date = new Date(),
): number {
    const [sy, sm] = startDate.split("-").map(Number);
    const startHalf = sm <= 6 ? 0 : 1;
    const nowHalf = now.getMonth() + 1 <= 6 ? 0 : 1;
    return (now.getFullYear() - sy) * 2 + (nowHalf - startHalf) + 1;
}

/**
 * currentSemester — semestre atual da graduação, limitado a [1, totalSemesters].
 * Nunca retorna menos de 1 nem mais que o total do curso.
 */
export function currentSemester(
    startDate: string,
    totalSemesters: number,
    now: Date = new Date(),
): number {
    const elapsed = semestersElapsed(startDate, now);
    return Math.min(Math.max(elapsed, 1), totalSemesters);
}

/**
 * isGraduationComplete — true quando o tempo decorrido ultrapassou a duração
 * do curso. Nesse ponto o card deve exibir estado "concluído" em vez de
 * continuar incrementando o semestre.
 */
export function isGraduationComplete(
    startDate: string,
    totalSemesters: number,
    now: Date = new Date(),
): boolean {
    return semestersElapsed(startDate, now) > totalSemesters;
}
