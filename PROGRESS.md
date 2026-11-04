
## Tooltip, Popover, Dialog, Menu, Toast, 0.7.0 (2026-11-04)
- Owner: "Add next set of components". W2 in one release. Submenus NOT built (Planned in menu.md); told owner.
- No portals: react-dom is banned in components and not a peer. Floating elements stay in the DOM, position:
  fixed via JS (core computePosition: flip, shift, logical start/end), + Popover API top layer where available
  (`raiseToTopLayer`); roadmap's CSS anchor positioning dropped (above the floor). Fallback tested with
  showPopover deleted; limitation (transformed ancestor) in COMPATIBILITY.md.
- Shared: react/src/overlay.tsx (useFloating, useOverlayLayer, useHoverIntent, renderTrigger, closingAction,
  restoreFocus, useMounted), core pushOverlayLayer dismiss stack, typeaheadIndex, createToastStore,
  react/src/icons.tsx. Trigger = ButtonConfig | element, wrapped in display:contents span (no ref merging).
- Controller naming: isOpen, open(), close(), toggle(), getTriggerProps(). Floating renders only after mount.
- Dialog: native dialog; panel inside a transparent full-viewport dialog (press on it = backdrop); actions last
  solid ([Cancel, Save]), alertdialog focuses first action; exit animation excluded.
- Toast: errors and toasts with an action stay (WCAG 2.2.1); defineToast has .show/.dismiss/.clear/.store.
- Playgrounds show a forced-open copy + a real copy. internal/tools/overlay-e2e.cjs = 38 real-browser checks
  (menu in modal, Escape layer by layer, clipped+transformed parent, focus return, hover pause).
- Budgets: overlay entries 10 kB (carry overlay layer + Button). AGENTS.md lessons updated.
- Next: W3 forms (Field + Input first; field wiring, native validation).
