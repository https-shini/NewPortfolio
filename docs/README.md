# Documentação do NewPortfolio

Duas pastas, e a diferença entre elas é **se o documento ainda muda**.

| pasta                      | natureza                                                 |
| -------------------------- | -------------------------------------------------------- |
| [`guides/`](guides/)       | **vivo** — muda quando a regra ou o processo muda        |
| [`reference/`](reference/) | **congelado** — registro de um momento, não se reescreve |

Antes desta divisão os nove arquivos ficavam no mesmo nível, e uma regra
que muda toda semana convivia com uma medição de agosto sem nada
distinguir as duas. Quem chegava precisava abrir cada arquivo para saber
qual era qual.

---

## `guides/` — vivo

| documento                                                   | o que responde                                                    |
| ----------------------------------------------------------- | ----------------------------------------------------------------- |
| [`github-project.md`](guides/github-project.md)             | como este repositório é planejado: fluxo, campos, rótulos, regras |
| [`github-project-setup.md`](guides/github-project-setup.md) | o que clicar para configurar o board, e como usá-lo no dia a dia  |

Se algo aqui divergir do board, do README ou de uma issue,
**`github-project.md` vale** e a divergência é defeito.

## `reference/` — congelado

Medição e histórico. **Nada aqui abre trabalho novo** — o planejamento
ativo é o [Project #3](https://github.com/users/https-shini/projects/3).

| documento                                                        | o que registra                                                                                        |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [`AUDITORIA-2026-08.md`](reference/AUDITORIA-2026-08.md)         | auditoria técnica e de posicionamento de agosto de 2026; a §22 é a origem do backlog T01–T33          |
| [`PERFORMANCE-2026-08.md`](reference/PERFORMANCE-2026-08.md)     | quatro capturas do PageSpeed, o que funcionou e **o que foi reprovado** — existe para ninguém refazer |
| [`ROLAGEM-2026-09.md`](reference/ROLAGEM-2026-09.md)             | **quem** custa na rolagem da home: o vidro absolvido, as 39 partículas animadas culpadas              |
| [`ROADMAP.md`](reference/ROADMAP.md)                             | as 15 melhorias de agosto e o que a execução ensinou. Encerrado                                       |
| [`baseline-pre-monorepo.md`](reference/baseline-pre-monorepo.md) | leitura de cada porta de qualidade em `6cd2733`, antes de `frontend/` virar `apps/web/`               |
| [`release-v2.0.0.md`](reference/release-v2.0.0.md)               | as notas da segunda geração do portfólio                                                              |

E dois arquivos que **nenhuma pessoa edita**:

| derivado                                                     | quem o grava                           |
| ------------------------------------------------------------ | -------------------------------------- |
| [`a11y-baseline.json`](reference/a11y-baseline.json)         | `node scripts/a11y.mjs --baseline`     |
| [`identity-baseline.json`](reference/identity-baseline.json) | `node scripts/identity.mjs --baseline` |

Estão no `.prettierignore` de propósito: os dois scripts os gravam com
`JSON.stringify(_, null, 2)`, e formatá-los à mão poria duas portas do CI
em contradição — a que confere formatação e a que regrava o arquivo.

E os dois são **lidos** em toda execução, não só gravados: `a11y.mjs` e
`identity.mjs` comparam a leitura de hoje contra o que está aqui, e saem com
erro se for pior. Regravar é `--baseline`, e se faz **antes** de qualquer
alteração — depois dela, a base já nasce contaminada.

---

## As pastas que ainda não existem

`architecture/`, `decisions/` e `troubleshooting/` **não foram criadas**.
Elas nascem junto do primeiro documento que couber em cada uma, e não
antes: pasta vazia é estrutura que promete o que não tem.

---

## Onde mora o resto

| documento                                      | papel                                               |
| ---------------------------------------------- | --------------------------------------------------- |
| [`../README.md`](../README.md)                 | o que o projeto é, como rodar, como está construído |
| [`../CONTRIBUTING.md`](../CONTRIBUTING.md)     | o fluxo de trabalho, as portas do CI, o merge local |
| [`../CHANGELOG.md`](../CHANGELOG.md)           | derivado de `RELEASE_NOTES` — `npm run changelog`   |
| [`../scripts/README.md`](../scripts/README.md) | as automações: o que cada script mede e por quê     |

E o que **não** é documentação apesar do nome: `apps/web/public/docs/`
guarda os PDFs de currículo e certificados que o site serve.
