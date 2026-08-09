import React from "react";

export function highlightText(
    text: string | undefined | null,
    query: string | undefined | null,
): React.ReactNode {
    if (!text) return text ?? "";

    const q = (query ?? "").trim();
    if (!q) return text;

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    const lower = q.toLowerCase();

    return parts.map((part, i) =>
        part.toLowerCase() === lower ? (
            <mark key={i} className="timeline__highlight">
                {part}
            </mark>
        ) : (
            part
        ),
    );
}
