import { RecommendationItem } from './Recommendations.types';

/**
 * RECOMMENDATIONS — fonte única de verdade
 *
 * Para adicionar uma nova recomendação futura, basta acrescentar um objeto
 * ao array abaixo seguindo o shape de `RecommendationItem`:
 *
 *   {
 *     id:         'rec-N',                        // identificador único
 *     authorName: 'Nome Completo',
 *     authorRole: 'Cargo · Empresa',              // papel + relação com o autor
 *     authorPhoto?: 'https://...',                // (opcional) URL da foto
 *     text:       'Texto completo da recomendação...',
 *     tags?:      ['Colaboração', 'Análise'],     // (opcional) tags de contexto
 *   }
 *
 * O carrossel e os cards se adaptam automaticamente à quantidade de itens.
 */
export const recommendations: RecommendationItem[] = [
    {
        id: 'rec-antonio-mario',
        authorName: 'Antônio Mário',
        authorRole:
            'Analista de Dados · Especialista de Software · Wise System · SQL · Power BI · Dashboard',
        date: '2026-04-06',
        relationship: {
            pt: 'Sênior em relação a Guilherme, sem supervisão direta',
            en: 'Senior to Guilherme, did not supervise directly',
        },
        text:
            'Trabalho com o Guilherme atualmente e uma das coisas que mais chamam atenção é a forma consistente com que ele conduz o trabalho no dia a dia.\n\nOutro ponto que admiro é a forma como ele se posiciona no time: participa, contribui e está sempre disposto a somar, seja trazendo uma visão diferente ou apoiando alguém quando necessário. Isso faz com que a colaboração flua de forma natural.\n\nAlém disso, o Guilherme demonstra evolução constante, absorvendo bem os aprendizados e colocando em prática rapidamente, o que impacta diretamente no resultado do trabalho.\n\nÉ um profissional confiável, que transmite segurança e que, sem dúvida, faz diferença no time.',
        tags: ['Colaboração', 'Evolução constante', 'Confiabilidade', 'Trabalho em time'],
    },
    {
        id: 'rec-victor-cardoso',
        authorName: 'Victor Cardoso',
        authorRole: 'Supervisor direto · Wise System',
        date: '2026-04-01',
        relationship: {
            pt: 'Supervisionava Guilherme diretamente',
            en: 'Supervised Guilherme directly',
        },
        text:
            'Acompanhar o desenvolvimento do Guilherme desde o início tem sido uma experiência extremamente gratificante. Tive a oportunidade de participar do seu treinamento e, hoje, acompanhando seu trabalho de perto na equipe, posso afirmar com segurança que ele desempenha com excelência o papel de homologador de NFs e boletos bancários.\n\nO que mais se destaca em seu perfil é sua capacidade de análise e resolução de problemas. Guilherme não adota uma abordagem superficial diante das demandas; sua postura é investigativa e precisa. Ele não apenas identifica falhas, mas compreende a causa raiz e avalia o impacto no ecossistema do software.\n\nEsse perfil analítico e detalhista se evidencia ainda mais em cenários de alta complexidade. Guilherme demonstra um domínio impressionante dos processos financeiros e de emissão de notas fiscais. Esse entendimento profundo das regras de negócio é um diferencial significativo, garantindo que as entregas nessas áreas críticas sejam realizadas com alto nível de segurança e qualidade.\n\nAlém de sua sólida competência técnica, é um profissional comprometido, proativo e que contribui diretamente para elevar o nível das entregas do time de suporte e desenvolvimento. Recomendo o Guilherme com total confiança para qualquer equipe que busque um profissional com rigor analítico, profundo conhecimento de regras de negócio e dedicação constante à excelência.',
        tags: [
            'Análise',
            'Resolução de problemas',
            'Regras de negócio',
            'Rigor analítico',
            'Excelência',
        ],
    },

    /* ─────────────────────────────────────────────────────────
       ✨ Espaço reservado para futuras recomendações.
       Basta descomentar o template abaixo e preencher:
    ─────────────────────────────────────────────────────────
    {
        id: 'rec-novo-autor',
        authorName: 'Nome do Autor',
        authorRole: 'Cargo · Empresa',
        // authorPhoto: 'https://...',
        date: '2026-MM-DD',
        relationship: {
            pt: 'Supervisionava diretamente',
            en: 'Supervised directly',
        },
        text:
            'Texto completo da recomendação. Parágrafos podem ser separados ' +
            'com \\n\\n.',
        tags: ['Tag 1', 'Tag 2'],
    },
    ───────────────────────────────────────────────────────── */
];
