import type {
    TimelineRawData,
    CareerCompany,
    CareerBullet,
} from "./Timeline.types";

/* ─────────────────────────────────────────────────────────
   WISE_SYSTEM_BULLETS — atividades operacionais
   compartilhadas entre as duas posições na Wise System
   (a função manteve o mesmo escopo; o que mudou foi o vínculo).

   Bullets com `highlight: true` aparecem também na seção
   "Destaques" no topo do modal — pegue 3-4 que melhor
   resumem a contribuição/responsabilidade.
───────────────────────────────────────────────────────── */
const WISE_SYSTEM_BULLETS: CareerBullet[] = [
    {
        text: "Suporte técnico e funcional a clientes via telefone, chat, e-mail e acesso remoto, orientando sobre uso do ERP e boas práticas operacionais",
        highlight: true,
    },
    {
        text: "Atuação focada nos módulos Financeiro e Faturamento",
        highlight: true,
    },
    {
        text: "Acompanhamento de rotinas de Contas a Pagar e Contas a Receber (lançamentos, baixas, cobranças e conciliações)",
    },
    {
        text: "Análise e resolução de inconsistências em arquivos bancários CNAB (remessa e retorno) e integrações com instituições financeiras",
        highlight: true,
    },
    {
        text: "Tratativa de divergências de conciliação bancária e problemas relacionados a títulos financeiros",
    },
    {
        text: "Suporte em faturamento e documentos fiscais: emissão, rejeições e homologação de notas fiscais",
    },
    {
        text: "Investigação e correção de erros tributários e validação de regras de negócio no sistema",
    },
    {
        text: "Identificação de causa raiz de incidentes e aplicação de soluções definitivas",
        highlight: true,
    },
    {
        text: "Gerenciamento de chamados em sistema ServiceDesk com documentação detalhada e rastreabilidade",
    },
    {
        text: "Escalonamento técnico e interação com equipes de Desenvolvimento e Implantação para correção de falhas sistêmicas",
    },
    {
        text: "Elaboração de materiais explicativos, orientações operacionais e apoio a treinamentos para usuários",
    },
    {
        text: "Proposição de melhorias em processos internos e redução de recorrência de chamados",
    },
];

const WISE_SYSTEM_TAGS = [
    "ERP",
    "CNAB",
    "Financeiro",
    "Faturamento",
    "Conciliação Bancária",
    "NFS-e",
    "ServiceDesk",
    "Troubleshooting",
] as const;

/* ─────────────────────────────────────────────────────────
   CAREER_COMPANIES — experiência profissional agrupada por empresa
   (layout estilo LinkedIn: 1 header de empresa → N posições).

   period/duration/totalDuration são DERIVADOS de
   startDate/endDate via `careerDates.ts` no idioma corrente —
   o display se atualiza sozinho com o tempo (ex.: "4 meses"
   vira "5 meses" no mês seguinte) e localiza para PT/EN.

   employmentType e modality são TOKENS estáveis — traduzidos
   no render via `t('career.employment.*')` e `t('career.modality.*')`.
───────────────────────────────────────────────────────── */
export const careerCompanies: CareerCompany[] = [
    {
        id: "wise-system",
        name: "Wise System",
        url: "https://wisesystem.com.br",
        location: "São Paulo, São Paulo, Brasil",
        positions: [
            {
                id: "wise-n1",
                title: "Analista de Suporte Técnico (Helpdesk) — N1",
                employmentType: "CLT",
                startDate: "2026-01",
                modality: "ON_SITE",
                status: "Atual",
                statusType: "active",
                summary:
                    "Suporte N1 em ERP de saúde com foco em Financeiro/Faturamento, CNAB e conciliação bancária. Responsável por causa raiz de incidentes, escalonamento técnico e proposição de melhorias contínuas.",
                bullets: WISE_SYSTEM_BULLETS,
                tags: [...WISE_SYSTEM_TAGS],
            },
            {
                id: "wise-estagio",
                title: "Analista de Suporte Técnico (Helpdesk)",
                employmentType: "INTERNSHIP",
                startDate: "2025-04",
                endDate: "2025-12",
                modality: "ON_SITE",
                status: "Concluído",
                statusType: "done",
                summary:
                    "Primeiro contato profissional com o mercado de tecnologia, prestando suporte técnico e funcional a clientes nos módulos do ERP SIGO.",
                bullets: WISE_SYSTEM_BULLETS,
                tags: [...WISE_SYSTEM_TAGS],
            },
        ],
    },
];

/* ─────────────────────────────────────────────────────────
   CORE_SKILLS — matriz estratégica para ATS
───────────────────────────────────────────────────────── */
export const CORE_SKILLS = {
    cybersecurity: [
        "Análise de Ameaças",
        "Gestão de Riscos",
        "Cibersegurança",
        "Privacidade e Proteção de Dados",
        "Enterprise Network Security",
        "Ética e Conformidade em Segurança",
    ],

    softwareEngineering: [
        "Lógica de Programação",
        "Algoritmos",
        "Estruturas de Dados",
        "Análise de Sistemas",
        "Sistemas Operacionais",
        "Teoria da Computação",
        "Resolução de Problemas",
    ],

    backend: [
        "Python",
        "Node.js",
        "SQL",
        "MySQL",
        "Banco de Dados",
        "Banco de Dados Relacionais e SQL",
        "Modelagem de Dados",
        "Flask",
    ],

    frontend: [
        "React.js",
        "HTML",
        "CSS",
        "JavaScript",
        "Front-end Development",
        "Desenvolvimento Web e Mobile",
    ],

    quality: [
        "Teste de Software",
        "Automação de Testes",
        "Garantia de Qualidade de Software",
        "Documentação de Testes",
        "Padrões de Qualidade e Normas",
    ],

    softSkills: [
        "Gestão de Projetos de Software",
        "Comunicação Técnica",
        "Pensamento Analítico",
        "Inglês",
    ],
} as const;

export const VERIFIED_SKILLS = [
    {
        name: "Algoritmos e Estruturas de Dados",
        level: "advanced",
        evidence: ["CC50", "UNICSUL", "ETEC"],
    },
    {
        name: "Banco de Dados",
        level: "advanced",
        evidence: ["UNICSUL", "Modelagem de Dados", "Wise System"],
    },
    {
        name: "Cibersegurança",
        level: "intermediate",
        evidence: ["Cisco Networking Academy"],
    },
    {
        name: "React.js",
        level: "intermediate",
        evidence: ["Rocketseat Discover", "Portfólio"],
    },
];

/* ─────────────────────────────────────────────────────────
   ALL_TIMELINE_ITEMS — fonte única para Formação + Certificações.
   (A experiência profissional vive em `careerCompanies` acima.)

   `modality` agora usa tokens — ON_SITE em vez de "presencial".
───────────────────────────────────────────────────────── */
export const ALL_TIMELINE_ITEMS: TimelineRawData = [
    {
        id: "edu-1",
        category: "edu",
        title: "Bacharelado em Ciência da Computação",
        institution: "Universidade Cruzeiro do Sul (UNICSUL)",
        institutionUrl: "https://www.cruzeirodosul.edu.br",
        period: "2023 — 2026",
        startDate: "2023-01",
        endDate: "2026-12",
        location: "São Paulo, SP",
        modality: "ON_SITE",
        status: "Em andamento",
        statusType: "active",
        description:
            "Formação acadêmica sólida em engenharia de software, fundamentos da computação e desenvolvimento de sistemas, com foco em algoritmos, estruturas de dados, banco de dados, sistemas operacionais e software escalável.",
        longDescription:
            "Formação acadêmica com base sólida em Ciência da Computação, consolidando competências em lógica de programação, algoritmos, estruturas de dados, banco de dados, sistemas operacionais e teoria da computação. A graduação fortalece minha capacidade de análise, modelagem de soluções e construção de software escalável.",
        responsibilities: [
            {
                text: "Aplicação de lógica de programação e resolução estruturada de problemas",
                highlight: true,
            },
            {
                text: "Análise e implementação de algoritmos e estruturas de dados",
                highlight: true,
            },
            { text: "Desenvolvimento web e mobile com foco em escalabilidade" },
            { text: "Banco de dados, modelagem relacional e SQL" },
            {
                text: "Fundamentos de sistemas operacionais, memória e processos",
            },
            {
                text: "Base teórica em computação, complexidade e linguagens formais",
            },
        ],
        tags: [
            "Lógica de Programação",
            "Algoritmos e Estruturas de Dados",
            "Desenvolvimento Web e Mobile",
            "Banco de Dados",
            "Sistemas Operacionais",
            "Teoria da Computação",
            "Resolução de Problemas",
        ],
        techIcons: ["java", "python", "mysql", "git"],
        certUrl: null,
    },
    {
        id: "edu-2",
        category: "edu",
        title: "Técnico em Desenvolvimento de Sistemas",
        institution: "ETEC — Escola Técnica Estadual de São Paulo",
        institutionUrl: "https://www.cps.sp.gov.br/etecs/",
        period: "2020 — 2022",
        startDate: "2020-01",
        endDate: "2022-12",
        location: "São Paulo, SP",
        modality: "ON_SITE",
        status: "Concluído",
        statusType: "done",
        description:
            "Formação técnica sólida em desenvolvimento de software, análise de sistemas, banco de dados, aplicações web/mobile e fundamentos de gestão de projetos.",
        longDescription:
            "Base técnica fundamental na minha trajetória, com forte ênfase em lógica de programação, resolução de problemas, modelagem de dados, análise de sistemas e desenvolvimento full stack.",
        responsibilities: [
            {
                text: "Desenvolvimento de software com foco em aplicações práticas",
                highlight: true,
            },
            {
                text: "Análise de sistemas e levantamento de requisitos",
                highlight: true,
            },
            { text: "Gestão e organização de projetos de software" },
            { text: "Desenvolvimento web com HTML, CSS e JavaScript" },
            { text: "Banco de dados relacionais, MySQL e modelagem" },
            {
                text: "Lógica de programação e resolução de problemas",
                highlight: true,
            },
        ],
        tags: [
            "Desenvolvimento de Software",
            "Análise de Sistemas",
            "Gestão de Projetos de Software",
            "Banco de Dados",
            "Desenvolvimento Web e Mobile",
            "Lógica de Programação",
            "Inglês",
        ],
        techIcons: ["html", "css", "js", "php", "mysql", "figma", "vscode"],
        certUrl: null,
    },
    {
        id: "cert-1",
        category: "cert",
        title: "Introdução à Cibersegurança",
        institution: "Cisco Networking Academy",
        institutionUrl: "https://www.netacad.com",
        period: "Abr 2026",
        startDate: "2026-04",
        endDate: "2026-04",
        status: "Concluído",
        statusType: "done",
        description:
            "Certificação Cisco focada em fundamentos de cibersegurança, análise de ameaças, proteção de dados, segurança de redes corporativas e resposta a incidentes.",
        longDescription:
            "Certificação concluída pela Cisco Networking Academy na 12ª Maratona CiberEducação Cisco Brasil, com foco em fundamentos essenciais de cibersegurança aplicados a ambientes corporativos.",
        responsibilities: [
            {
                text: "Análise de ameaças, vulnerabilidades e gestão de riscos",
                highlight: true,
            },
            {
                text: "Privacidade, proteção de dados e segurança da informação",
                highlight: true,
            },
            { text: "Fundamentos de enterprise network security" },
            { text: "Resposta a incidentes e boas práticas defensivas" },
            { text: "Ética e conformidade em segurança" },
        ],
        tags: [
            "Cibersegurança",
            "Análise de Ameaças e Gestão de Riscos",
            "Enterprise Network Security",
            "Privacidade e Proteção de Dados",
            "Ética e Conformidade em Segurança",
        ],
        techIcons: ["linux", "python", "git"],
        certUrl:
            "https://www.linkedin.com/in/oguilherme-cruz/details/certifications/",
    },
    {
        id: "cert-2",
        category: "cert",
        title: "CC50 — Ciência da Computação de Harvard",
        institution: "Fundação Estudar",
        institutionUrl: "https://cc50.com.br",
        period: "Dez 2024",
        startDate: "2024-06",
        endDate: "2024-12",
        status: "Concluído",
        statusType: "done",
        description:
            "Formação intensiva em ciência da computação com foco em programação, algoritmos, estruturas de dados, SQL, desenvolvimento web e fundamentos de inteligência artificial.",
        longDescription:
            "Formação de alta intensidade baseada no CS50 de Harvard, consolidando fundamentos sólidos em ciência da computação, resolução estruturada de problemas e desenvolvimento de software.",
        responsibilities: [
            { text: "Programação estruturada com C e Python", highlight: true },
            {
                text: "Algoritmos, estruturas de dados e gerenciamento de memória",
                highlight: true,
            },
            { text: "SQL, modelagem de bancos e análise de dados" },
            { text: "Desenvolvimento web backend" },
            {
                text: "Fundamentos de inteligência artificial e machine learning",
            },
        ],
        tags: [
            "Programação",
            "Algoritmos e Estruturas de Dados",
            "Memória e Gerenciamento de Recursos",
            "SQL e Modelagem de Bancos de Dados",
            "Desenvolvimento Web",
            "Inteligência Artificial",
        ],
        techIcons: ["python", "mysql", "git"],
        certUrl:
            "https://www.linkedin.com/in/oguilherme-cruz/details/certifications/",
    },
    {
        id: "cert-3",
        category: "cert",
        title: "Trilha Discover",
        institution: "Rocketseat",
        institutionUrl: "https://rocketseat.com.br",
        period: "Mar 2024",
        startDate: "2023-10",
        endDate: "2024-03",
        status: "Concluído",
        statusType: "done",
        description:
            "Formação prática em desenvolvimento web e mobile com foco em front-end, back-end, JavaScript moderno e construção de interfaces escaláveis.",
        longDescription:
            "Trilha hands-on focada no desenvolvimento de aplicações web e mobile, cobrindo HTML, CSS, JavaScript, React, Node.js e fundamentos modernos de arquitetura frontend e backend.",
        responsibilities: [
            {
                text: "Front-end development com React e componentização",
                highlight: true,
            },
            { text: "Back-end development com Node.js" },
            {
                text: "Desenvolvimento web responsivo com HTML, CSS e JavaScript",
            },
            { text: "Arquitetura de interfaces e experiência do usuário" },
            {
                text: "Resolução de problemas e construção de projetos práticos",
            },
        ],
        tags: [
            "Front-end Development",
            "Back-end Development",
            "Desenvolvimento Web e Mobile",
            "Resolução de Problemas",
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
        certUrl:
            "https://app.rocketseat.com.br/certificates/5e1a87e2-9e71-4dbd-82a1-52f98b99c984",
    },
    {
        id: "cert-4",
        category: "cert",
        title: "Modelagem de Dados",
        institution: "Fundação Bradesco",
        institutionUrl: "https://www.ev.org.br",
        period: "2023",
        startDate: "2023-01",
        endDate: "2023-03",
        status: "Concluído",
        statusType: "done",
        description:
            "Fundamentos sólidos em modelagem de dados, bancos relacionais, SQL e estruturação de informações com foco em integridade, consistência e escalabilidade.",
        longDescription:
            "Formação voltada à modelagem conceitual, lógica e física de bancos de dados relacionais, com ênfase em diagramas ER, normalização, relacionamentos, integridade referencial e boas práticas de estruturação de dados.",
        responsibilities: [
            {
                text: "Modelagem conceitual, lógica e física de dados",
                highlight: true,
            },
            { text: "Banco de dados relacionais e SQL", highlight: true },
            { text: "Normalização e integridade referencial" },
            { text: "Análise de dados e estruturação de informações" },
        ],
        tags: [
            "Modelagem de Dados",
            "Banco de Dados Relacionais e SQL",
            "Modelagem Conceitual, Lógica e Física",
            "Análise de Dados",
        ],
        techIcons: ["mysql", "oracle"],
        certUrl:
            "https://www.linkedin.com/in/oguilherme-cruz/details/certifications/",
    },
    {
        id: "cert-5",
        category: "cert",
        title: "Qualidade de Software",
        institution: "IEstudar",
        institutionUrl: "https://iestudar.com",
        period: "Nov 2022",
        startDate: "2022-11",
        endDate: "2022-11",
        status: "Concluído",
        statusType: "done",
        description:
            "Fundamentos de QA, testes, automação, documentação e padrões de qualidade para software confiável.",
        longDescription:
            "Formação voltada aos fundamentos de garantia de qualidade de software, com ênfase em testes funcionais, validação de requisitos, documentação técnica, automação de testes e aplicação de padrões de qualidade em sistemas.",
        responsibilities: [
            {
                text: "Teste de software e validação funcional",
                highlight: true,
            },
            { text: "Automação e documentação de testes" },
            { text: "Garantia de qualidade de software", highlight: true },
            { text: "Padrões de qualidade, normas e boas práticas" },
        ],
        tags: [
            "Teste de Software",
            "Automação de Testes",
            "Documentação de Testes",
            "Garantia de Qualidade de Software",
            "Padrões de Qualidade e Normas",
        ],
        techIcons: ["git", "vscode"],
        certUrl:
            "https://www.linkedin.com/in/oguilherme-cruz/details/certifications/",
    },
];

/* ─────────────────────────────────────────────────────────
   DERIVED EXPORTS
───────────────────────────────────────────────────────── */
export const educationItems = ALL_TIMELINE_ITEMS.filter(
    (i) => i.category === "edu",
);
export const certificationItems = ALL_TIMELINE_ITEMS.filter(
    (i) => i.category === "cert",
);
