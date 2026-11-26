import { detectGitHubPr } from '../src/lib/detect-github';
import { load } from './load-document';

const PR_URL = 'https://github.com/octo-org/my-service/pull/42';
const HEADING = `
  <h1 class="prc-PageHeader-Title">
    <bdi data-testid="issue-title" class="markdown-title">
      Add retry to upload
    </bdi>
  </h1>
`;

describe('detectGitHubPr', () => {
  it('uses the pull request URL and the title heading', () => {
    expect(detectGitHubPr(load(HEADING), PR_URL)).toEqual({
      prefix: 'my-service#42',
      title: 'Add retry to upload',
      url: 'https://github.com/octo-org/my-service/pull/42',
      separator: ' | ',
    });
  });

  it.each([
    'https://github.com/octo-org/my-service/pull/42/files',
    'https://github.com/octo-org/my-service/pull/42/commits',
    'https://github.com/octo-org/my-service/pull/42/checks',
    'https://github.com/octo-org/my-service/pull/42?w=1',
    'https://github.com/octo-org/my-service/pull/42#issuecomment-123',
  ])('drops the tab, query and anchor from %s', (pageUrl) => {
    expect(detectGitHubPr(load(HEADING), pageUrl)?.url).toBe(
      'https://github.com/octo-org/my-service/pull/42',
    );
  });

  it('works on a GitHub Enterprise host', () => {
    const link = detectGitHubPr(
      load(HEADING),
      'https://github.example.com/octo-org/my-service/pull/7/files',
    );
    expect(link).toEqual({
      prefix: 'my-service#7',
      title: 'Add retry to upload',
      url: 'https://github.example.com/octo-org/my-service/pull/7',
      separator: ' | ',
    });
  });

  it.each([
    '<bdi class="js-issue-title markdown-title">Add retry to upload</bdi>',
    '<h1><bdi class="markdown-title">Add retry to upload</bdi></h1>',
  ])('reads the title from the older heading %s', (html) => {
    expect(detectGitHubPr(load(html), PR_URL)?.title).toBe('Add retry to upload');
  });

  it.each([
    'Add retry to upload by octocat · Pull Request #42 · octo-org/my-service',
    'Add retry to upload by octocat · Pull Request #42 · octo-org/my-service · GitHub',
  ])('falls back to the tab title %s without its suffix', (tabTitle) => {
    expect(detectGitHubPr(load('', tabTitle), PR_URL)?.title).toBe('Add retry to upload');
  });

  it('keeps an earlier " by " in the tab title fallback', () => {
    const doc = load('', 'Sort by date by octocat · Pull Request #42 · octo-org/my-service');
    expect(detectGitHubPr(doc, PR_URL)?.title).toBe('Sort by date');
  });

  it('gives a blank title when the tab title is not a pull request title', () => {
    const doc = load('', 'GitHub · Where software is built');
    expect(detectGitHubPr(doc, PR_URL)?.title).toBe('');
  });

  it('gives a blank title when the page has none', () => {
    expect(detectGitHubPr(load(''), PR_URL)?.title).toBe('');
  });

  it.each([
    'https://github.com/octo-org/my-service/issues/42',
    'https://github.com/octo-org/my-service/pulls',
    'https://github.com/octo-org/my-service',
    'https://gitlab.com/group/project/-/merge_requests/42',
    'https://jira.example.com/browse/ABC-123',
    'not a url',
  ])('returns null for %s', (pageUrl) => {
    expect(detectGitHubPr(load(HEADING), pageUrl)).toBeNull();
  });
});
