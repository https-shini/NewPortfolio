/**
 * Re-export tipos de TimelineItem para manter fonte única de dados.
 * Formacoes consome os mesmos itens (category === 'edu' | 'cert').
 */
export type {
    TimelineItem,
    TimelineStatusType,
    TimelineCategory,
    TimelineModality,
    TimelineResponsibility,
    TimelineProjectLink,
} from '@/widgets/Timeline/Timeline.types';
