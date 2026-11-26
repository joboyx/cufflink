import { CODE_HOST_SEPARATOR, type CopyLink } from './format-link';
import { headingOrTabTitle, parseUrl } from './read-page';

/**
 * What tells one kind of GitHub page from another.
 */
interface GitHubPage {
  /**
   * Path segment after `/<owner>/<repo>/`: `pull` or `issues`.
   */
  segment: string;
  /**
   * Title headings, best first.
   */
  headings: readonly string[];
  /**
   * Tab title suffix after the title, for item number `n`, without the optional
   * ` · GitHub` end. A regex source.
   */
  tabSuffix: (n: string) => string;
}

const PULL_REQUEST: GitHubPage = {
  segment: 'pull',
  headings: ['[data-testid="issue-title"]', 'bdi.js-issue-title', 'h1 bdi.markdown-title'],
  // Greedy title capture: only the last ` by <login>` before the suffix goes.
  tabSuffix: (n) => `\\s+by\\s+\\S+\\s+·\\s+Pull Request\\s+#${n}`,
};

const ISSUE: GitHubPage = {
  segment: 'issues',
  headings: ['[data-testid="issue-title"]', 'bdi.js-issue-title'],
  tabSuffix: (n) => `\\s+·\\s+Issue\\s+#${n}`,
};

/**
 * Finds the GitHub pull request on a pull request page, on any tab of it, on
 * github.com or a GitHub Enterprise host.
 * The copied URL drops the tab suffix, the query and the anchor.
 */
export function detectGitHubPr(doc: Document, pageUrl: string): CopyLink | null {
  return detectGitHubPage(PULL_REQUEST, doc, pageUrl);
}

/**
 * Finds the GitHub issue on an issue page, on github.com or a GitHub Enterprise host.
 * The copied URL drops the query and the anchor.
 */
export function detectGitHubIssue(doc: Document, pageUrl: string): CopyLink | null {
  return detectGitHubPage(ISSUE, doc, pageUrl);
}

function detectGitHubPage(page: GitHubPage, doc: Document, pageUrl: string): CopyLink | null {
  const url = parseUrl(pageUrl);
  if (!url) {
    return null;
  }

  // Match the path, not the host, so GitHub Enterprise works too.
  const pattern = new RegExp(`^/([^/]+)/([^/]+)/${page.segment}/(\\d+)(?:/|$)`);
  const match = pattern.exec(url.pathname);
  const owner = match?.[1];
  const repo = match?.[2];
  const n = match?.[3];
  if (!owner || !repo || !n) {
    return null;
  }

  // The tab title ends with `<suffix> · <owner>/<repo>`, then ` · GitHub` in server HTML.
  // Any other tab title, such as the generic one while the page loads, gives no title.
  const tabTitle = new RegExp(`^(.*)${page.tabSuffix(n)}\\s+·\\s+\\S+/\\S+(?:\\s+·\\s+GitHub)?$`);
  return {
    prefix: `${repo}#${n}`,
    title: headingOrTabTitle(doc, page.headings, (title) => tabTitle.exec(title)?.[1] ?? ''),
    url: `${url.origin}/${owner}/${repo}/${page.segment}/${n}`,
    separator: CODE_HOST_SEPARATOR,
  };
}
