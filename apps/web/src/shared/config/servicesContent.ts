import type { Localized } from "@/shared/lib/localized";
export interface FAQ {
    id: string;
    q: Localized;
    a: Localized;
}
const l = (pt: string, en: string): Localized => ({ pt, en });
export const FAQ_ITEMS: FAQ[] = [
    {
        id: "cost",
        q: l("Quanto custa criar um site?", "How much does a website cost?"),
        a: l(
            "Os planos indicam valores iniciais. O simulador ajuda a organizar uma estimativa; a proposta confirma preço, escopo e prazo após o briefing.",
            "Plans show starting prices. The estimator helps organize an estimate; the proposal confirms price, scope and timeline after the briefing.",
        ),
    },
    {
        id: "hosting",
        q: l(
            "Preciso contratar hospedagem e domínio?",
            "Do I need hosting and a domain?",
        ),
        a: l(
            "Domínio, licenças e hospedagem externa são custos separados, salvo previsão expressa na proposta. A configuração pode ser contratada conforme a necessidade.",
            "Domain, licenses and external hosting are separate costs unless expressly included in the proposal. Setup can be arranged as needed.",
        ),
    },
    {
        id: "time",
        q: l("Quanto tempo demora a entrega?", "How long does delivery take?"),
        a: l(
            "O prazo é definido na proposta e depende do escopo, da disponibilidade e do recebimento dos materiais e acessos necessários.",
            "The proposal defines the timeline based on scope, availability and receipt of the necessary materials and access.",
        ),
    },
    {
        id: "extra",
        q: l(
            "Posso solicitar funcionalidades adicionais?",
            "Can I request additional features?",
        ),
        a: l(
            "Sim. A viabilidade e o custo são avaliados antes da execução. Recursos já incluídos no escopo não são cobrados novamente.",
            "Yes. Feasibility and cost are assessed before work starts. Features already included in the scope are not charged twice.",
        ),
    },
    {
        id: "platforms",
        q: l(
            "Você trabalha com WordPress ou Wix?",
            "Do you work with WordPress or Wix?",
        ),
        a: l(
            "Manutenção, migração ou modernização nessas plataformas depende de avaliação técnica do site, dos acessos e das limitações da plataforma. Não são anunciadas como especializações.",
            "Maintenance, migration or modernization on these platforms requires a technical assessment of the site, access and platform limitations. They are not advertised as specializations.",
        ),
    },
    {
        id: "support",
        q: l(
            "Posso contratar somente consultoria ou suporte?",
            "Can I book consulting or support only?",
        ),
        a: l(
            "Sim. Há serviços avulsos, agendados e com escopo definido, sem necessidade de contratar um site.",
            "Yes. One-off services are scheduled and scoped independently; no website purchase is required.",
        ),
    },
    {
        id: "remote",
        q: l(
            "Os atendimentos são remotos?",
            "Are services delivered remotely?",
        ),
        a: l(
            "Sim. A oferta é voltada ao atendimento remoto com acesso autorizado e combinado previamente. Não há plantão ou suporte contínuo.",
            "Yes. Services are remote, with authorized access agreed in advance. Emergency or continuous support is not offered.",
        ),
    },
    {
        id: "payment",
        q: l("Como funciona o pagamento?", "How does payment work?"),
        a: l(
            "A condição padrão está indicada junto aos planos: entrada na contratação e saldo após aprovação, antes da publicação definitiva. A proposta formaliza as condições aplicáveis.",
            "Standard terms are shown with the plans: a deposit upon agreement and the balance after approval, before final publication. The proposal formalizes the applicable terms.",
        ),
    },
    {
        id: "delivery",
        q: l(
            "O que acontece depois da entrega?",
            "What happens after delivery?",
        ),
        a: l(
            "A entrega inclui a validação e as orientações previstas na proposta. Novos pedidos, manutenção e atividades fora do escopo são avaliados separadamente.",
            "Delivery includes the validation and guidance agreed in the proposal. New requests, maintenance and out-of-scope work are assessed separately.",
        ),
    },
    {
        id: "referral",
        q: l(
            "Como funciona o programa de indicações?",
            "How does the referral program work?",
        ),
        a: l(
            "A indicação deve ser identificada antes da contratação. Benefícios dependem de contratação e pagamento integral, do regulamento e do acordo aplicável. Não há pagamento automático nem acúmulo de crédito e comissão.",
            "Referrals must be identified before contracting. Benefits require a completed contract and full payment, under the applicable rules and agreement. There are no automatic payments or combined credit and commission.",
        ),
    },
    {
        id: "maintenance",
        q: l(
            "É possível contratar manutenção mensal?",
            "Can I arrange monthly maintenance?",
        ),
        a: l(
            "Sim, por contrato separado com franquia de horas, atividades incluídas e prazos de atendimento definidos. Não significa disponibilidade ilimitada.",
            "Yes, under a separate contract defining included hours, activities and response times. It does not imply unlimited availability.",
        ),
    },
    {
        id: "custom",
        q: l(
            "Posso solicitar uma solução personalizada?",
            "Can I request a custom solution?",
        ),
        a: l(
            "Sim. A proposta depende de análise de viabilidade, documentação, permissões e escopo. Acesso a sistemas de terceiros exige autorização.",
            "Yes. The proposal depends on feasibility, documentation, permissions and scope. Third-party system access requires authorization.",
        ),
    },
    {
        id: "revisions",
        q: l("Como funcionam as revisões?", "How do revisions work?"),
        a: l(
            "Cada plano informa as revisões previstas; no Premium elas são definidas em contrato. Pedidos fora do escopo e revisões adicionais são avaliados e cobrados separadamente.",
            "Each plan specifies its revisions; Premium revisions are defined in the agreement. Out-of-scope requests and additional revisions are assessed and charged separately.",
        ),
    },
    {
        id: "email-alignment",
        q: l(
            "Como solicito e negocio um orçamento?",
            "How do I request and discuss a quote?",
        ),
        a: l(
            "Escolha os serviços na página de orçamento e descreva sua necessidade. Sites personalizados e demandas de TI fora do catálogo são avaliados individualmente por e-mail. Sem envio configurado, a página prepara um rascunho que você precisa enviar pelo seu aplicativo de e-mail. A solicitação não gera contratação automática.",
            "Choose services on the quote page and describe your needs. Custom websites and IT requests outside the catalog are assessed individually by email. When submission is not configured, the page prepares a draft you must send from your email application. A request does not create a contract.",
        ),
    },
];
const pt = {
    eyebrow: "GCRUZ · Desenvolvimento, consultoria e soluções de TI",
    title: "Soluções digitais para fazer seu negócio evoluir.",
    intro: "Desenvolvimento de sites, consultoria de TI, suporte técnico e soluções personalizadas para pequenas empresas e profissionais que precisam de tecnologia funcional e confiável.",
    quote: "Solicitar orçamento",
    explore: "Conhecer serviços",
    qualities: [
        "Atendimento direto comigo",
        "Escopo definido",
        "Execução remota",
    ],
    visualLabel: "Tecnologia aplicada a problemas reais",
    visualTitle: "Uma necessidade. Um caminho claro.",
    visualText:
        "Entender o problema, definir a solução e entregar com cuidado técnico. Sem complexidade que o seu negócio não precisa.",
    nav: "Navegação de serviços",
    navLabels: [
        "Serviços",
        "Planos web",
        "Avulsos",
        "Simular",
        "Indicações",
        "Orçamento",
    ],
    titles: [
        "Tecnologia para diferentes momentos do seu negócio",
        "Desenvolvimento web, com escopo claro",
        "Consultoria e serviços avulsos de TI",
        "Soluções empresariais",
        "Personalize sua solução",
        "Projetos e experiência",
        "Indique & Ganhe e parcerias",
        "Como funciona a contratação",
        "Perguntas frequentes",
        "Vamos entender sua necessidade",
        "Seu próximo passo começa com uma conversa.",
    ],
    catalogIntro:
        "Uma operação independente, com comunicação direta. Escolha uma necessidade para conhecer as possibilidades e os limites de atuação.",
    examples: "Exemplos e limites",
    choose: "Selecionar",
    from: "A partir de",
    perHour: "/h",
    perMonth: "/mês",
    onQuote: "Sob consulta",
    recommended: "Recomendado",
    webIntro:
        "Três pontos de partida. Todos os valores dependem da confirmação de escopo na proposta.",
    webAudience: [
        "Uma presença digital objetiva.",
        "Apresentar serviços e captar contatos.",
        "Uma estrutura mais completa, sob avaliação.",
    ],
    payment:
        "na contratação; o saldo após aprovação, antes da publicação definitiva.",
    excluded:
        "Domínio, licenças, hospedagem externa, textos extensos e recursos avançados não previstos estão fora do preço. Prazos são definidos na proposta; alterações fora do escopo são cobradas separadamente. Não há revisões ilimitadas.",
    serviceNote:
        "Valores iniciais para serviços remotos de escopo definido. O orçamento final depende da complexidade e dos requisitos identificados.",
    groups: [
        "Consultoria e suporte",
        "Dados e desenvolvimento",
        "Sistemas empresariais",
        "Treinamento",
    ],
    packageNote:
        "A execução depende de viabilidade, permissões, licenças e informações fornecidas. Resultados de sistemas externos não são garantidos.",
    addonGroups: ["Adicionais para sites", "Serviços técnicos complementares"],
    maintenance:
        "Manutenção exige contrato com franquia de horas, atividades e prazos de atendimento. Analytics depende da avaliação de privacidade e consentimento aplicável. Nada é ativado automaticamente.",
    simulator: "Monte uma estimativa",
    simulatorIntro:
        "Escolha um serviço principal e apenas os adicionais compatíveis. O resumo segue com você para o formulário.",
    mainService: "Serviço principal",
    hours: "Quantidade de horas",
    addons: "Adicionais compatíveis",
    noAddons:
        "Não há adicionais disponíveis para esta seleção. Recursos já incluídos ou dependentes de avaliação não são cobrados novamente aqui.",
    subtotal: "Subtotal pontual estimado",
    monthly: "Manutenção mensal estimada, separada",
    estimateNote:
        "Estimativa inicial, sem descontos automáticos. Não é orçamento definitivo nem contratação. A proposta confirma escopo, quantidades e valores.",
    summary: "Resumo da solicitação",
    emptySelection: "Selecione um serviço para estimar.",
    proposal: "Solicitar proposta com esta seleção",
    included: "Escopo incluído",
    noSelection: "Nenhum serviço selecionado",
    none: "Sem adicionais",
    viewProject: "Conhecer projeto",
    projectType: "Projeto pessoal / acadêmico",
    experience: "Experiência que orienta a entrega",
    experienceText:
        "Minha experiência em suporte a sistemas empresariais inclui análise de erros, arquivos CNAB, rotinas financeiras e de faturamento, além de treinamento de usuários. Aplico essa base à compreensão de problemas e à comunicação técnica, respeitando autorizações e confidencialidade.",
    projectNote:
        "Os projetos abaixo demonstram prática técnica. Não são apresentados como trabalhos contratados por clientes.",
    referralTitle: "Indique meus serviços e ganhe benefícios.",
    referralIntro:
        "Você pode apresentar a GCRUZ a quem precisa de tecnologia. A indicação é avaliada e acompanhada por contato direto.",
    customer: "Créditos para clientes",
    customerText:
        "Após contratação e pagamento integral, a indicação pode gerar crédito para serviços futuros, conforme regulamento.",
    serviceValue: "Valor do serviço",
    credit: "Crédito",
    above: "A partir de",
    partner: "Parcerias comerciais",
    partnerText:
        "Para escritórios de contabilidade, agências, designers, profissionais de marketing, consultores e outros parceiros aprovados.",
    commission:
        "sobre o valor líquido comercial elegível contratado e efetivamente recebido, conforme acordo. Impostos e despesas de terceiros ficam fora da base, salvo previsão contratual.",
    referCta: "Quero indicar um cliente",
    partnerCta: "Quero ser parceiro",
    rulesTitle: "Condições do programa",
    rules: [
        "Identifique a indicação antes da contratação. Autoindicação não é permitida.",
        "Contratos cancelados ou não recebidos não geram comissão. Créditos exigem pagamento integral.",
        "Não é permitido acumular crédito e comissão pela mesma indicação.",
        "Não compartilhe dados pessoais de terceiros sem autorização. Você pode solicitar primeiro uma apresentação consentida.",
        "Não há pagamento automático. As condições completas dependem do regulamento e do acordo aplicável.",
    ],
    steps: [
        {
            title: "Entendimento",
            text: "Você descreve a necessidade e o contexto do negócio.",
        },
        {
            title: "Diagnóstico e proposta",
            text: "Avalio escopo, viabilidade, preço, prazo e acessos necessários.",
        },
        {
            title: "Desenvolvimento ou atendimento",
            text: "Executo o trabalho conforme as condições aprovadas.",
        },
        {
            title: "Validação e entrega",
            text: "Realizamos testes, revisão prevista e orientações finais.",
        },
    ],
    timing: "Não há prazo universal. A proposta considera escopo, disponibilidade e recebimento de materiais e acessos.",
    contactIntro:
        "Preencha apenas o necessário para iniciar a conversa. O resumo do simulador acompanha a solicitação, sem exigir cadastro.",
    email: "Conversar por e-mail",
    whatsapp: "Conversar pelo WhatsApp",
    finalText:
        "Conte o problema que você quer resolver. Eu avalio a viabilidade e preparo uma proposta com limites claros.",
    interests: {
        quote: "Orçamento",
        referral: "Indicação",
        partner: "Parceria",
    },
    interest: "Tipo de interesse",
    fields: {
        name: "Nome",
        email: "E-mail",
        phone: "WhatsApp",
        company: "Empresa ou negócio",
        deadline: "Prazo desejado",
        message: "Descrição da necessidade",
    },
    referralMessage: "Descreva a indicação sem dados pessoais de terceiros",
    partnerMessage: "Conte sobre sua atuação e a parceria desejada",
    optional: "opcional",
    select: "Selecione",
    required: "Preencha este campo.",
    invalidEmail: "Informe um e-mail válido.",
    shortMessage: "Descreva sua necessidade em pelo menos 10 caracteres.",
    consent:
        "Li o aviso de privacidade e concordo com o uso dos dados fornecidos para avaliar e responder a esta solicitação.",
    consentError: "Confirme a leitura e o aceite de privacidade.",
    submit: "Enviar solicitação",
    prepare: "Preparar e-mail",
    sending: "Enviando…",
    success:
        "Solicitação recebida pelo Formspree. Isso confirma o recebimento pelo serviço, não a leitura ou entrega na caixa de e-mail.",
    error: "Não foi possível confirmar o recebimento. Seus dados continuam no formulário. Tente novamente ou utilize o e-mail abaixo.",
    fallback:
        "O contato será enviado pelo seu aplicativo de e-mail. Prepare a mensagem, revise e confirme o envio no aplicativo. Nada é enviado automaticamente.",
    ready: "Mensagem preparada, ainda não enviada. Abra seu e-mail para concluir ou copie a mensagem para seu webmail.",
    openEmail: "Abrir aplicativo de e-mail",
    copy: "Copiar mensagem",
    copied: "Mensagem copiada. Envie para",
    copyError:
        "Não foi possível copiar automaticamente. Selecione e copie a mensagem abaixo.",
    privacy:
        "Guilherme Cruz utiliza os dados para avaliar e responder à sua solicitação. Não são gravados no armazenamento do navegador nem enviados a analytics. Para informações ou solicitações sobre seus dados, escreva para",
    emailPrivacy:
        "No envio por e-mail, os dados passam pelo seu provedor e pelo serviço do destinatário, após sua confirmação.",
    providerPrivacy:
        "O envio direto é processado pelo Formspree. Tratamento e retenção seguem as condições desse serviço.",
    providerPolicy: "Privacidade do Formspree",
    subject: "Contato comercial GCRUZ",
    skip: "Ir para o conteúdo principal",
};
const en: typeof pt = {
    eyebrow: "GCRUZ · Development, consulting & IT solutions",
    title: "Digital solutions to help your business move forward.",
    intro: "Websites, IT consulting, technical support and custom solutions for small businesses and professionals who need reliable, functional technology.",
    quote: "Request a quote",
    explore: "Explore services",
    qualities: ["Work directly with me", "Defined scope", "Remote delivery"],
    visualLabel: "Technology for real problems",
    visualTitle: "One need. A clear way forward.",
    visualText:
        "Understand the problem, define a solution and deliver with technical care. Without complexity your business does not need.",
    nav: "Service navigation",
    navLabels: [
        "Services",
        "Web plans",
        "One-off services",
        "Estimate",
        "Referrals",
        "Quote",
    ],
    titles: [
        "Technology for different stages of your business",
        "Web development with a clear scope",
        "IT consulting and one-off services",
        "Business solutions",
        "Customize your solution",
        "Projects and experience",
        "Referrals & partnerships",
        "How the process works",
        "Frequently asked questions",
        "Let's understand your needs",
        "Your next step starts with a conversation.",
    ],
    catalogIntro:
        "An independent professional with direct communication. Choose a need to explore possibilities and boundaries.",
    examples: "Examples and boundaries",
    choose: "Select",
    from: "Starting at",
    perHour: "/hour",
    perMonth: "/month",
    onQuote: "Custom quote",
    recommended: "Recommended",
    webIntro:
        "Three starting points. All prices require scope confirmation in the proposal.",
    webAudience: [
        "A focused online presence.",
        "Present services and capture inquiries.",
        "A more complete structure, subject to assessment.",
    ],
    payment:
        "upon agreement; the balance after approval, before final publication.",
    excluded:
        "Domain, licenses, external hosting, extensive copywriting and unspecified advanced features are excluded. Timelines are agreed in the proposal; out-of-scope changes are quoted separately. Unlimited revisions are not included.",
    serviceNote:
        "Starting prices for remote services with a defined scope. The final quote depends on complexity and identified requirements.",
    groups: [
        "Consulting and support",
        "Data and development",
        "Business systems",
        "Training",
    ],
    packageNote:
        "Delivery depends on feasibility, permissions, licenses and supplied information. Outcomes involving external systems are not guaranteed.",
    addonGroups: ["Website add-ons", "Additional technical services"],
    maintenance:
        "Maintenance requires a contract defining included hours, activities and response times. Analytics requires assessment of applicable privacy and consent needs. Nothing is activated automatically.",
    simulator: "Build an estimate",
    simulatorIntro:
        "Choose a main service and compatible add-ons. Your selections follow you into the contact form.",
    mainService: "Main service",
    hours: "Number of hours",
    addons: "Compatible add-ons",
    noAddons:
        "No add-ons are available for this selection. Included features or items requiring assessment are not charged again here.",
    subtotal: "Estimated one-time subtotal",
    monthly: "Estimated monthly maintenance, separate",
    estimateNote:
        "A starting estimate, without automatic discounts. This is not a final quote or a contract. The proposal confirms scope, quantities and prices.",
    summary: "Request summary",
    emptySelection: "Select a service to estimate.",
    proposal: "Request proposal with these selections",
    included: "Included scope",
    noSelection: "No service selected",
    none: "No add-ons",
    viewProject: "Explore project",
    projectType: "Personal / academic project",
    experience: "Experience that informs delivery",
    experienceText:
        "My experience supporting business systems includes error analysis, CNAB files, finance and billing routines, and user training. I apply this foundation to understanding problems and communicating technical details while respecting authorization and confidentiality.",
    projectNote:
        "The projects below demonstrate technical practice. They are not presented as commissioned client work.",
    referralTitle: "Refer my services and earn benefits.",
    referralIntro:
        "Introduce GCRUZ to someone who needs technology. Referrals are assessed and followed up through direct contact.",
    customer: "Credits for clients",
    customerText:
        "Once a contract is completed and fully paid, a referral may earn credit for future services under the program rules.",
    serviceValue: "Service value",
    credit: "Credit",
    above: "From",
    partner: "Business partnerships",
    partnerText:
        "For accounting firms, agencies, designers, marketing professionals, consultants and other approved partners.",
    commission:
        "of the eligible net commercial value contracted and actually received, according to the agreement. Taxes and third-party expenses are excluded unless expressly agreed.",
    referCta: "I want to refer a client",
    partnerCta: "I want to become a partner",
    rulesTitle: "Program conditions",
    rules: [
        "Identify referrals before contracting. Self-referrals are not allowed.",
        "Canceled or unpaid contracts do not generate commission. Credits require full payment.",
        "Credit and commission cannot be combined for the same referral.",
        "Do not share third-party personal data without permission. You can first request a consented introduction.",
        "Payments are not automatic. Full conditions depend on the applicable program rules and agreement.",
    ],
    steps: [
        {
            title: "Understanding",
            text: "Describe your needs and business context.",
        },
        {
            title: "Diagnosis and proposal",
            text: "I assess scope, feasibility, pricing, timeline and access requirements.",
        },
        {
            title: "Development or service",
            text: "I perform the work under the approved conditions.",
        },
        {
            title: "Validation and delivery",
            text: "We complete tests, agreed revisions and final guidance.",
        },
    ],
    timing: "There is no universal timeline. The proposal considers scope, availability and receipt of materials and access.",
    contactIntro:
        "Provide only what is needed to start a conversation. Your estimate summary accompanies the request without requiring an account.",
    email: "Get in touch by email",
    whatsapp: "Chat on WhatsApp",
    finalText:
        "Tell me which problem you want to solve. I assess feasibility and prepare a proposal with clear boundaries.",
    interests: { quote: "Quote", referral: "Referral", partner: "Partnership" },
    interest: "Type of inquiry",
    fields: {
        name: "Name",
        email: "Email",
        phone: "WhatsApp",
        company: "Company or business",
        deadline: "Preferred deadline",
        message: "Description of your needs",
    },
    referralMessage: "Describe the referral without third-party personal data",
    partnerMessage: "Tell me about your work and proposed partnership",
    optional: "optional",
    select: "Select",
    required: "Complete this field.",
    invalidEmail: "Enter a valid email address.",
    shortMessage: "Describe your needs in at least 10 characters.",
    consent:
        "I have read the privacy notice and agree to the use of the supplied information to assess and respond to this request.",
    consentError: "Confirm that you have read and accepted the privacy notice.",
    submit: "Send request",
    prepare: "Prepare email",
    sending: "Sending…",
    success:
        "Request received by Formspree. This confirms receipt by the service, not inbox delivery or reading.",
    error: "Receipt could not be confirmed. Your information remains in the form. Try again or use the email below.",
    fallback:
        "Your inquiry will be sent through your email app. Prepare the message, review it and confirm sending in the app. Nothing is sent automatically.",
    ready: "Message prepared, not sent yet. Open your email to finish or copy the message into your webmail.",
    openEmail: "Open email app",
    copy: "Copy message",
    copied: "Message copied. Send it to",
    copyError:
        "Could not copy automatically. Select and copy the message below.",
    privacy:
        "Guilherme Cruz uses these details to assess and respond to your inquiry. They are not saved in browser storage or sent to analytics. For information or requests about your data, email",
    emailPrivacy:
        "Email messages pass through your provider and the recipient's service after your confirmation.",
    providerPrivacy:
        "Direct submissions are processed by Formspree. Processing and retention follow that service's terms.",
    providerPolicy: "Formspree privacy",
    subject: "GCRUZ business inquiry",
    skip: "Skip to main content",
};
export const COPY: Localized<typeof pt> = { pt, en };

export const PROJECT_COPY = {
    codexAlt: l(
        "Interface do Codex — Code Validator",
        "Codex — Code Validator interface",
    ),
    codexDescription: l(
        "TCC voltado à qualidade de software, com análise estática, relatórios e histórico de análises. A apresentação técnica detalha a implementação atual.",
        "A software quality capstone with static analysis, reports and analysis history. The technical presentation details the current implementation.",
    ),
    chatDescription: l(
        "Aplicação em tempo real com Node.js, JavaScript e WebSocket. Demonstra comunicação entre frontend e backend.",
        "A real-time app with Node.js, JavaScript and WebSocket, demonstrating frontend and backend communication.",
    ),
};
