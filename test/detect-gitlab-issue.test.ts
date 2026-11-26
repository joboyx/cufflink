import { detectGitLabIssue } from '../src/lib/detect-gitlab-issue';
import { load } from './load-document';

const ISSUE_URL = 'https://gitlab.com/group/project/-/work_items/5';
const HEADING = `
  <h1 data-testid="work-item-title" class="gl-heading-1">
    Upload fails on large files
  </h1>
`;

describe('detectGitLabIssue', () => {
  it('uses the work item URL and the title heading', () => {
    expect(detectGitLabIssue(load(HEADING), ISSUE_URL)).toEqual({
      prefix: 'project#5',
      title: 'Upload fails on large files',
      url: 'https://gitlab.com/group/project/-/work_items/5',
      separator: ' | ',
    });
  });

  it('keeps the issues segment of an issue page', () => {
    expect(
      detectGitLabIssue(load(HEADING), 'https://gitlab.com/group/project/-/issues/5')?.url,
    ).toBe('https://gitlab.com/group/project/-/issues/5');
  });

  it.each([
    'https://gitlab.com/group/project/-/issues/5/designs',
    'https://gitlab.com/group/project/-/issues/5?show=related',
    'https://gitlab.com/group/project/-/issues/5#note_123',
  ])('drops the tab, query and anchor from %s', (pageUrl) => {
    expect(detectGitLabIssue(load(HEADING), pageUrl)?.url).toBe(
      'https://gitlab.com/group/project/-/issues/5',
    );
  });

  it('keeps a nested group path and uses its last segment as the prefix', () => {
    const link = detectGitLabIssue(
      load(HEADING),
      'https://gitlab.com/group/subgroup/my-service/-/work_items/42#note_1',
    );
    expect(link).toEqual({
      prefix: 'my-service#42',
      title: 'Upload fails on large files',
      url: 'https://gitlab.com/group/subgroup/my-service/-/work_items/42',
      separator: ' | ',
    });
  });

  it('works on a self-managed host', () => {
    const link = detectGitLabIssue(
      load(HEADING),
      'https://gitlab.example.com/group/project/-/issues/7',
    );
    expect(link).toEqual({
      prefix: 'project#7',
      title: 'Upload fails on large files',
      url: 'https://gitlab.example.com/group/project/-/issues/7',
      separator: ' | ',
    });
  });

  it('reads the title from the older issue heading', () => {
    const doc = load('<h1 data-testid="title-content">Upload fails on large files</h1>');
    expect(detectGitLabIssue(doc, ISSUE_URL)?.title).toBe('Upload fails on large files');
  });

  it.each([
    'Upload fails on large files (#5) · Issue · group/project',
    'Upload fails on large files (#5) · Issues · Group / Project · GitLab',
  ])('falls back to the tab title %s without its suffix', (tabTitle) => {
    expect(detectGitLabIssue(load('', tabTitle), ISSUE_URL)?.title).toBe(
      'Upload fails on large files',
    );
  });

  it('gives a blank title when the tab title is not an issue title', () => {
    const doc = load('', 'Group / Project · GitLab');
    expect(detectGitLabIssue(doc, ISSUE_URL)?.title).toBe('');
  });

  it('gives a blank title when the page has none', () => {
    expect(detectGitLabIssue(load(''), ISSUE_URL)?.title).toBe('');
  });

  it.each([
    'https://gitlab.com/group/project/-/merge_requests/5',
    'https://gitlab.com/group/project/-/issues',
    'https://gitlab.com/group/project',
    'https://github.com/octo-org/my-service/issues/5',
    'https://jira.example.com/browse/ABC-123',
    'not a url',
  ])('returns null for %s', (pageUrl) => {
    expect(detectGitLabIssue(load(HEADING), pageUrl)).toBeNull();
  });
});
