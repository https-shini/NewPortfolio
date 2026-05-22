import React, { useEffect, useRef, useState, useCallback } from "react";
import "./ScrollUtils.css";
import { IconArrowUp } from "@/shared/ui/Icons";

/**
 * ScrollUtils — Container unificado para:
 *   • Indicador de progresso no topo da página
 *   • Botão "voltar ao topo" no canto inferior direito
 *
 * Performance: usa um único listener de scroll com requestAnimationFrame
 * (passive) que atualiza ambos os elementos. Sem state churn em React.
 */
export const ScrollUtils: React.FC<{ label?: string }> = ({
    label = "Voltar ao topo",
}) => {
    const [showBackToTop, setShowBackToTop] = useState(false);
    const progressRef = useRef<HTMLSpanElement>(null);
    const tickingRef = useRef(false);
    const lastVisibleRef = useRef(false);

    const update = useCallback(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollHeight > 0 ? Math.min(1, scrollTop / scrollHeight) : 0;

        if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${progress})`;
        }

        const visible = scrollTop > 720;
        if (visible !== lastVisibleRef.current) {
            lastVisibleRef.current = visible;
            setShowBackToTop(visible);
        }

        tickingRef.current = false;
    }, []);

    useEffect(() => {
        const onScroll = () => {
            if (!tickingRef.current) {
                window.requestAnimationFrame(update);
                tickingRef.current = true;
            }
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [update]);

    const handleClick = useCallback(() => {
        const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: noMotion ? "auto" : "smooth" });
    }, []);

    return (
        <>
            <div className="scroll-progress" aria-hidden="true">
                <span ref={progressRef} className="scroll-progress__bar" />
            </div>

            <button
                type="button"
                className={`back-to-top${showBackToTop ? " is-visible" : ""}`}
                onClick={handleClick}
                aria-label={label}
                aria-hidden={!showBackToTop}
                tabIndex={showBackToTop ? 0 : -1}
            >
                <IconArrowUp width={18} height={18} aria-hidden="true" />
            </button>
        </>
    );
};
