import React, { useEffect, useRef, useCallback } from 'react';
import './TimelineModal.css';
import { TimelineItem } from '../Timeline.types';
import { calculateDuration } from '@/shared/lib/dateUtils';
import {
  IconClose,
  IconLocation,
  IconExternalLink,
  IconBadge,
  IconBriefcase,
  IconGraduationCap,
} from '@/shared/ui/Icons';

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const SKILL_BASE = 'https://skillicons.dev/icons?i=';
const FOCUSABLE  =
  'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';

const MODALITY_LABELS: Record<string, Record<'pt' | 'en', string>> = {
  presencial: { pt: 'Presencial', en: 'On-site' },
  remoto:     { pt: 'Remoto',     en: 'Remote' },
  híbrido:    { pt: 'Híbrido',    en: 'Hybrid' },
  ead:        { pt: 'EaD',        en: 'Distance learning' },
};

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  edu:  <IconGraduationCap width={20} height={20} />,
  cert: <IconBadge         width={20} height={20} />,
  exp:  <IconBriefcase     width={20} height={20} />,
};

/* ─────────────────────────────────────────────────────────
   PROPS
───────────────────────────────────────────────────────── */
interface TimelineModalProps {
  item:    TimelineItem;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  lang:    'pt' | 'en';
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */
export const TimelineModal: React.FC<TimelineModalProps> = ({
  item,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  lang,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef  = useRef<HTMLButtonElement>(null);
  const bodyRef   = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  /* ── Labels ─────────────────────────────────────────── */
  const L = {
    close:            lang === 'pt' ? 'Fechar detalhes'          : 'Close details',
    prev:             lang === 'pt' ? 'Item anterior'             : 'Previous item',
    next:             lang === 'pt' ? 'Próximo item'              : 'Next item',
    responsibilities: lang === 'pt' ? 'Responsabilidades'         : 'Responsibilities',
    skills:           lang === 'pt' ? 'Competências'              : 'Skills',
    links:            lang === 'pt' ? 'Projetos relacionados'     : 'Related projects',
    certificate:      lang === 'pt' ? 'Ver certificado verificável' : 'View certificate',
    keyboard:         lang === 'pt'
      ? '← → navegar · Esc fechar'
      : '← → navigate · Esc close',
  };

  /* ── Focus trap ─────────────────────────────────────── */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Focus close button on open
    requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowLeft'  && hasPrev) { onPrev?.(); return; }
      if (e.key === 'ArrowRight' && hasNext) { onNext?.(); return; }

      if (e.key !== 'Tab') return;

      const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  /* ── Scroll body to top when item changes ───────────── */
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [item.id]);

  /* ── Swipe gesture (mobile) ─────────────────────────── */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);

    // Only horizontal swipes (more horizontal than vertical)
    if (Math.abs(dx) < 52 || dy > Math.abs(dx)) return;

    if (dx > 0 && hasNext) onNext?.();  // swipe left → next
    if (dx < 0 && hasPrev) onPrev?.();  // swipe right → prev
  }, [hasPrev, hasNext, onPrev, onNext]);

  /* ── Derived values ─────────────────────────────────── */
  const duration       = calculateDuration(item.startDate, item.endDate, lang);
  const modalityLabel  = item.modality
    ? MODALITY_LABELS[item.modality]?.[lang]
    : null;

  /* ─────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────── */
  return (
    /* Backdrop — click closes */
    <div
      className="tl-modal-backdrop is-open"
      onClick={onClose}
      aria-hidden="true"
    >
      {/* Dialog — stops propagation */}
      <div
        ref={dialogRef}
        className="tl-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tl-modal-title"
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-hidden="false"
      >

        {/* ══════════════════════════════════════
            HEADER
        ══════════════════════════════════════ */}
        <header className="tl-modal__header">
          {/* Top accent line */}
          <div className="tl-modal__header-accent" aria-hidden="true" />

          <div className="tl-modal__header-row">
            {/* Avatar: logo or category icon */}
            <div className="tl-modal__avatar" aria-hidden="true">
              {item.institutionLogo ? (
                <img
                  src={item.institutionLogo}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                />
              ) : (
                <span className="tl-modal__avatar-icon">
                  {CATEGORY_ICON[item.category]}
                </span>
              )}
            </div>

            {/* Text block */}
            <div className="tl-modal__header-text">
              <h2 id="tl-modal-title" className="tl-modal__title">
                {item.title}
              </h2>

              <p className="tl-modal__institution">
                {item.institutionUrl ? (
                  <a
                    href={item.institutionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tl-modal__institution-link"
                  >
                    {item.institution}
                  </a>
                ) : (
                  item.institution
                )}
              </p>

              <div className="tl-modal__meta-row">
                <time className="tl-modal__period" dateTime={item.startDate}>
                  {item.period}
                </time>

                {item.location && (
                  <span className="tl-modal__location">
                    <IconLocation width={11} height={11} aria-hidden />
                    {item.location}
                  </span>
                )}

                {modalityLabel && (
                  <span className="tl-modal__modality">{modalityLabel}</span>
                )}
              </div>
            </div>

            {/* Status + close */}
            <div className="tl-modal__header-end">
              <span className={`tl-modal__status tl-modal__status--${item.statusType}`}>
                {item.status}
              </span>

              <button
                ref={closeRef}
                className="tl-modal__close"
                type="button"
                onClick={onClose}
                aria-label={L.close}
              >
                <IconClose width={16} height={16} />
              </button>
            </div>
          </div>

          {/* Duration badge */}
          <p className="tl-modal__duration">{duration}</p>
        </header>

        {/* ══════════════════════════════════════
            BODY
        ══════════════════════════════════════ */}
        <div ref={bodyRef} className="tl-modal__body">

          {/* Long description */}
          <section className="tl-modal__section">
            <p className="tl-modal__desc">
              {item.longDescription ?? item.description}
            </p>
          </section>

          {/* Responsibilities */}
          {item.responsibilities && item.responsibilities.length > 0 && (
            <section className="tl-modal__section">
              <h3 className="tl-modal__section-title">{L.responsibilities}</h3>
              <ul className="tl-modal__responsibilities" role="list">
                {item.responsibilities.map((r, i) => (
                  <li
                    key={i}
                    className={`tl-modal__responsibility${r.highlight ? ' is-highlight' : ''}`}
                  >
                    {r.text}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tags + tech icons */}
          {(item.tags.length > 0 || (item.techIcons && item.techIcons.length > 0)) && (
            <section className="tl-modal__section">
              <h3 className="tl-modal__section-title">{L.skills}</h3>
              <div className="tl-modal__tags">
                {item.tags.map(tag => (
                  <span key={tag} className="badge badge--accent">{tag}</span>
                ))}
                {item.techIcons?.map(icon => (
                  <span key={icon} className="badge badge--neutral tl-modal__tech-badge">
                    <img
                      src={`${SKILL_BASE}${icon}`}
                      alt={icon}
                      width={14}
                      height={14}
                      loading="lazy"
                    />
                    {icon}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Project links */}
          {item.projectLinks && item.projectLinks.length > 0 && (
            <section className="tl-modal__section">
              <h3 className="tl-modal__section-title">{L.links}</h3>
              <div className="tl-modal__project-links">
                {item.projectLinks.map(link => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--outline btn--sm"
                  >
                    <IconExternalLink width={14} height={14} />
                    {link.label}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Certificate CTA */}
          {item.certUrl && (
            <section className="tl-modal__section">
              <a
                href={item.certUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary btn--sm"
              >
                <IconBadge width={14} height={14} />
                {L.certificate}
              </a>
            </section>
          )}
        </div>

        {/* ══════════════════════════════════════
            FOOTER — navigation
        ══════════════════════════════════════ */}
        <footer className="tl-modal__footer">
          <button
            className="btn btn--ghost btn--sm tl-modal__nav-btn"
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label={L.prev}
          >
            ← {L.prev}
          </button>

          <p className="tl-modal__keyboard-hint" aria-hidden="true">
            {L.keyboard}
          </p>

          <button
            className="btn btn--ghost btn--sm tl-modal__nav-btn"
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            aria-label={L.next}
          >
            {L.next} →
          </button>
        </footer>
      </div>
    </div>
  );
};

export default TimelineModal;
