import { defineToast } from '@pinfold/react/toast';

/** The site's own toasts (code copied, link copied): one region, rendered once by the app. */
export const SiteToasts = defineToast({ placement: 'bottom-end', duration: 2500 });
