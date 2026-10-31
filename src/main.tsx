import * as React from 'react';
import { createRoot } from 'react-dom/client';

import '@lumae/core/reset.css';
import '@lumae/core/styles.css';
import '@lumae/accordion/styles.css';
import './docs.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
