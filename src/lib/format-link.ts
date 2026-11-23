import { escapeAttr, escapeHtml } from './escape';

/**
 * A link to copy, from any source page (a Jira issue or a GitLab merge request).
 */
export interface CopyLink {
  /**
   * Short id at the start of the label, never cut: `ABC-123` or `my-service!42`.
   */
  prefix: string;
  /**
   * Human title after the separator. Blank gives a label with only the prefix.
   */
  title: string;
  /**
   * Canonical URL the copied link points to.
   */
  url: string;
  /**
   * Text between prefix and title: `JIRA_SEPARATOR` or `MERGE_REQUEST_SEPARATOR`.
   */
  separator: string;
}

/**
 * Separator of a Jira label: `ABC-123: Summary`.
 */
export const JIRA_SEPARATOR = ': ';

/**
 * Separator of a merge request label: `my-service!42 | Title`.
 */
export const MERGE_REQUEST_SEPARATOR = ' | ';

/**
 * Most visible characters a copied link label may have, including the ellipsis.
 */
export const MAX_LABEL_LENGTH = 100;

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/**
 * Link label: prefix, separator and title, or just the prefix when the title is blank.
 * A label longer than `MAX_LABEL_LENGTH` visible characters gets a cut title that ends
 * with `…`. The prefix and the separator are never cut.
 */
export function formatLinkLabel(link: CopyLink): string {
  const title = link.title.trim();
  if (!title) {
    return link.prefix;
  }

  const head = `${link.prefix}${link.separator}`;
  const label = `${head}${title}`;
  if (countGraphemes(label) <= MAX_LABEL_LENGTH) {
    return label;
  }

  // Count by grapheme so the cut never splits an emoji or a combining mark.
  const room = Math.max(0, MAX_LABEL_LENGTH - countGraphemes(head) - 1);
  const parts = Array.from(graphemes.segment(title), (part) => part.segment);
  return `${head}${parts.slice(0, room).join('').trimEnd()}…`;
}

/**
 * Visible label only. Apps that paste as plain text use this, with no hyperlink.
 */
export function formatPlainText(link: CopyLink): string {
  return formatLinkLabel(link);
}

/**
 * HTML anchor for apps that paste rich text.
 */
export function formatHtml(link: CopyLink): string {
  const label = formatLinkLabel(link);
  return `<a href="${escapeAttr(link.url)}">${escapeHtml(label)}</a>`;
}

function countGraphemes(text: string): number {
  return Array.from(graphemes.segment(text)).length;
}
