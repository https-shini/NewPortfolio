import React, { useRef, useState } from "react";
import { RepoThumb } from "@/features/devhub/components/RepoThumb";
import type { ReadmeImage } from "@/features/devhub/readme";
import type { Repository } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import { IconChevronLeft, IconChevronRight } from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   ProjectGallery — as capturas do README, uma por vez
   ─────────────────────────────────────────────────────────
   Imagem principal + setas + legenda (o `alt` do README) + contador
   e miniaturas. No celular, as miniaturas viram pontos (só CSS: o
   mesmo botão, sem a imagem) e a imagem aceita arrasto lateral.

   ← / → trocam de imagem enquanto o foco está na galeria. O contador
   é região viva educada: o leitor de tela ouve "Imagem 2 de 5" a cada
   troca, sem ser interrompido.

   Sem imagens (README sem capturas, ou ainda carregando), a galeria
   mostra a mesma capa do cartão — o visitante nunca vê um buraco.
───────────────────────────────────────────────────────── */

interface Props {
    repo: Repository;
    images: ReadmeImage[];
    loading: boolean;
    name: string;
}

const ARRASTO_MINIMO = 40;

export const ProjectGallery: React.FC<Props> = ({
    repo,
    images,
    loading,
    name,
}) => {
    const { t } = useLang();
    const [atual, setAtual] = useState(0);
    const inicioX = useRef<number | null>(null);
    const total = images.length;

    if (total === 0) {
        return (
            <section
                className="pgallery pgallery--empty"
                aria-label={t("modal.gallery")}
            >
                <div className="pgallery__stage">
                    <RepoThumb
                        repo={repo}
                        source="showcase"
                        coverVariant="full"
                        className="pgallery__cover"
                    />
                </div>
                <p className="pgallery__caption" role="status">
                    {loading ? t("modal.loading") : t("modal.noImages")}
                </p>
            </section>
        );
    }

    const i = Math.min(atual, total - 1);
    const ir = (n: number) => setAtual((n + total) % total);
    const imagem = images[i];
    const legenda = imagem.alt || `${name} — ${i + 1}`;
    const contador = t("modal.counter")
        .replace("{n}", String(i + 1))
        .replace("{total}", String(total));

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (total < 2) return;
        if (e.key === "ArrowRight") {
            e.preventDefault();
            ir(i + 1);
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            ir(i - 1);
        }
    };

    return (
        <section
            className="pgallery"
            aria-label={t("modal.gallery")}
            aria-roledescription={t("modal.carousel")}
            onKeyDown={onKeyDown}
        >
            <div
                className="pgallery__stage"
                onPointerDown={(e) => {
                    inicioX.current = e.clientX;
                }}
                onPointerUp={(e) => {
                    if (inicioX.current === null || total < 2) return;
                    const dx = e.clientX - inicioX.current;
                    inicioX.current = null;
                    if (Math.abs(dx) >= ARRASTO_MINIMO)
                        ir(dx < 0 ? i + 1 : i - 1);
                }}
            >
                <img
                    key={imagem.src}
                    className="pgallery__img"
                    src={imagem.src}
                    alt={legenda}
                    decoding="async"
                    draggable={false}
                />
                {total > 1 && (
                    <>
                        <button
                            type="button"
                            className="pgallery__arrow pgallery__arrow--prev"
                            onClick={() => ir(i - 1)}
                            aria-label={t("modal.prev")}
                        >
                            <IconChevronLeft
                                width={20}
                                height={20}
                                aria-hidden
                            />
                        </button>
                        <button
                            type="button"
                            className="pgallery__arrow pgallery__arrow--next"
                            onClick={() => ir(i + 1)}
                            aria-label={t("modal.next")}
                        >
                            <IconChevronRight
                                width={20}
                                height={20}
                                aria-hidden
                            />
                        </button>
                    </>
                )}
                <div className="pgallery__bar">
                    <span className="pgallery__caption">{legenda}</span>
                    <span className="pgallery__count" aria-live="polite">
                        <span aria-hidden="true">
                            {i + 1} / {total}
                        </span>
                        <span className="sr-only">{contador}</span>
                    </span>
                </div>
            </div>

            {total > 1 && (
                <ul className="pgallery__thumbs">
                    {images.map((img, n) => (
                        <li key={img.src}>
                            <button
                                type="button"
                                className="pgallery__thumb"
                                onClick={() => ir(n)}
                                aria-label={t("modal.goTo").replace(
                                    "{n}",
                                    String(n + 1),
                                )}
                                aria-current={n === i ? "true" : undefined}
                            >
                                <img
                                    src={img.src}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};
