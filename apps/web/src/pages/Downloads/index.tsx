import React, { useMemo } from "react";
import "./Downloads.css";
import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { useLang } from "@/shared/hooks/useLang";
import { useRoute } from "@/shared/hooks/useRoute";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import {
    useDownloads,
    formatarTamanho,
    type Arquivo,
} from "@/shared/hooks/useDownloads";
import type { Plataforma } from "@/shared/lib/platform";
import { formatFullDate } from "@/shared/lib/dateUtils";
import { ROUTES, releaseNotePath } from "@/shared/config/routes";
import { PROFILE } from "@/shared/config/profile";
import { AtualizacaoDesktop } from "@/widgets/AtualizacaoDesktop/AtualizacaoDesktop";
import {
    IconDownload,
    IconArrowRight,
    IconGitBranch,
    IconPackage,
    IconShield,
    IconWindows,
    IconApple,
    IconLinux,
    IconAndroid,
} from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   /downloads — os instaladores da última versão
   ─────────────────────────────────────────────────────────
   A lista NÃO está escrita aqui: vem de /api/downloads, que lê as GitHub
   Releases. É o que impede a página de continuar oferecendo a versão
   passada depois que alguém publica uma nova — link de download velho é
   pior que ausente, porque funciona e entrega o errado.

   Os sistemas são apresentados em pé de igualdade: mesma superfície,
   mesmo tamanho, ordem fixa. NÃO há detecção de plataforma nem "melhor
   opção" — houve, e saiu. Detecção por user-agent erra com frequência, e
   uma página que já decidiu por você transfere para a interface uma
   escolha que é de quem baixa. Quem sabe qual é o próprio sistema é a
   pessoa; o trabalho da página é mostrar tudo com clareza igual.
───────────────────────────────────────────────────────── */

const NOMES: Record<Plataforma, string> = {
    windows: "Windows",
    macos: "macOS",
    linux: "Linux",
    android: "Android",
};

const ICONES: Record<
    Plataforma,
    React.FC<{ width?: number; height?: number }>
> = {
    windows: IconWindows,
    macos: IconApple,
    linux: IconLinux,
    android: IconAndroid,
};

/** Ordem fixa, igual para todo mundo. */
const ORDEM: Plataforma[] = ["windows", "macos", "linux", "android"];

type ChaveFormato =
    | "downloads.formatLabel.exe"
    | "downloads.formatLabel.dmg"
    | "downloads.formatLabel.appimage"
    | "downloads.formatLabel.deb"
    | "downloads.formatLabel.apk";

/**
 * O rótulo visível vem da tradução, não da API.
 *
 * A função continua devolvendo o formato técnico (`Instalador .exe`), que
 * é o dado; como isso se diz em cada idioma é decisão da apresentação,
 * como no resto do site. A extensão do nome do arquivo é a chave.
 */
function chaveDoFormato(nome: string): ChaveFormato | null {
    const n = nome.toLowerCase();
    if (n.endsWith(".exe")) return "downloads.formatLabel.exe";
    if (n.endsWith(".dmg")) return "downloads.formatLabel.dmg";
    if (n.endsWith(".appimage")) return "downloads.formatLabel.appimage";
    if (n.endsWith(".deb")) return "downloads.formatLabel.deb";
    if (n.endsWith(".apk")) return "downloads.formatLabel.apk";
    return null;
}

type Tradutor = ReturnType<typeof useLang>["t"];

interface ListaProps {
    arquivos: Arquivo[];
    plataforma: Plataforma;
    lang: "pt" | "en";
    t: Tradutor;
}

const ListaDeArquivos: React.FC<ListaProps> = ({
    arquivos,
    plataforma,
    lang,
    t,
}) => (
    <ul className="dl-files">
        {arquivos.map((a) => {
            const chave = chaveDoFormato(a.nome);
            const rotulo = chave ? t(chave) : a.formato;
            return (
                <li key={a.url} className="dl-file">
                    <div className="dl-file__info">
                        <span className="dl-file__formato">{rotulo}</span>
                        <span className="dl-file__linha">
                            {a.arquitetura && (
                                <span className="badge badge--neutral">
                                    {a.arquitetura}
                                </span>
                            )}
                            <span className="dl-file__tamanho">
                                {formatarTamanho(a.tamanho, lang)}
                            </span>
                        </span>
                        {/* Zero downloads na primeira hora de uma release
                            lê como abandono, não como novidade. */}
                        {a.downloads > 0 && (
                            <span className="dl-file__count">
                                {a.downloads.toLocaleString(
                                    lang === "pt" ? "pt-BR" : "en-US",
                                )}{" "}
                                {t("downloads.downloadCount")}
                            </span>
                        )}
                    </div>

                    {/* `download` pede ao navegador para salvar em vez de
                        navegar; sem ele o .apk abriria como página. O rótulo
                        acessível diz O QUE se baixa — "Baixar" repetido seis
                        vezes numa lista não distingue nada. */}
                    <a
                        className="btn btn--primary btn--sm dl-file__btn"
                        href={a.url}
                        download
                        aria-label={`${t("downloads.get")} ${NOMES[plataforma]} — ${rotulo}${
                            a.arquitetura ? ` ${a.arquitetura}` : ""
                        }`}
                    >
                        <IconDownload
                            width={14}
                            height={14}
                            aria-hidden="true"
                        />
                        <span>{t("downloads.get")}</span>
                    </a>
                </li>
            );
        })}
    </ul>
);

export const DownloadsPage: React.FC = () => {
    const { lang, t } = useLang();
    const { navigate } = useRoute();
    useReducedMotion();
    const { dados, status } = useDownloads();

    useDocumentMeta({
        title: `${t("downloads.title")} — ${PROFILE.name}`,
        description: t("downloads.lead"),
        path: ROUTES.DOWNLOADS,
    });

    const porPlataforma = useMemo(() => {
        const mapa = new Map<Plataforma, Arquivo[]>();
        for (const a of dados.arquivos) {
            const lista = mapa.get(a.plataforma) ?? [];
            lista.push(a);
            mapa.set(a.plataforma, lista);
        }
        return mapa;
    }, [dados.arquivos]);

    /* Ordem fixa, sem reordenar por nada: dois visitantes na mesma
       versão veem exatamente a mesma página. */
    const presentes = useMemo(
        () => ORDEM.filter((p) => porPlataforma.has(p)),
        [porPlataforma],
    );

    const temArquivos = presentes.length > 0;

    /* Navegação interna, com as teclas de "abrir em nova aba" intactas:
       interceptar um ctrl+clique tiraria da pessoa o comportamento que o
       navegador já dá de graça. */
    const irPara = (destino: string) => (e: React.MouseEvent) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        navigate(destino);
    };

    /* A página da versão existe no próprio site, em português e inglês.
       Antes o destino era o `html_url` da release no GitHub — que some
       para o visitante assim que o repositório deixa de ser público, e
       que só existe em um idioma. */
    const notasDaVersao = dados.versao
        ? releaseNotePath(dados.versao)
        : ROUTES.RELEASE_NOTES;
    const irParaHistorico = irPara(ROUTES.RELEASE_NOTES);

    return (
        <>
            <a href="#main-content" className="skip-link">
                {lang === "pt"
                    ? "Ir para o conteúdo principal"
                    : "Skip to main content"}
            </a>

            <Header />

            <main
                id="main-content"
                className="dl"
                aria-busy={status === "loading"}
            >
                <div className="container">
                    <header className="dl__cabecalho">
                        <h1 className="dl__titulo">{t("downloads.title")}</h1>
                        <p className="dl__lead">{t("downloads.lead")}</p>

                        {dados.versao && (
                            <p className="dl__meta">
                                <IconGitBranch
                                    width={13}
                                    height={13}
                                    aria-hidden="true"
                                />
                                <span>
                                    {t("downloads.version")} {dados.versao}
                                </span>
                                {dados.publicadoEm && (
                                    <>
                                        <span aria-hidden="true">·</span>
                                        <span>
                                            {t("downloads.publishedAt")}{" "}
                                            {formatFullDate(
                                                dados.publicadoEm,
                                                lang,
                                            )}
                                        </span>
                                    </>
                                )}
                                <a
                                    href={notasDaVersao}
                                    className="dl__notas"
                                    onClick={irPara(notasDaVersao)}
                                >
                                    {t("downloads.notes")}
                                </a>
                            </p>
                        )}
                    </header>

                    {/* Só renderiza dentro do aplicativo; no navegador o
                        hook devolve `indisponivel` e não sai nada. */}
                    <AtualizacaoDesktop />

                    {status === "error" && (
                        <div className="dl__erro" role="status">
                            <p className="dl__erro-texto">
                                {t("downloads.error")}
                            </p>
                            {/* Recarregar e não "ver no GitHub": o
                                repositório é privado, e o cache do hook
                                só é gravado em sucesso — então recarregar
                                realmente tenta buscar de novo. */}
                            <button
                                type="button"
                                className="btn btn--outline btn--sm"
                                onClick={() => window.location.reload()}
                            >
                                {t("downloads.retry")}
                            </button>
                        </div>
                    )}

                    {!temArquivos && status !== "loading" && (
                        <div className="dl__vazio">
                            <span
                                className="dl__vazio-marca"
                                aria-hidden="true"
                            >
                                <IconPackage width={22} height={22} />
                            </span>
                            <h2 className="dl__vazio-titulo">
                                {t("downloads.empty.title")}
                            </h2>
                            <p className="dl__vazio-corpo">
                                {t("downloads.empty.body")}
                            </p>
                            {/* O caminho alternativo dentro do card, e não
                                só isolado no fim da página, que é onde ele
                                não faz falta. */}
                            <a
                                className="btn btn--outline btn--sm"
                                href={ROUTES.RELEASE_NOTES}
                                onClick={irParaHistorico}
                            >
                                {t("downloads.allReleases")}
                            </a>
                        </div>
                    )}

                    {temArquivos && (
                        <section
                            className="dl__sistemas"
                            aria-labelledby="dl-sistemas"
                        >
                            {/* Um heading só, e nada de "outras": não há
                                uma primeira da qual as demais sejam o
                                resto. Todos os sistemas são o assunto. */}
                            <h2 className="dl__secao" id="dl-sistemas">
                                {t("downloads.platforms")}
                            </h2>

                            <div className="dl__grade">
                                {presentes.map((p) => {
                                    const Icone = ICONES[p];
                                    return (
                                        <article
                                            key={p}
                                            className="card card--interactive dl-card"
                                            aria-labelledby={`dl-${p}`}
                                        >
                                            <div className="dl-card__topo">
                                                <span
                                                    className="dl-card__icone"
                                                    aria-hidden="true"
                                                >
                                                    <Icone
                                                        width={20}
                                                        height={20}
                                                    />
                                                </span>
                                                <h3
                                                    className="dl-card__nome"
                                                    id={`dl-${p}`}
                                                >
                                                    {NOMES[p]}
                                                </h3>
                                            </div>

                                            <ListaDeArquivos
                                                arquivos={
                                                    porPlataforma.get(p) ?? []
                                                }
                                                plataforma={p}
                                                lang={lang}
                                                t={t}
                                            />
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {temArquivos && (
                        <section
                            className="dl__seguranca"
                            aria-labelledby="dl-seguranca"
                        >
                            <span
                                className="dl__seguranca-marca"
                                aria-hidden="true"
                            >
                                <IconShield width={20} height={20} />
                            </span>
                            <div>
                                <h2
                                    className="dl__seguranca-titulo"
                                    id="dl-seguranca"
                                >
                                    {t("downloads.security.title")}
                                </h2>
                                <p className="dl__seguranca-corpo">
                                    {t("downloads.security.body")}
                                </p>
                            </div>
                        </section>
                    )}

                    <section className="dl__ios" aria-labelledby="dl-ios">
                        <h2 className="dl__ios-titulo" id="dl-ios">
                            {t("downloads.ios.title")}
                        </h2>
                        <p className="dl__ios-corpo">
                            {t("downloads.ios.body")}
                        </p>
                    </section>

                    <p className="dl__todas">
                        <a
                            href={ROUTES.RELEASE_NOTES}
                            onClick={irParaHistorico}
                        >
                            <span>{t("downloads.allReleases")}</span>
                            <IconArrowRight
                                width={14}
                                height={14}
                                aria-hidden="true"
                            />
                        </a>
                    </p>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default DownloadsPage;
