import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Featured.css';
import { useLang } from '@/shared/hooks/useLang';
import { IconStar, IconChevronLeft, IconChevronRight } from '@/shared/ui/Icons';

const SLIDES = [
  { bg: undefined,         label: 'HomeMade Gourmet', sub: 'Site de receitas inteligente' },
  { bg: 'linear-gradient(135deg,#0a1a14,#051210)', label: 'Receitas', sub: 'Sistema de recomendação' },
  { bg: 'linear-gradient(135deg,#12080a,#1a0a0f)', label: 'Calorias', sub: 'Cálculo automático' },
  { bg: 'linear-gradient(135deg,#0a1020,#07080f)', label: 'Admin',    sub: 'Painel administrativo' },
];

const TECH = [
  { key: 'html',   label: 'HTML5',      variant: 'brand' },
  { key: 'css',    label: 'CSS3',       variant: 'brand' },
  { key: 'js',     label: 'JavaScript', variant: 'brand' },
  { key: 'php',    label: 'PHP',        variant: 'accent' },
  { key: 'mysql',  label: 'MySQL',      variant: 'accent' },
  { key: 'figma',  label: 'Figma',      variant: 'neutral' },
];

const DETAILS = [
  {
    key:  'challenge' as const,
    text: 'Criar um sistema de recomendação personalizado de receitas sem dependências externas, com cálculo automático de macronutrientes.',
  },
  {
    key:  'solution' as const,
    text: 'Algoritmo próprio baseado em preferências e ingredientes favoritos, integrado a banco de dados relacional MySQL normalizado.',
  },
  {
    key:  'result' as const,
    text: 'TCC aprovado com louvor — 200+ receitas, painel administrativo completo e sistema de avaliação da comunidade em produção.',
  },
];

const INTERVAL = 4500;

export const Featured: React.FC = () => {
  const { t } = useLang();
  const [current, setCurrent]   = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX    = useRef(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const noMotion   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const goTo = useCallback((index: number) => {
    if (animating) return;
    const next = ((index % SLIDES.length) + SLIDES.length) % SLIDES.length;
    if (next === current) return;
    setAnimating(true);
    setCurrent(next);
    setTimeout(() => setAnimating(false), 600);
  }, [animating, current]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  const startAuto = useCallback(() => {
    if (noMotion || SLIDES.length < 2) return;
    timerRef.current = setInterval(next, INTERVAL);
  }, [next, noMotion]);

  const stopAuto = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const resetAuto = useCallback(() => { stopAuto(); startAuto(); }, [stopAuto, startAuto]);

  useEffect(() => { startAuto(); return stopAuto; }, [startAuto, stopAuto]);

  // Pause when hidden
  useEffect(() => {
    const handler = () => document.hidden ? stopAuto() : startAuto();
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [startAuto, stopAuto]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft')  { prev(); resetAuto(); }
    if (e.key === 'ArrowRight') { next(); resetAuto(); }
  };

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const delta = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 48) { delta > 0 ? next() : prev(); resetAuto(); }
  };

  const skillBase = 'https://skillicons.dev/icons?i=';

  return (
    <section id="destaque" className="featured section" aria-labelledby="featured-title" data-reveal>
      <div className="container">
        <header className="section-header">
          <span className="section-eyebrow">Destaque</span>
          <span className="featured__eyebrow">
            <IconStar />
            <span>{t('featured.badge')}</span>
          </span>
          <h2 className="section-title" id="featured-title">HomeMade Gourmet</h2>
          <p className="section-subtitle">{t('featured.desc')}</p>
        </header>

        <article className="featured__project" aria-label="Projeto HomeMade Gourmet">
          {/* Gallery */}
          <div
            ref={galleryRef}
            className="featured__gallery"
            role="region"
            aria-label="Imagens do projeto"
            aria-roledescription="carrossel"
            onMouseEnter={stopAuto}
            onMouseLeave={startAuto}
            onKeyDown={handleKeyDown}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            tabIndex={0}
          >
            <div className="featured__slides">
              {SLIDES.map((slide, i) => (
                <div
                  key={i}
                  className={`featured__slide${i === current ? ' is-active' : ''}`}
                >
                  <div
                    className="featured__slide-ph"
                    style={slide.bg ? { background: slide.bg } : undefined}
                  >
                    {slide.label}
                    <span className="featured__slide-ph-sub">{slide.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="featured__dots" role="group" aria-label="Navegar entre imagens">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`featured__dot${i === current ? ' is-active' : ''}`}
                  type="button"
                  aria-label={`Imagem ${i + 1}`}
                  aria-selected={i === current}
                  onClick={() => { goTo(i); resetAuto(); }}
                />
              ))}
            </div>

            {/* Arrows */}
            <button
              className="featured__arrow featured__arrow--prev"
              type="button"
              id="featured-prev"
              aria-label="Imagem anterior"
              tabIndex={-1}
              onClick={() => { prev(); resetAuto(); }}
            >
              <IconChevronLeft width={16} height={16} />
            </button>
            <button
              className="featured__arrow featured__arrow--next"
              type="button"
              id="featured-next"
              aria-label="Próxima imagem"
              tabIndex={-1}
              onClick={() => { next(); resetAuto(); }}
            >
              <IconChevronRight width={16} height={16} />
            </button>
          </div>

          {/* Body */}
          <div className="featured__body">
            <p className="featured__desc">
              <strong>TCC desenvolvido na ETEC Vila Formosa em 2022.</strong> O HomeMade Gourmet
              vai além de listar receitas — o sistema recomenda receitas personalizadas, calcula
              calorias automaticamente e oferece filtros por tipo de alimentação.
            </p>

            <div className="featured__tech">
              {TECH.map(item => (
                <span className={`badge badge--${item.variant}`} key={item.key}>
                  <img src={`${skillBase}${item.key}`} alt="" width={14} height={14} loading="lazy" />
                  {item.label}
                </span>
              ))}
            </div>

            <div className="featured__actions">
              <a
                href="https://https-shini.github.io/homemade-gourmet/"
                className="btn btn--primary btn--sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('featured.btn.live')}
              </a>
              <a
                href="https://github.com/https-shini/homemade-gourmet"
                className="btn btn--outline btn--sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('featured.btn.repo')}
              </a>
            </div>
          </div>
        </article>

        {/* Details */}
        <div className="featured__details">
          {DETAILS.map(d => (
            <div className="detail-card" key={d.key}>
              <p className="detail-card__label">
                {t(`detail.${d.key}` as 'detail.challenge' | 'detail.solution' | 'detail.result')}
              </p>
              <p className="detail-card__text">{d.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
