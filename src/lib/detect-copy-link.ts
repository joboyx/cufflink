import { detectGitHubIssue, detectGitHubPr } from './detect-github';
import { detectGitLabIssue } from './detect-gitlab-issue';
import { detectGitLabMr } from './detect-gitlab-mr';
import { detectIssue } from './detect-issue';
import type { CopyLink } from './format-link';

/**
 * Finds the link to copy on this page: a GitLab merge request or issue, a GitHub
 * pull request or issue, else a Jira issue.
 */
export function detectCopyLink(doc: Document, pageUrl: string): CopyLink | null {
  // The code host pages go first: the Jira detector also reads a key from the tab
  // title, so a pull request titled `feat(ABC-12): …` would otherwise copy a broken
  // browse URL.
  return (
    detectGitLabMr(doc, pageUrl) ??
    detectGitLabIssue(doc, pageUrl) ??
    detectGitHubPr(doc, pageUrl) ??
    detectGitHubIssue(doc, pageUrl) ??
    detectIssue(doc, pageUrl)
  );
}
