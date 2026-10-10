import React from "react";
import "./SkillIcon.css";
import {
    SKILL_ICONS,
    temVariante,
    type SkillIconId,
} from "@/shared/config/skillIcons";

/**
 * SkillIcon — um ícone de tecnologia, servido do próprio domínio.
 *
 * ── A troca de tema é CSS, não estado ────────────────────────────────
 *
 * Para um ícone com variante, este componente emite OS DOIS `<img>` e
 * deixa o `SkillIcon.css` esconder o que não é do tema, pelo `data-theme`
 * que `useTheme` escreve no `<html>`.
 *
 * Parece desperdício e não é. A alternativa seria ler o tema em
 * JavaScript, e `useTheme` é `useState` puro — o cabeçalho dele avisa que
 * não deve ser chamado em mais de um componente, porque cada chamador
 * ganharia estado próprio. A /links já o chamava em paralelo com o
 * Header, que é quem tem o botão; o resultado é que lá os ícones de stack
 * não acompanhavam a troca. Por CSS não existe estado, então não existe o
 * que dessincronizar, em nenhuma página.
 *
 * O custo real é um `<img>` extra por ícone temático e o download das
 * duas variantes. São arquivos de 0,8 a 3,4 KB, servidos do mesmo domínio
 * e com nome por hash de conteúdo — cache imutável. Nada disso entra no
 * orçamento do documento, que mede entrada, modulepreload e folhas.
 *
 * ── Dimensões explícitas ─────────────────────────────────────────────
 *
 * `width` e `height` vão no atributo, e não só no CSS: é o que reserva a
 * caixa antes do arquivo chegar e mantém o deslocamento de layout em
 * zero. Os três tamanhos em uso são 18 (chips do Destaque), 20 (cartões
 * de Formação) e 32 (grade da seção Sobre).
 *
 * ── Acessibilidade ───────────────────────────────────────────────────
 *
 * Sem `alt`, o ícone é decorativo: `alt=""` mais `aria-hidden`, que é o
 * que o Destaque e as Formações já faziam (lá o rótulo acessível é do
 * grupo, não de cada imagem). Com `alt`, ele é anunciado — e só uma vez,
 * porque `display: none` tira o par escondido da árvore de acessibilidade.
 */
interface SkillIconProps {
    id: SkillIconId;
    /** Lado da caixa em px — vira `width` e `height` no atributo. */
    size: number;
    /** Ausente ou vazio ⇒ decorativo (`alt=""` + `aria-hidden`). */
    alt?: string;
    className?: string;
}

export const SkillIcon: React.FC<SkillIconProps> = ({
    id,
    size,
    alt,
    className,
}) => {
    const { dark, light } = SKILL_ICONS[id];
    const decorativo = !alt;

    /* Atributos idênticos aos que os quatro pontos de chamada usavam
       antes — `lazy` e `async` inclusive. */
    const rotulo = alt ?? "";
    /* O `alt` fica FORA deste objeto, explícito em cada <img>: a regra
       jsx-a11y/alt-text não consegue provar a presença do atributo por
       dentro de um spread, e ela está certa em não confiar. Ser explícito
       é mais barato que desligar a porta. */
    const comuns = {
        width: size,
        height: size,
        loading: "lazy" as const,
        decoding: "async" as const,
        ...(decorativo ? { "aria-hidden": true as const } : {}),
    };

    /* Sem variante: um `<img>`, não dois. Metade dos ícones cai aqui. */
    if (!temVariante(id)) {
        return (
            <img
                src={dark}
                alt={rotulo}
                className={className ? `skill-icon ${className}` : "skill-icon"}
                {...comuns}
            />
        );
    }

    const base = className ? `skill-icon ${className}` : "skill-icon";

    return (
        <>
            <img
                src={dark}
                alt={rotulo}
                className={`${base} skill-icon--dark`}
                {...comuns}
            />
            <img
                src={light}
                alt={rotulo}
                className={`${base} skill-icon--light`}
                {...comuns}
            />
        </>
    );
};
