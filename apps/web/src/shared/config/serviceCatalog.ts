import type { Localized } from "../lib/localized.ts";
export type CategoryId =
    "web" | "support" | "data" | "automation" | "business" | "training";
export type Billing = "from" | "hour" | "month" | "quote";
export interface ServiceCategory {
    id: CategoryId;
    name: Localized;
    description: Localized;
    examples: Localized<string[]>;
    limit: Localized;
}
export interface CommercialOffer {
    id: string;
    kind: "plan" | "service" | "package";
    name: Localized;
    description: Localized;
    category: CategoryId;
    price?: number;
    billing: Billing;
    unit: Localized;
    scope: Localized<string[]>;
    exclusions: Localized<string[]>;
    cta: Localized;
    addonIds: string[];
    included: string[];
}
export interface Addon {
    id: string;
    name: Localized;
    price: number;
    billing: "from" | "month";
    group: "web" | "technical";
}
export interface ReferralRules {
    credits: { minimum: number; maximum: number | null; credit: number }[];
    commission: { minimum: number; maximum: number };
}
const l = <T>(pt: T, en: T): Localized<T> => ({ pt, en });
const list = (pt: string, en: string) => l(pt.split("|"), en.split("|"));
export const COMMERCIAL_CONFIG = {
    currency: "BRL",
    locale: "pt-BR",
    depositPercent: 50,
    balancePercent: 50,
    maxHours: 40,
};
export const CATEGORIES: ServiceCategory[] = [
    {
        id: "web",
        name: l("Desenvolvimento Web e Software", "Web & Software Development"),
        description: l(
            "Da presença digital a funcionalidades sob medida para o seu negócio.",
            "From an online presence to features tailored to your business.",
        ),
        examples: list(
            "Landing pages e sites institucionais|Modernização, páginas e formulários|Correções e melhorias frontend|Aplicações simples, APIs e funcionalidades sob avaliação",
            "Landing pages and business websites|Modernization, pages and forms|Frontend fixes and improvements|Simple applications, APIs and features subject to assessment",
        ),
        limit: l(
            "React, TypeScript, JavaScript, HTML, CSS, Python, Node.js e SQL, conforme o projeto.",
            "React, TypeScript, JavaScript, HTML, CSS, Python, Node.js and SQL, according to the project.",
        ),
    },
    {
        id: "support",
        name: l("Consultoria e Suporte Técnico", "IT Consulting & Support"),
        description: l(
            "Diagnóstico remoto, resolução de problemas e orientação no uso de ferramentas.",
            "Remote diagnosis, troubleshooting and guidance on using digital tools.",
        ),
        examples: list(
            "Diagnóstico e suporte remoto avulso|Configuração de e-mail profissional|Ferramentas e ambientes digitais|Análise de erros de sistemas",
            "One-off remote diagnosis and support|Business email setup|Digital tools and environments|System error analysis",
        ),
        limit: l(
            "Atendimento agendado, com escopo definido. Sem plantão ou disponibilidade contínua.",
            "Scheduled work with an agreed scope. No emergency or continuous availability.",
        ),
    },
    {
        id: "data",
        name: l("Dados, SQL e Relatórios", "Data, SQL & Reporting"),
        description: l(
            "Organização e processamento de informações para apoiar atividades operacionais.",
            "Organizing and processing information to support daily operations.",
        ),
        examples: list(
            "Consultas SQL e relatórios|Tratamento de CSV e JSON|Exportação e organização de dados|Ajustes simples em consultas e rotinas",
            "SQL queries and reports|CSV and JSON processing|Data exports and organization|Simple query and data routine adjustments",
        ),
        limit: l(
            "Bancos de produção exigem autorização expressa, backup e avaliação de risco antes de qualquer operação.",
            "Production databases require explicit authorization, a backup and risk assessment before any operation.",
        ),
    },
    {
        id: "automation",
        name: l("Automação e Integrações", "Automation & Integrations"),
        description: l(
            "Scripts e integrações para reduzir tarefas manuais com escopo e limites claros.",
            "Scripts and integrations to reduce manual work within clear boundaries.",
        ),
        examples: list(
            "Scripts Python e JavaScript|Processamento de arquivos|Geração de relatórios|Integrações simples com APIs REST documentadas",
            "Python and JavaScript scripts|File processing|Report generation|Simple integrations with documented REST APIs",
        ),
        limit: l(
            "Viabilidade depende de documentação e acesso autorizado. Não inclui monitoramento permanente.",
            "Feasibility depends on documentation and authorized access. Continuous monitoring is not included.",
        ),
    },
    {
        id: "business",
        name: l("Sistemas Empresariais", "Business Systems Consulting"),
        description: l(
            "Apoio técnico em sistemas administrativos, financeiros e de faturamento.",
            "Technical guidance for administrative, finance and billing systems.",
        ),
        examples: list(
            "Diagnóstico funcional e análise de erros|Organização de processos financeiros|Análise técnica de arquivos CNAB|Orientação operacional sobre faturamento",
            "Functional diagnosis and error analysis|Organization of financial processes|Technical analysis of CNAB files|Operational billing guidance",
        ),
        limit: l(
            "Atuação técnica, sem serviços contábeis, jurídicos, apuração tributária ou parecer fiscal. Sem homologação oficial ou suporte a software proprietário sem autorização.",
            "Technical work only: no accounting, legal advice, tax calculation or tax opinions. No official certification or proprietary software support without authorization.",
        ),
    },
    {
        id: "training",
        name: l("Treinamentos e Documentação", "Training & Documentation"),
        description: l(
            "Conhecimento organizado para facilitar o uso de ferramentas e processos.",
            "Organized knowledge to make tools and procedures easier to use.",
        ),
        examples: list(
            "Treinamento remoto individual ou de pequenas equipes|Manuais e guias técnicos|Procedimentos operacionais|Documentação de fluxos e rotinas",
            "Remote individual or small-team training|User manuals and technical guides|Operating procedures|Workflow and routine documentation",
        ),
        limit: l(
            "Conteúdo adaptado às necessidades acordadas, sem divulgar informações confidenciais de terceiros.",
            "Content tailored to agreed needs, without disclosing third-party confidential information.",
        ),
    },
];
const WEB_ADDONS = [
    "page",
    "section",
    "advanced-form",
    "dns",
    "analytics",
    "revision",
    "maintenance",
];
const offer = (
    id: string,
    kind: CommercialOffer["kind"],
    category: CategoryId,
    pt: string,
    en: string,
    price: number | undefined,
    billing: Billing,
    scopePt: string,
    scopeEn: string,
    addonIds: string[] = [],
    included: string[] = [],
    unitPt = "",
    unitEn = "",
): CommercialOffer => ({
    id,
    kind,
    category,
    name: l(pt, en),
    description: l(scopePt.split("|")[0], scopeEn.split("|")[0]),
    price,
    billing,
    scope: list(scopePt, scopeEn),
    exclusions: list(
        "Licenças e despesas de terceiros não incluídas|Atividades fora do escopo precisam de nova proposta",
        "Licenses and third-party costs excluded|Out-of-scope work requires a separate proposal",
    ),
    cta: l("Solicitar proposta", "Request proposal"),
    addonIds,
    included,
    unit: l(unitPt, unitEn),
});
export const WEB_PLANS: CommercialOffer[] = [
    offer(
        "express",
        "plan",
        "web",
        "Express",
        "Express",
        990,
        "from",
        "Uma landing page com até quatro seções|Design responsivo e informações essenciais|Botão de contato e SEO técnico básico|Uma rodada de revisão",
        "One landing page with up to four sections|Responsive design and essential information|Contact button and basic technical SEO|One revision round",
        WEB_ADDONS,
        ["responsive", "basic-seo", "contact-button"],
    ),
    offer(
        "professional",
        "plan",
        "web",
        "Profissional",
        "Professional",
        1500,
        "from",
        "Uma página com até seis seções|Design responsivo e apresentação de serviços|Galeria ou seção de portfólio|Formulário padrão e SEO técnico básico|Duas rodadas de revisão",
        "One page with up to six sections|Responsive design and service presentation|Gallery or portfolio section|Standard form and basic technical SEO|Two revision rounds",
        WEB_ADDONS,
        ["responsive", "basic-seo", "standard-form", "gallery"],
    ),
    offer(
        "premium",
        "plan",
        "web",
        "Premium",
        "Premium",
        2200,
        "from",
        "Até três páginas simples ou landing page elaborada|Estrutura ampliada e componentes personalizados|Formulários e recursos dentro do escopo aprovado|Responsividade e SEO técnico básico|Revisões definidas em contrato; escopo precisa de confirmação",
        "Up to three simple pages or an elaborate landing page|Expanded content and custom components|Forms and features within the approved scope|Responsive layout and basic technical SEO|Contract-defined revisions; scope confirmation required",
        ["dns", "analytics", "maintenance"],
        [
            "responsive",
            "basic-seo",
            "advanced-form",
            "page",
            "section",
            "revision",
        ],
    ),
];
export const TECH_SERVICES: CommercialOffer[] = [
    offer(
        "diagnosis",
        "service",
        "support",
        "Diagnóstico técnico remoto",
        "Remote technical diagnosis",
        149,
        "from",
        "Investigação de um problema e orientação técnica",
        "Investigation of a problem and technical guidance",
        ["support-hour", "documentation"],
        [],
        "até uma hora",
        "up to one hour",
    ),
    offer(
        "consulting",
        "service",
        "support",
        "Consultoria tecnológica",
        "Technology consulting",
        249,
        "from",
        "Avaliação de necessidades e orientação sobre ferramentas",
        "Needs assessment and guidance on tools",
        ["support-hour", "documentation"],
        [],
        "até 1h30",
        "up to 1.5 hours",
    ),
    offer(
        "support",
        "service",
        "support",
        "Suporte técnico remoto",
        "Remote technical support",
        120,
        "hour",
        "Atendimento remoto agendado para um escopo acordado",
        "Scheduled remote support for an agreed scope",
        ["documentation"],
    ),
    offer(
        "email",
        "service",
        "support",
        "Configuração de e-mail profissional",
        "Business email setup",
        250,
        "from",
        "Configuração conforme provedor e acessos autorizados",
        "Setup according to the provider and authorized access",
        ["email-account", "documentation"],
    ),
    offer(
        "sql",
        "service",
        "data",
        "Consulta ou relatório SQL",
        "SQL query or report",
        350,
        "from",
        "Consulta ou relatório de escopo definido; acesso autorizado",
        "A scoped query or report with authorized access",
        ["documentation"],
    ),
    offer(
        "files",
        "service",
        "data",
        "Tratamento de arquivos e dados",
        "File and data processing",
        250,
        "from",
        "Organização e tratamento de arquivos CSV ou JSON",
        "Organization and processing of CSV or JSON files",
        ["documentation"],
    ),
    offer(
        "script",
        "service",
        "automation",
        "Script de automação simples",
        "Simple automation script",
        450,
        "from",
        "Uma tarefa delimitada em Python ou JavaScript",
        "One bounded task in Python or JavaScript",
        ["documentation"],
    ),
    offer(
        "api",
        "service",
        "automation",
        "Integração simples com API",
        "Simple API integration",
        650,
        "from",
        "Integração sujeita a API documentada e acesso autorizado",
        "Integration subject to documented API and authorized access",
        ["documentation"],
    ),
    offer(
        "functional",
        "service",
        "business",
        "Diagnóstico funcional",
        "Functional diagnosis",
        249,
        "from",
        "Análise técnica de comportamento e mensagens de erro",
        "Technical analysis of behavior and error messages",
        ["documentation"],
        [],
        "até 1h30",
        "up to 1.5 hours",
    ),
    offer(
        "process-consulting",
        "service",
        "business",
        "Consultoria técnica de processos",
        "Technical process consulting",
        350,
        "from",
        "Orientação operacional sobre um processo acordado",
        "Operational guidance on an agreed process",
        ["documentation"],
    ),
    offer(
        "cnab",
        "service",
        "business",
        "Análise técnica de arquivos CNAB",
        "Technical CNAB file analysis",
        450,
        "from",
        "Análise de estrutura e inconsistências; sem homologação oficial",
        "Structure and inconsistency analysis; no official certification",
        ["documentation"],
    ),
    offer(
        "training",
        "service",
        "training",
        "Treinamento remoto individual",
        "Individual remote training",
        150,
        "hour",
        "Capacitação sobre uma ferramenta ou rotina acordada",
        "Training on an agreed tool or routine",
        ["documentation"],
    ),
    offer(
        "team-training",
        "service",
        "training",
        "Treinamento de equipe pequena",
        "Small-team training",
        350,
        "from",
        "Conteúdo e tamanho da equipe definidos na proposta",
        "Content and team size defined in the proposal",
        ["training-hour", "documentation"],
        [],
        "até duas horas",
        "up to two hours",
    ),
    offer(
        "documentation",
        "service",
        "training",
        "Documentação operacional",
        "Operational documentation",
        250,
        "from",
        "Manual ou procedimento com escopo definido",
        "A manual or procedure with a defined scope",
        [],
        ["documentation"],
    ),
];
export const BUSINESS_PACKAGES: CommercialOffer[] = [
    offer(
        "digital-presence",
        "package",
        "web",
        "Presença Digital",
        "Digital Presence",
        WEB_PLANS[1].price,
        "from",
        "Site profissional com até seis seções|Formulário de contato|Publicação básica",
        "Professional website with up to six sections|Contact form|Basic publication",
        WEB_ADDONS,
        ["standard-form", "basic-seo"],
    ),
    offer(
        "business-diagnosis",
        "package",
        "support",
        "Diagnóstico Empresarial de TI",
        "Business IT Diagnosis",
        349,
        "from",
        "Reunião de diagnóstico|Análise de até dois problemas técnicos|Recomendações priorizadas|Relatório resumido",
        "Diagnostic meeting|Analysis of up to two technical issues|Prioritized recommendations|Brief report",
        ["support-hour"],
        ["documentation"],
    ),
    offer(
        "productivity",
        "package",
        "automation",
        "Processos e Produtividade",
        "Processes & Productivity",
        790,
        "from",
        "Análise de um processo manual|Proposta de melhoria|Implementação simples com script ou tratamento de dados|Instruções de utilização",
        "Analysis of one manual process|Improvement proposal|Simple script or data processing implementation|Usage instructions",
        [],
        ["documentation"],
    ),
    offer(
        "operational-training",
        "package",
        "training",
        "Treinamento Operacional",
        "Operational Training",
        490,
        "from",
        "Levantamento das dificuldades|Treinamento remoto de até duas horas|Guia resumido de utilização",
        "Assessment of difficulties|Up to two hours of remote training|Brief usage guide",
        ["training-hour"],
        ["documentation"],
    ),
];
export const CUSTOM_SERVICES: CommercialOffer[] = [
    offer(
        "bespoke-website",
        "service",
        "web",
        "Criação de Sites Personalizados",
        "Custom Website Development",
        undefined,
        "quote",
        "Site personalizado: necessidades, referências e viabilidade avaliadas por e-mail; escopo, prazo e investimento definidos na proposta",
        "Custom website: requirements, references and feasibility assessed by email; scope, timeline and investment defined in the proposal",
        [],
        [],
    ),
    offer(
        "custom-it",
        "service",
        "support",
        "Serviço Personalizado de TI",
        "Custom IT Service",
        undefined,
        "quote",
        "Demanda técnica fora do catálogo, sujeita a análise de viabilidade e negociação individual por e-mail",
        "Technical request outside the catalog, subject to feasibility assessment and individual discussion by email",
        [],
        [],
    ),
    offer(
        "custom-web",
        "service",
        "web",
        "Modernização ou software sob medida",
        "Modernization or custom software",
        undefined,
        "quote",
        "Modernização, correções frontend, aplicações simples, APIs ou funcionalidades sob avaliação",
        "Modernization, frontend fixes, simple apps, APIs or features subject to assessment",
        [],
        [],
    ),
];
export const OFFERS = [
    ...WEB_PLANS,
    ...TECH_SERVICES,
    ...BUSINESS_PACKAGES,
    ...CUSTOM_SERVICES,
];
export const ADDONS: Addon[] = [
    {
        id: "page",
        name: l("Página simples adicional", "Additional simple page"),
        price: 350,
        billing: "from",
        group: "web",
    },
    {
        id: "section",
        name: l("Seção adicional", "Additional section"),
        price: 150,
        billing: "from",
        group: "web",
    },
    {
        id: "advanced-form",
        name: l("Formulário avançado", "Advanced form"),
        price: 250,
        billing: "from",
        group: "web",
    },
    {
        id: "dns",
        name: l("Configuração de domínio e DNS", "Domain and DNS setup"),
        price: 150,
        billing: "from",
        group: "web",
    },
    {
        id: "analytics",
        name: l("Analytics e eventos básicos", "Analytics and basic events"),
        price: 250,
        billing: "from",
        group: "web",
    },
    {
        id: "revision",
        name: l("Revisão adicional", "Additional revision"),
        price: 150,
        billing: "from",
        group: "web",
    },
    {
        id: "maintenance",
        name: l("Manutenção web programada", "Scheduled web maintenance"),
        price: 149,
        billing: "month",
        group: "web",
    },
    {
        id: "support-hour",
        name: l("Hora adicional de suporte", "Additional support hour"),
        price: TECH_SERVICES.find((o) => o.id === "support")!.price!,
        billing: "from",
        group: "technical",
    },
    {
        id: "training-hour",
        name: l("Hora adicional de treinamento", "Additional training hour"),
        price: TECH_SERVICES.find((o) => o.id === "training")!.price!,
        billing: "from",
        group: "technical",
    },
    {
        id: "documentation",
        name: l("Documentação complementar", "Additional documentation"),
        price: 200,
        billing: "from",
        group: "technical",
    },
    {
        id: "email-account",
        name: l(
            "Configuração adicional de conta de e-mail",
            "Additional email account setup",
        ),
        price: 100,
        billing: "from",
        group: "technical",
    },
];
export const REFERRALS: ReferralRules = {
    credits: [
        { minimum: 150, maximum: 499, credit: 30 },
        { minimum: 500, maximum: 999, credit: 75 },
        { minimum: 1000, maximum: null, credit: 150 },
    ],
    commission: { minimum: 10, maximum: 15 },
};
export function referralCredit(value: number) {
    return (
        REFERRALS.credits.find(
            (r) =>
                value >= r.minimum &&
                (r.maximum === null || value < r.maximum + 1),
        )?.credit ?? 0
    );
}
export type Interest = "quote" | "referral" | "partner";
export interface Selection {
    offerId: string;
    addonIds: string[];
    hours: number;
}
export const EMPTY_SELECTION: Selection = {
    offerId: "",
    addonIds: [],
    hours: 1,
};
export function compatibleAddons(offerId: string) {
    const offer = OFFERS.find((o) => o.id === offerId);
    return ADDONS.filter(
        (a) => offer?.addonIds.includes(a.id) && !offer.included.includes(a.id),
    );
}
export function estimate(selection: Selection) {
    const offer = OFFERS.find((o) => o.id === selection.offerId);
    const allowed = compatibleAddons(selection.offerId);
    const addons = allowed.filter((a) => selection.addonIds.includes(a.id));
    const hours = Number.isFinite(selection.hours)
        ? Math.min(
              COMMERCIAL_CONFIG.maxHours,
              Math.max(1, Math.floor(selection.hours)),
          )
        : 1;
    const subtotal =
        offer?.price === undefined
            ? null
            : Math.max(0, offer.price) *
                  (offer.billing === "hour" ? hours : 1) +
              addons
                  .filter((a) => a.billing !== "month")
                  .reduce((n, a) => n + Math.max(0, a.price), 0);
    return {
        offer,
        addons,
        hours,
        subtotal,
        monthly: addons
            .filter((a) => a.billing === "month")
            .reduce((n, a) => n + Math.max(0, a.price), 0),
    };
}
export const money = (value: number) =>
    new Intl.NumberFormat(COMMERCIAL_CONFIG.locale, {
        style: "currency",
        currency: COMMERCIAL_CONFIG.currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    }).format(value);
