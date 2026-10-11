# Ícones de tecnologia (skill-icons)

**Todos os 34 SVGs deste diretório vêm da fork
https://github.com/https-shini/skill-icons** — fork de **skill-icons**, de
tandpfun (https://github.com/tandpfun/skill-icons), licença MIT
(Copyright © 2022 tandpfun).

**Os logotipos pertencem aos respectivos donos.** A licença MIT cobre o
empacotamento em SVG, não as marcas representadas.

Conferido por SHA-256, arquivo por arquivo: **34 de 34 são byte-idênticos** aos
do diretório `icons/` da fork. Não há ícone local sem origem na fork, e nenhum
arquivo aqui deve ser editado à mão — atualizar é copiar da fork por cima.

## Por que os nomes são os da fork

`NodeJS-Dark.svg` e não `nodejs-dark.svg`: o nome é o mesmo do diretório
`icons/` da fork, então atualizar é cópia direta, sem traduzir nome nenhum.

## Os 21 ícones em uso

Com variante por tema (par `-Dark` / `-Light`), 13:

`Bash` · `Figma` · `Firebase` · `Java` · `Linux` · `MySQL` · `NodeJS` ·
`PHP` · `Python` · `React` · `SQL` · `Vite` · `VSCode`

Arquivo único — logotipo com fundo de marca próprio, igual nos dois temas, 8:

`CSS` · `Docker` · `FastAPI` · `Git` · `HTML` · `JavaScript` · `Oracle` · `Sass`

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
