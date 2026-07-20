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
        "**Desenvolvedor Júnior** com experiência prática em **React, TypeScript, Node.js e APIs REST**, hoje atuando como **Analista de Suporte Técnico** na Wise System, efetivado de estágio a CLT em menos de um ano. Construo aplicações com **JavaScript**, **Python** e **JWT**, aplico **Clean Code** e **Git**, e busco uma vaga onde eu escreva o sistema em vez de só dar suporte a ele.",
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
        "De estagiário a efetivado CLT em menos de um ano na Wise System. Experiência prática com ERP financeiro, CNAB, conciliação bancária e homologação fiscal, com foco em resolução de problemas e causa raiz de incidentes.",
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
        "Cursando Ciência da Computação na UNICSUL, com técnico em Desenvolvimento de Sistemas pela ETEC. Certificações em cibersegurança, CS50 (Harvard), modelagem de dados e qualidade de software complementam a formação.",
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
        "Sou Guilherme Cruz, **Desenvolvedor Júnior** em transição de carreira, hoje atuando como **Analista de Suporte Técnico (Helpdesk)** na Wise System. Fui efetivado de estágio a CLT em menos de um ano, dando suporte a um **ERP financeiro** em produção: análise de causa raiz de incidentes, arquivos bancários **CNAB**, conciliação bancária e homologação de notas fiscais. É vivência real de sistema em produção, não só teoria de sala de aula.\n\nDo lado do desenvolvimento, domino **JavaScript**, **TypeScript**, **Java**, **Python** e **PHP**, com foco em **front-end** (**React**, **React Router**, **Vite**, **HTML5**, **CSS3**, SPA e design responsivo) e **back-end** (**Node.js**, **APIs REST/RESTful**, **WebSocket**, **autenticação JWT**, **POO**). Trabalho com **MySQL** e **Oracle**, modelagem de banco de dados relacional, e uso **Git**, **GitHub** e **CI/CD** com deploy contínuo em **Vercel** e **Render**.\n\nAplico **metodologias ágeis (Scrum/Kanban)**, **Clean Code**, testes de software e boas práticas de **qualidade de software**. Tenho perfil **analítico** e **investigativo**, aprendo rápido, colaboro bem em equipe e busco minha próxima oportunidade como **Desenvolvedor** para aplicar essa base técnica em projetos reais, com autonomia crescente.",
    "about.goal.body":
        "Busco oportunidade como **Desenvolvedor** para atuar no desenvolvimento web e contribuir com soluções reais. Trago prática com **React**, **Node.js**, **TypeScript**, **APIs REST** e **autenticação JWT**, somada à vivência de sistemas em produção adquirida no suporte a **ERP**. Quero aplicar essa base em um time colaborativo, contribuindo com **código de qualidade** e evoluindo continuamente.\n\nTenho interesse em **arquitetura de software**, **segurança da informação** e **testes de software**, e busco crescer usando **metodologias ágeis (Scrum/Kanban)**, **CI/CD** e boas práticas de **Clean Code** em um ambiente que valorize aprendizado contínuo e entrega de qualidade.",
    "about.specs.title": "Áreas de especialização",
    "contact.cta.heading": "Vamos **construir algo** juntos?",
    "contact.cta.lead":
        "Estou pronto para contribuir como **Desenvolvedor Júnior**, com prática real em **React**, **TypeScript**, **Node.js**, **APIs REST** e **autenticação JWT**, somada à experiência de sistemas em produção que trago do suporte técnico a um **ERP**. Aplico **Clean Code**, **Git** e **metodologias ágeis** no meu dia a dia.\n\nSe você procura alguém com **perfil analítico**, **resolução de problemas** na veia e prontidão para **contribuir em projetos reais**, me chama, vamos conversar sobre a vaga.",

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
        "Projetos construídos do zero com React, TypeScript, Node.js e Python/FastAPI, incluindo APIs REST, autenticação JWT e aplicações em tempo real com WebSocket, todos com deploy contínuo em produção.",
    "work.more": "Ver todos no GitHub",
    "work.eyebrow": "Portfólio",
    "work.btn.demo": "Acessar projeto",
    "work.btn.repo": "Repositório",
    "work.preview": "Prévia",
    "work.block.stack": "Stack",

    /* CONTACT */
    "contact.title": "Vamos trabalhar juntos",
    "contact.sub":
        "Desenvolvedor Júnior com experiência prática em React, Node.js, TypeScript e APIs REST, e vivência real de sistemas em produção como Analista de Suporte Técnico em ERP financeiro. Disponível para posições de Desenvolvedor Frontend, Full Stack ou Estágio em Desenvolvimento, remoto ou presencial.",
    "contact.hook": "Tem uma vaga de Desenvolvedor? Vamos conversar.",
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
        "Depoimentos de colegas e gestores da Wise System sobre minha atuação como Analista de Suporte Técnico: postura investigativa, resolução de problemas e confiabilidade no dia a dia com sistemas em produção. Recomendações reais, publicadas no LinkedIn.",
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
        "**Junior Developer** with hands-on experience in **React, TypeScript, Node.js and REST APIs**, currently working as a **Technical Support Analyst** at Wise System, promoted from intern to full-time employee in under a year. I build applications with **JavaScript**, **Python** and **JWT**, apply **Clean Code** and **Git**, and I'm looking for a role where I write the system instead of just supporting it.",
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
        "From intern to full-time employee in under a year at Wise System. Hands-on experience with financial ERP, CNAB, bank reconciliation and tax compliance, focused on problem-solving and root-cause analysis.",
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
        "Currently pursuing a Computer Science degree at UNICSUL, with a technical degree in Systems Development from ETEC. Certifications in cybersecurity, CS50 (Harvard), data modeling and software quality round out the education.",
    "education.eyebrow": "Academic",
    "education.edu.title": "Academic Education",
    "education.cert.title": "Certifications",
    "education.cert.link": "View certificate",
    "education.edu.label": "Degree",
    "education.cert.label": "Certification",
    "education.achievements": "achievements",
    "education.filterLabel": "Filter formations",
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
        "I'm looking for a **Developer** opportunity to work in web development and contribute to real solutions. I bring practical experience with **React**, **Node.js**, **TypeScript**, **REST APIs** and **JWT authentication**, combined with production-systems experience gained supporting an **ERP**. I want to apply that foundation on a collaborative team, contributing **quality code** and growing continuously.\n\nI'm interested in **software architecture**, **information security** and **software testing**, and I want to grow using **agile methodologies (Scrum/Kanban)**, **CI/CD** and solid **Clean Code** practices in an environment that values continuous learning and quality delivery.",
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
        "Projects built from scratch with React, TypeScript, Node.js and Python/FastAPI, including REST APIs, JWT authentication and real-time applications with WebSocket, all with continuous deployment to production.",
    "work.more": "View all on GitHub",
    "work.eyebrow": "Portfolio",
    "work.btn.demo": "View project",
    "work.btn.repo": "Repository",
    "work.preview": "Preview",
    "work.block.stack": "Stack",

    /* CONTACT */
    "contact.title": "Let's work together",
    "contact.sub":
        "Junior Developer with hands-on experience in React, Node.js, TypeScript and REST APIs, plus real production-systems experience as a Technical Support Analyst for a financial ERP. Available for Frontend Developer, Full Stack or Development Internship positions, remote or on-site.",
    "contact.hook": "Have a Developer opening? Let's talk.",
    "contact.share":
        "Connect with me or reach out directly through the platforms below.",
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
        "Testimonials from Wise System colleagues and managers about my work as a Technical Support Analyst: investigative mindset, problem-solving and reliability in day-to-day work with production systems. Real recommendations, published on LinkedIn.",
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
