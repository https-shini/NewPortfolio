import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TimelineCategory,
  TimelineGrouped,
  TimelineItem,
} from '../Timeline.types';

const CATEGORIES: TimelineCategory[] = ['exp', 'edu', 'cert'];
const DEFAULT_TAB: TimelineCategory  = 'exp';
const URL_PARAM_TAB                  = 'tab';

function readParam(key: string): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get(key) ?? '';
}

function isValidCategory(v: string): v is TimelineCategory {
  return (CATEGORIES as string[]).includes(v);
}

/* ─────────────────────────────────────────────────────────
   RETURN TYPE
───────────────────────────────────────────────────────── */
export interface UseTimelineFilterReturn {
  activeTab:    TimelineCategory;
  setActiveTab: (tab: TimelineCategory) => void;
  grouped:      TimelineGrouped;
  activeItems:  TimelineItem[];
  countsByTab:  Record<TimelineCategory, number>;
}

/* ─────────────────────────────────────────────────────────
   HOOK
───────────────────────────────────────────────────────── */
export function useTimelineFilter(allItems: TimelineItem[]): UseTimelineFilterReturn {

  const [activeTab, setActiveTabState] = useState<TimelineCategory>(() => {
    const t = readParam(URL_PARAM_TAB);
    return isValidCategory(t) ? t : DEFAULT_TAB;
  });

  /* ── Sync active tab → URL ────────────────────────────── */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);

    if (activeTab !== DEFAULT_TAB) params.set(URL_PARAM_TAB, activeTab);
    else                           params.delete(URL_PARAM_TAB);

    // Preserve any existing ?item= param set by the modal
    const qs  = params.toString();
    const url = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;

    history.replaceState(null, '', url);
  }, [activeTab]);

  /* ── Group items by category (no filtering — all items shown) ── */
  const grouped = useMemo<TimelineGrouped>(() => {
    return Object.fromEntries(
      CATEGORIES.map(cat => [
        cat,
        allItems.filter(item => item.category === cat),
      ]),
    ) as TimelineGrouped;
  }, [allItems]);

  const countsByTab = useMemo<Record<TimelineCategory, number>>(
    () => ({
      exp:  grouped.exp.length,
      edu:  grouped.edu.length,
      cert: grouped.cert.length,
    }),
    [grouped],
  );

  const activeItems = grouped[activeTab];

  const setActiveTab = useCallback((tab: TimelineCategory) => {
    setActiveTabState(tab);
  }, []);

  return {
    activeTab,
    setActiveTab,
    grouped,
    activeItems,
    countsByTab,
  };
}
