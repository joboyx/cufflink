import { detectGitLabMr } from './detect-gitlab-mr';
import { detectIssue } from './detect-issue';
import type { CopyLink } from './format-link';

/**
 * Finds the link to copy on this page: a GitLab merge request, else a Jira issue.
 */
export function detectCopyLink(doc: Document, pageUrl: string): CopyLink | null {
  // The merge request goes first: the Jira detector also reads a key from the tab
  // title, so an MR titled `feat(ABC-12): …` would otherwise copy a broken browse URL.
  return detectGitLabMr(doc, pageUrl) ?? detectIssue(doc, pageUrl);
}
