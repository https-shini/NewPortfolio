import React from "react";
import "./Logo.css";

/* ─────────────────────────────────────────────────────────
   Logo — a marca <gcruz.dev/>
   ─────────────────────────────────────────────────────────
   Estritamente tipográfica, por decisão de identidade: nenhum símbolo
   desenhado. O acento da marca são os colchetes em crimson; o nome fica
   na cor de texto principal e a extensão no indigo de acento. Tudo por
   token — é o que faz a marca responder à troca de tema sem uma linha
   de JavaScript.

   A variante compacta <gc/> serve aos espaços onde o nome inteiro não
   cabe: o menu móvel aqui, e — fora do React — favicon e ícone do
   aplicativo, gerados por scripts/icones.mjs a partir do mesmo desenho.

   Acessibilidade: o leitor de tela lê "gcruz.dev", não a pontuação.
   Os colchetes são apresentação, e soletrar "menor que, barra, maior
   que" a cada passagem pelo header seria ruído sem informação.
─────────────────────────────────────────────────────────── */

interface LogoProps {
    variante?: "completa" | "compacta";
}

export const Logo: React.FC<LogoProps> = ({ variante = "completa" }) => {
    const compacta = variante === "compacta";
    return (
        <span
            className="logo"
            role="img"
            aria-label={compacta ? "gc" : "gcruz.dev"}
        >
            <span className="logo__colchete" aria-hidden="true">
                {"<"}
            </span>
            {compacta ? (
                <span className="logo__nome" aria-hidden="true">
                    gc
                </span>
            ) : (
                <>
                    <span className="logo__nome" aria-hidden="true">
                        gcruz
                    </span>
                    <span className="logo__extensao" aria-hidden="true">
                        .dev
                    </span>
                </>
            )}
            <span className="logo__colchete" aria-hidden="true">
                {"/>"}
            </span>
        </span>
    );
};

export default Logo;
