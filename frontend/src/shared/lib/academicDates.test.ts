import { describe, it, expect } from "vitest";
import {
    semestersElapsed,
    currentSemester,
    isGraduationComplete,
} from "./academicDates";

/* now fixo para determinismo (mês é 0-indexado em Date). */
const at = (y: number, m: number) => new Date(y, m - 1, 15);

const START = "2023-01"; // Bacharelado em CC
const TOTAL = 8;

describe("semestersElapsed", () => {
    it("conta o 1º semestre no início do curso", () => {
        expect(semestersElapsed(START, at(2023, 3))).toBe(1); // mar/2023
    });

    it("passa ao 2º semestre no 2º período letivo", () => {
        expect(semestersElapsed(START, at(2023, 9))).toBe(2); // set/2023
    });

    it("chega ao 8º semestre no fim do curso", () => {
        expect(semestersElapsed(START, at(2026, 7))).toBe(8); // jul/2026
    });

    it("ultrapassa o total após a conclusão", () => {
        expect(semestersElapsed(START, at(2027, 6))).toBe(9);
    });
});

describe("currentSemester", () => {
    it("limita ao total do curso (nunca > totalSemesters)", () => {
        expect(currentSemester(START, TOTAL, at(2027, 6))).toBe(8);
    });

    it("nunca retorna menos de 1 (antes do início)", () => {
        expect(currentSemester(START, TOTAL, at(2022, 6))).toBe(1);
    });

    it("retorna o semestre corrente dentro do curso", () => {
        expect(currentSemester(START, TOTAL, at(2025, 3))).toBe(5);
    });
});

describe("isGraduationComplete", () => {
    it("false durante o curso", () => {
        expect(isGraduationComplete(START, TOTAL, at(2026, 7))).toBe(false);
    });

    it("true após ultrapassar a duração", () => {
        expect(isGraduationComplete(START, TOTAL, at(2027, 6))).toBe(true);
    });
});
