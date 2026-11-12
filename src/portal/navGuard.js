// A tiny in-app navigation guard (AXIS-32). A screen with unsaved edits (the
// content editor) registers a function that returns a confirm message when it's
// unsafe to leave, or null to allow. PortalLayout's nav links / sign-out call
// confirmNavigation() first and cancel the click if it returns false.
//
// Why not React Router's useBlocker? That needs a data router; this app uses
// <BrowserRouter>, so a small module-level guard stands in. beforeunload (added
// by the editor itself) still covers tab close / reload.

let guardFn = null;

export function setNavGuard(fn) { guardFn = fn; }
export function clearNavGuard(fn) { if (guardFn === fn) guardFn = null; }

// Returns true if navigation may proceed. If a guard is set and returns a
// message, the user is asked to confirm leaving.
export function confirmNavigation() {
  const msg = guardFn ? guardFn() : null;
  if (!msg) return true;
  return window.confirm(msg);
}
