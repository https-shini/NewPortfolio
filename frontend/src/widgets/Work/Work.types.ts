export interface WorkProject {
    id: string;
    emoji: string;
    title: string;
    desc: string;
    tech: Array<{ label: string; variant: "brand" | "accent" | "neutral" }>;
    demoUrl: string;
    repoUrl: string;
    thumbBg?: string;
    thumbColor?: string;
    imageUrl?: string;
}
