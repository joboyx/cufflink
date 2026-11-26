import { copyLink } from './clipboard';
import { detectCopyLink } from './detect-copy-link';
import { formatLinkLabel } from './format-link';
import { showToast } from './toast';

/**
 * Detects the Jira issue, GitHub pull request or issue, or GitLab merge request or
 * issue on this tab, copies a formatted link, and shows a card.
 */
export async function copyCurrentLink(): Promise<void> {
  const link = detectCopyLink(document, location.href);
  if (!link) {
    showToast({
      kind: 'error',
      kicker: 'Not found',
      title: 'No issue, pull request or merge request on this page',
      body: 'Open an issue, a pull request or a merge request, or select a card on a board.',
    });
    return;
  }

  try {
    await copyLink(link);
  } catch {
    showToast({
      kind: 'error',
      kicker: 'Copy failed',
      title: 'Could not write to the clipboard',
    });
    return;
  }

  showToast({
    kind: 'success',
    kicker: 'Copied',
    title: formatLinkLabel(link),
    body: link.url,
  });
}
