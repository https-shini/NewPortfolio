import React, { useState } from "react";
import { useLang } from "@/shared/hooks/useLang";
import type { TranslationKey } from "@/shared/lib/translations";
import { IconExternalLink, IconInfo } from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   ProfileWidgets — panorama do perfil no GitHub
   ─────────────────────────────────────────────────────────
   Quatro indicadores gerados por serviços externos, com as URLs
   EXATAS do perfil (as mesmas do README em https-shini/https-shini).
   São imagens SVG: carregam sob demanda (`loading="lazy"`), não
   executam script e não passam pela nossa API — o que mostram é
   calculado por cada serviço, com o cache dele (24 h).

   Tema Radical com fundo #0d1117: os cartões já vêm escuros, então
   a moldura é escura nos DOIS temas, como uma janela de IDE — em vez
   de um cartão escuro "furando" uma página clara.

   Cada imagem tem `alt` descritivo, e a falha de carregamento vira
   um aviso com link para a fonte, nunca um ícone quebrado.
───────────────────────────────────────────────────────── */

interface Widget {
    id: "stats" | "langs" | "streak" | "trophy";
    title: TranslationKey;
    alt: TranslationKey;
    src: string;
    width: number;
    height: number;
    note?: TranslationKey;
}

const PROFILE_WIDGETS: readonly Widget[] = [
    {
        id: "stats",
        title: "widgets.stats.title",
        alt: "widgets.stats.alt",
        src: "https://gcruz-github-readme-stats.vercel.app/api?username=https-shini&show_icons=true&theme=radical&include_all_commits=true&count_private=true&hide_border=true&bg_color=0d1117&cache_seconds=86400&rank_icon=percentile",
        width: 495,
        height: 195,
        note: "widgets.stats.note",
    },
    {
        id: "langs",
        title: "widgets.langs.title",
        alt: "widgets.langs.alt",
        src: "https://gcruz-github-readme-stats.vercel.app/api/top-langs/?username=https-shini&layout=compact&langs_count=8&theme=radical&hide_border=true&bg_color=0d1117&cache_seconds=86400&card_width=380",
        width: 380,
        height: 185,
    },
    {
        id: "streak",
        title: "widgets.streak.title",
        alt: "widgets.streak.alt",
        src: "https://streak-stats.demolab.com/?user=https-shini&theme=radical&hide_border=true&background=0d1117",
        width: 495,
        height: 195,
    },
    {
        id: "trophy",
        title: "widgets.trophy.title",
        alt: "widgets.trophy.alt",
        src: "https://github-profile-trophy-khaki-nine.vercel.app/?username=https-shini&theme=radical&no-frame=true&column=-1&margin-w=8&margin-h=8&row=2",
        width: 1000,
        height: 232,
    },
];

const WidgetCard: React.FC<{ w: Widget }> = ({ w }) => {
    const { t } = useLang();
    const [falhou, setFalhou] = useState(false);

    return (
        <figure className="pwidget" data-widget={w.id}>
            <figcaption className="pwidget__title">{t(w.title)}</figcaption>
            <div className="pwidget__frame">
                {falhou ? (
                    <p className="pwidget__fallback" role="status">
                        {t("widgets.error")}{" "}
                        <a
                            href={w.src}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t("widgets.openSource")}
                            <IconExternalLink
                                width={12}
                                height={12}
                                aria-hidden
                            />
                        </a>
                    </p>
                ) : (
                    <img
                        className="pwidget__img"
                        src={w.src}
                        alt={t(w.alt)}
                        width={w.width}
                        height={w.height}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={() => setFalhou(true)}
                    />
                )}
            </div>
            {w.note && (
                <p className="pwidget__note">
                    <IconInfo width={14} height={14} aria-hidden />
                    {t(w.note)}
                </p>
            )}
        </figure>
    );
};

export const ProfileWidgets: React.FC = () => {
    const { t } = useLang();
    return (
        <section
            id="panorama-github"
            className="devhub-section pwidgets"
            aria-labelledby="pwidgets-title"
        >
            <div className="devhub-section__head">
                <h2 id="pwidgets-title" className="devhub-section__title">
                    {t("widgets.title")}
                </h2>
                <p className="devhub-section__desc">{t("widgets.desc")}</p>
            </div>
            <div className="pwidgets__panel">
                <div className="pwidgets__bar" aria-hidden="true">
                    <span className="pwidgets__dots">
                        <span />
                        <span />
                        <span />
                    </span>
                    <span className="pwidgets__path">~/https-shini/stats</span>
                </div>
                <div className="pwidgets__grid">
                    {PROFILE_WIDGETS.map((w) => (
                        <WidgetCard key={w.id} w={w} />
                    ))}
                </div>
            </div>
            <p className="pwidgets__source">{t("widgets.source")}</p>
        </section>
    );
};
