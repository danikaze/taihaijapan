/**
 * Load a service worker if supported by the browser
 *
 * @param swPath Path to the service worker
 */
export function loadSw(swPath: string): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swPath);
  });
}
