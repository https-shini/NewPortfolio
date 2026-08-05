Segunda geração do portfólio: a versão em HTML/CSS/JS puro deu lugar a uma SPA em **React 18 + TypeScript 5 + Vite 5**, com arquitetura em camadas, design system próprio e internacionalização completa.

## Adicionado

- **Design system próprio** com tokens CSS em três níveis — primitivos, semânticos e overrides de tema —, tema claro/escuro persistente e sincronizado com o sistema
- **Bilíngue PT-BR/EN** sem recarregar a página, em duas camadas: chaves tipadas para a interface e dados localizados para o conteúdo
- **Social tree em `/links`**: página autônoma de link-in-bio, com perfil, stack e links públicos derivados de uma fonte única
- **Notas de versão em `/release-notes`**: linha do tempo das versões, também acessível pelo badge no rodapé, com filtro por tema e permalink por versão
- **Roteamento próprio** sobre a History API, sem `react-router-dom`
- **Duas funções serverless** que falam com o GitHub sem expor token ao browser: métricas do perfil e as releases desta página

## Alterado

- Arquitetura reorganizada em camadas — `app` → `pages` → `widgets` → `shared`
- Modal, accordion e cache extraídos para componentes e utilitários compartilhados
- Datas de carreira em ISO, com período e duração derivados automaticamente
- **CSS convertido para mobile-first**: o estilo base atende a menor tela e cada `min-width` acrescenta. Nenhuma das consultas de largura usava `min-width`; hoje são 45. As seis que continuam com `max-width` são pares com `pointer: coarse`, mantidas de propósito — o complemento exato de ponteiro grosso não é `pointer: fine`, porque existe `pointer: none`
- **Escala de breakpoints declarada** em `tokens.css`: dez valores soltos viraram oito nomeados, cinco principais e três de consumidor único. Os pares 768/780 e 880/900 foram fundidos; faixas de 12 px e 20 px são estreitas demais para conter decisão de layout

## Corrigido

- Contraste da cor da marca aplicada a texto, que reprovava o AA nos dois temas
- Contraste do rodapé no tema escuro, que reprovava em todas as páginas
- Alvos de toque abaixo do mínimo em ponteiro fino
- Acesso direto por URL às rotas secundárias, que retornava 404
- Código morto encontrado na conversão do CSS: bloco de grade que repetia a regra base no Sobre, `right`/`top` num elemento sem `position` no Hero e `flex-wrap` duplicado no Destaque

## Detalhes

- **245 testes** em 29 arquivos, cobrindo também as funções serverless
- **22/22** combinações limpas no axe-core: 11 perfis de dispositivo, do Galaxy Fold fechado a 4K, em retrato e paisagem, nos dois temas
- A conversão para mobile-first foi verificada por um diff de geometria que mede a caixa de cada elemento em **288 combinações** de rota, largura e tema — 92.820 caixas, em 36 larguras. O arranjo foi calibrado contra o próprio código sem mudança antes de servir de prova
- Apenas **duas dependências de runtime**: `react` e `react-dom`

**Site:** https://gcruz.dev.br
