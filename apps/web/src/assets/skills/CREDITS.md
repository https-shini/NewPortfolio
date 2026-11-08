# Ícones de tecnologia (skill-icons)

**Todos os 81 SVGs deste diretório vêm da fork
https://github.com/https-shini/skill-icons** — fork de **skill-icons**, de
tandpfun (https://github.com/tandpfun/skill-icons), licença MIT
(Copyright © 2022 tandpfun).

**Os logotipos pertencem aos respectivos donos.** A licença MIT cobre o
empacotamento em SVG, não as marcas representadas.

Conferido por SHA-256, arquivo por arquivo: **81 de 81 são byte-idênticos** aos
do diretório `icons/` da fork (commit `3b53d04`, 08/11/2026). Não há ícone local sem origem na fork, e nenhum
arquivo aqui deve ser editado à mão — atualizar é copiar da fork por cima.

## Por que os nomes são os da fork

`NodeJS-Dark.svg` e não `nodejs-dark.svg`: o nome é o mesmo do diretório
`icons/` da fork, então atualizar é cópia direta, sem traduzir nome nenhum.

## Os 46 ícones em uso

Com variante por tema (par `-Dark` / `-Light`), 35:

`Bandit` · `Bash` · `Biome` · `Claude` · `ExpressJS` · `Figma` · `Firebase` ·
`Gemini` · `Github` · `GolangCI` · `Java` · `Jinja` · `JWT` · `Jupyter` ·
`Linux` · `Lucide` · `Motion` · `MySQL` · `NextJS` · `NodeJS` · `OpenRouter` ·
`PHP` · `PostgreSQL` · `Pydantic` · `Python` · `Radon` · `React` · `Ruff` ·
`SocketIO` · `SQL` · `SVG` · `TailwindCSS` · `Uvicorn` · `Vite` · `VSCode`

Arquivo único — logotipo com fundo de marca próprio, igual nos dois temas, 11:

`CSS` · `Docker` · `FastAPI` · `Git` · `Heroku` · `HTML` · `JavaScript` ·
`Oracle` · `Sass` · `StyledComponents` · `TypeScript`

## Licenças além do MIT da fork

A fork registra a procedência de cada arte nova em `assets/icon-sources.json`.
As licenças dessas artes estão copiadas em `licenses/`:

| Ícone | Origem da arte | Licença |
| --- | --- | --- |
| Lucide, Ruff, Biome, Gemini, Claude, OpenRouter, Jupyter, Jinja, SocketIO | Simple Icons | CC0 (`licenses/SimpleIcons-CC0.txt`) |
| Motion (Framer Motion) | SVGL | MIT (`licenses/SVGL-MIT.txt`) |
| Bandit | logomark do repositório PyCQA/bandit, raster embutido no SVG | Apache-2.0 (`licenses/Bandit-Apache-2.0.txt`) |
| GolangCI | SVG do repositório golangci/golangci-lint | GPL-3.0 (`licenses/GolangCI-GPL-3.0.txt`) |
| Radon | badge tipográfico da fork com glifos da JetBrains Mono | OFL (`licenses/JetBrainsMono-OFL.txt`) |

Radon não tem logomarca oficial; o badge é um desenho da própria fork.

## Associações sem marca própria

Seguem a fork, que não inventa logotipo para formato ou serviço sem marca:
`Dockerfile` usa o ícone do Docker, `Procfile` o do Heroku, `PL/pgSQL` o do
PostgreSQL, e GitHub API e GitHub OAuth o do GitHub. O nome exibido continua
sendo o original (ver `CATALOGO` em `src/features/devhub/tech.ts`).

## Como entram no build

Nunca embutidos no JS: `vite.config.ts` (`assetsInlineLimit`) os emite como
arquivos próprios, em cache e baixados só quando aparecem.

O mapeamento ID → arquivo é `src/shared/config/skillIcons.ts`, e quem renderiza
é `src/shared/ui/SkillIcon`, que emite os dois `<img>` do par e deixa o CSS
escolher pelo `data-theme`.

## Duas notas de história, para ninguém refazer o caminho errado

**O `SQL` já foi local, e não é mais.** Houve aqui um `sql-dark.svg` /
`sql-light.svg` de 824 bytes, feito neste projeto porque uma verificação não
achou `SQL.svg` na fork. **A verificação estava errada**: a fork tem o ícone
como par temático, `SQL-Dark.svg` e `SQL-Light.svg` — só não como arquivo
único. Os dois foram substituídos pelos da fork (1192 e 1213 bytes), que são um
desenho diferente do que havia aqui.

**O `Oracle` existe só na fork.** O upstream não o tem (404), e é por isso que
ele era imagem quebrada enquanto os ícones vinham de `skillicons.dev`: aquele
domínio nunca o serviu. Foi a tipagem fechada de `SkillIconId` que expôs o
problema.
