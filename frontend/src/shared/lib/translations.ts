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
    | "contact.meta.devlinks"
    | "contact.meta.location"
    | "contact.label.location"
    | "contact.email.now"
    | "contact.form.title"
    | "contact.form.name"
    | "contact.form.email"
    | "contact.form.message"
    | "contact.form.name.placeholder"
    | "contact.form.email.placeholder"
    | "contact.form.message.placeholder"
    | "contact.form.error.name"
    | "contact.form.error.email"
    | "contact.form.error.message"

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
        "Estudante de Ciência da Computação em busca da primeira oportunidade como **Desenvolvedor Júnior** ou **Estagiário**. Experiência prática com **React, Node.js e MySQL** no desenvolvimento de aplicações web — busco evoluir tecnicamente e contribuir com soluções eficientes em um ambiente colaborativo.",
    "hero.status": "Disponível para oportunidades",
    "hero.cta.work": "Ver projetos",
    "hero.cta.cv": "Download CV",
    "hero.badge": "Em busca da primeira oportunidade",
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
    "timeline.sub": "Trajetória profissional e evolução na área de tecnologia.",
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
        "Trajetória acadêmica e certificações que sustentam minha base técnica.",
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
        "Sou estudante de **Ciência da Computação** na Universidade Cruzeiro do Sul, com formação técnica em **Desenvolvimento de Sistemas** pela **ETEC Vila Formosa**. Ao longo da minha formação, desenvolvi uma base sólida em **lógica de programação**, **estruturas de dados** e **fundamentos de engenharia de software**, aplicando esses conceitos na construção de **projetos práticos** e soluções reais.\n\nTenho experiência no desenvolvimento de **aplicações web modernas**, com foco em **frontend** e integração com **APIs**. Utilizo tecnologias como **React**, **JavaScript/TypeScript**, **Node.js** e **MySQL**, criando **interfaces responsivas**, organizadas e com atenção à **experiência do usuário (UX/UI)** — sempre buscando entregar soluções **funcionais**, **performáticas** e bem estruturadas.\n\nAlém do desenvolvimento web, tenho interesse em áreas como **Java**, **machine learning**, **segurança da informação** e **engenharia de software**, buscando construir soluções **escaláveis** e **robustas**. Em meus projetos, aplico **código limpo**, **boas práticas** e **versionamento com Git**, mantendo foco em **organização**, **manutenibilidade** e **evolução contínua** como desenvolvedor.",
    "about.goal.body":
        "Estou em busca da minha primeira oportunidade como **Desenvolvedor Júnior** ou **Estagiário em Desenvolvimento**, com o objetivo de aplicar meus conhecimentos em **projetos reais**, evoluir minhas **habilidades técnicas** e contribuir ativamente com o time. Tenho interesse em **desenvolvimento web** e **Java**, além de explorar áreas como **segurança da informação** e **arquitetura de software**.\n\nMeu foco é desenvolver aplicações com **boa estrutura**, **escalabilidade** e **manutenibilidade**, aplicando **boas práticas** e **organização de código**. Busco um ambiente onde eu possa crescer profissionalmente, contribuir com **resolução de problemas**, manter **aprendizado contínuo** e entregar soluções com **qualidade** e **performance**.",
    "about.specs.title": "Áreas de especialização",
    "contact.cta.heading": "Vamos **construir algo** juntos?",
    "contact.cta.lead":
        "Estou pronto para iniciar minha trajetória como **Desenvolvedor Júnior** ou **Estagiário**, contribuindo com **aplicações modernas**, **bem estruturadas** e voltadas para **performance** e **experiência do usuário**.\n\nSe você procura alguém **dedicado**, com **vontade de evoluir** e que **contribua de forma prática em projetos reais**, vamos conversar e construir **soluções juntos**!",

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
        "Seleção de projetos que demonstram minha experiência prática no desenvolvimento de aplicações, com foco em boas práticas, performance e qualidade de código.",
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
    "contact.meta.devlinks": "Confira meus links sociais e projetos",
    "contact.meta.location": "Disponível para trabalho remoto ou presencial",
    "contact.label.location": "Localização",
    "contact.email.now": "Enviar e-mail agora",
    "contact.form.title": "Ou envie uma mensagem direta",
    "contact.form.name": "Nome",
    "contact.form.email": "E-mail",
    "contact.form.message": "Mensagem",
    "contact.form.name.placeholder": "Seu nome",
    "contact.form.email.placeholder": "voce@exemplo.com",
    "contact.form.message.placeholder":
        "Conte-me sobre sua ideia, projeto ou oportunidade…",
    "contact.form.error.name": "Informe seu nome.",
    "contact.form.error.email": "Informe um e-mail válido.",
    "contact.form.error.message":
        "Escreva uma mensagem com pelo menos 10 caracteres.",

    /* RECOMMENDATIONS */
    "rec.title": "Recomendações",
    "rec.sub":
        "O que pessoas que trabalharam comigo dizem sobre minha atuação profissional.",
    "rec.eyebrow": "Depoimentos",
    "rec.count.one": "recomendação",
    "rec.count.many": "recomendações",
    "rec.source.text": "Via LinkedIn",
    "rec.source.label": "Ver recomendações no LinkedIn",

    /* FOOTER */
    "footer.tagline":
        "Desenvolvedor focado em evolução constante e criação de soluções modernas.",
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
        "Computer Science student seeking a first opportunity as a **Junior Developer** or **Intern**. Hands-on experience with **React, Node.js and MySQL** in web development — looking to grow technically and contribute efficient solutions in a collaborative environment.",
    "hero.status": "Open to opportunities",
    "hero.cta.work": "View projects",
    "hero.cta.cv": "Download CV",
    "hero.badge": "Seeking first opportunity",
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
    "timeline.sub": "Professional journey and growth in the tech industry.",
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
        "Academic path and certifications that build my technical foundation.",
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
        "I'm a **Computer Science** student at Universidade Cruzeiro do Sul, with a technical background in **Systems Development** from **ETEC Vila Formosa**. Throughout my education I built a solid foundation in **programming logic**, **data structures** and **software engineering fundamentals**, applying these concepts to **hands-on projects** and real-world solutions.\n\nI have experience building **modern web applications**, focused on the **frontend** and **API** integration. I work with technologies such as **React**, **JavaScript/TypeScript**, **Node.js** and **MySQL**, creating **responsive**, well-organized **interfaces** with attention to **user experience (UX/UI)** — always aiming to deliver **functional**, **performant** and well-structured solutions.\n\nBeyond web development, I'm interested in areas like **Java**, **machine learning**, **information security** and **software engineering**, aiming to build **scalable** and **robust** solutions. Across my projects I apply **clean code**, **good practices** and **version control with Git**, keeping a focus on **organization**, **maintainability** and **continuous growth** as a developer.",
    "about.goal.body":
        "I'm looking for my first opportunity as a **Junior Developer** or **Development Intern**, aiming to apply my knowledge to **real projects**, sharpen my **technical skills** and actively contribute to the team. I'm interested in **web development** and **Java**, and I also explore areas like **information security** and **software architecture**.\n\nMy focus is building applications with **solid structure**, **scalability** and **maintainability**, applying **best practices** and **clean code organization**. I'm looking for an environment where I can grow professionally, contribute to **problem-solving**, keep up **continuous learning** and deliver solutions with **quality** and **performance**.",
    "about.specs.title": "Areas of expertise",
    "contact.cta.heading": "Let's **build something** together?",
    "contact.cta.lead":
        "I'm ready to start my journey as a **Junior Developer** or **Intern**, contributing to **modern**, **well-structured** applications focused on **performance** and **user experience**.\n\nIf you're looking for someone **dedicated**, **eager to grow** and ready to **contribute practically to real projects**, let's talk and **build solutions together**!",

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
    "work.sub": "Projects built to practice and improve technical skills.",
    "work.more": "View all on GitHub",
    "work.eyebrow": "Portfolio",
    "work.btn.demo": "View project",
    "work.btn.repo": "Repository",
    "work.preview": "Preview",
    "work.block.stack": "Stack",

    /* CONTACT */
    "contact.title": "Let's work together",
    "contact.sub":
        "Frontend developer focused on React, TypeScript and performant experiences. Seeking first professional opportunity to contribute to real projects.",
    "contact.hook": "Have an idea or opportunity? Let's talk.",
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
    "contact.meta.devlinks": "Check out my social links and projects",
    "contact.meta.location": "Available remotely and on-site",
    "contact.label.location": "Location",
    "contact.email.now": "Send an email now",
    "contact.form.title": "Or send a direct message",
    "contact.form.name": "Name",
    "contact.form.email": "Email",
    "contact.form.message": "Message",
    "contact.form.name.placeholder": "Your name",
    "contact.form.email.placeholder": "you@example.com",
    "contact.form.message.placeholder":
        "Tell me about your idea, project or opportunity…",
    "contact.form.error.name": "Please enter your name.",
    "contact.form.error.email": "Please enter a valid email.",
    "contact.form.error.message":
        "Please write a message with at least 10 characters.",

    /* RECOMMENDATIONS */
    "rec.title": "Recommendations",
    "rec.sub":
        "What people who worked with me say about my professional performance.",
    "rec.eyebrow": "Testimonials",
    "rec.count.one": "recommendation",
    "rec.count.many": "recommendations",
    "rec.source.text": "Via LinkedIn",
    "rec.source.label": "View recommendations on LinkedIn",

    /* FOOTER */
    "footer.tagline":
        "Developer focused on continuous learning and building modern solutions.",
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
