/**
 * Whether this document is a preview frame (`preview.html`), and how a frame talks to the page that holds
 * it. Messages go to the parent's origin only, and the page accepts them only from its own frames.
 */
export const IN_PREVIEW = typeof window !== 'undefined' && /\/preview\.html$/.test(window.location.pathname);

/** In a frame: which of the page's previews it shows (`#/<component>/<preview>`, `main` by default). */
export const PREVIEW_NAME = IN_PREVIEW ? window.location.hash.replace(/^#\/?/, '').split('/')[1] || 'main' : 'main';

/**
 * Components that are a layout, or that cover the screen: their frame has a fixed height so a fixed bar,
 * a modal, a drawer or a scrolling page has a viewport to work in. Every other preview grows with its
 * content (and with any popup it opens).
 */
export const FIXED_HEIGHT = new Set(['appshell', 'navbar', 'dialog', 'tour', 'command', 'toast', 'cursor']);

export type FrameMessage =
  | { type: 'ready' }
  | { type: 'painted' }
  | { type: 'height'; px: number }
  | { type: 'event'; text: string }
  | { type: 'error'; message: string }
  | { type: 'state'; key: string; raw: string };

export function postToPage(message: FrameMessage) {
  if (!IN_PREVIEW || window.parent === window) return;
  window.parent.postMessage(message, window.location.origin);
}

/** What a demo did, shown under the preview on the page ("Followed a link to /reports"). */
export function reportEvent(text: string) {
  postToPage({ type: 'event', text });
}
