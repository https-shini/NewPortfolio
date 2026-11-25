import type { Localized } from "@/shared/lib/localized";
const l = (pt: string, en: string): Localized => ({ pt, en });
export const SOLUTIONS = [
    {
        id: "web",
        title: l("Desenvolvimento de sites", "Website development"),
        text: l(
            "Apresente seu negócio com clareza e facilite o próximo contato.",
            "Present your business clearly and make the next contact easier.",
        ),
        examples: l(
            "Landing pages, sites institucionais, portfólios e reformulação.",
            "Landing pages, business websites, portfolios and redesigns.",
        ),
        href: "#web",
        offer: "express",
    },
    {
        id: "software",
        title: l("Desenvolvimento de software", "Software development"),
        text: l(
            "Transforme uma necessidade específica em uma funcionalidade útil.",
            "Turn a specific need into a useful feature.",
        ),
        examples: l(
            "Aplicações web simples, APIs e integrações, sob avaliação.",
            "Simple web applications, APIs and integrations, subject to assessment.",
        ),
        offer: "custom-web",
    },
    {
        id: "support",
        title: l("Suporte e infraestrutura", "Support & infrastructure"),
        text: l(
            "Entenda erros e organize o ambiente digital de trabalho.",
            "Understand errors and organize your digital workspace.",
        ),
        examples: l(
            "Diagnóstico, configuração de ferramentas e suporte remoto agendado.",
            "Diagnosis, tool setup and scheduled remote support.",
        ),
        href: "#avulsos",
        offer: "diagnosis",
    },
    {
        id: "consulting",
        title: l("Consultoria e otimização", "Consulting & optimization"),
        text: l(
            "Tenha orientação técnica para decidir o próximo passo.",
            "Get technical guidance to decide your next step.",
        ),
        examples: l(
            "Análise de sistemas, dados, processos e melhorias sob avaliação.",
            "System, data and process analysis, with improvements subject to assessment.",
        ),
        href: "#avulsos",
        offer: "consulting",
    },
    {
        id: "custom",
        title: l("Serviços personalizados", "Custom services"),
        text: l(
            "Sua necessidade não cabe no catálogo? Comece por uma conversa.",
            "Your needs go beyond the catalog? Start with a conversation.",
        ),
        examples: l(
            "Requisitos específicos, viabilidade e proposta discutidos por e-mail.",
            "Specific requirements, feasibility and a proposal discussed by email.",
        ),
        href: "#ti-personalizada",
        offer: "custom-it",
    },
];
export const PRESENTATION = {
    pt: {
        title: "Sua ideia merece mais do que um site. Merece uma solução.",
        intro: "Sites profissionais, desenvolvimento e soluções de TI para quem precisa tirar uma ideia do papel ou melhorar o que já funciona. Atendimento direto, do primeiro contato à entrega.",
        eyebrow: "GCRUZ / Soluções digitais sob medida",
        nav: [
            "Soluções",
            "Planos e preços",
            "Adicionais",
            "Como funciona",
            "Dúvidas",
        ],
        heroLabel: "Do desafio à solução",
        heroSteps: [
            "Entender sua necessidade",
            "Definir um escopo claro",
            "Construir com cuidado técnico",
        ],
        heroNote: "Você conversa diretamente com quem desenvolve.",
        solutions: "O que seu projeto precisa agora?",
        solutionsIntro:
            "Escolha um ponto de partida. Cada solução tem um escopo definido e pode ser avaliada conforme a realidade do seu negócio.",
        compare: "Um ponto de partida. Preços transparentes.",
        compareIntro:
            "Compare os planos existentes. O investimento final depende dos requisitos, dos materiais e do escopo aprovado na proposta.",
        details: "Limites e adicionais",
        extras: "Adicionais compatíveis",
        exclusions: "Fora do escopo",
        proposal: "Solicitar este plano",
        see: "Explorar solução",
        redesign: "Já tem um site?",
        redesignText:
            "Modernização, correções e melhorias são avaliadas a partir do projeto existente. Investimento sob consulta.",
        redesignCta: "Avaliar meu site",
        customSite: "Um site exclusivo, pensado para o seu projeto.",
        customSiteIntro:
            "Comece pelas suas necessidades, não por um pacote. Estrutura, identidade visual e funcionalidades são discutidas individualmente para definir uma solução viável.",
        customSitePoints: [
            "Design e organização do conteúdo conforme o projeto",
            "Funcionalidades e integrações sujeitas a avaliação",
            "Escopo, prazo e investimento negociados por e-mail",
        ],
        customSiteCta: "Quero um site personalizado",
        addons: "Complemente seu projeto, no seu ritmo.",
        addonsIntro:
            "Adicionais e serviços avulsos podem atender a uma necessidade específica. A contratação separada depende da compatibilidade técnica; recursos já incluídos não são cobrados novamente.",
        oneOff: "Adicionais pontuais",
        technical: "Serviços técnicos avulsos",
        packages: "Pacotes empresariais",
        selectAddon: "Solicitar adicional",
        standalone: "Preciso apenas de adicionais",
        customIT: "Não encontrou o que precisa? Vamos conversar.",
        customITIntro:
            "Descreva o problema, o ambiente e suas referências. Uma demanda fora do catálogo pode ser avaliada individualmente, sem compromisso com tecnologias ou entregas antes da análise de viabilidade.",
        customITCta: "Solicitar serviço personalizado",
        emailTerms:
            "Sob consulta. Requisitos, valores e condições serão alinhados por e-mail.",
        maintenance: "Continuidade, com limites bem definidos.",
        maintenanceIntro:
            "Manutenção opcional para acompanhar o site após a entrega. O contrato define atividades, franquia de horas e prazos de atendimento, de acordo com a necessidade.",
        maintenanceCta: "Conversar sobre manutenção",
        maintenancePoints: [
            "Contratação separada do desenvolvimento",
            "Atividades e periodicidade definidas em contrato",
            "Sem suporte ilimitado ou plantão 24 horas",
        ],
        why: "Tecnologia com responsabilidade. Contato direto.",
        whyIntro:
            "Uma operação independente: você acompanha as decisões e conversa com o profissional responsável pelo projeto.",
        benefits: [
            {
                title: "Comunicação próxima",
                text: "Alinhamento de necessidades e acompanhamento durante a execução.",
            },
            {
                title: "Transparência comercial",
                text: "Escopo, prazos, revisões e custos formalizados na proposta.",
            },
            {
                title: "Cuidado técnico",
                text: "Atenção à organização, à responsividade e à experiência de uso.",
            },
            {
                title: "Continuidade possível",
                text: "Novas demandas e manutenção avaliadas conforme o projeto evolui.",
            },
        ],
        evidence: "Conheça o trabalho técnico",
        process: "Um caminho claro, da ideia à entrega.",
        steps: [
            {
                title: "Escolha",
                text: "Explore os serviços e selecione o que faz sentido.",
            },
            {
                title: "Solicitação",
                text: "Organize seu pedido na página de orçamento.",
            },
            {
                title: "Alinhamento",
                text: "Necessidades e viabilidade são discutidas por e-mail.",
            },
            {
                title: "Proposta",
                text: "Você recebe escopo, investimento e prazo para avaliar.",
            },
            {
                title: "Execução",
                text: "O trabalho começa conforme aprovação e condições acordadas.",
            },
            {
                title: "Entrega",
                text: "Validação, revisão prevista e orientações finais.",
            },
        ],
        noContract:
            "Solicitar um orçamento não gera contratação automática. Os prazos dependem do escopo, da disponibilidade e do recebimento dos materiais.",
        final: "Vamos transformar sua ideia em realidade?",
        finalText:
            "Conte o que você precisa e prepare uma solicitação de proposta personalizada.",
        finalCta: "Montar meu orçamento",
    },
    en: {
        title: "Your idea deserves more than a website. It deserves a solution.",
        intro: "Professional websites, development and IT solutions to bring an idea to life or improve what already works. Direct contact, from the first conversation to delivery.",
        eyebrow: "GCRUZ / Tailored digital solutions",
        nav: [
            "Solutions",
            "Plans & pricing",
            "Add-ons",
            "How it works",
            "Questions",
        ],
        heroLabel: "From challenge to solution",
        heroSteps: [
            "Understand your needs",
            "Define a clear scope",
            "Build with technical care",
        ],
        heroNote: "Talk directly to the person building your project.",
        solutions: "What does your project need now?",
        solutionsIntro:
            "Choose a starting point. Each solution has a defined scope and can be assessed against your business needs.",
        compare: "A starting point. Transparent pricing.",
        compareIntro:
            "Compare the existing plans. Final investment depends on requirements, materials and the scope approved in the proposal.",
        details: "Limits & add-ons",
        extras: "Compatible add-ons",
        exclusions: "Outside the scope",
        proposal: "Request this plan",
        see: "Explore solution",
        redesign: "Already have a website?",
        redesignText:
            "Modernization, fixes and improvements are assessed against the existing project. Pricing on request.",
        redesignCta: "Assess my website",
        customSite: "A unique website, shaped around your project.",
        customSiteIntro:
            "Start with your needs, rather than a package. Structure, visual identity and functionality are discussed individually to define a viable solution.",
        customSitePoints: [
            "Design and content organization tailored to the project",
            "Features and integrations subject to assessment",
            "Scope, timeline and investment discussed by email",
        ],
        customSiteCta: "I want a custom website",
        addons: "Extend your project at your own pace.",
        addonsIntro:
            "Add-ons and one-off services can address a specific need. Standalone work depends on technical compatibility; included features are not charged twice.",
        oneOff: "One-off add-ons",
        technical: "One-off technical services",
        packages: "Business packages",
        selectAddon: "Request add-on",
        standalone: "I only need add-ons",
        customIT: "Didn't find what you need? Let's talk.",
        customITIntro:
            "Describe the problem, environment and references. A request outside the catalog can be assessed individually, without committing to technologies or deliverables before checking feasibility.",
        customITCta: "Request a custom service",
        emailTerms:
            "Pricing on request. Requirements, investment and terms will be discussed by email.",
        maintenance: "Continuity, with clearly defined limits.",
        maintenanceIntro:
            "Optional maintenance to support your website after delivery. The agreement defines activities, included hours and response times according to your needs.",
        maintenanceCta: "Discuss maintenance",
        maintenancePoints: [
            "Contracted separately from development",
            "Activities and frequency defined in the agreement",
            "No unlimited or 24-hour support",
        ],
        why: "Responsible technology. Direct contact.",
        whyIntro:
            "An independent practice: follow the decisions and talk to the professional responsible for your project.",
        benefits: [
            {
                title: "Close communication",
                text: "Requirements alignment and updates throughout delivery.",
            },
            {
                title: "Commercial transparency",
                text: "Scope, timelines, revisions and costs formalized in the proposal.",
            },
            {
                title: "Technical care",
                text: "Attention to organization, responsiveness and usability.",
            },
            {
                title: "Room to continue",
                text: "New requests and maintenance assessed as the project evolves.",
            },
        ],
        evidence: "Explore the technical work",
        process: "A clear path, from idea to delivery.",
        steps: [
            {
                title: "Choose",
                text: "Explore services and select what makes sense.",
            },
            {
                title: "Request",
                text: "Organize your request on the quote page.",
            },
            { title: "Align", text: "Discuss needs and feasibility by email." },
            {
                title: "Proposal",
                text: "Review scope, investment and timeline.",
            },
            {
                title: "Execution",
                text: "Work begins according to approval and agreed conditions.",
            },
            {
                title: "Delivery",
                text: "Validation, agreed revisions and final guidance.",
            },
        ],
        noContract:
            "A quote request does not create a contract. Timelines depend on scope, availability and receipt of materials.",
        final: "Ready to bring your idea to life?",
        finalText:
            "Tell me what you need and prepare a request for a tailored proposal.",
        finalCta: "Build my quote",
    },
};
