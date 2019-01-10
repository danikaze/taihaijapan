const NOTIFICATION_TIME_OK = 2000;
const NOTIFICATION_TIME_ERROR = 4000;

interface MdlSnackbarData {
  message: string;
  actionText?: string;
  timeout: number;
  actionHandler(): void;
}

interface MdlSnackbar extends HTMLDivElement {
  MaterialSnackbar: {
    showSnackbar(MdlSnackbarData): void;
  };
}

/**
 * Show a notification message using a [snackbar](https://getmdl.io/components/index.html#snackbar-section)
 *
 * @param message Message to show
 * @param actionText If provided, the returned promise will be resolved when the action is clicked
 */
export function showSnackbar(message: string, actionText?: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const snackbar = document.getElementById('snackbar') as MdlSnackbar;
    snackbar.MaterialSnackbar.showSnackbar({
      message,
      actionText,
      timeout: actionText ? NOTIFICATION_TIME_ERROR : NOTIFICATION_TIME_OK,
      actionHandler: actionText && resolve,
    });
  });
}
