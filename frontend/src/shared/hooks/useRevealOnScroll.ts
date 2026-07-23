import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver to the returned ref and adds
 * the `is-visible` class when the element enters the viewport.
 *
 * @param index     - stagger position (0-based); multiplied by staggerMs
 * @param staggerMs - milliseconds per stagger step (default 90)
 */
export function useRevealOnScroll<T extends HTMLElement = HTMLElement>(
    index = 0,
    staggerMs = 90,
) {
    const ref = useRef<T | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const noMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        if (noMotion) {
            el.classList.add("is-visible");
            return;
        }

        let timerId: ReturnType<typeof setTimeout>;

        const observer = new IntersectionObserver(
            ([entry], obs) => {
                if (!entry.isIntersecting) return;
                obs.unobserve(el);

                const delay = index * staggerMs;
                if (delay > 0) {
                    timerId = setTimeout(
                        () => el.classList.add("is-visible"),
                        delay,
                    );
                } else {
                    el.classList.add("is-visible");
                }
            },
            { threshold: 0.08, rootMargin: "0px 0px -48px 0px" },
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
            clearTimeout(timerId);
        };
    }, [index, staggerMs]);

    return ref;
}
