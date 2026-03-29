export type Lang = "pt" | "en";

export type TranslationKey =
    /* ── NAV ───────────────────────────────────────── */
    | "nav.home"
    | "nav.about"
    | "nav.career"
    | "nav.featured"
    | "nav.work"
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

    /* ── TIMELINE ──────────────────────────────────── */
    | "timeline.title"
    | "timeline.sub"
    | "timeline.tab.edu"
    | "timeline.tab.cert"
    | "timeline.tab.exp"

    /* ── FEATURED ──────────────────────────────────── */
    | "featured.badge"
    | "featured.desc"
    | "featured.btn.live"
    | "featured.btn.repo"

    /* ── DETAILS ───────────────────────────────────── */
    | "detail.challenge"
    | "detail.solution"
    | "detail.result"

    /* ── WORK ──────────────────────────────────────── */
    | "work.title"
    | "work.sub"
    | "work.more"

    /* ── CONTACT ───────────────────────────────────── */
    | "contact.title"
    | "contact.sub"
    | "contact.send" // botão: estado inicial
    | "contact.sending" // botão: enviando
    | "contact.sent" // botão: enviado com sucesso
    | "contact.success" // mensagem de feedback positivo
    | "contact.error" // mensagem de feedback negativo
    | "contact.meta.response"
    | "contact.meta.linkedin"
    | "contact.meta.github"
    | "contact.meta.location"
    | "contact.hook"

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
    "nav.featured": "Destaque",
    "nav.work": "Projetos",
    "nav.contact": "Contato",

    /* HERO */
    "hero.greeting": "Olá, eu sou",
    "hero.role": "Desenvolvedor Júnior",
    "hero.sub": "Desenvolvimento Web",
    "hero.desc":
        "Focado em desenvolvimento web moderno com React, APIs e boas práticas de código.",
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

    /* TIMELINE */
    "timeline.title": "Minha Trajetória",
    "timeline.sub":
        "Formação acadêmica, certificações e evolução profissional.",
    "timeline.tab.edu": "Formação",
    "timeline.tab.cert": "Certificações",
    "timeline.tab.exp": "Experiência",

    /* FEATURED */
    "featured.badge": "Projeto em Destaque",
    "featured.desc":
        "Projeto web com foco em usabilidade, performance e boas práticas de desenvolvimento.",
    "featured.btn.live": "Ver projeto",
    "featured.btn.repo": "Repositório",

    /* DETAILS */
    "detail.challenge": "Desafio",
    "detail.solution": "Solução",
    "detail.result": "Resultado",

    /* WORK */
    "work.title": "Projetos",
    "work.sub":
        "Seleção de projetos que demonstram minha experiência prática no desenvolvimento de aplicações, com foco em boas práticas, performance e qualidade de código.",
    "work.more": "Ver todos no GitHub",

    /* CONTACT */
    "contact.title": "Vamos trabalhar juntos",
    "contact.sub":
        "Desenvolvedor Frontend focado em React, TypeScript e experiências performáticas. Buscando primeira oportunidade profissional para contribuir em projetos reais.",
    "contact.send": "Enviar mensagem",
    "contact.sending": "Enviando...",
    "contact.sent": "Mensagem enviada!",
    "contact.success": "Mensagem enviada com sucesso!",
    "contact.error": "Erro ao enviar. Tente novamente.",
    "contact.meta.response": "Respondo em até 24h",
    "contact.meta.linkedin": "Aberto a networking e oportunidades",
    "contact.meta.github": "Projetos reais e código limpo",
    "contact.meta.location": "Disponível para remoto e presencial",
    "contact.hook": "Tem uma ideia ou oportunidade? Vamos conversar.",

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
    "nav.featured": "Featured",
    "nav.work": "Projects",
    "nav.contact": "Contact",

    /* HERO */
    "hero.greeting": "Hi, I'm",
    "hero.role": "Junior Developer",
    "hero.sub": "Web Development",
    "hero.desc":
        "Focused on modern web development with React, APIs and clean code practices.",
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

    /* TIMELINE */
    "timeline.title": "My Journey",
    "timeline.sub": "Education, certifications and professional growth.",
    "timeline.tab.edu": "Education",
    "timeline.tab.cert": "Certifications",
    "timeline.tab.exp": "Experience",

    /* FEATURED */
    "featured.badge": "Featured Project",
    "featured.desc":
        "Web project focused on usability, performance and development best practices.",
    "featured.btn.live": "View project",
    "featured.btn.repo": "Repository",

    /* DETAILS */
    "detail.challenge": "Challenge",
    "detail.solution": "Solution",
    "detail.result": "Result",

    /* WORK */
    "work.title": "Projects",
    "work.sub": "Projects built to practice and improve technical skills.",
    "work.more": "View all on GitHub",

    /* CONTACT */
    "contact.title": "Let's talk",
    "contact.sub": "Open to opportunities as a junior developer or intern.",
    "contact.send": "Send message",
    "contact.sending": "Sending…",
    "contact.sent": "Sent!",
    "contact.success": "Message sent successfully!",
    "contact.error": "Failed to send. Please try again.",
    "contact.meta.response": "Replies within 24h",
    "contact.meta.linkedin": "Open to networking and opportunities",
    "contact.meta.github": "Real projects and clean code",
    "contact.meta.location": "Available remotely and on-site",
    "contact.hook": "Got an idea or opportunity? Let's talk.",

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
