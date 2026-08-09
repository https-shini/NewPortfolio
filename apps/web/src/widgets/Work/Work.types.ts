import type { Localized } from "@/shared/lib/localized";

export interface WorkProject {
    id: string;
    emoji: string;
    title: Localized;
    desc: Localized;
    tech: Array<{ label: string; variant: "brand" | "accent" | "neutral" }>;
    demoUrl: string;
    repoUrl: string;
    thumbBg?: string;
    thumbColor?: string;
    imageUrl?: string;
}
