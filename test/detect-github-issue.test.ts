import { detectGitHubIssue } from '../src/lib/detect-github';
import { load } from './load-document';

const ISSUE_URL = 'https://github.com/octo-org/my-service/issues/42';
const HEADING = `
  <h1>
    <bdi data-testid="issue-title" class="markdown-title">
      Upload fails on large files
    </bdi>
  </h1>
`;

describe('detectGitHubIssue', () => {
  it('uses the issue URL and the title heading', () => {
    expect(detectGitHubIssue(load(HEADING), ISSUE_URL)).toEqual({
      prefix: 'my-service#42',
      title: 'Upload fails on large files',
      url: 'https://github.com/octo-org/my-service/issues/42',
      separator: ' | ',
    });
  });

  it.each([
    'https://github.com/octo-org/my-service/issues/42?q=is%3Aopen',
    'https://github.com/octo-org/my-service/issues/42#issuecomment-123',
    'https://github.com/octo-org/my-service/issues/42/',
  ])('drops the query and anchor from %s', (pageUrl) => {
    expect(detectGitHubIssue(load(HEADING), pageUrl)?.url).toBe(
      'https://github.com/octo-org/my-service/issues/42',
    );
  });

  it('works on a GitHub Enterprise host', () => {
    const link = detectGitHubIssue(
      load(HEADING),
      'https://github.example.com/octo-org/my-service/issues/7',
    );
    expect(link).toEqual({
      prefix: 'my-service#7',
      title: 'Upload fails on large files',
      url: 'https://github.example.com/octo-org/my-service/issues/7',
      separator: ' | ',
    });
  });

  it('reads the title from the older heading', () => {
    const doc = load('<bdi class="js-issue-title">Upload fails on large files</bdi>');
    expect(detectGitHubIssue(doc, ISSUE_URL)?.title).toBe('Upload fails on large files');
  });

  it.each([
    'Upload fails on large files · Issue #42 · octo-org/my-service',
    'Upload fails on large files · Issue #42 · octo-org/my-service · GitHub',
  ])('falls back to the tab title %s without its suffix', (tabTitle) => {
    expect(detectGitHubIssue(load('', tabTitle), ISSUE_URL)?.title).toBe(
      'Upload fails on large files',
    );
  });

  it('gives a blank title when the tab title is not an issue title', () => {
    const doc = load('', 'GitHub · Where software is built');
    expect(detectGitHubIssue(doc, ISSUE_URL)?.title).toBe('');
  });

  it('gives a blank title when the page has none', () => {
    expect(detectGitHubIssue(load(''), ISSUE_URL)?.title).toBe('');
  });

  it.each([
    'https://github.com/octo-org/my-service/pull/42',
    'https://github.com/octo-org/my-service/issues',
    'https://gitlab.com/group/project/-/issues/42',
    'https://jira.example.com/projects/ABC/issues/ABC-123',
    'not a url',
  ])('returns null for %s', (pageUrl) => {
    expect(detectGitHubIssue(load(HEADING), pageUrl)).toBeNull();
  });
});
