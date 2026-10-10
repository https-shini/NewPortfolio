# Ícones de tecnologia (skill-icons)

Os SVGs deste diretório vêm de **skill-icons**, de tandpfun —
https://github.com/tandpfun/skill-icons — licença MIT
(Copyright © 2022 tandpfun), obtidos pela fork
https://github.com/https-shini/skill-icons.

**Os logotipos pertencem aos respectivos donos.** A licença MIT cobre o
empacotamento em SVG, não as marcas representadas.

## Por que os nomes são os da fork

`NodeJS-Dark.svg` e não `nodejs-dark.svg`: o nome é o mesmo do diretório
`icons/` da fork, então atualizar um ícone é copiar o arquivo por cima, sem
traduzir nome nenhum. Os dez arquivos que já estavam aqui em minúsculas foram
renomeados para esta convenção — e os oito que vinham da fork eram
**byte-idênticos** aos de lá, conferido por SHA-256, então a renomeação não
trocou um pixel.

## Os 21 ícones em uso

Com variante por tema (par `-Dark` / `-Light`), 12:

`Bash` · `Figma` · `Firebase` · `Java` · `Linux` · `MySQL` · `NodeJS` ·
`PHP` · `Python` · `React` · `Vite` · `VSCode`

Arquivo único — logotipo com fundo de marca próprio, igual nos dois temas, 8:

`CSS` · `Docker` · `FastAPI` · `Git` · `HTML` · `JavaScript` · `Oracle` · `Sass`

Mais `SQL`, abaixo. O mapeamento ID → arquivo é
`src/shared/config/skillIcons.ts`, e quem renderiza é `src/shared/ui/SkillIcon`.

## As duas exceções

**`SQL-Dark.svg` / `SQL-Light.svg` não vêm da fork.** Ela não possui um ícone
"SQL" genérico — só SQLite, MySQL e PostgreSQL. Estes dois foram criados neste
projeto seguindo o mesmo modelo (256×256, `rect rx="60"`, glifo no bloco
central). Não os sobrescreva ao atualizar da fork.

**`Oracle.svg` existe só na fork.** O upstream não o tem (404), e é por isso
que ele era uma imagem quebrada enquanto os ícones vinham de `skillicons.dev`:
aquele domínio nunca o serviu. Foi a tipagem fechada de `SkillIconId` que
expôs o problema.
