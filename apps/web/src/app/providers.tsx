import React from "react";
import { LangProvider } from "@/app/LangContext";
import { RouterProvider } from "@/app/RouterContext";
import { ThemeProvider } from "@/app/ThemeContext";

interface ProvidersProps {
    children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
    return (
        <RouterProvider>
            <ThemeProvider>
                <LangProvider>{children}</LangProvider>
            </ThemeProvider>
        </RouterProvider>
    );
};
