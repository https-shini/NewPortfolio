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
import {
    detectarPlataforma,
    type Plataforma,
    type PlataformaDetectada,
} from "@/shared/lib/platform";
import { ROUTES } from "@/shared/config/routes";
import { PROFILE } from "@/shared/config/profile";
import { GITHUB_URL } from "@/shared/config/constants";
import {
    IconDownload,
    IconArrowRight,
    IconGitBranch,
    IconPackage,
} from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   /downloads — os instaladores da última versão
   ─────────────────────────────────────────────────────────
   A lista NÃO está escrita aqui: vem de /api/downloads, que lê as GitHub
   Releases. É o que impede a página de continuar oferecendo a versão
   passada depois que alguém publica uma nova — link de download velho é
   pior que ausente, porque funciona e entrega o errado.

   A plataforma detectada só decide a ORDEM: o cartão dela sobe para o
   topo e os outros continuam logo abaixo. Detecção por user-agent erra,
   e uma página que esconde as outras opções ao errar deixa a pessoa sem
   saída.
───────────────────────────────────────────────────────── */

const NOMES: Record<Plataforma, string> = {
    windows: "Windows",
    macos: "macOS",
    linux: "Linux",
    android: "Android",
};

/** A ordem de sempre, quando não há nada detectado para promover. */
const ORDEM: Plataforma[] = ["windows", "macos", "linux", "android"];

interface CartaoProps {
    plataforma: Plataforma;
    arquivos: Arquivo[];
    destaque: boolean;
    lang: "pt" | "en";
    rotuloBaixar: string;
}

const Cartao: React.FC<CartaoProps> = ({
    plataforma,
    arquivos,
    destaque,
    lang,
    rotuloBaixar,
}) => (
    <article
        className={`dl-card${destaque ? " dl-card--destaque" : ""}`}
        aria-labelledby={`dl-${plataforma}`}
    >
        <h3 className="dl-card__nome" id={`dl-${plataforma}`}>
            {NOMES[plataforma]}
        </h3>

        <ul className="dl-card__lista">
            {arquivos.map((a) => (
                <li key={a.url} className="dl-file">
                    <span className="dl-file__meta">
                        <span className="dl-file__formato">{a.formato}</span>
                        <span className="dl-file__detalhe">
                            {a.arquitetura ? `${a.arquitetura} · ` : ""}
                            {formatarTamanho(a.tamanho, lang)}
                        </span>
                    </span>

                    {/* `download` pede ao navegador para salvar em vez de
                        navegar; sem ele o .apk abriria como página. O rótulo
                        acessível diz O QUE se baixa, porque "Baixar" repetido
                        seis vezes numa lista não distingue nada. */}
                    <a
                        className="btn btn--primary btn--sm dl-file__btn"
                        href={a.url}
                        download
                        aria-label={`${rotuloBaixar} ${NOMES[plataforma]} — ${a.formato}${
                            a.arquitetura ? ` ${a.arquitetura}` : ""
                        }`}
                    >
                        <IconDownload
                            width={14}
                            height={14}
                            aria-hidden="true"
                        />
                        <span>{rotuloBaixar}</span>
                    </a>
                </li>
            ))}
        </ul>
    </article>
);

export const DownloadsPage: React.FC = () => {
    const { lang, t } = useLang();
    const { navigate } = useRoute();
    useReducedMotion();
    const { dados, status } = useDownloads();

    /* Uma vez por montagem: o user-agent não muda no meio da visita. */
    const detectada: PlataformaDetectada = useMemo(
        () => detectarPlataforma(),
        [],
    );

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

    /* A detectada primeiro, o resto na ordem de sempre. */
    const ordenadas = useMemo(() => {
        const presentes = ORDEM.filter((p) => porPlataforma.has(p));
        if (detectada === "ios" || detectada === "desconhecida")
            return presentes;
        return [
            ...presentes.filter((p) => p === detectada),
            ...presentes.filter((p) => p !== detectada),
        ];
    }, [porPlataforma, detectada]);

    const temArquivos = ordenadas.length > 0;
    const promovida =
        detectada !== "ios" &&
        detectada !== "desconhecida" &&
        porPlataforma.has(detectada)
            ? detectada
            : null;

    const irParaNotas = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        navigate(ROUTES.RELEASE_NOTES);
    };

    return (
        <>
            <a href="#main-content" className="skip-link">
                {lang === "pt"
                    ? "Ir para o conteúdo principal"
                    : "Skip to main content"}
            </a>

            <Header />

            <main id="main-content" className="dl">
                <div className="container">
                    <header className="dl__cabecalho">
                        <h1 className="dl__titulo">{t("downloads.title")}</h1>
                        <p className="dl__lead">{t("downloads.lead")}</p>

                        {dados.versao && (
                            <p className="dl__versao">
                                <IconGitBranch
                                    width={13}
                                    height={13}
                                    aria-hidden="true"
                                />
                                <span>
                                    {t("downloads.version")} {dados.versao}
                                </span>
                                <a
                                    href={ROUTES.RELEASE_NOTES}
                                    className="dl__notas"
                                    onClick={irParaNotas}
                                >
                                    {t("downloads.notes")}
                                </a>
                            </p>
                        )}
                    </header>

                    {/* Carregando não mostra esqueleto: a lista é curta e a
                        resposta vem do CDN. Piscar caixas cinzas por 200ms
                        agita mais do que informa. */}
                    {status === "error" && (
                        <p className="dl__aviso" role="status">
                            {t("downloads.error")}
                        </p>
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
                        </div>
                    )}

                    {temArquivos && (
                        <>
                            {promovida && (
                                <h2 className="dl__secao">
                                    {t("downloads.forYou")}
                                </h2>
                            )}

                            <div className="dl__grade">
                                {ordenadas.map((p) => (
                                    <Cartao
                                        key={p}
                                        plataforma={p}
                                        arquivos={porPlataforma.get(p) ?? []}
                                        destaque={p === promovida}
                                        lang={lang}
                                        rotuloBaixar={t("downloads.get")}
                                    />
                                ))}
                            </div>

                            {/* Não é rodapé legal: é o que a pessoa precisa
                                saber ANTES de clicar, para o aviso do sistema
                                não parecer que o arquivo é malicioso. */}
                            <p className="dl__nota">
                                {t("downloads.unsigned")}
                            </p>
                        </>
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
                            href={`${GITHUB_URL}/releases`}
                            target="_blank"
                            rel="noopener noreferrer"
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
