import React, { useState, useEffect, useRef } from 'react';
import './Timeline.css';
import { useLang } from '@/shared/hooks/useLang';
import { TIMELINE_DATA } from './Timeline.data';
import { TimelineCategory, TimelineItem } from './Timeline.types';
import { IconExternalLink } from '@/shared/ui/Icons';

// ── Tab icons ──────────────────────────────────────────────────────────────────
const IconEducation = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15} aria-hidden="true">
    <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z"/>
  </svg>
);
const IconCert = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15} aria-hidden="true">
    <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z"/>
  </svg>
);
const IconWork = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15} aria-hidden="true">
    <path fillRule="evenodd" d="M7.5 5.25a3 3 0 013-3h3a3 3 0 013 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0112 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 017.5 5.455V5.25zm7.5 0v.09a49.488 49.488 0 00-5 0v-.09a1.5 1.5 0 011.5-1.5h2a1.5 1.5 0 011.5 1.5zm-3 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd"/>
  </svg>
);

const TAB_CONFIG: { key: TimelineCategory; labelKey: 'timeline.tab.edu' | 'timeline.tab.cert' | 'timeline.tab.exp'; icon: React.ReactNode }[] = [
  { key: 'edu',  labelKey: 'timeline.tab.edu',  icon: <IconEducation /> },
  { key: 'cert', labelKey: 'timeline.tab.cert', icon: <IconCert /> },
  { key: 'exp',  labelKey: 'timeline.tab.exp',  icon: <IconWork /> },
];

// ── TimelineCard ─────────────────────────────────────────────────────────────
const TimelineCard: React.FC<{ item: TimelineItem; index: number }> = ({ item, index }) => {
  const ref      = useRef<HTMLElement>(null);
  const side     = index % 2 === 0 ? 'left' : 'right';
  const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (noMotion) { el.classList.add('is-visible'); return; }

    const obs = new IntersectionObserver(
      ([entry], observer) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('is-visible'), index * 80);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index, noMotion]);

  return (
    <article
      ref={ref}
      className={`timeline__item timeline__item--${side}`}
      data-tl-item
    >
      <div className="timeline__marker" aria-hidden="true" />
      <div className="timeline__card">
        <div className="timeline__card-head">
          <time className="timeline__date" dateTime={item.period}>{item.period}</time>
          <span className={`timeline__status timeline__status--${item.statusType}`}>
            {item.status}
          </span>
        </div>
        <h3 className="timeline__card-title">{item.title}</h3>
        <h4 className="timeline__card-subtitle">{item.institution}</h4>
        <p className="timeline__card-desc">{item.description}</p>
        {item.tags.length > 0 && (
          <div className="timeline__tags">
            {item.tags.map(tag => (
              <span className="timeline__tag" key={tag}>{tag}</span>
            ))}
          </div>
        )}
        {item.certUrl && (
          <a
            href={item.certUrl}
            className="timeline__cert-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver certificado de ${item.title} (abre em nova aba)`}
          >
            Ver certificado <IconExternalLink width={13} height={13} />
          </a>
        )}
      </div>
    </article>
  );
};

// ── Timeline ─────────────────────────────────────────────────────────────────
export const Timeline: React.FC = () => {
  const { t }         = useLang();
  const [active, setActive] = useState<TimelineCategory>('edu');
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleKeyDown = (e: React.KeyboardEvent, current: TimelineCategory) => {
    const keys  = TAB_CONFIG.map(c => c.key);
    const idx   = keys.indexOf(current);
    let target: TimelineCategory | null = null;

    if      (e.key === 'ArrowRight' || e.key === 'ArrowDown')  target = keys[(idx + 1) % keys.length];
    else if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    target = keys[(idx - 1 + keys.length) % keys.length];
    else if (e.key === 'Home')                                   target = keys[0];
    else if (e.key === 'End')                                    target = keys[keys.length - 1];

    if (target) {
      e.preventDefault();
      setActive(target);
      tabRefs.current[target]?.focus();
    }
  };

  return (
    <section id="timeline" className="timeline section" aria-labelledby="timeline-title" data-reveal>
      <div className="container">
        <header className="section-header">
          <span className="section-eyebrow">Trajetória</span>
          <h2 className="section-title" id="timeline-title">{t('timeline.title')}</h2>
          <p className="section-subtitle">{t('timeline.sub')}</p>
        </header>

        {/* Tabs */}
        <div className="timeline__tabs" role="tablist" aria-label="Categorias da trajetória">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.key}
              ref={el => { tabRefs.current[tab.key] = el; }}
              className={`timeline__tab${active === tab.key ? ' is-active' : ''}`}
              role="tab"
              id={`tab-${tab.key}`}
              aria-controls={`panel-${tab.key}`}
              aria-selected={active === tab.key}
              tabIndex={active === tab.key ? 0 : -1}
              onClick={() => setActive(tab.key)}
              onKeyDown={e => handleKeyDown(e, tab.key)}
            >
              {tab.icon}
              <span>{t(tab.labelKey)}</span>
            </button>
          ))}
        </div>

        {/* Panels */}
        {TAB_CONFIG.map(tab => (
          <div
            key={tab.key}
            id={`panel-${tab.key}`}
            className={`timeline__panel${active === tab.key ? ' is-active' : ''}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.key}`}
            aria-hidden={active !== tab.key}
          >
            <div className="timeline__line" aria-hidden="true" />
            <div className="timeline__items">
              {TIMELINE_DATA[tab.key].map((item, idx) => (
                <TimelineCard key={item.id} item={item} index={idx} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
