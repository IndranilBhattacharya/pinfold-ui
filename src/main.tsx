import * as React from 'react';
import { createRoot } from 'react-dom/client';

import '@lumae/css/reset.css';
import '@lumae/css/tokens.css';
import '@lumae/css/accordion.css';
import './docs.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
