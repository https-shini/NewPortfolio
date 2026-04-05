import React, { useEffect, useRef } from 'react';
import './TimelineCard.css';
import { TimelineItem } from '../Timeline.types';
import { highlightText } from '@/shared/lib/highlightText';
import { calculateDuration } from '@/shared/lib/dateUtils';
import { IconExternalLink, IconBriefcase, IconLocation } from '@/shared/ui/Icons';

const SKILL_BASE = 'https://skillicons.dev/icons?i=';
const MAX_ICONS  = 5;

interface TimelineCardProps {
  item:        TimelineItem;
  index:       number;
  side:        'left' | 'right';
  searchQuery: string;
  onOpen:      () => void;
  lang:        'pt' | 'en';
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  item,
  index,
  side,
  searchQuery,
  onOpen,
  lang,
}) => {
  const articleRef = useRef<HTMLElement>(null);

  /* ── Two-stage IntersectionObserver ────────────────────
     Stage 1: marker appears (CSS delay via --item-index)
     Stage 2: card slides in (120ms after marker, also CSS)
  ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;

    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (noMotion) {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (!entry.isIntersecting) return;
        // Stagger controlled by --item-index custom property
        el.classList.add('is-visible');
        obs.unobserve(el);
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── Keyboard activation ────────────────────────────── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };

  const duration = calculateDuration(item.startDate, item.endDate, lang);
  const openLabel = lang === 'pt' ? 'Ver detalhes' : 'View details';

  return (
    <article
      ref={articleRef}
      className={`tl-card tl-card--${side}`}
      style={{ '--item-index': index } as React.CSSProperties}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${openLabel}: ${item.title} — ${item.institution}`}
    >
      {/* Stage 1: marker */}
      <div
        className={`tl-card__marker tl-card__marker--${item.statusType}`}
        aria-hidden="true"
      />

      {/* Stage 2: card body */}
      <div className="tl-card__inner">

        {/* Hover glow overlay */}
        <div className="tl-card__glow" aria-hidden="true" />

        {/* ── Header: date + status ── */}
        <div className="tl-card__head">
          <time className="tl-card__date" dateTime={item.startDate}>
            {item.period}
          </time>
          <span className={`tl-card__status tl-card__status--${item.statusType}`}>
            {item.status}
          </span>
        </div>

        {/* ── Institution logo + title block ── */}
        <div className="tl-card__title-row">
          {item.institutionLogo && (
            <img
              src={item.institutionLogo}
              alt=""
              className="tl-card__logo"
              width={28}
              height={28}
              loading="lazy"
              aria-hidden="true"
            />
          )}

          <div className="tl-card__title-block">
            <h3 className="tl-card__title">
              {highlightText(item.title, searchQuery)}
            </h3>
            <p className="tl-card__subtitle">
              {highlightText(item.institution, searchQuery)}
              {item.location && (
                <span className="tl-card__location">
                  <IconLocation width={10} height={10} aria-hidden />
                  {item.location}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* ── Duration ── */}
        <p className="tl-card__duration" aria-label={`Duração: ${duration}`}>
          {duration}
        </p>

        {/* ── Description ── */}
        <p className="tl-card__desc">
          {highlightText(item.description, searchQuery)}
        </p>

        {/* ── Tags ── */}
        {item.tags.length > 0 && (
          <div className="tl-card__tags" aria-label="Tags">
            {item.tags.map(tag => (
              <span key={tag} className="tl-card__tag">
                {highlightText(tag, searchQuery)}
              </span>
            ))}
          </div>
        )}

        {/* ── Tech icons (max 5) ── */}
        {item.techIcons && item.techIcons.length > 0 && (
          <div className="tl-card__icons" aria-label="Tecnologias">
            {item.techIcons.slice(0, MAX_ICONS).map(icon => (
              <img
                key={icon}
                src={`${SKILL_BASE}${icon}`}
                alt={icon}
                width={20}
                height={20}
                loading="lazy"
                title={icon}
              />
            ))}
            {item.techIcons.length > MAX_ICONS && (
              <span className="tl-card__icons-more">
                +{item.techIcons.length - MAX_ICONS}
              </span>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="tl-card__footer">
          {item.certUrl && (
            <a
              href={item.certUrl}
              className="tl-card__cert-link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              aria-label={`Ver certificado de ${item.title}`}
            >
              {lang === 'pt' ? 'Ver certificado' : 'View certificate'}
              <IconExternalLink width={11} height={11} />
            </a>
          )}

          <span className="tl-card__open-hint" aria-hidden="true">
            <IconBriefcase width={11} height={11} />
            {openLabel}
          </span>
        </div>
      </div>
    </article>
  );
};
