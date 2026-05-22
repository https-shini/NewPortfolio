import { RecommendationItem } from "./Recommendations.types";

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
            pt:
                "Trabalho com o Guilherme atualmente e uma das coisas que mais chamam atenção é a forma consistente com que ele conduz o trabalho no dia a dia.\n\nOutro ponto que admiro é a forma como ele se posiciona no time: participa, contribui e está sempre disposto a somar, seja trazendo uma visão diferente ou apoiando alguém quando necessário. Isso faz com que a colaboração flua de forma natural.\n\nAlém disso, o Guilherme demonstra evolução constante, absorvendo bem os aprendizados e colocando em prática rapidamente, o que impacta diretamente no resultado do trabalho.\n\nÉ um profissional confiável, que transmite segurança e que, sem dúvida, faz diferença no time.",
            en:
                "I currently work with Guilherme, and one of the things that stands out the most is the consistent way he handles his work day to day.\n\nAnother point I admire is how he positions himself within the team: he participates, contributes and is always willing to add value — whether by bringing a different perspective or supporting someone when needed. This makes collaboration flow naturally.\n\nOn top of that, Guilherme shows constant growth, absorbing what he learns and quickly putting it into practice, which directly impacts the results of the work.\n\nHe is a reliable professional who inspires confidence and who, without a doubt, makes a difference on the team.",
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
            pt:
                "Acompanhar o desenvolvimento do Guilherme desde o início tem sido uma experiência extremamente gratificante. Tive a oportunidade de participar do seu treinamento e, hoje, acompanhando seu trabalho de perto na equipe, posso afirmar com segurança que ele desempenha com excelência o papel de homologador de NFs e boletos bancários.\n\nO que mais se destaca em seu perfil é sua capacidade de análise e resolução de problemas. Guilherme não adota uma abordagem superficial diante das demandas; sua postura é investigativa e precisa. Ele não apenas identifica falhas, mas compreende a causa raiz e avalia o impacto no ecossistema do software.\n\nEsse perfil analítico e detalhista se evidencia ainda mais em cenários de alta complexidade. Guilherme demonstra um domínio impressionante dos processos financeiros e de emissão de notas fiscais. Esse entendimento profundo das regras de negócio é um diferencial significativo, garantindo que as entregas nessas áreas críticas sejam realizadas com alto nível de segurança e qualidade.\n\nAlém de sua sólida competência técnica, é um profissional comprometido, proativo e que contribui diretamente para elevar o nível das entregas do time de suporte e desenvolvimento. Recomendo o Guilherme com total confiança para qualquer equipe que busque um profissional com rigor analítico, profundo conhecimento de regras de negócio e dedicação constante à excelência.",
            en:
                "Following Guilherme's development from the very beginning has been an extremely rewarding experience. I had the opportunity to take part in his training and, today, watching his work closely within the team, I can confidently say that he excels in the role of validating invoices (NFs) and bank slips.\n\nWhat stands out most in his profile is his capacity for analysis and problem-solving. Guilherme does not take a superficial approach to demands; his stance is investigative and precise. He not only identifies failures but understands their root cause and assesses the impact on the software ecosystem.\n\nThis analytical, detail-oriented profile becomes even more evident in highly complex scenarios. Guilherme demonstrates an impressive command of financial processes and invoice issuance. This deep understanding of business rules is a significant differentiator, ensuring that deliveries in these critical areas are carried out with a high level of safety and quality.\n\nBeyond his solid technical competence, he is a committed, proactive professional who directly contributes to raising the level of the support and development team's deliveries. I recommend Guilherme with full confidence to any team looking for a professional with analytical rigor, deep knowledge of business rules and constant dedication to excellence.",
        },
        tags: [
            { pt: "Análise", en: "Analysis" },
            { pt: "Resolução de problemas", en: "Problem-solving" },
            { pt: "Regras de negócio", en: "Business rules" },
            { pt: "Rigor analítico", en: "Analytical rigor" },
            { pt: "Excelência", en: "Excellence" },
        ],
    },
];
