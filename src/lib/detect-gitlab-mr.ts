import { CODE_HOST_SEPARATOR, type CopyLink } from './format-link';
import { headingOrTabTitle, parseUrl } from './read-page';

// Match the path, not the host, so self-managed GitLab works too.
const MERGE_REQUEST_PATH_PATTERN = /^\/(.+?)\/-\/merge_requests\/(\d+)(?:\/|$)/;

const TITLE_SELECTORS = ['h1[data-testid="title-content"]'];

/**
 * Finds the GitLab merge request on a merge request page, on any tab of it.
 * The copied URL drops the tab suffix, the query and the anchor.
 */
export function detectGitLabMr(doc: Document, pageUrl: string): CopyLink | null {
  const url = parseUrl(pageUrl);
  if (!url) {
    return null;
  }

  const match = MERGE_REQUEST_PATH_PATTERN.exec(url.pathname);
  const projectPath = match?.[1];
  const iid = match?.[2];
  if (!projectPath || !iid) {
    return null;
  }

  const project = projectPath.slice(projectPath.lastIndexOf('/') + 1);
  return {
    prefix: `${project}!${iid}`,
    title: titleFromDocument(doc, iid),
    url: `${url.origin}/${projectPath}/-/merge_requests/${iid}`,
    separator: CODE_HOST_SEPARATOR,
  };
}

/**
 * Reads the merge request title from the page heading, or from the tab title
 * without its ` (!<iid>) · Merge requests · … · GitLab` suffix.
 */
function titleFromDocument(doc: Document, iid: string): string {
  const suffix = new RegExp(`\\s*\\(!${iid}\\)\\s+·\\s+Merge requests\\s+·.*$`);
  return headingOrTabTitle(doc, TITLE_SELECTORS, (tabTitle) => tabTitle.replace(suffix, ''));
}
