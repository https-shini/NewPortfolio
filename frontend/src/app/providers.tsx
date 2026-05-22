import React from 'react';
import { LangProvider } from '@/app/LangContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <LangProvider>{children}</LangProvider>;
};
