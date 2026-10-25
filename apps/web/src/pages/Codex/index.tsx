import { lazy, Suspense, useState } from "react";
import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { FEATURED_PROJECT as project } from "@/widgets/Featured/Featured.data";
import { useLang } from "@/shared/hooks/useLang";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { ROUTES } from "@/shared/config/routes";
import {
    IconArrowLeft,
    IconExternalLink,
    IconArrowRight,
    IconSearch,
} from "@/shared/ui/Icons";
import "./Codex.css";

const Gallery = lazy(() =>
    import("@/widgets/Featured/components/FeaturedLightbox").then((m) => ({
        default: m.FeaturedLightbox,
    })),
);

export function CodexPage() {
    const { lang } = useLang();
    useReducedMotion();
    const [image, setImage] = useState<number | null>(null);
    const tr = (pt: string, en: string) => (lang === "pt" ? pt : en);
    const sections = [
        ["proposta", tr("Proposta", "Purpose")],
        ["funcionalidades", tr("Funcionalidades", "Features")],
        ["pipeline", tr("Como funciona", "Workflow")],
        ["interface", "Interface"],
        ["engenharia", tr("Engenharia", "Engineering")],
        ["implementacao", tr("Implementação", "Implementation")],
    ];
    useDocumentMeta({
        title: "Codex — Code Validator | Guilherme Cruz",
        description: project.description[lang],
        path: ROUTES.CODEX,
    });
    const figure = (index: number, hero = false) => {
        const slide = project.slides[index]!;
        return (
            <figure
                className={hero ? "codex__cover" : "codex__capture"}
                key={slide.src}
            >
                <button
                    type="button"
                    className="codex__image"
                    onClick={() => setImage(index)}
                    aria-label={`${tr("Ampliar", "Enlarge")}: ${slide.label[lang]}`}
                >
                    <img
                        src={slide.src}
                        alt={`${project.name} — ${slide.label[lang]}`}
                        width={1920}
                        height={1080}
                        loading={hero ? "eager" : "lazy"}
                        decoding="async"
                    />
                    <span className="codex__zoom">
                        <IconSearch width={16} height={16} aria-hidden="true" />
                        {tr("Ampliar captura", "Enlarge capture")}
                    </span>
                </button>
                <figcaption>
                    <span className="codex__number">0{index + 1}</span>
                    <div>
                        <strong>{slide.label[lang]}</strong>
                        <p>{slide.description?.[lang]}</p>
                    </div>
                </figcaption>
            </figure>
        );
    };
    return (
        <>
            <a href="#main-content" className="skip-link">
                {tr("Ir para o conteúdo principal", "Skip to main content")}
            </a>
            <Header />
            <main id="main-content" className="codex">
                <div className="container">
                    <a
                        href={
                            lang === "en" ? "/?lang=en#destaque" : "/#destaque"
                        }
                        className="codex__back"
                    >
                        <IconArrowLeft
                            width={16}
                            height={16}
                            aria-hidden="true"
                        />
                        {tr("Voltar ao portfólio", "Back to portfolio")}
                    </a>
                    <header className="codex__hero">
                        <div>
                            <p className="section-eyebrow">
                                {tr("Projeto em destaque", "Featured project")}{" "}
                                <span aria-hidden="true">/</span> TCC
                            </p>
                            <h1>
                                Codex<span>Code Validator</span>
                            </h1>
                            <p className="codex__lead">
                                {tr(
                                    "Qualidade de código medida, explicada e acompanhada.",
                                    "Code quality measured, explained and tracked.",
                                )}
                            </p>
                            <p className="codex__intro">
                                {tr(
                                    "Trabalho de Conclusão de Curso que integra análise estática e revisão por inteligência artificial para transformar evidências do código em recomendações de melhoria.",
                                    "A capstone project integrating static analysis and AI review to turn code evidence into actionable improvement recommendations.",
                                )}
                            </p>
                            <div className="codex__actions">
                                <a
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn--primary"
                                >
                                    {tr(
                                        "Explorar aplicação",
                                        "Explore application",
                                    )}
                                    <IconExternalLink
                                        width={16}
                                        height={16}
                                        aria-hidden="true"
                                    />
                                </a>
                                <a
                                    href="#proposta"
                                    className="btn btn--outline"
                                >
                                    {tr(
                                        "Conhecer o projeto",
                                        "Discover the project",
                                    )}
                                    <IconArrowRight
                                        width={16}
                                        height={16}
                                        aria-hidden="true"
                                    />
                                </a>
                            </div>
                        </div>
                        <aside
                            className="codex__summary"
                            aria-label={tr(
                                "Perfil do projeto",
                                "Project profile",
                            )}
                        >
                            <span className="codex__status">
                                {tr(
                                    "APLICAÇÃO DISPONÍVEL",
                                    "APPLICATION AVAILABLE",
                                )}
                            </span>
                            <dl>
                                <div>
                                    <dt>{tr("Contexto", "Context")}</dt>
                                    <dd>
                                        {tr(
                                            "Trabalho de Conclusão de Curso",
                                            "Academic capstone project",
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt>{tr("Área", "Field")}</dt>
                                    <dd>
                                        {tr(
                                            "Engenharia e qualidade de software",
                                            "Software engineering and quality",
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt>{tr("Abordagem", "Approach")}</dt>
                                    <dd>
                                        {tr(
                                            "Análise estática + revisão por IA",
                                            "Static analysis + AI review",
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt>{tr("Código-fonte", "Source code")}</dt>
                                    <dd>
                                        {tr(
                                            "Repositório oficial ainda não publicado",
                                            "Official repository not yet published",
                                        )}
                                    </dd>
                                </div>
                            </dl>
                        </aside>
                    </header>
                    <nav
                        className="codex__nav"
                        aria-label={tr("Nesta página", "On this page")}
                    >
                        {sections.map(([id, label], i) => (
                            <a key={id} href={`#${id}`}>
                                <span aria-hidden="true">0{i + 1}</span>
                                {label}
                            </a>
                        ))}
                    </nav>
                    {figure(0, true)}

                    <section
                        id="proposta"
                        className="codex__section codex__split"
                        aria-labelledby="purpose-title"
                    >
                        <div>
                            <span className="section-eyebrow">
                                01 / {tr("Proposta", "Purpose")}
                            </span>
                            <h2 id="purpose-title">
                                {tr(
                                    "Propósito e contexto do projeto.",
                                    "Project purpose and context.",
                                )}
                            </h2>
                        </div>
                        <div className="codex__prose">
                            <p>
                                {tr(
                                    "Linters identificam problemas pontuais. Entender a qualidade de um repositório exige relacionar esses achados com segurança, complexidade e organização do código. O Codex reúne essas perspectivas em uma avaliação estruturada.",
                                    "Linters identify individual issues. Understanding repository quality requires connecting those findings with security, complexity and code organization. Codex brings these perspectives together in a structured assessment.",
                                )}
                            </p>
                            <p>
                                {tr(
                                    "O objetivo é apoiar desenvolvedores e equipes na identificação de prioridades e no acompanhamento do débito técnico entre execuções, commits e pull requests. A nota sintetiza a avaliação; o relatório oferece o contexto para decidir o que melhorar.",
                                    "The goal is to help developers and teams identify priorities and track technical debt across runs, commits and pull requests. The score summarizes the assessment; the report provides context for deciding what to improve.",
                                )}
                            </p>
                            <div className="codex__callout">
                                <strong>
                                    {tr(
                                        "Relevância acadêmica",
                                        "Academic relevance",
                                    )}
                                </strong>
                                <p>
                                    {tr(
                                        "O projeto articula integração de APIs, autenticação, processamento assíncrono, análise de software e persistência em uma aplicação web completa.",
                                        "The project brings API integration, authentication, asynchronous processing, software analysis and persistence together in a complete web application.",
                                    )}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section
                        id="funcionalidades"
                        className="codex__section"
                        aria-labelledby="features-title"
                    >
                        <span className="section-eyebrow">
                            02 / {tr("Funcionalidades", "Features")}
                        </span>
                        <h2 id="features-title">
                            {tr(
                                "Recursos disponíveis na aplicação.",
                                "Features available in the application.",
                            )}
                        </h2>
                        <div className="codex__cards">
                            {[
                                [
                                    tr("Análise estática", "Static analysis"),
                                    tr(
                                        "Lint, segurança e complexidade com ruff, bandit e radon para Python, Biome para JavaScript/TypeScript e golangci-lint para Go.",
                                        "Lint, security and complexity with ruff, bandit and radon for Python, Biome for JavaScript/TypeScript and golangci-lint for Go.",
                                    ),
                                ],
                                [
                                    tr("Revisão por IA", "AI review"),
                                    tr(
                                        "Gemini, Claude ou OpenRouter interpretam resultados e amostras de código para produzir uma revisão qualitativa, com geração acompanhada em streaming.",
                                        "Gemini, Claude or OpenRouter interpret results and code samples to produce a qualitative review, with generation streamed in real time.",
                                    ),
                                ],
                                [
                                    tr(
                                        "Comparação de pull requests",
                                        "Pull request comparison",
                                    ),
                                    tr(
                                        "Avaliação de base e head, inclusive em forks, para apresentar a diferença de score entre as duas versões.",
                                        "Assessment of base and head, including forks, to show the score difference between both versions.",
                                    ),
                                ],
                                [
                                    tr(
                                        "Histórico por commit",
                                        "Per-commit history",
                                    ),
                                    tr(
                                        "Com PostgreSQL configurado, mantém análises por usuário, reutiliza resultados em cache e calcula a evolução em relação à revisão anterior.",
                                        "With PostgreSQL configured, stores user analyses, reuses cached results and calculates changes since the previous review.",
                                    ),
                                ],
                                [
                                    tr(
                                        "Progresso e achados",
                                        "Progress and findings",
                                    ),
                                    tr(
                                        "Etapas transmitidas via SSE, com fallback para polling. Achados podem ser filtrados por ferramenta e severidade.",
                                        "Stages streamed through SSE, with polling fallback. Findings can be filtered by tool and severity.",
                                    ),
                                ],
                                [
                                    tr(
                                        "Automação e limites",
                                        "Automation and limits",
                                    ),
                                    tr(
                                        "Webhooks permitem reanalisar pushes na branch padrão de repositórios públicos. Fila e limite de tamanho controlam a entrada de análises.",
                                        "Webhooks enable analysis of pushes to the default branch of public repositories. A queue and size limit control incoming analyses.",
                                    ),
                                ],
                            ].map(([title, text], i) => (
                                <article className="codex__card" key={title}>
                                    <span className="codex__number">
                                        0{i + 1}
                                    </span>
                                    <h3>{title}</h3>
                                    <p>{text}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section
                        id="pipeline"
                        className="codex__section"
                        aria-labelledby="pipeline-title"
                    >
                        <span className="section-eyebrow">
                            03 / {tr("Como funciona", "Workflow")}
                        </span>
                        <h2 id="pipeline-title">
                            {tr(
                                "Do repositório ao relatório.",
                                "From repository to report.",
                            )}
                        </h2>
                        <ol className="codex__steps">
                            {[
                                [
                                    tr("Conectar", "Connect"),
                                    tr(
                                        "URL pública sem login ou seleção de repositório após OAuth do GitHub.",
                                        "Public URL without sign-in, or repository selection after GitHub OAuth.",
                                    ),
                                ],
                                [
                                    tr("Preparar", "Prepare"),
                                    tr(
                                        "Fila, verificação de tamanho, clone raso e consulta ao cache por commit.",
                                        "Queue, size check, shallow clone and per-commit cache lookup.",
                                    ),
                                ],
                                [
                                    tr("Analisar", "Analyze"),
                                    tr(
                                        "Ferramentas estáticas, metadados do GitHub e revisão qualitativa por IA.",
                                        "Static tools, GitHub metadata and qualitative AI review.",
                                    ),
                                ],
                                [
                                    tr("Apresentar", "Present"),
                                    tr(
                                        "Score, achados e recomendações. Histórico e delta quando há persistência.",
                                        "Score, findings and recommendations. History and delta when persistence is available.",
                                    ),
                                ],
                            ].map(([title, text], i) => (
                                <li key={title}>
                                    <span className="codex__step-number">
                                        0{i + 1}
                                    </span>
                                    <h3>{title}</h3>
                                    <p>{text}</p>
                                </li>
                            ))}
                        </ol>
                        <div className="codex__score">
                            <div>
                                <span className="section-eyebrow">
                                    {tr(
                                        "COMPOSIÇÃO DO SCORE",
                                        "SCORE COMPOSITION",
                                    )}
                                </span>
                                <h3>
                                    {tr(
                                        "Uma escala de 0 a 1000",
                                        "A scale from 0 to 1000",
                                    )}
                                </h3>
                                <p>
                                    {tr(
                                        "A nota combina métricas determinísticas e revisão qualitativa. Com a IA desativada ou em caso de falha, o resultado usa 100% do score estático.",
                                        "The score combines deterministic metrics and qualitative review. When AI is disabled or fails, the result uses 100% of the static score.",
                                    )}
                                </p>
                            </div>
                            <div>
                                <div className="codex__weights">
                                    <span>
                                        <strong>40%</strong>
                                        {tr(
                                            "Análise estática",
                                            "Static analysis",
                                        )}
                                    </span>
                                    <span>
                                        <strong>60%</strong>
                                        {tr("Revisão por IA", "AI review")}
                                    </span>
                                </div>
                                <div
                                    className="codex__score-bar"
                                    aria-hidden="true"
                                >
                                    <span />
                                    <span />
                                </div>
                                <p className="codex__note">
                                    {tr(
                                        "Pesos do cálculo, não métricas de desempenho do projeto.",
                                        "Calculation weights, not project performance metrics.",
                                    )}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section
                        id="interface"
                        className="codex__section"
                        aria-labelledby="interface-title"
                    >
                        <span className="section-eyebrow">04 / Interface</span>
                        <h2 id="interface-title">
                            {tr(
                                "Explore o sistema em contexto.",
                                "Explore the system in context.",
                            )}
                        </h2>
                        <p className="codex__section-intro">
                            {tr(
                                "Capturas reais da página pública. Os repositórios, achados e scores apresentados nas demonstrações são dados de exemplo; não representam análises autenticadas.",
                                "Real captures of the public page. Repositories, findings and scores shown in the demos are sample data; they do not represent authenticated analyses.",
                            )}
                        </p>
                        <div className="codex__gallery">
                            {[1, 2, 3].map((i) => figure(i))}
                        </div>
                    </section>

                    <section
                        id="engenharia"
                        className="codex__section"
                        aria-labelledby="engineering-title"
                    >
                        <span className="section-eyebrow">
                            05 / {tr("Engenharia", "Engineering")}
                        </span>
                        <h2 id="engineering-title">
                            {tr(
                                "Arquitetura e integrações.",
                                "Architecture and integrations.",
                            )}
                        </h2>
                        <p className="codex__section-intro">
                            {tr(
                                "A interface envia solicitações à API e acompanha os resultados. O backend concentra o processamento e as conexões com GitHub, provedores de IA e banco de dados.",
                                "The interface sends requests to the API and tracks results. The backend centralizes processing and connections to GitHub, AI providers and the database.",
                            )}
                        </p>
                        <ol
                            className="codex__architecture"
                            aria-label={tr(
                                "Camadas da arquitetura",
                                "Architecture layers",
                            )}
                        >
                            {[
                                [
                                    "Frontend",
                                    "Next.js 15 · React 19 · TypeScript",
                                    tr(
                                        "Tailwind CSS e ícones lucide-react. Páginas para selecionar repositórios, acompanhar jobs e consultar relatórios.",
                                        "Tailwind CSS and lucide-react icons. Pages for repository selection, job tracking and report browsing.",
                                    ),
                                ],
                                [
                                    "Backend",
                                    "Python · FastAPI · Uvicorn",
                                    tr(
                                        "Orquestra autenticação, fila, ferramentas de análise e integração com os provedores de IA.",
                                        "Orchestrates authentication, queuing, analysis tools and AI provider integration.",
                                    ),
                                ],
                                [
                                    tr(
                                        "Integrações e persistência",
                                        "Integrations and persistence",
                                    ),
                                    "GitHub API · LLM · PostgreSQL",
                                    tr(
                                        "GitHub para autenticação e metadados. IA opcional para revisão; PostgreSQL opcional para histórico e cache.",
                                        "GitHub for authentication and metadata. Optional AI review; optional PostgreSQL for history and cache.",
                                    ),
                                ],
                            ].map(([title, stack, text], i) => (
                                <li className="codex__card" key={title}>
                                    <span
                                        className="codex__number"
                                        aria-hidden="true"
                                    >
                                        0{i + 1}
                                    </span>
                                    <h3>{title}</h3>
                                    <p className="codex__stack">{stack}</p>
                                    <p>{text}</p>
                                </li>
                            ))}
                        </ol>
                        <div className="codex__engineering">
                            <div>
                                <h3>
                                    {tr(
                                        "Decisões de implementação",
                                        "Implementation decisions",
                                    )}
                                </h3>
                                <ul className="codex__list">
                                    <li>
                                        {tr(
                                            "Tokens do GitHub ficam no servidor; o navegador recebe um cookie de sessão HttpOnly.",
                                            "GitHub tokens stay on the server; the browser receives an HttpOnly session cookie.",
                                        )}
                                    </li>
                                    <li>
                                        {tr(
                                            "Clones temporários são removidos ao final do processamento.",
                                            "Temporary clones are removed after processing.",
                                        )}
                                    </li>
                                    <li>
                                        {tr(
                                            "Webhooks usam HMAC-SHA256. A execução tem limites configuráveis de concorrência e tamanho de repositório.",
                                            "Webhooks use HMAC-SHA256. Execution has configurable concurrency and repository size limits.",
                                        )}
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3>
                                    {tr(
                                        "Limites atuais",
                                        "Current limitations",
                                    )}
                                </h3>
                                <ul className="codex__list">
                                    <li>
                                        {tr(
                                            "Fila, sessões e jobs em memória limitam a execução a uma instância; reinícios interrompem sessões e jobs.",
                                            "In-memory queue, sessions and jobs limit execution to one instance; restarts interrupt sessions and jobs.",
                                        )}
                                    </li>
                                    <li>
                                        {tr(
                                            "Sem PostgreSQL, histórico, delta e cache não são persistidos.",
                                            "Without PostgreSQL, history, delta and cache are not persisted.",
                                        )}
                                    </li>
                                    <li>
                                        {tr(
                                            "Ferramentas ausentes são sinalizadas como indisponíveis. Provedores de IA têm limites próprios de uso.",
                                            "Missing tools are reported as unavailable. AI providers have their own usage limits.",
                                        )}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section
                        id="implementacao"
                        className="codex__section"
                        aria-labelledby="implementation-title"
                    >
                        <span className="section-eyebrow">
                            06 / {tr("Implementação", "Implementation")}
                        </span>
                        <h2 id="implementation-title">
                            {tr(
                                "Do pedido ao relatório: responsabilidades claras.",
                                "From request to report: clear responsibilities.",
                            )}
                        </h2>
                        <p className="codex__section-intro">
                            {tr(
                                "A interface em Next.js consome a API FastAPI. O backend coordena os jobs, executa ferramentas locais e consulta serviços externos; PostgreSQL armazena resultados quando configurado.",
                                "The Next.js interface consumes the FastAPI API. The backend coordinates jobs, runs local tools and calls external services; PostgreSQL stores results when configured.",
                            )}
                        </p>
                        <div className="codex__cards">
                            {[
                                [
                                    "backend/main.py",
                                    tr("Orquestração", "Orchestration"),
                                    tr(
                                        "Rotas HTTP, sessão OAuth, fila FIFO com asyncio.Semaphore, SSE e pipeline compartilhado entre análise avulsa, comparação de PRs e webhook.",
                                        "HTTP routes, OAuth session, FIFO queue with asyncio.Semaphore, SSE and a pipeline shared by individual analysis, PR comparison and webhooks.",
                                    ),
                                ],
                                [
                                    "analyzer.py · linters.py",
                                    tr("Motor estático", "Static engine"),
                                    tr(
                                        "Inventário de arquivos, sinais de testes e documentação, ferramentas em paralelo e achados normalizados. O registry seleciona os linters pelas linguagens detectadas.",
                                        "File inventory, test and documentation signals, parallel tools and normalized findings. The registry selects linters by detected languages.",
                                    ),
                                ],
                                [
                                    "reviewers/",
                                    tr("Revisão opcional", "Optional review"),
                                    tr(
                                        "Dispatcher por LLM_PROVIDER para Gemini, Claude ou OpenRouter. Os providers recebem resultados estáticos e amostras, normalizam a resposta e informam o progresso da geração.",
                                        "LLM_PROVIDER dispatches to Gemini, Claude or OpenRouter. Providers receive static results and samples, normalize the response and report generation progress.",
                                    ),
                                ],
                                [
                                    "github_meta.py · db.py",
                                    tr(
                                        "Integração e dados",
                                        "Integration and data",
                                    ),
                                    tr(
                                        "GitHub REST API fornece commits, contribuidores e linguagens. O banco guarda o relatório, o commit, a origem e o usuário quando identificado; o cache é consultado por repositório e hash.",
                                        "GitHub REST API supplies commits, contributors and languages. The database stores the report, commit, origin and user when identified; cache lookup uses repository and hash.",
                                    ),
                                ],
                                [
                                    "frontend/app/ · components/",
                                    tr(
                                        "Experiência de consulta",
                                        "Results interface",
                                    ),
                                    tr(
                                        "Páginas de apresentação, dashboard, análise e comparação. Componentes exibem score, indicadores e achados filtráveis; lib/api.ts concentra chamadas e acompanhamento de jobs.",
                                        "Presentation, dashboard, analysis and comparison pages. Components display scores, indicators and filterable findings; lib/api.ts centralizes requests and job tracking.",
                                    ),
                                ],
                                [
                                    "config.py · docker-compose.yml",
                                    tr(
                                        "Configuração e execução",
                                        "Configuration and execution",
                                    ),
                                    tr(
                                        "Variáveis de ambiente selecionam provider, URLs, OAuth, persistência e limites. Docker Compose define frontend, backend e banco; DATABASE_URL e segredo do webhook habilitam suas integrações.",
                                        "Environment variables select provider, URLs, OAuth, persistence and limits. Docker Compose defines frontend, backend and database; DATABASE_URL and the webhook secret enable their integrations.",
                                    ),
                                ],
                            ].map(([file, title, text]) => (
                                <article className="codex__card" key={file}>
                                    <h3>{title}</h3>
                                    <code className="codex__module">
                                        {file}
                                    </code>
                                    <p>{text}</p>
                                </article>
                            ))}
                        </div>
                        <div className="codex__engineering">
                            <div>
                                <h3>
                                    {tr(
                                        "Entradas e acompanhamento",
                                        "Inputs and tracking",
                                    )}
                                </h3>
                                <ul className="codex__list">
                                    <li>
                                        <code>POST /api/analyze-public</code> —{" "}
                                        {tr(
                                            "recebe uma URL pública do GitHub, sem login, e devolve job_id.",
                                            "accepts a public GitHub URL without sign-in and returns job_id.",
                                        )}
                                    </li>
                                    <li>
                                        <code>GET /api/repos</code> ·{" "}
                                        <code>POST /api/analyze</code> —{" "}
                                        {tr(
                                            "listagem e análise autenticadas pela sessão OAuth do GitHub.",
                                            "listing and analysis authenticated by the GitHub OAuth session.",
                                        )}
                                    </li>
                                    <li>
                                        <code>
                                            GET
                                            /api/analyze/&#123;job_id&#125;/stream
                                        </code>{" "}
                                        —{" "}
                                        {tr(
                                            "envia etapas por SSE; o cliente recorre ao endpoint de status por polling se necessário.",
                                            "sends stages through SSE; the client falls back to polling the status endpoint when needed.",
                                        )}
                                    </li>
                                    <li>
                                        <code>POST /api/analyze-pr</code> —{" "}
                                        {tr(
                                            "executa base e head e calcula head − base, inclusive para PRs de forks.",
                                            "runs base and head and calculates head − base, including fork PRs.",
                                        )}
                                    </li>
                                    <li>
                                        <code>GET /api/history</code> ·{" "}
                                        <code>GET /api/my/analyses</code> —{" "}
                                        {tr(
                                            "consultas por repositório e por usuário autenticado, respectivamente.",
                                            "queries by repository and by authenticated user, respectively.",
                                        )}
                                    </li>
                                    <li>
                                        <code>POST /api/webhooks/github</code> —{" "}
                                        {tr(
                                            "valida a assinatura HMAC-SHA256 e processa pushes na branch padrão de repositórios públicos.",
                                            "validates the HMAC-SHA256 signature and processes pushes to the default branch of public repositories.",
                                        )}
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3>
                                    {tr(
                                        "Processamento e interpretação",
                                        "Processing and interpretation",
                                    )}
                                </h3>
                                <ul className="codex__list">
                                    <li>
                                        {tr(
                                            "Após o clone raso, o hash identifica um resultado reutilizável. Sem cache, asyncio.gather executa a análise estática em uma thread enquanto busca os metadados do GitHub.",
                                            "After the shallow clone, the hash identifies a reusable result. Without cache, asyncio.gather runs static analysis in a thread while fetching GitHub metadata.",
                                        )}
                                    </li>
                                    <li>
                                        {tr(
                                            "O score estático parte de 1000 e aplica penalidades por segurança, sinais de qualidade, densidade de lint por mil linhas e complexidade. Não equivale a uma certificação de qualidade.",
                                            "The static score starts at 1000 and applies penalties for security, quality signals, lint density per thousand lines and complexity. It is not a quality certification.",
                                        )}
                                    </li>
                                    <li>
                                        {tr(
                                            "A revisão por IA é opcional. LLM_PROVIDER=none mantém o processamento determinístico; erros do provider também preservam o resultado estático.",
                                            "AI review is optional. LLM_PROVIDER=none keeps processing deterministic; provider errors also preserve the static result.",
                                        )}
                                    </li>
                                    <li>
                                        {tr(
                                            "Amostras de código e caminhos internos são retirados antes de salvar o relatório. O diretório temporário é removido no bloco finally, inclusive quando ocorre erro.",
                                            "Code samples and internal paths are removed before saving the report. The temporary directory is removed in the finally block, including when an error occurs.",
                                        )}
                                    </li>
                                    <li>
                                        {tr(
                                            "O pré-check de tamanho depende da API do GitHub e é best-effort. O cache usa repositório e commit, sem separar resultados por provider; a comparação deve considerar o modo de análise registrado.",
                                            "The size pre-check depends on GitHub API and is best-effort. Cache keys use repository and commit without separating results by provider; comparisons must consider the recorded analysis mode.",
                                        )}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
            {image !== null && (
                <Suspense fallback={null}>
                    <Gallery
                        slides={project.slides}
                        initialIndex={image}
                        projectName={project.name}
                        liveUrl={project.liveUrl}
                        onClose={() => setImage(null)}
                    />
                </Suspense>
            )}
        </>
    );
}
