import React from 'react';
import ReactDOM from 'react-dom/client';

// ── Global styles — order matters: tokens → base → (component CSS loaded per widget)
import '@/shared/styles/tokens.css';
import '@/shared/styles/globals.css';

import App from '@/app/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
