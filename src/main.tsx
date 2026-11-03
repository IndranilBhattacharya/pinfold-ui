import * as React from 'react';
import { createRoot } from 'react-dom/client';

import '@pinfold/css/reset.css';
import '@pinfold/css/tokens.css';
import '@pinfold/css/accordion.css';
import '@pinfold/css/button.css';
import '@pinfold/css/spinner.css';
import '@pinfold/css/separator.css';
import '@pinfold/css/kbd.css';
import '@pinfold/css/skeleton.css';
import '@pinfold/css/badge.css';
import '@pinfold/css/packs.css';
import './docs.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
