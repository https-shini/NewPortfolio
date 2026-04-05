import React from 'react';
import { Providers } from './providers';
import { Routes }    from './routes';

const App: React.FC = () => (
  <Providers>
    <Routes />
  </Providers>
);

export default App;
