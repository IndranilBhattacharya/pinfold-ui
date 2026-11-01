import * as React from 'react';
import { createRoot } from 'react-dom/client';

import '@pinfold/css/reset.css';
import '@pinfold/css/tokens.css';
import '@pinfold/css/accordion.css';
import './docs.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
