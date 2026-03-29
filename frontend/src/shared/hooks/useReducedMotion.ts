import { useEffect } from 'react';

export function useReducedMotion() {
  useEffect(() => {
    const mq     = window.matchMedia('(prefers-reduced-motion: reduce)');
    const toggle = (v: boolean) => document.body.classList.toggle('reduce-motion', v);
    toggle(mq.matches);
    const handler = (e: MediaQueryListEvent) => toggle(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
}
