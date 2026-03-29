import React from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers — wraps the app with global context/providers.
 * Theme and lang are handled via localStorage + CSS class on <html>/<body>,
 * so no React Context is required. Add providers here as the app grows
 * (e.g., QueryClientProvider, ToastProvider, etc.).
 */
export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <>{children}</>;
};
