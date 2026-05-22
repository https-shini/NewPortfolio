import type { TimelineRawData, CareerCompany, CareerBullet } from "./Timeline.types";

/* ─────────────────────────────────────────────────────────
   WISE_SYSTEM_BULLETS — atividades operacionais bilíngues
   compartilhadas entre as duas posições na Wise System.
   Itens com `highlight: true` aparecem na seção "Destaques".
───────────────────────────────────────────────────────── */
const WISE_SYSTEM_BULLETS: CareerBullet[] = [
    {
        text: {
            pt: "Suporte técnico e funcional a clientes via telefone, chat, e-mail e acesso remoto, orientando sobre uso do ERP e boas práticas operacionais",
            en: "Technical and functional customer support via phone, chat, email and remote access, guiding ERP usage and operational best practices",
        },
        highlight: true,
    },
    {
        text: {
            pt: "Atuação focada nos módulos Financeiro e Faturamento",
            en: "Focused on the Finance and Billing modules",
        },
        highlight: true,
    },
    {
        text: {
            pt: "Acompanhamento de rotinas de Contas a Pagar e Contas a Receber (lançamentos, baixas, cobranças e conciliações)",
            en: "Monitoring Accounts Payable and Accounts Receivable routines (entries, settlements, collections and reconciliations)",
        },
    },
    {
        text: {
            pt: "Análise e resolução de inconsistências em arquivos bancários CNAB (remessa e retorno) e integrações com instituições financeiras",
            en: "Analysis and resolution of inconsistencies in CNAB bank files (outbound and return) and integrations with financial institutions",
        },
        highlight: true,
    },
    {
        text: {
            pt: "Tratativa de divergências de conciliação bancária e problemas relacionados a títulos financeiros",
            en: "Handling bank reconciliation discrepancies and issues related to financial titles",
        },
    },
    {
        text: {
            pt: "Suporte em faturamento e documentos fiscais: emissão, rejeições e homologação de notas fiscais",
            en: "Support for billing and tax documents: issuance, rejections and approval of invoices",
        },
    },
    {
        text: {
            pt: "Investigação e correção de erros tributários e validação de regras de negócio no sistema",
            en: "Investigation and correction of tax errors and validation of business rules in the system",
        },
    },
    {
        text: {
            pt: "Identificação de causa raiz de incidentes e aplicação de soluções definitivas",
            en: "Root-cause identification of incidents and application of definitive solutions",
        },
        highlight: true,
    },
    {
        text: {
            pt: "Gerenciamento de chamados em sistema ServiceDesk com documentação detalhada e rastreabilidade",
            en: "Ticket management in a ServiceDesk system with detailed documentation and traceability",
        },
    },
    {
        text: {
            pt: "Escalonamento técnico e interação com equipes de Desenvolvimento e Implantação para correção de falhas sistêmicas",
            en: "Technical escalation and collaboration with Development and Deployment teams to fix systemic failures",
        },
    },
    {
        text: {
            pt: "Elaboração de materiais explicativos, orientações operacionais e apoio a treinamentos para usuários",
            en: "Creation of explanatory materials, operational guidance and support for user training",
        },
    },
    {
        text: {
            pt: "Proposição de melhorias em processos internos e redução de recorrência de chamados",
            en: "Proposing improvements to internal processes and reducing ticket recurrence",
        },
    },
];

const WISE_SYSTEM_TAGS = [
    { pt: "ERP", en: "ERP" },
    { pt: "CNAB", en: "CNAB" },
    { pt: "Financeiro", en: "Finance" },
    { pt: "Faturamento", en: "Billing" },
    { pt: "Conciliação Bancária", en: "Bank Reconciliation" },
    { pt: "NFS-e", en: "NFS-e" },
    { pt: "ServiceDesk", en: "ServiceDesk" },
    { pt: "Troubleshooting", en: "Troubleshooting" },
];

/* ─────────────────────────────────────────────────────────
   CAREER_COMPANIES — experiência profissional por empresa.
   period/duration/totalDuration são derivados de start/end
   via `careerDates.ts` no idioma corrente.
───────────────────────────────────────────────────────── */
export const careerCompanies: CareerCompany[] = [
    {
        id: "wise-system",
        name: "Wise System",
        url: "https://wisesystem.com.br",
        location: { pt: "São Paulo, São Paulo, Brasil", en: "São Paulo, Brazil" },
        positions: [
            {
                id: "wise-n1",
                title: {
                    pt: "Analista de Suporte Técnico (Helpdesk) — N1",
                    en: "Technical Support Analyst (Helpdesk) — Tier 1",
                },
                employmentType: "CLT",
                startDate: "2026-01",
                modality: "ON_SITE",
                statusType: "active",
                summary: {
                    pt: "Suporte N1 em ERP de saúde com foco em Financeiro/Faturamento, CNAB e conciliação bancária. Responsável por causa raiz de incidentes, escalonamento técnico e proposição de melhorias contínuas.",
                    en: "Tier 1 support for a healthcare ERP focused on Finance/Billing, CNAB and bank reconciliation. Responsible for incident root-cause analysis, technical escalation and proposing continuous improvements.",
                },
                bullets: WISE_SYSTEM_BULLETS,
                tags: [...WISE_SYSTEM_TAGS],
            },
            {
                id: "wise-estagio",
                title: {
                    pt: "Analista de Suporte Técnico (Helpdesk)",
                    en: "Technical Support Analyst (Helpdesk)",
                },
                employmentType: "INTERNSHIP",
                startDate: "2025-04",
                endDate: "2025-12",
                modality: "ON_SITE",
                statusType: "done",
                summary: {
                    pt: "Primeiro contato profissional com o mercado de tecnologia, prestando suporte técnico e funcional a clientes nos módulos do ERP SIGO.",
                    en: "First professional experience in the tech industry, providing technical and functional support to clients across the SIGO ERP modules.",
                },
                bullets: WISE_SYSTEM_BULLETS,
                tags: [...WISE_SYSTEM_TAGS],
            },
        ],
    },
];

/* ─────────────────────────────────────────────────────────
   ALL_TIMELINE_ITEMS — Formação + Certificações (bilíngue).
───────────────────────────────────────────────────────── */
export const ALL_TIMELINE_ITEMS: TimelineRawData = [
    {
        id: "edu-1",
        category: "edu",
        title: {
            pt: "Bacharelado em Ciência da Computação",
            en: "Bachelor's Degree in Computer Science",
        },
        institution: "Universidade Cruzeiro do Sul (UNICSUL)",
        institutionUrl: "https://www.cruzeirodosul.edu.br",
        period: { pt: "2023 — 2026", en: "2023 — 2026" },
        startDate: "2023-01",
        endDate: "2026-12",
        location: "São Paulo, SP",
        modality: "ON_SITE",
        statusType: "active",
        description: {
            pt: "Formação acadêmica sólida em engenharia de software, fundamentos da computação e desenvolvimento de sistemas, com foco em algoritmos, estruturas de dados, banco de dados, sistemas operacionais e software escalável.",
            en: "Solid academic foundation in software engineering, computing fundamentals and systems development, focused on algorithms, data structures, databases, operating systems and scalable software.",
        },
        tags: [
            { pt: "Lógica de Programação", en: "Programming Logic" },
            { pt: "Algoritmos e Estruturas de Dados", en: "Algorithms & Data Structures" },
            { pt: "Desenvolvimento Web e Mobile", en: "Web & Mobile Development" },
            { pt: "Banco de Dados", en: "Databases" },
            { pt: "Sistemas Operacionais", en: "Operating Systems" },
            { pt: "Teoria da Computação", en: "Theory of Computation" },
            { pt: "Resolução de Problemas", en: "Problem Solving" },
        ],
        techIcons: ["java", "python", "mysql", "git"],
        certUrl: null,
    },
    {
        id: "edu-2",
        category: "edu",
        title: {
            pt: "Técnico em Desenvolvimento de Sistemas",
            en: "Technical Degree in Systems Development",
        },
        institution: "ETEC — Escola Técnica Estadual de São Paulo",
        institutionUrl: "https://www.cps.sp.gov.br/etecs/",
        period: { pt: "2020 — 2022", en: "2020 — 2022" },
        startDate: "2020-01",
        endDate: "2022-12",
        location: "São Paulo, SP",
        modality: "ON_SITE",
        statusType: "done",
        description: {
            pt: "Formação técnica sólida em desenvolvimento de software, análise de sistemas, banco de dados, aplicações web/mobile e fundamentos de gestão de projetos.",
            en: "Solid technical training in software development, systems analysis, databases, web/mobile applications and project management fundamentals.",
        },
        tags: [
            { pt: "Desenvolvimento de Software", en: "Software Development" },
            { pt: "Análise de Sistemas", en: "Systems Analysis" },
            { pt: "Gestão de Projetos de Software", en: "Software Project Management" },
            { pt: "Banco de Dados", en: "Databases" },
            { pt: "Desenvolvimento Web e Mobile", en: "Web & Mobile Development" },
            { pt: "Lógica de Programação", en: "Programming Logic" },
            { pt: "Inglês", en: "English" },
        ],
        techIcons: ["html", "css", "js", "php", "mysql", "figma", "vscode"],
        certUrl: null,
    },
    {
        id: "cert-1",
        category: "cert",
        title: { pt: "Introdução à Cibersegurança", en: "Introduction to Cybersecurity" },
        institution: "Cisco Networking Academy",
        institutionUrl: "https://www.netacad.com",
        period: { pt: "Abr 2026", en: "Apr 2026" },
        startDate: "2026-04",
        endDate: "2026-04",
        statusType: "done",
        description: {
            pt: "Certificação Cisco focada em fundamentos de cibersegurança, análise de ameaças, proteção de dados, segurança de redes corporativas e resposta a incidentes.",
            en: "Cisco certification focused on cybersecurity fundamentals, threat analysis, data protection, enterprise network security and incident response.",
        },
        tags: [
            { pt: "Cibersegurança", en: "Cybersecurity" },
            { pt: "Análise de Ameaças e Gestão de Riscos", en: "Threat Analysis & Risk Management" },
            { pt: "Enterprise Network Security", en: "Enterprise Network Security" },
            { pt: "Privacidade e Proteção de Dados", en: "Privacy & Data Protection" },
            { pt: "Ética e Conformidade em Segurança", en: "Security Ethics & Compliance" },
        ],
        techIcons: ["linux", "python", "git"],
        certUrl: "https://www.linkedin.com/in/oguilherme-cruz/details/certifications/",
    },
    {
        id: "cert-2",
        category: "cert",
        title: { pt: "CC50 — Ciência da Computação de Harvard", en: "CC50 — Harvard Computer Science" },
        institution: "Fundação Estudar",
        institutionUrl: "https://cc50.com.br",
        period: { pt: "Dez 2024", en: "Dec 2024" },
        startDate: "2024-06",
        endDate: "2024-12",
        statusType: "done",
        description: {
            pt: "Formação intensiva em ciência da computação com foco em programação, algoritmos, estruturas de dados, SQL, desenvolvimento web e fundamentos de inteligência artificial.",
            en: "Intensive computer science course focused on programming, algorithms, data structures, SQL, web development and artificial-intelligence fundamentals.",
        },
        tags: [
            { pt: "Programação", en: "Programming" },
            { pt: "Algoritmos e Estruturas de Dados", en: "Algorithms & Data Structures" },
            { pt: "Memória e Gerenciamento de Recursos", en: "Memory & Resource Management" },
            { pt: "SQL e Modelagem de Bancos de Dados", en: "SQL & Database Modeling" },
            { pt: "Desenvolvimento Web", en: "Web Development" },
            { pt: "Inteligência Artificial", en: "Artificial Intelligence" },
        ],
        techIcons: ["python", "mysql", "git"],
        certUrl: "https://www.linkedin.com/in/oguilherme-cruz/details/certifications/",
    },
    {
        id: "cert-3",
        category: "cert",
        title: { pt: "Trilha Discover", en: "Discover Track" },
        institution: "Rocketseat",
        institutionUrl: "https://rocketseat.com.br",
        period: { pt: "Mar 2024", en: "Mar 2024" },
        startDate: "2023-10",
        endDate: "2024-03",
        statusType: "done",
        description: {
            pt: "Formação prática em desenvolvimento web e mobile com foco em front-end, back-end, JavaScript moderno e construção de interfaces escaláveis.",
            en: "Hands-on training in web and mobile development focused on front-end, back-end, modern JavaScript and building scalable interfaces.",
        },
        tags: [
            { pt: "Front-end Development", en: "Front-end Development" },
            { pt: "Back-end Development", en: "Back-end Development" },
            { pt: "Desenvolvimento Web e Mobile", en: "Web & Mobile Development" },
            { pt: "Resolução de Problemas", en: "Problem Solving" },
        ],
        techIcons: ["html", "css", "sass", "js", "react", "nodejs", "vite", "git", "figma", "vscode"],
        certUrl:
            "https://app.rocketseat.com.br/certificates/5e1a87e2-9e71-4dbd-82a1-52f98b99c984",
    },
    {
        id: "cert-4",
        category: "cert",
        title: { pt: "Modelagem de Dados", en: "Data Modeling" },
        institution: "Fundação Bradesco",
        institutionUrl: "https://www.ev.org.br",
        period: { pt: "2023", en: "2023" },
        startDate: "2023-01",
        endDate: "2023-03",
        statusType: "done",
        description: {
            pt: "Fundamentos sólidos em modelagem de dados, bancos relacionais, SQL e estruturação de informações com foco em integridade, consistência e escalabilidade.",
            en: "Solid fundamentals in data modeling, relational databases, SQL and information structuring focused on integrity, consistency and scalability.",
        },
        tags: [
            { pt: "Modelagem de Dados", en: "Data Modeling" },
            { pt: "Banco de Dados Relacionais e SQL", en: "Relational Databases & SQL" },
            { pt: "Modelagem Conceitual, Lógica e Física", en: "Conceptual, Logical & Physical Modeling" },
            { pt: "Análise de Dados", en: "Data Analysis" },
        ],
        techIcons: ["mysql", "oracle"],
        certUrl: "https://www.linkedin.com/in/oguilherme-cruz/details/certifications/",
    },
    {
        id: "cert-5",
        category: "cert",
        title: { pt: "Qualidade de Software", en: "Software Quality" },
        institution: "IEstudar",
        institutionUrl: "https://iestudar.com",
        period: { pt: "Nov 2022", en: "Nov 2022" },
        startDate: "2022-11",
        endDate: "2022-11",
        statusType: "done",
        description: {
            pt: "Fundamentos de QA, testes, automação, documentação e padrões de qualidade para software confiável.",
            en: "QA fundamentals: testing, automation, documentation and quality standards for reliable software.",
        },
        tags: [
            { pt: "Teste de Software", en: "Software Testing" },
            { pt: "Automação de Testes", en: "Test Automation" },
            { pt: "Documentação de Testes", en: "Test Documentation" },
            { pt: "Garantia de Qualidade de Software", en: "Software Quality Assurance" },
            { pt: "Padrões de Qualidade e Normas", en: "Quality Standards & Norms" },
        ],
        techIcons: ["git", "vscode"],
        certUrl: "https://www.linkedin.com/in/oguilherme-cruz/details/certifications/",
    },
];

/* ── Derived exports ───────────────────────────────────── */
export const educationItems = ALL_TIMELINE_ITEMS.filter((i) => i.category === "edu");
export const certificationItems = ALL_TIMELINE_ITEMS.filter((i) => i.category === "cert");
