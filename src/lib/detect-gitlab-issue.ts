import { CODE_HOST_SEPARATOR, type CopyLink } from './format-link';
import { headingOrTabTitle, parseUrl } from './read-page';

// Match the path, not the host, so self-managed GitLab works too. gitlab.com opens
// an issue as a work item, so both path segments are issue pages. A group-level
// work item (`/groups/<group>/-/work_items/<iid>`, such as an epic) is not a project
// issue, and a `<group>#<iid>` label would name a different item.
const ISSUE_PATH_PATTERN = /^\/(?!groups\/)(.+?)\/-\/(issues|work_items)\/(\d+)(?:\/|$)/;

const TITLE_SELECTORS = ['h1[data-testid="work-item-title"]', 'h1[data-testid="title-content"]'];

/**
 * Finds the GitLab issue on an issue or work item page.
 * The copied URL keeps the `issues` or `work_items` segment of the page and drops
 * the tab suffix, the query and the anchor.
 */
export function detectGitLabIssue(doc: Document, pageUrl: string): CopyLink | null {
  const url = parseUrl(pageUrl);
  if (!url) {
    return null;
  }

  const match = ISSUE_PATH_PATTERN.exec(url.pathname);
  const projectPath = match?.[1];
  const segment = match?.[2];
  const iid = match?.[3];
  if (!projectPath || !segment || !iid) {
    return null;
  }

  const project = projectPath.slice(projectPath.lastIndexOf('/') + 1);
  return {
    prefix: `${project}#${iid}`,
    title: titleFromDocument(doc, iid),
    url: `${url.origin}/${projectPath}/-/${segment}/${iid}`,
    separator: CODE_HOST_SEPARATOR,
  };
}

/**
 * Reads the issue title from the page heading, or from the tab title without its
 * ` (#<iid>) · Issue · …` suffix. A tab title without that suffix gives a blank title.
 */
function titleFromDocument(doc: Document, iid: string): string {
  const tabTitle = new RegExp(`^(.*)\\(#${iid}\\)\\s+·\\s+.*$`);
  return headingOrTabTitle(doc, TITLE_SELECTORS, (title) => tabTitle.exec(title)?.[1] ?? '');
}
