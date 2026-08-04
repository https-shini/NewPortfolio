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

## Corrigido

- Contraste da cor da marca aplicada a texto, que reprovava o AA nos dois temas
- Contraste do rodapé no tema escuro, que reprovava em todas as páginas
- Alvos de toque abaixo do mínimo em ponteiro fino
- Acesso direto por URL às rotas secundárias, que retornava 404

## Detalhes

- **202 testes** em 25 arquivos, cobrindo também as funções serverless
- **22/22** combinações limpas no axe-core: 11 perfis de dispositivo, do Galaxy Fold fechado a 4K, em retrato e paisagem, nos dois temas
- Apenas **duas dependências de runtime**: `react` e `react-dom`

**Site:** https://gcruz.dev.br
