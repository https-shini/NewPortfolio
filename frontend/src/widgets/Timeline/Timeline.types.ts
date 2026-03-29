export type TimelineStatusType = 'active' | 'done';
export type TimelineCategory   = 'edu' | 'cert' | 'exp';

export interface TimelineItem {
  id:          string;
  title:       string;
  institution: string;
  period:      string;
  status:      string;
  statusType:  TimelineStatusType;
  description: string;
  tags:        string[];
  certUrl:     string | null;
}

export type TimelineData = Record<TimelineCategory, TimelineItem[]>;
