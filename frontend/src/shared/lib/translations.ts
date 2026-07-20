export type Lang = "pt" | "en";

export type TranslationKey =
    /* ── NAV ───────────────────────────────────────── */
    | "nav.home"
    | "nav.about"
    | "nav.career"
    | "nav.education"
    | "nav.featured"
    | "nav.work"
    | "nav.recommendations"
    | "nav.contact"

    /* ── HERO ──────────────────────────────────────── */
    | "hero.greeting"
    | "hero.role"
    | "hero.sub"
    | "hero.desc"
    | "hero.status"
    | "hero.cta.work"
    | "hero.cta.cv"
    | "hero.badge"
    | "hero.scroll"

    /* ── ABOUT ─────────────────────────────────────── */
    | "about.title"
    | "about.bio.p1"
    | "about.bio.p2"
    | "about.bio.p3"
    | "about.bio.p4"
    | "about.goal.title"
    | "about.goal.text"

    /* ── TIMELINE (Carreira) ───────────────────────── */
    | "timeline.title"
    | "timeline.sub"
    | "timeline.eyebrow"
    | "timeline.exp.title"

    /* ── CAREER (cards e modal de posição) ─────────── */
    | "career.visit"
    | "career.positions"
    | "career.openDetails"
    | "career.activities"
    | "career.skills"
    | "career.company"
    | "career.modalOpened"
    | "career.fact.employment"
    | "career.fact.duration"
    | "career.fact.modality"
    | "career.fact.location"
    | "career.fact.period"
    | "career.summary"
    | "career.close"
    | "career.present"
    | "career.highlights"
    | "career.about"
    | "career.stats.experience"
    | "career.stats.company"
    | "career.stats.companies"
    | "career.stats.role"
    | "career.stats.roles"
    | "career.promoted"
    | "career.status.active"
    | "career.status.done"
    | "career.aside.label"
    | "career.aside.overview"
    | "career.aside.level"
    | "career.aside.seniority"

    /* ── EDUCATION (Formações) ─────────────────────── */
    | "education.title"
    | "education.sub"
    | "education.eyebrow"
    | "education.edu.title"
    | "education.cert.title"
    | "education.cert.link"
    | "education.edu.label"
    | "education.cert.label"
    | "education.achievements"
    | "education.filterLabel"
    | "education.filter.all"
    | "education.filter.edu"
    | "education.filter.cert"
    | "education.showMore"
    | "education.showLess"
    | "education.status.active"
    | "education.status.done"
    | "education.tech.label"
    | "education.skills.label"
    | "education.progress"
    | "about.bio"
    | "about.goal.body"
    | "about.specs.title"
    | "contact.cta.heading"
    | "contact.cta.lead"

    /* ── FEATURED ──────────────────────────────────── */
    | "featured.badge"
    | "featured.eyebrow"
    | "featured.desc"
    | "featured.btn.live"
    | "featured.btn.repo"
    | "featured.btn.docs"
    | "featured.gallery.label"
    | "featured.autoplay.play"
    | "featured.autoplay.pause"
    | "featured.arrow.prev"
    | "featured.arrow.next"
    | "featured.block.tech"
    | "featured.block.endpoints"
    | "featured.endpoint.protected"
    | "featured.lightbox.open"
    | "featured.lightbox.close"
    | "featured.lightbox.thumbnails"
    | "featured.thumbs.label"

    /* ── DETAILS ───────────────────────────────────── */
    | "detail.challenge"
    | "detail.solution"
    | "detail.result"

    /* ── WORK ──────────────────────────────────────── */
    | "work.title"
    | "work.sub"
    | "work.more"
    | "work.eyebrow"
    | "work.btn.demo"
    | "work.btn.repo"
    | "work.preview"
    | "work.block.stack"

    /* ── CONTACT ───────────────────────────────────── */
    | "contact.title"
    | "contact.sub"
    | "contact.hook"
    | "contact.share"
    | "contact.send"
    | "contact.sending"
    | "contact.sent"
    | "contact.cta.primary"
    | "contact.cta.sending"
    | "contact.cta.success"
    | "contact.cta.error"
    | "contact.meta.response"
    | "contact.meta.linkedin"
    | "contact.meta.github"
    | "contact.meta.location"

    /* ── RECOMMENDATIONS ───────────────────────────── */
    | "rec.title"
    | "rec.sub"
    | "rec.eyebrow"
    | "rec.count.one"
    | "rec.count.many"
    | "rec.source.text"
    | "rec.source.label"

    /* ── FOOTER ────────────────────────────────────── */
    | "footer.tagline"
    | "footer.nav"
    | "footer.projects"
    | "footer.contact"
    | "footer.location"
    | "footer.made"
    | "footer.coffee"
    | "footer.rights";

export type Translations = Record<TranslationKey, string>;

/* ═══════════════════════════════════════════════════
   🇧🇷 PORTUGUÊS
═══════════════════════════════════════════════════ */

const pt: Translations = {
    /* NAV */
    "nav.home": "Início",
    "nav.about": "Sobre",
    "nav.career": "Carreira",
    "nav.education": "Formações",
    "nav.featured": "Destaque",
    "nav.work": "Projetos",
    "nav.recommendations": "Recomendações",
    "nav.contact": "Contato",

    /* HERO */
    "hero.greeting": "Olá, eu sou",
    "hero.role": "Desenvolvedor Júnior",
    "hero.sub": "Desenvolvimento Web",
    "hero.desc":
        "Cursando Ciência da Computação, com experiência prática em **frontend**, **backend** e **deploy contínuo**. Atuo principalmente com **React**, **TypeScript**, **Node.js** e **APIs REST**, além de bancos de dados como **MySQL** e **Oracle**, e linguagens como **Java**, **Python** e **PHP**.\n\nAplico boas práticas como **Clean Code** e **Git** para desenvolver soluções eficientes, organizadas e de fácil manutenção. Busco uma oportunidade para contribuir com projetos reais, evoluir tecnicamente e gerar valor para o time.",
    "hero.status": "Disponível para oportunidades",
    "hero.cta.work": "Ver projetos",
    "hero.cta.cv": "Download CV",
    "hero.badge": "Em transição para desenvolvimento",
    "hero.scroll": "Explorar",

    /* ABOUT */
    "about.title": "Sobre Mim",
    "about.bio.p1":
        "Sou Guilherme Cruz, estudante de Ciência da Computação com formação técnica em Desenvolvimento de Sistemas. Possuo base sólida em lógica de programação, estruturas de dados e fundamentos de software.",
    "about.bio.p2":
        "Tenho experiência prática no desenvolvimento de aplicações web utilizando React, JavaScript/TypeScript, Node.js e MySQL, com foco em interfaces modernas, responsivas e integração com APIs.",
    "about.bio.p3":
        "Aplico boas práticas como código limpo, organização de projetos e versionamento com Git, desenvolvendo soluções eficientes, escaláveis e de fácil manutenção.",
    "about.bio.p4":
        "Busco minha primeira oportunidade como Desenvolvedor Júnior ou Estagiário, onde eu possa evoluir tecnicamente, atuar em projetos reais e contribuir com o time.",
    "about.goal.title": "Objetivo Profissional",
    "about.goal.text":
        "Atuar como desenvolvedor júnior ou estagiário, contribuindo com projetos reais, evoluindo minhas habilidades técnicas e adquirindo experiência prática no mercado.",

    /* TIMELINE (Carreira) */
    "timeline.title": "Carreira",
    "timeline.sub":
        "Minha trajetória profissional é marcada pelo desenvolvimento contínuo, experiência prática em tecnologia e atuação na resolução de problemas. Possuo vivência com análise de sistemas, suporte técnico, processos de negócio e investigação de incidentes, sempre buscando soluções eficientes, melhoria contínua e evolução profissional por meio de novos conhecimentos e desafios.",
    "timeline.eyebrow": "Profissional",
    "timeline.exp.title": "Experiência Profissional",

    /* CAREER — cards e modal */
    "career.visit": "Visitar empresa",
    "career.positions": "Posições na empresa",
    "career.openDetails": "Ver detalhes da posição",
    "career.activities": "Atividades",
    "career.skills": "Competências",
    "career.company": "Empresa",
    "career.modalOpened": "Modal aberto: descrição completa da posição",
    "career.fact.employment": "Vínculo",
    "career.fact.duration": "Duração",
    "career.fact.modality": "Modalidade",
    "career.fact.location": "Localização",
    "career.fact.period": "Período",
    "career.summary": "Resumo",
    "career.close": "Fechar modal",
    "career.present": "o momento",
    "career.highlights": "Destaques",
    "career.about": "Sobre a posição",
    "career.stats.experience": "Experiência",
    "career.stats.company": "Empresa",
    "career.stats.companies": "Empresas",
    "career.stats.role": "Cargo",
    "career.stats.roles": "Cargos",
    "career.promoted": "Efetivado",
    "career.status.active": "Atual",
    "career.status.done": "Concluído",
    "career.aside.label": "Painel profissional",
    "career.aside.overview": "Visão geral",
    "career.aside.level": "Nível",
    "career.aside.seniority": "Júnior",

    /* EDUCATION (Formações) */
    "education.title": "Formações",
    "education.sub":
        "Confira minhas formações acadêmicas e profissionais, incluindo graduação em Ciência da Computação e técnico em Desenvolvimento de Sistemas. Busco aprimoramento contínuo por meio de cursos e certificações em áreas como cibersegurança, desenvolvimento de software, modelagem de dados e qualidade de software, mantendo meus conhecimentos atualizados e evoluindo constantemente.",
    "education.eyebrow": "Acadêmico",
    "education.edu.title": "Formação Acadêmica",
    "education.cert.title": "Certificações",
    "education.cert.link": "Ver certificado",
    "education.edu.label": "Graduação",
    "education.cert.label": "Certificação",
    "education.achievements": "conquistas",
    "education.filterLabel": "Filtrar formações",
    "education.filter.all": "Tudo",
    "education.filter.edu": "Acadêmico",
    "education.filter.cert": "Certificações",
    "education.showMore": "Ver mais",
    "education.showLess": "Ver menos",
    "education.status.active": "Em andamento",
    "education.status.done": "Concluído",
    "education.tech.label": "Tecnologias",
    "education.skills.label": "Competências",
    "education.progress": "concluído",
    "about.bio":
        "Sou Guilherme Cruz, **Desenvolvedor Júnior** em transição de carreira, hoje atuando como **Analista de Suporte Técnico (Helpdesk)** na Wise System. Fui efetivado de estágio a CLT em menos de um ano, dando suporte a um **ERP financeiro** em produção: análise de causa raiz de incidentes, arquivos bancários **CNAB**, conciliação bancária e homologação de notas fiscais. É vivência real de sistema em produção, não só teoria de sala de aula.\n\nDo lado do desenvolvimento, domino **JavaScript**, **TypeScript**, **Java**, **Python** e **PHP**, com foco em **front-end** (**React**, **React**, **Vite**, **HTML5**, **CSS3**, SPA e design responsivo) e **back-end** (**Node.js**, **APIs REST/RESTful**, **WebSocket**, **autenticação JWT**, **POO**). Trabalho com **MySQL** e **Oracle**, modelagem de banco de dados relacional, e uso **Git**, **GitHub** e **CI/CD** com deploy contínuo em **Vercel** e **Render**.\n\nAplico **metodologias ágeis (Scrum/Kanban)**, **Clean Code**, testes de software e boas práticas de **qualidade de software**. Tenho perfil **analítico** e **investigativo**, aprendo rápido, colaboro bem em equipe e busco minha próxima oportunidade como **Desenvolvedor** para aplicar essa base técnica em projetos reais, com autonomia crescente.",
    "about.goal.body":
        "Busco minha primeira oportunidade como **Desenvolvedor Júnior** ou **Estagiário em Desenvolvimento**, para aplicar na prática o que venho construindo com **React**, **Node.js**, **TypeScript**, **APIs REST** e **autenticação JWT**, além da experiência com **Java**, **Python** e **PHP**. Um inglês intermediário me ajuda a acompanhar documentação técnica e times internacionais, e trago também a vivência real de sistemas em produção do suporte a um **ERP financeiro**. Quero evoluir tecnicamente, atuar em projetos reais e contribuir ativamente com o time.\n\nTenho interesse em **arquitetura de software**, **segurança da informação** e **testes de software**, e busco crescer usando **metodologias ágeis (Scrum/Kanban)**, **CI/CD** e boas práticas de **Clean Code**, em um ambiente que valorize aprendizado contínuo, resolução de problemas e entrega de qualidade.",
    "about.specs.title": "Áreas de especialização",
    "contact.cta.heading": "Vamos **construir algo** juntos?",
    "contact.cta.lead":
        "Estou pronto para iniciar minha trajetória como **Desenvolvedor Júnior** ou **Estagiário**, contribuindo com **aplicações modernas**, **bem estruturadas** e voltadas para **performance** e **experiência do usuário**. Também estou disponível para **projetos avulsos** e **freelances**.\n\nSe você procura alguém **dedicado**, com **vontade de evoluir** e prontidão para **contribuir de forma prática em projetos reais**, me chama, vamos conversar e construir **soluções juntos**!",

    /* FEATURED */
    "featured.eyebrow": "Destaque",
    "featured.badge": "Projeto em Destaque",
    "featured.desc":
        "Projeto web com foco em usabilidade, performance e boas práticas de desenvolvimento.",
    "featured.btn.live": "Ver demo",
    "featured.btn.repo": "Repositório",
    "featured.btn.docs": "Swagger Docs",
    "featured.gallery.label": "Capturas do projeto",
    "featured.autoplay.play": "Iniciar autoplay",
    "featured.autoplay.pause": "Pausar autoplay",
    "featured.arrow.prev": "Slide anterior",
    "featured.arrow.next": "Próximo slide",
    "featured.block.tech": "Stack",
    "featured.block.endpoints": "Endpoints da API",
    "featured.endpoint.protected": "Rota protegida (requer Bearer Token)",
    "featured.lightbox.open": "Ampliar",
    "featured.lightbox.close": "Fechar visualização",
    "featured.lightbox.thumbnails": "Miniaturas dos slides",
    "featured.thumbs.label": "Navegação por miniaturas",

    /* DETAILS */
    "detail.challenge": "Desafio",
    "detail.solution": "Solução",
    "detail.result": "Resultado",

    /* WORK */
    "work.title": "Projetos",
    "work.sub":
        "Projetos desenvolvidos do zero, abrangendo desde o planejamento e arquitetura até a implantação em produção. Utilizam tecnologias como React, TypeScript, Node.js e Python/FastAPI para a construção de interfaces modernas, APIs REST, autenticação JWT, aplicações em tempo real com WebSocket e integração entre serviços. Todos os projetos seguem boas práticas de desenvolvimento, versionamento com Git e deploy contínuo em ambientes de produção.",
    "work.more": "Ver todos no GitHub",
    "work.eyebrow": "Portfólio",
    "work.btn.demo": "Acessar projeto",
    "work.btn.repo": "Repositório",
    "work.preview": "Prévia",
    "work.block.stack": "Stack",

    /* CONTACT */
    "contact.title": "Vamos trabalhar juntos",
    "contact.sub":
        "Desenvolvedor em início de carreira, com base sólida em programação e engenharia de software. Busco minha primeira oportunidade para contribuir com projetos reais e evoluir continuamente como profissional de tecnologia.",
    "contact.hook": "Tem uma ideia ou oportunidade? Vamos conversar!",
    "contact.share": "Conecte-se comigo através das plataformas abaixo:",
    "contact.send": "Enviar mensagem",
    "contact.sending": "Enviando...",
    "contact.sent": "Mensagem enviada!",
    "contact.cta.primary": "Iniciar conversa",
    "contact.cta.sending": "Enviando mensagem...",
    "contact.cta.success": "Mensagem enviada com sucesso!",
    "contact.cta.error": "Erro ao enviar. Por favor, tente novamente.",
    "contact.meta.response": "Respondo em até 24h",
    "contact.meta.linkedin": "Aberto a networking e novas oportunidades",
    "contact.meta.github": "Projetos reais com código limpo e organizado",
    "contact.meta.location": "Disponível para trabalho remoto ou presencial",

    /* RECOMMENDATIONS */
    "rec.title": "Recomendações",
    "rec.sub":
        "Depoimentos de colegas, gestores e profissionais com quem trabalhei ao longo da minha trajetória, destacando aspectos como comprometimento, postura investigativa, capacidade de resolver problemas, colaboração em equipe e responsabilidade no desenvolvimento e suporte de soluções. São recomendações reais, publicadas no LinkedIn, que refletem experiências práticas e a confiança construída em diferentes contextos profissionais.",
    "rec.eyebrow": "Depoimentos",
    "rec.count.one": "recomendação",
    "rec.count.many": "recomendações",
    "rec.source.text": "Via LinkedIn",
    "rec.source.label": "Ver recomendações no LinkedIn",

    /* FOOTER */
    "footer.tagline":
        "Desenvolvedor Júnior em transição, com prática real em React, Node.js e sistemas em produção.",
    "footer.nav": "Navegação",
    "footer.projects": "Projetos",
    "footer.contact": "Contato",
    "footer.location": "São Paulo, Brasil",
    "footer.made": "Feito com",
    "footer.coffee": "e muito café",
    "footer.rights": "Todos os direitos reservados.",
};

/* ═══════════════════════════════════════════════════
   🇺🇸 ENGLISH
   (revised to match the Portuguese content faithfully)
═══════════════════════════════════════════════════ */

const en: Translations = {
    /* NAV */
    "nav.home": "Home",
    "nav.about": "About",
    "nav.career": "Career",
    "nav.education": "Education",
    "nav.featured": "Featured",
    "nav.work": "Projects",
    "nav.recommendations": "Recommendations",
    "nav.contact": "Contact",

    /* HERO */
    "hero.greeting": "Hi, I'm",
    "hero.role": "Junior Developer",
    "hero.sub": "Web Development",
    "hero.desc":
        "Computer Science student transitioning into development, currently working as a **Technical Support Analyst** at **Wise System**, promoted from intern to full-time employee in under a year. I move comfortably between **frontend** and **backend**, with hands-on experience in **React**, **TypeScript**, **Node.js** and **REST APIs**, plus **Java**, **Python** and **PHP**.\n\nI apply **Clean Code**, **Git** and intermediate English in my day to day, always aiming to solve problems at the root instead of just working around them. My next step is moving from supporting the system to building it.",
    "hero.status": "Open to opportunities",
    "hero.cta.work": "View projects",
    "hero.cta.cv": "Download CV",
    "hero.badge": "Transitioning into development",
    "hero.scroll": "Explore",

    /* ABOUT */
    "about.title": "About Me",
    "about.bio.p1":
        "I'm Guilherme Cruz, a Computer Science student with a technical background in Systems Development. I have a solid foundation in programming logic, data structures and software fundamentals.",
    "about.bio.p2":
        "I have hands-on experience building web applications using React, JavaScript/TypeScript, Node.js and MySQL, focusing on modern, responsive interfaces and API integration.",
    "about.bio.p3":
        "I apply best practices such as clean code, project organization and Git version control, aiming to build efficient, scalable and maintainable solutions.",
    "about.bio.p4":
        "I am seeking my first opportunity as a Junior Developer or Intern, where I can grow technically, work on real projects and contribute to the team.",
    "about.goal.title": "Professional Goal",
    "about.goal.text":
        "To work as a junior developer or intern, contributing to real projects, improving my technical skills and gaining industry experience.",

    /* TIMELINE (Career) */
    "timeline.title": "Career",
    "timeline.sub":
        "My professional journey is marked by continuous development, hands-on experience with technology and a focus on problem-solving. I have experience with systems analysis, technical support, business processes and incident investigation, always looking for efficient solutions, continuous improvement and professional growth through new knowledge and challenges.",
    "timeline.eyebrow": "Career",
    "timeline.exp.title": "Professional Experience",

    /* CAREER — cards and modal */
    "career.visit": "Visit company",
    "career.positions": "Positions at company",
    "career.openDetails": "View position details",
    "career.activities": "Responsibilities",
    "career.skills": "Skills",
    "career.company": "Company",
    "career.modalOpened": "Modal opened: full position description",
    "career.fact.employment": "Employment",
    "career.fact.duration": "Duration",
    "career.fact.modality": "Mode",
    "career.fact.location": "Location",
    "career.fact.period": "Period",
    "career.summary": "Overview",
    "career.close": "Close modal",
    "career.present": "Present",
    "career.highlights": "Highlights",
    "career.about": "About this role",
    "career.stats.experience": "Experience",
    "career.stats.company": "Company",
    "career.stats.companies": "Companies",
    "career.stats.role": "Role",
    "career.stats.roles": "Roles",
    "career.promoted": "Promoted",
    "career.status.active": "Current",
    "career.status.done": "Completed",
    "career.aside.label": "Professional panel",
    "career.aside.overview": "Overview",
    "career.aside.level": "Level",
    "career.aside.seniority": "Junior",

    /* EDUCATION */
    "education.title": "Education",
    "education.sub":
        "Check out my academic and professional education, including a Computer Science degree and a technical degree in Systems Development. I pursue continuous improvement through courses and certifications in areas such as cybersecurity, software development, data modeling and software quality, keeping my knowledge up to date and constantly evolving.",
    "education.eyebrow": "Academic",
    "education.edu.title": "Academic Education",
    "education.cert.title": "Certifications",
    "education.cert.link": "View certificate",
    "education.edu.label": "Degree",
    "education.cert.label": "Certification",
    "education.achievements": "achievements",
    "education.filterLabel": "Filter education",
    "education.filter.all": "All",
    "education.filter.edu": "Academic",
    "education.filter.cert": "Certifications",
    "education.showMore": "Show more",
    "education.showLess": "Show less",
    "education.status.active": "In progress",
    "education.status.done": "Completed",
    "education.tech.label": "Technologies",
    "education.skills.label": "Skills",
    "education.progress": "completed",
    "about.bio":
        "I'm Guilherme Cruz, a **Junior Developer** transitioning careers, currently working as a **Technical Support Analyst (Helpdesk)** at Wise System. I was promoted from intern to full-time employee in under a year, supporting a **financial ERP** in production: root-cause analysis of incidents, **CNAB** banking files, bank reconciliation, and tax document validation. That's real production-system experience, not just classroom theory.\n\nOn the development side, I work with **JavaScript**, **TypeScript**, **Java**, **Python** and **PHP**, focused on **front-end** (**React**, **React Router**, **Vite**, **HTML5**, **CSS3**, SPA and responsive design) and **back-end** (**Node.js**, **REST/RESTful APIs**, **WebSocket**, **JWT authentication**, **OOP**). I work with **MySQL** and **Oracle**, relational database modeling, and use **Git**, **GitHub** and **CI/CD** with continuous deployment on **Vercel** and **Render**.\n\nI apply **agile methodologies (Scrum/Kanban)**, **Clean Code**, software testing and solid **software quality** practices. I have an **analytical**, **investigative** mindset, learn fast, collaborate well on teams, and I'm looking for my next opportunity as a **Developer** to apply this technical foundation to real projects, with growing autonomy.",
    "about.goal.body":
        "I'm looking for my first opportunity as a **Junior Developer** or **Development Intern**, to put into practice what I've been building with **React**, **Node.js**, **TypeScript**, **REST APIs** and **JWT authentication**, along with experience in **Java**, **Python** and **PHP**. Intermediate English helps me follow technical documentation and work with international teams, and I also bring real production-systems experience from supporting a **financial ERP**. I want to grow technically, work on real projects and actively contribute to the team.\n\nI'm interested in **software architecture**, **information security** and **software testing**, and I want to grow using **agile methodologies (Scrum/Kanban)**, **CI/CD** and solid **Clean Code** practices, in an environment that values continuous learning, problem-solving and quality delivery.",
    "about.specs.title": "Areas of expertise",
    "contact.cta.heading": "Let's **build something** together?",
    "contact.cta.lead":
        "I'm ready to contribute as a **Junior Developer**, with real practice in **React**, **TypeScript**, **Node.js**, **REST APIs** and **JWT authentication**, combined with production-systems experience from technical support on an **ERP**. I apply **Clean Code**, **Git** and **agile methodologies** in my day to day.\n\nIf you're looking for someone with an **analytical mindset**, a knack for **problem-solving**, and readiness to **contribute to real projects**, reach out, let's talk about the role.",

    /* FEATURED */
    "featured.eyebrow": "Featured",
    "featured.badge": "Featured Project",
    "featured.desc":
        "Web project focused on usability, performance and development best practices.",
    "featured.btn.live": "View demo",
    "featured.btn.repo": "Repository",
    "featured.btn.docs": "Swagger Docs",
    "featured.gallery.label": "Project screenshots",
    "featured.autoplay.play": "Start autoplay",
    "featured.autoplay.pause": "Pause autoplay",
    "featured.arrow.prev": "Previous slide",
    "featured.arrow.next": "Next slide",
    "featured.block.tech": "Stack",
    "featured.block.endpoints": "API Endpoints",
    "featured.endpoint.protected": "Protected route (requires Bearer Token)",
    "featured.lightbox.open": "Expand",
    "featured.lightbox.close": "Close viewer",
    "featured.lightbox.thumbnails": "Slide thumbnails",
    "featured.thumbs.label": "Thumbnail navigation",

    /* DETAILS */
    "detail.challenge": "Challenge",
    "detail.solution": "Solution",
    "detail.result": "Result",

    /* WORK */
    "work.title": "Projects",
    "work.sub":
        "Projects built from scratch, covering everything from planning and architecture to production deployment. They use technologies such as React, TypeScript, Node.js and Python/FastAPI to build modern interfaces, REST APIs, JWT authentication, real-time applications with WebSocket, and integration between services. All projects follow development best practices, Git version control and continuous deployment to production environments.",
    "work.more": "View all on GitHub",
    "work.eyebrow": "Portfolio",
    "work.btn.demo": "View project",
    "work.btn.repo": "Repository",
    "work.preview": "Preview",
    "work.block.stack": "Stack",

    /* CONTACT */
    "contact.title": "Let's work together",
    "contact.sub":
        "Developer at the start of my career, with a solid foundation in programming and software engineering. I'm looking for my first opportunity to contribute to real projects and continuously grow as a technology professional.",
    "contact.hook": "Have an idea or an opportunity? Let's talk!",
    "contact.share": "Connect with me through the platforms below:",
    "contact.send": "Send message",
    "contact.sending": "Sending…",
    "contact.sent": "Sent!",
    "contact.cta.primary": "Start a conversation",
    "contact.cta.sending": "Sending message…",
    "contact.cta.success": "Message sent!",
    "contact.cta.error": "Failed to send. Please try again.",
    "contact.meta.response": "I reply within 24h",
    "contact.meta.linkedin": "Open to networking and opportunities",
    "contact.meta.github": "Real projects and clean code",
    "contact.meta.location": "Available remotely and on-site",

    /* RECOMMENDATIONS */
    "rec.title": "Recommendations",
    "rec.sub":
        "Testimonials from colleagues, managers and professionals I've worked with throughout my career, highlighting aspects such as commitment, an investigative approach, problem-solving ability, teamwork and reliability in developing and supporting solutions. These are real recommendations, published on LinkedIn, that reflect hands-on experience and the trust built across different professional contexts.",
    "rec.eyebrow": "Testimonials",
    "rec.count.one": "recommendation",
    "rec.count.many": "recommendations",
    "rec.source.text": "Via LinkedIn",
    "rec.source.label": "View recommendations on LinkedIn",

    /* FOOTER */
    "footer.tagline":
        "Junior Developer in transition, with real-world practice in React, Node.js and production systems.",
    "footer.nav": "Navigation",
    "footer.projects": "Projects",
    "footer.contact": "Contact",
    "footer.location": "São Paulo, Brazil",
    "footer.made": "Made with",
    "footer.coffee": "and lots of coffee",
    "footer.rights": "All rights reserved.",
};

/* EXPORTS */
export const TRANSLATIONS: Record<Lang, Translations> = { pt, en };
export const DEFAULT_LANG: Lang = "pt";
