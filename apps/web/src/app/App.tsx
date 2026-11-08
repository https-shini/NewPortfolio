import React from "react";
import { Providers } from "./providers";
import { Routes } from "./routes";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary/ErrorBoundary";

/* Dois níveis de proteção: o de dentro (em `Routes`) cobre uma página e
   mantém a atmosfera de fundo; este cobre os próprios providers — um erro
   lá não seria capturado por nenhum limite abaixo deles. */
const App: React.FC = () => (
    <ErrorBoundary>
        <Providers>
            <Routes />
        </Providers>
    </ErrorBoundary>
);

export default App;
