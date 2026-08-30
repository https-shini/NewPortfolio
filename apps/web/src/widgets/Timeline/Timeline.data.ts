import type {
    TimelineRawData,
    CareerCompany,
    CareerBullet,
} from "./Timeline.types";

/* ─────────────────────────────────────────────────────────
   Bullets da Wise System — uma lista por posição.
   ──────────────
   As duas posições compartilhavam um único array, o que dizia
   que o estagiário fazia exatamente o mesmo que o efetivo. A
   efetivação existe justamente porque o escopo mudou: liderança
   da implantação, apoio ao N2, transição para PIX e formação de
   novos estagiários só valem para a posição CLT.

   Itens com `highlight: true` sobem para a seção "Destaques"; os
   demais ficam em "Atividades" — ver PositionEntry.tsx.
───────────────────────────────────────────────────────── */
const WISE_N1_BULLETS: CareerBullet[] = [
    {
        text: {
            pt: "Efetivado de estágio a CLT em menos de um ano, com ampliação de responsabilidades e autonomia técnica",
            en: "Promoted from intern to full-time in under a year, with broader responsibilities and technical autonomy",
        },
        highlight: true,
    },
    {
        text: {
            pt: "Liderança da equipe de implantação nos processos de homologação bancária e de notas fiscais, atuando com diversos bancos e municípios",
            en: "Leading the deployment team through bank and invoice homologation, working with several banks and municipalities",
        },
        highlight: true,
    },
    {
        text: {
            pt: "Suporte técnico e funcional ao ERP (SIGO), com análise de regras de negócio, resolução de problemas e apoio em demandas de Suporte N2",
            en: "Technical and functional support for the ERP (SIGO), with business-rule analysis, problem-solving and support on Tier 2 demands",
        },
    },
    {
        text: {
            pt: "Atuação nos módulos Financeiro e Faturamento, com domínio de Contas a Pagar e Receber (lançamentos, baixas, cobranças e conciliações)",
            en: "Working across the Finance and Billing modules, with command of Accounts Payable and Receivable (entries, settlements, collections and reconciliations)",
        },
    },
    {
        text: {
            pt: "Análise e correção de inconsistências em arquivos CNAB (remessa e retorno), incluindo integrações com instituições financeiras",
            en: "Analysis and correction of inconsistencies in CNAB files (outbound and return), including integrations with financial institutions",
        },
    },
    {
        text: {
            pt: "Participação ativa na transição do sistema para pagamentos via PIX, atuando em homologações, CNABs e particularidades de clientes",
            en: "Active role in the system's transition to PIX payments, working on homologations, CNAB files and client-specific requirements",
        },
        highlight: true,
    },
    {
        text: {
            pt: "Homologação de notas fiscais e boletos bancários, com suporte a rotinas de faturamento, emissão, validação e tratativa de rejeições",
            en: "Homologation of invoices and bank slips, supporting billing routines, issuance, validation and rejection handling",
        },
    },
    {
        text: {
            pt: "Postura investigativa na resolução de problemas: análise de causa raiz e avaliação de impacto no ecossistema do software",
            en: "Investigative approach to problem-solving: root-cause analysis and assessment of impact across the software ecosystem",
        },
        highlight: true,
    },
    {
        text: {
            pt: "Condução de atendimentos técnicos com clareza e didática, sendo referência direta para clientes em determinadas demandas",
            en: "Conducting technical support with clarity and didactics, becoming the direct point of reference for clients on certain demands",
        },
    },
    {
        text: {
            pt: "Treinamentos online para clientes sobre os módulos do sistema, com foco em didática e clareza na explicação técnica",
            en: "Online training for clients on the system's modules, focused on didactics and clarity in technical explanation",
        },
    },
    {
        text: {
            pt: "Treinamento e capacitação interna de novos estagiários, orientando processos e boas práticas",
            en: "Internal training and onboarding of new interns, guiding processes and best practices",
        },
        highlight: true,
    },
    {
        text: {
            pt: "Estruturação de sistema interno de controle de homologação, organizando processos e indicadores da equipe",
            en: "Structuring an internal homologation control system, organising the team's processes and indicators",
        },
        highlight: true,
    },
    {
        text: {
            pt: "Identificação e reporte de bugs, com comunicação técnica estruturada para as equipes de Suporte N2 e Desenvolvimento",
            en: "Identifying and reporting bugs, with structured technical communication to the Tier 2 Support and Development teams",
        },
    },
    {
        text: {
            pt: "Gestão de chamados via Service Desk, com documentação técnica detalhada, rastreabilidade e escalonamento",
            en: "Ticket management through Service Desk, with detailed technical documentation, traceability and escalation",
        },
    },
    {
        text: {
            pt: "Proposição de melhorias em processos internos, contribuindo para a redução de incidentes e o aumento da eficiência operacional",
            en: "Proposing improvements to internal processes, contributing to fewer incidents and greater operational efficiency",
        },
    },
];

const WISE_ESTAGIO_BULLETS: CareerBullet[] = [
    {
        text: {
            pt: "Suporte técnico e funcional a clientes via telefone, chat, e-mail e acesso remoto, orientando sobre o uso do ERP (SIGO) e boas práticas operacionais",
            en: "Technical and functional customer support via phone, chat, email and remote access, guiding usage of the ERP (SIGO) and operational best practices",
        },
        highlight: true,
    },
    {
        text: {
            pt: "Atuação focada nos módulos Financeiro e Faturamento",
            en: "Focused on the Finance and Billing modules",
        },
    },
    {
        text: {
            pt: "Integrante da equipe de implantação, atuando nos processos de homologação bancária e de notas fiscais",
            en: "Member of the deployment team, working on bank and invoice homologation",
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
            pt: "Suporte em Faturamento e documentos fiscais: emissão, rejeições e homologação de notas fiscais",
            en: "Support for Billing and tax documents: issuance, rejections and invoice homologation",
        },
        highlight: true,
    },
    {
        text: {
            pt: "Investigação e correção de erros tributários, com validação de regras de negócio no sistema",
            en: "Investigation and correction of tax errors, validating business rules in the system",
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
            pt: "Treinamentos para novos estagiários sobre os módulos do sistema, com foco em didática e clareza na explicação técnica",
            en: "Training new interns on the system's modules, focused on didactics and clarity in technical explanation",
        },
    },
    {
        text: {
            pt: "Gerenciamento de chamados em sistema Service Desk, com documentação detalhada e rastreabilidade",
            en: "Ticket management in a Service Desk system, with detailed documentation and traceability",
        },
    },
    {
        text: {
            pt: "Escalonamento técnico e interação com as equipes de Suporte N2 e Desenvolvimento para correção de falhas sistêmicas",
            en: "Technical escalation and collaboration with the Tier 2 Support and Development teams to fix systemic failures",
        },
    },
    {
        text: {
            pt: "Elaboração de materiais explicativos e orientações operacionais, com apoio a treinamentos para usuários",
            en: "Creation of explanatory materials and operational guidance, supporting user training",
        },
    },
    {
        text: {
            pt: "Proposição de melhorias em processos internos, contribuindo para a redução de recorrência de chamados",
            en: "Proposing improvements to internal processes, contributing to fewer recurring tickets",
        },
    },
];

/* Competências comuns às duas posições. */
const WISE_SYSTEM_TAGS = [
    { pt: "SIGO", en: "SIGO" },
    { pt: "ERP", en: "ERP" },
    { pt: "SST", en: "SST" },
    { pt: "Financeiro", en: "Finance" },
    { pt: "Faturamento", en: "Billing" },
    { pt: "CNAB", en: "CNAB" },
    { pt: "Conciliação Bancária", en: "Bank Reconciliation" },
    { pt: "NFS-e", en: "NFS-e" },
    { pt: "RPS", en: "RPS" },
    { pt: "Service Desk", en: "Service Desk" },
    { pt: "Homologação Bancária", en: "Bank Homologation" },
    { pt: "Implantação", en: "Deployment" },
    { pt: "Análise de Causa Raiz", en: "Root-Cause Analysis" },
    { pt: "Treinamento", en: "Training" },
];

/* O que só a posição efetiva acrescenta. O painel lateral agrega o
   conjunto único dos dois cargos — ver CareerStats.tsx. */
const WISE_N1_TAGS = [
    { pt: "PIX", en: "PIX" },
    { pt: "Suporte N2", en: "Tier 2 Support" },
    { pt: "Liderança Técnica", en: "Technical Leadership" },
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
        location: {
            pt: "São Paulo, São Paulo, Brasil",
            en: "São Paulo, Brazil",
        },
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
                    pt: "Efetivado após o estágio, com liderança das homologações bancárias e de notas fiscais junto à equipe de implantação.",
                    en: "Promoted from intern to full-time, leading bank and invoice homologations alongside the deployment team.",
                },
                bullets: WISE_N1_BULLETS,
                tags: [...WISE_SYSTEM_TAGS, ...WISE_N1_TAGS],
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
                    pt: "Primeiro contato profissional com tecnologia: suporte a clientes nos módulos Financeiro e Faturamento do SIGO, integrando a equipe de implantação.",
                    en: "First professional experience in tech: client support across SIGO's Finance and Billing modules, as part of the deployment team.",
                },
                bullets: WISE_ESTAGIO_BULLETS,
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
            {
                pt: "Algoritmos e Estruturas de Dados",
                en: "Algorithms & Data Structures",
            },
            {
                pt: "Desenvolvimento Web e Mobile",
                en: "Web & Mobile Development",
            },
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
            {
                pt: "Gestão de Projetos de Software",
                en: "Software Project Management",
            },
            { pt: "Banco de Dados", en: "Databases" },
            {
                pt: "Desenvolvimento Web e Mobile",
                en: "Web & Mobile Development",
            },
            { pt: "Lógica de Programação", en: "Programming Logic" },
            { pt: "Inglês", en: "English" },
        ],
        techIcons: ["html", "css", "js", "php", "mysql", "figma", "vscode"],
        certUrl: "/docs/etec.pdf",
    },
    {
        id: "cert-1",
        category: "cert",
        title: {
            pt: "Introdução à Cibersegurança",
            en: "Introduction to Cybersecurity",
        },
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
            {
                pt: "Análise de Ameaças e Gestão de Riscos",
                en: "Threat Analysis & Risk Management",
            },
            {
                pt: "Enterprise Network Security",
                en: "Enterprise Network Security",
            },
            {
                pt: "Privacidade e Proteção de Dados",
                en: "Privacy & Data Protection",
            },
            {
                pt: "Ética e Conformidade em Segurança",
                en: "Security Ethics & Compliance",
            },
        ],
        techIcons: ["linux", "python", "git"],
        certUrl:
            "https://www.linkedin.com/in/oguilherme-cruz/details/certifications/",
    },
    {
        id: "cert-2",
        category: "cert",
        title: {
            pt: "CC50 — Ciência da Computação de Harvard",
            en: "CC50 — Harvard Computer Science",
        },
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
            {
                pt: "Algoritmos e Estruturas de Dados",
                en: "Algorithms & Data Structures",
            },
            {
                pt: "Memória e Gerenciamento de Recursos",
                en: "Memory & Resource Management",
            },
            {
                pt: "SQL e Modelagem de Bancos de Dados",
                en: "SQL & Database Modeling",
            },
            { pt: "Desenvolvimento Web", en: "Web Development" },
            { pt: "Inteligência Artificial", en: "Artificial Intelligence" },
        ],
        techIcons: ["python", "mysql", "git"],
        certUrl: "/docs/CC50.pdf",
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
            {
                pt: "Desenvolvimento Web e Mobile",
                en: "Web & Mobile Development",
            },
            { pt: "Resolução de Problemas", en: "Problem Solving" },
        ],
        techIcons: [
            "html",
            "css",
            "sass",
            "js",
            "react",
            "nodejs",
            "vite",
            "git",
            "figma",
            "vscode",
        ],
        certUrl: "/docs/certificate.pdf",
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
            {
                pt: "Banco de Dados Relacionais e SQL",
                en: "Relational Databases & SQL",
            },
            {
                pt: "Modelagem Conceitual, Lógica e Física",
                en: "Conceptual, Logical & Physical Modeling",
            },
            { pt: "Análise de Dados", en: "Data Analysis" },
        ],
        techIcons: ["mysql", "oracle"],
        certUrl: "/docs/modelagem-de-dados.pdf",
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
            {
                pt: "Garantia de Qualidade de Software",
                en: "Software Quality Assurance",
            },
            {
                pt: "Padrões de Qualidade e Normas",
                en: "Quality Standards & Norms",
            },
        ],
        techIcons: ["git", "vscode"],
        certUrl:
            "https://www.linkedin.com/in/oguilherme-cruz/details/certifications/",
    },
];

/* ── Derived exports ───────────────────────────────────── */
export const educationItems = ALL_TIMELINE_ITEMS.filter(
    (i) => i.category === "edu",
);
export const certificationItems = ALL_TIMELINE_ITEMS.filter(
    (i) => i.category === "cert",
);
