import { type RecommendationItem } from "./Recommendations.types";

/**
 * RECOMMENDATIONS — fonte única de verdade (bilíngue PT/EN).
 *
 * Para adicionar uma nova recomendação, acrescente um objeto ao array
 * seguindo o shape de `RecommendationItem`. Campos textuais usam o
 * formato `{ pt, en }`:
 *
 *   {
 *     id:         'rec-N',
 *     authorName: 'Nome Completo',                      // nome próprio
 *     authorRole: { pt: 'Cargo · Empresa', en: 'Role · Company' },
 *     date:       '2026-MM-DD',
 *     relationship: { pt: '...', en: '...' },
 *     text:       { pt: 'Texto...', en: 'Text...' },    // \n\n separa parágrafos
 *     tags:       [{ pt: 'Análise', en: 'Analysis' }],
 *   }
 *
 * O carrossel e os cards se adaptam automaticamente à quantidade de itens.
 */
export const recommendations: RecommendationItem[] = [
    {
        id: "rec-antonio-mario",
        authorName: "Antônio Mário",
        authorRole: {
            pt: "Analista de Dados · Especialista de Software · Wise System · SQL · Power BI · Dashboard",
            en: "Data Analyst · Software Specialist · Wise System · SQL · Power BI · Dashboard",
        },
        date: "2026-04-06",
        relationship: {
            pt: "Sênior em relação a Guilherme, sem supervisão direta",
            en: "Senior to Guilherme, did not supervise directly",
        },
        text: {
            pt: "Trabalho com o Guilherme atualmente e uma das coisas que mais chamam atenção é a forma consistente com que ele conduz o trabalho no dia a dia.\n\nOutro ponto que admiro é a forma como ele se posiciona no time: participa, contribui e está sempre disposto a somar, seja trazendo uma visão diferente ou apoiando alguém quando necessário. Isso faz com que a colaboração flua de forma natural.\n\nAlém disso, o Guilherme demonstra evolução constante, absorvendo bem os aprendizados e colocando em prática rapidamente, o que impacta diretamente no resultado do trabalho.\n\nÉ um profissional confiável, que transmite segurança e que, sem dúvida, faz diferença no time.",
            en: "I currently work with Guilherme, and one of the things that stands out the most is the consistent way he handles his work day to day.\n\nAnother point I admire is how he positions himself within the team: he participates, contributes and is always willing to add value — whether by bringing a different perspective or supporting someone when needed. This makes collaboration flow naturally.\n\nOn top of that, Guilherme shows constant growth, absorbing what he learns and quickly putting it into practice, which directly impacts the results of the work.\n\nHe is a reliable professional who inspires confidence and who, without a doubt, makes a difference on the team.",
        },
        tags: [
            { pt: "Colaboração", en: "Collaboration" },
            { pt: "Evolução constante", en: "Constant growth" },
            { pt: "Confiabilidade", en: "Reliability" },
            { pt: "Trabalho em time", en: "Teamwork" },
        ],
    },
    {
        id: "rec-victor-cardoso",
        authorName: "Victor Cardoso",
        authorRole: {
            pt: "Supervisor direto · Wise System",
            en: "Direct Supervisor · Wise System",
        },
        date: "2026-04-01",
        relationship: {
            pt: "Supervisionava Guilherme diretamente",
            en: "Supervised Guilherme directly",
        },
        text: {
            pt: "Acompanhar o desenvolvimento do Guilherme desde o início tem sido uma experiência extremamente gratificante. Tive a oportunidade de participar do seu treinamento e, hoje, acompanhando seu trabalho de perto na equipe, posso afirmar com segurança que ele desempenha com excelência o papel de homologador de NFs e boletos bancários.\n\nO que mais se destaca em seu perfil é sua capacidade de análise e resolução de problemas. Guilherme não adota uma abordagem superficial diante das demandas; sua postura é investigativa e precisa. Ele não apenas identifica falhas, mas compreende a causa raiz e avalia o impacto no ecossistema do software.\n\nEsse perfil analítico e detalhista se evidencia ainda mais em cenários de alta complexidade. Guilherme demonstra um domínio impressionante dos processos financeiros e de emissão de notas fiscais. Esse entendimento profundo das regras de negócio é um diferencial significativo, garantindo que as entregas nessas áreas críticas sejam realizadas com alto nível de segurança e qualidade.\n\nAlém de sua sólida competência técnica, é um profissional comprometido, proativo e que contribui diretamente para elevar o nível das entregas do time de suporte e desenvolvimento. Recomendo o Guilherme com total confiança para qualquer equipe que busque um profissional com rigor analítico, profundo conhecimento de regras de negócio e dedicação constante à excelência.",
            en: "Following Guilherme's development from the very beginning has been an extremely rewarding experience. I had the opportunity to take part in his training and, today, watching his work closely within the team, I can confidently say that he excels in the role of validating invoices (NFs) and bank slips.\n\nWhat stands out most in his profile is his capacity for analysis and problem-solving. Guilherme does not take a superficial approach to demands; his stance is investigative and precise. He not only identifies failures but understands their root cause and assesses the impact on the software ecosystem.\n\nThis analytical, detail-oriented profile becomes even more evident in highly complex scenarios. Guilherme demonstrates an impressive command of financial processes and invoice issuance. This deep understanding of business rules is a significant differentiator, ensuring that deliveries in these critical areas are carried out with a high level of safety and quality.\n\nBeyond his solid technical competence, he is a committed, proactive professional who directly contributes to raising the level of the support and development team's deliveries. I recommend Guilherme with full confidence to any team looking for a professional with analytical rigor, deep knowledge of business rules and constant dedication to excellence.",
        },
        tags: [
            { pt: "Análise", en: "Analysis" },
            { pt: "Resolução de problemas", en: "Problem-solving" },
            { pt: "Regras de negócio", en: "Business rules" },
            { pt: "Rigor analítico", en: "Analytical rigor" },
            { pt: "Excelência", en: "Excellence" },
        ],
    },
    {
        id: "rec-rebeka-alencar",
        authorName: "Rebeka Alencar",
        authorRole: {
            pt: "Data Science · Data Analytics · BI · Python · SQL · Power BI · Estudante",
            en: "Data Science · Data Analytics · BI · Python · SQL · Power BI · Student",
        },
        date: "2026-07-25",
        relationship: {
            pt: "Trabalhou na mesma equipe que Guilherme",
            en: "Worked on the same team as Guilherme",
        },
        text: {
            pt: "Tive a oportunidade de trabalhar com o Guilherme e posso afirmar que ele é um profissional extremamente dedicado e comprometido. Está sempre em busca de aprender, compreender os desafios e aprimorar seus conhecimentos, o que demonstra sua vontade constante de evoluir.\n\nAlém disso, é uma pessoa muito proativa, sempre disposta a ajudar quem está ao seu redor. Seu respeito, responsabilidade e espírito colaborativo fazem toda a diferença no ambiente de trabalho.\n\nMesmo em situações de alta pressão e prazos apertados, o Guilherme sempre manteve a calma e se dedicou para entregar resultados com qualidade e eficiência. Sua agilidade, inteligência e capacidade de resolver problemas eram reconhecidas por toda a equipe.\n\nSem dúvidas, recomendo o Guilherme para qualquer empresa ou oportunidade. Tenho certeza de que ele agregará muito valor por onde passar, sendo um profissional de excelência e confiança.",
            en: "I had the opportunity to work with Guilherme and I can say he is an extremely dedicated and committed professional. He is always seeking to learn, understand challenges and improve his knowledge, which shows his constant drive to grow.\n\nBeyond that, he is a very proactive person, always willing to help those around him. His respect, responsibility and collaborative spirit make all the difference in the work environment.\n\nEven under high pressure and tight deadlines, Guilherme always stayed calm and dedicated himself to delivering quality, efficient results. His agility, intelligence and problem-solving ability were recognized by the entire team.\n\nWithout a doubt, I recommend Guilherme for any company or opportunity. I'm certain he will add great value wherever he goes, being a professional of excellence and trust.",
        },
        tags: [
            { pt: "Dedicação", en: "Dedication" },
            { pt: "Proatividade", en: "Proactivity" },
            { pt: "Resolução de problemas", en: "Problem-solving" },
            { pt: "Trabalho sob pressão", en: "Grace under pressure" },
            { pt: "Colaboração", en: "Collaboration" },
        ],
    },
    {
        id: "rec-lucca-campello",
        authorName: "Lucca Campello",
        authorRole: {
            pt: "Analista de Dados · SQL · Python · Power BI · PostgreSQL · AWS · Estudante de Engenharia de Software",
            en: "Data Analyst · SQL · Python · Power BI · PostgreSQL · AWS · Software Engineering Student",
        },
        date: "2026-08-11",
        relationship: {
            pt: "Trabalhou na mesma equipe que Guilherme",
            en: "Worked on the same team as Guilherme",
        },
        text: {
            pt: 'Tive o prazer de trabalhar ao lado do Guilherme na Wise System, e posso dizer que ele é um daqueles profissionais em quem você realmente confia no dia a dia.\n\nAtuando diretamente com homologação e suporte técnico aos clientes, sempre se destacou pela didática e pela facilidade em transformar problemas técnicos em explicações claras. Isso era tão perceptível que tivemos clientes que faziam questão de tratar determinadas demandas diretamente com ele, justamente pela confiança e pela forma como conduzia cada atendimento.\n\nNo dia a dia, o Guilherme também era uma das pessoas com quem eu mais gostava de discutir problemas. Muitas vezes ele vinha até a minha mesa com uma dúvida ou uma situação diferente, e acabávamos debatendo possibilidades até encontrar a melhor solução. Nunca era simplesmente "resolver o chamado", mas entender o problema e buscar uma forma melhor de resolvê-lo.\n\nQuando eu precisava direcionar alguma demanda relacionada ao N2, tinha tranquilidade em contar com ele, porque sabia que haveria comprometimento tanto na execução quanto no retorno ao cliente.\n\nNa área de homologação, além de dominar muito bem os processos, também assumia a responsabilidade de orientar e treinar novos estagiários. Durante a transição do sistema para suportar pagamentos via PIX, trabalhamos muito próximos nas homologações, CNABs e particularidades dos diferentes clientes, e a participação dele foi fundamental durante todo esse processo.\n\nMais do que competência técnica, o que sempre me chamou atenção no Guilherme foi a vontade genuína de entregar um trabalho bem feito, a integridade e a disposição para ajudar quem estivesse ao lado.\n\nÉ um profissional que eu recomendaria de olhos fechados e com quem teria enorme prazer em trabalhar novamente.',
            en: 'It was a pleasure to work alongside Guilherme at Wise System, and I can say he is one of those professionals you genuinely rely on day to day.\n\nWorking directly with homologation and technical support for clients, he always stood out for how clearly he explains things and for turning technical problems into plain explanations. It was so noticeable that we had clients who made a point of handling certain demands directly with him, precisely because of the trust and the way he conducted every case.\n\nDay to day, Guilherme was also one of the people I most enjoyed discussing problems with. He would often come to my desk with a question or an unusual situation, and we would end up debating possibilities until we found the best solution. It was never simply "closing the ticket", but understanding the problem and looking for a better way to solve it.\n\nWhenever I had to route a demand related to N2, I was at ease counting on him, because I knew there would be commitment both in the execution and in getting back to the client.\n\nIn homologation, beyond mastering the processes very well, he also took on the responsibility of guiding and training new interns. During the system transition to support PIX payments, we worked very closely on homologations, CNAB files and the particularities of each client, and his contribution was fundamental throughout that whole process.\n\nMore than technical competence, what always stood out to me in Guilherme was the genuine will to deliver work well done, his integrity and his readiness to help whoever was beside him.\n\nHe is a professional I would recommend with my eyes closed and with whom I would have enormous pleasure in working again.',
        },
        tags: [
            { pt: "Homologação", en: "Homologation" },
            { pt: "Suporte N2", en: "N2 support" },
            { pt: "PIX e CNAB", en: "PIX and CNAB" },
            { pt: "Didática", en: "Clear communication" },
            { pt: "Treinamento de estagiários", en: "Training interns" },
        ],
    },
];
