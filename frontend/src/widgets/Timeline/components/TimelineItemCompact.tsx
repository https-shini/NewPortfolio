import React from 'react';
import './TimelineItemCompact.css';
import { TimelineItem } from '../Timeline.types';
import { highlightText } from '@/shared/lib/highlightText';
import { calculateDuration } from '@/shared/lib/dateUtils';

interface TimelineItemCompactProps {
  item:        TimelineItem;
  searchQuery: string;
  onOpen:      () => void;
  lang:        'pt' | 'en';
}

export const TimelineItemCompact: React.FC<TimelineItemCompactProps> = ({
  item,
  searchQuery,
  onOpen,
  lang,
}) => {
  const duration    = calculateDuration(item.startDate, item.endDate, lang);
  const openLabel   = lang === 'pt' ? 'Ver detalhes' : 'View details';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      className="tl-compact"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      aria-label={`${openLabel}: ${item.title} — ${item.institution}`}
    >
      {/* Status dot */}
      <span
        className={`tl-compact__dot tl-compact__dot--${item.statusType}`}
        aria-hidden="true"
      />

      {/* Title + institution */}
      <div className="tl-compact__body">
        <span className="tl-compact__title">
          {highlightText(item.title, searchQuery)}
        </span>
        <span className="tl-compact__sep" aria-hidden="true">·</span>
        <span className="tl-compact__institution">
          {highlightText(item.institution, searchQuery)}
        </span>
      </div>

      {/* Period + duration */}
      <div className="tl-compact__meta">
        <time className="tl-compact__period" dateTime={item.startDate}>
          {item.period}
        </time>
        <span className="tl-compact__duration">{duration}</span>
      </div>

      {/* Status pill */}
      <span className={`tl-compact__status tl-compact__status--${item.statusType}`}>
        {item.status}
      </span>
    </div>
  );
};
