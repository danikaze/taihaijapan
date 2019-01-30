/**
 * The BeforeInstallPromptEvent is fired at the Window.onbeforeinstallprompt handler
 * before a user is prompted to "install" a web site to a home screen on mobile.
 *
 * @deprecated Only supported on Chrome and Android Webview.
 */
interface BeforeInstallPromptEvent extends Event {

  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: Array<string>;

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>;

}

/**
 * Handle the Add To Home Screen (A2HS) on Desktop
 * Code from https://developer.mozilla.org/en-US/docs/Web/Apps/Progressive/Add_to_home_screen
 *
 * @param button Element to act as prompt trigger
 */
export function a2hs(button: HTMLElement): void {
  if (!button) {
    return;
  }

  window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    let deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    button.style.display = '';

    button.addEventListener('click', (e) => {
      // hide our user interface that shows our A2HS button
      button.style.display = 'none';
      // Show the prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'dismissed') {
          button.style.display = '';
        }
        deferredPrompt = null;
      });
    });
  });
}
