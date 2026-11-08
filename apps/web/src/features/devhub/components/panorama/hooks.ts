import { useEffect, useRef, useState } from "react";
import { LOCALE } from "@/features/devhub/format";
import type { Lang } from "@/shared/lib/translations";

/* ─────────────────────────────────────────────────────────
   Hooks de animação do panorama
   ─────────────────────────────────────────────────────────
   Contagem curta e só na mudança: o número vai do valor anterior ao
   novo (do zero, na primeira vez que entra na tela). Com
   `prefers-reduced-motion`, o valor final aparece direto.
───────────────────────────────────────────────────────── */

export const semMovimento = () =>
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const semObservador = () => typeof IntersectionObserver === "undefined";

/** `true` a partir da primeira vez que o elemento aparece na tela. */
export function useEmVista<T extends Element>(): [React.RefObject<T>, boolean] {
    const ref = useRef<T>(null) as React.RefObject<T>;
    const [visto, setVisto] = useState(() => semMovimento() || semObservador());
    useEffect(() => {
        const el = ref.current;
        if (!el || visto) return;
        const obs = new IntersectionObserver(
            (entradas) => {
                if (entradas.some((e) => e.isIntersecting)) {
                    setVisto(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.15 },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [visto]);
    return [ref, visto];
}

/** Valor que acompanha `alvo` com uma interpolação curta. */
export function useNumeroAnimado(alvo: number, ativo: boolean): number {
    const imediato = semMovimento();
    const [valor, setValor] = useState(0);
    const atual = useRef(0);
    useEffect(() => {
        if (!ativo || imediato) return;
        const de = atual.current;
        if (de === alvo) return;
        const duracao = 650;
        let inicio: number | null = null;
        let quadro = 0;
        const passo = (t: number) => {
            inicio ??= t;
            const k = Math.min(1, (t - inicio) / duracao);
            const v = Math.round(de + (alvo - de) * (1 - (1 - k) ** 3));
            atual.current = v;
            setValor(v);
            if (k < 1) quadro = requestAnimationFrame(passo);
        };
        quadro = requestAnimationFrame(passo);
        return () => cancelAnimationFrame(quadro);
    }, [alvo, ativo, imediato]);
    if (imediato) return alvo;
    return ativo ? valor : 0;
}

/** "6 de nov." / "6 de nov. de 2026", sempre em UTC (datas do calendário). */
export const curto = (iso: string, lang: Lang, ano = false) =>
    new Intl.DateTimeFormat(LOCALE[lang], {
        day: "numeric",
        month: "short",
        ...(ano ? { year: "numeric" } : {}),
        timeZone: "UTC",
    }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
