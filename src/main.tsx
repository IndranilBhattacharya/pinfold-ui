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
import '@pinfold/css/alert.css';
import '@pinfold/css/avatar.css';
import '@pinfold/css/card.css';
import '@pinfold/css/progress.css';
import '@pinfold/css/tooltip.css';
import '@pinfold/css/popover.css';
import '@pinfold/css/dialog.css';
import '@pinfold/css/menu.css';
import '@pinfold/css/toast.css';
import '@pinfold/css/input.css';
import '@pinfold/css/checkbox.css';
import '@pinfold/css/radio.css';
import '@pinfold/css/switch.css';
import '@pinfold/css/toggle.css';
import '@pinfold/css/toolbar.css';
import '@pinfold/css/tabs.css';
import '@pinfold/css/breadcrumb.css';
import '@pinfold/css/pagination.css';
import '@pinfold/css/stepper.css';
import '@pinfold/css/select.css';
import '@pinfold/css/tags.css';
import '@pinfold/css/command.css';
import '@pinfold/css/slider.css';
import '@pinfold/css/number.css';
import '@pinfold/css/otp.css';
import '@pinfold/css/field.css';
import '@pinfold/css/packs.css';
import './docs.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
