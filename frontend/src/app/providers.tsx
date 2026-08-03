import React from "react";
import { LangProvider } from "@/app/LangContext";
import { RouterProvider } from "@/app/RouterContext";

interface ProvidersProps {
    children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
    return (
        <RouterProvider>
            <LangProvider>{children}</LangProvider>
        </RouterProvider>
    );
};
