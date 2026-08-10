import React from "react";
import "./AtualizacaoDesktop.css";
import { useLang } from "@/shared/hooks/useLang";
import { useAtualizacaoDesktop } from "@/shared/hooks/useAtualizacaoDesktop";
import {
    IconDownload,
    IconCheck,
    IconWarning,
    IconClock,
} from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   AtualizacaoDesktop — o estado da atualização, na página
   ─────────────────────────────────────────────────────────
   Só existe dentro do aplicativo. No navegador o hook devolve
   `indisponivel` e este componente não renderiza nada — não há um
   "instale o app para ver isto", que seria propaganda no lugar de
   informação.

   O ciclo inteiro acontece aqui: verificar, baixar e reiniciar. Sair
   desta tela para concluir uma atualização seria mandar a pessoa buscar
   um instalador que o app já sabe baixar sozinho.
───────────────────────────────────────────────────────── */

export const AtualizacaoDesktop: React.FC = () => {
    const { t } = useLang();
    const { estado, verificar, baixar, instalar } = useAtualizacaoDesktop();

    if (estado.situacao === "indisponivel") return null;

    const { situacao, versao, nova, progresso } = estado;

    /* Um ícone por situação, e nunca dois significados no mesmo. */
    const Icone =
        situacao === "erro" || situacao === "naoSuportada"
            ? IconWarning
            : situacao === "atual"
              ? IconCheck
              : situacao === "pronta" || situacao === "disponivel"
                ? IconDownload
                : IconClock;

    const mensagem = () => {
        switch (situacao) {
            case "verificando":
                return t("downloads.update.checking");
            case "atual":
                return t("downloads.update.current");
            case "disponivel":
                return `${t("downloads.update.available")} ${nova ?? ""}`.trim();
            case "baixando":
                return `${t("downloads.update.downloading")} ${progresso ?? 0}%`;
            case "pronta":
                return t("downloads.update.ready");
            case "erro":
                return t("downloads.update.error");
            case "naoSuportada":
                return t("downloads.update.unsupported");
            default:
                return t("downloads.update.idle");
        }
    };

    const ocupado = situacao === "verificando" || situacao === "baixando";

    return (
        <section
            className={`card dl-update dl-update--${situacao}`}
            aria-labelledby="dl-update-titulo"
        >
            <span className="dl-update__marca" aria-hidden="true">
                <Icone width={20} height={20} />
            </span>

            <div className="dl-update__texto">
                <h2 className="dl-update__titulo" id="dl-update-titulo">
                    {t("downloads.update.title")}
                </h2>
                {/* `aria-live`: a mensagem muda sozinha conforme o
                    download anda, e quem usa leitor de tela precisa saber
                    disso sem reler a página. */}
                <p className="dl-update__estado" aria-live="polite">
                    {mensagem()}
                </p>
                {versao && (
                    <p className="dl-update__versao">
                        {t("downloads.update.runningVersion")} {versao}
                    </p>
                )}
            </div>

            {/* A barra é decorativa: o percentual já está no texto acima,
                que é o que o leitor de tela anuncia. */}
            {situacao === "baixando" && (
                <div className="dl-update__barra" aria-hidden="true">
                    <div
                        className="dl-update__barra-preenchida"
                        style={{ width: `${progresso ?? 0}%` }}
                    />
                </div>
            )}

            <div className="dl-update__acoes">
                {situacao === "pronta" ? (
                    <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={instalar}
                    >
                        {t("downloads.update.install")}
                    </button>
                ) : situacao === "disponivel" ? (
                    <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={baixar}
                    >
                        <IconDownload
                            width={14}
                            height={14}
                            aria-hidden="true"
                        />
                        <span>{t("downloads.update.download")}</span>
                    </button>
                ) : situacao === "naoSuportada" ? null : (
                    /* Sem botão quando a instalação não se atualiza: um
                       "verificar" que nunca sai do lugar é pior que a
                       ausência dele. A lista de downloads é a saída, e
                       está logo abaixo. */
                    <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={verificar}
                        disabled={ocupado}
                    >
                        {t("downloads.update.check")}
                    </button>
                )}
            </div>
        </section>
    );
};

export default AtualizacaoDesktop;
