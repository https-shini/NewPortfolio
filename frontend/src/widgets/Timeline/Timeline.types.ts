import React from 'react';

/* ─────────────────────────────────────────────────────────
   ENUMERATIONS
───────────────────────────────────────────────────────── */
export type TimelineStatusType = 'active' | 'done' | 'planned';
export type TimelineCategory   = 'edu' | 'cert' | 'exp';
export type TimelineModality   = 'presencial' | 'remoto' | 'híbrido' | 'ead';

/* ─────────────────────────────────────────────────────────
   NESTED STRUCTURES
───────────────────────────────────────────────────────── */
export interface TimelineResponsibility {
  /** Descriptive text for this responsibility */
  text:       string;
  /** When true, renders with stronger emphasis (accent color, bold) */
  highlight?: boolean;
}

export interface TimelineProjectLink {
  label: string;
  url:   string;
}

/* ─────────────────────────────────────────────────────────
   CORE ITEM — single source of truth
   All fields used by both the card and the modal.
───────────────────────────────────────────────────────── */
export interface TimelineItem {
  /** Unique identifier — used for deep-linking (?item=exp-1) */
  id:               string;
  /** Which tab this item belongs to */
  category:         TimelineCategory;

  /* ── Identification ── */
  title:            string;
  institution:      string;
  institutionUrl?:  string;   // link to company/university site
  institutionLogo?: string;   // CDN or imported image URL

  /* ── Period ── */
  /** Display string, e.g. "Jan 2026 — Presente" */
  period:           string;
  /** ISO "YYYY-MM" — used for duration calculation */
  startDate:        string;
  /** ISO "YYYY-MM" — undefined means ongoing */
  endDate?:         string;

  /* ── Location ── */
  location?:        string;
  modality?:        TimelineModality;

  /* ── Status ── */
  /** Human-readable label, e.g. "Cursando", "Concluído" */
  status:           string;
  statusType:       TimelineStatusType;

  /* ── Content ── */
  /** Short paragraph — shown on the card */
  description:      string;
  /** Longer paragraph — shown in the modal */
  longDescription?: string;
  /** Bulleted list of responsibilities — shown in the modal */
  responsibilities?: TimelineResponsibility[];

  /* ── Tags & skills ── */
  /** Text-only tags used for filtering and display */
  tags:             string[];
  /** Names resolved by skillicons.dev (e.g. 'react', 'nodejs') */
  techIcons?:       string[];

  /* ── Links ── */
  certUrl?:         string | null;
  projectLinks?:    TimelineProjectLink[];
}

/* ─────────────────────────────────────────────────────────
   DERIVED TYPES
───────────────────────────────────────────────────────── */

/** The authoritative flat list — export from Timeline.data.ts */
export type TimelineRawData = TimelineItem[];

/** Grouped by category — derived in useTimelineFilter */
export type TimelineGrouped = Record<TimelineCategory, TimelineItem[]>;

/** Tab configuration shape for the tab bar */
export interface TimelineTabConfig {
  key:      TimelineCategory;
  labelKey: 'timeline.tab.edu' | 'timeline.tab.cert' | 'timeline.tab.exp';
  icon:     React.ReactNode;
}

/** Filter state snapshot — used for URL serialization */
export interface TimelineFilterState {
  query:     string;
  activeTab: TimelineCategory;
}
