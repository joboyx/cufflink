import { detectGitLabMr } from '../src/lib/detect-gitlab-mr';
import { load } from './load-document';

const MR_URL = 'https://gitlab.com/group/project/-/merge_requests/42';
const HEADING = `
  <h1 class="title gl-heading-1" data-testid="title-content">
    Add retry to upload
  </h1>
`;

describe('detectGitLabMr', () => {
  it('uses the merge request URL and the title heading', () => {
    expect(detectGitLabMr(load(HEADING), MR_URL)).toEqual({
      prefix: 'project!42',
      title: 'Add retry to upload',
      url: 'https://gitlab.com/group/project/-/merge_requests/42',
      separator: ' | ',
    });
  });

  it.each([
    'https://gitlab.com/group/project/-/merge_requests/42/diffs',
    'https://gitlab.com/group/project/-/merge_requests/42/commits',
    'https://gitlab.com/group/project/-/merge_requests/42?tab=pipelines',
    'https://gitlab.com/group/project/-/merge_requests/42#note_123',
  ])('drops the tab, query and anchor from %s', (pageUrl) => {
    expect(detectGitLabMr(load(HEADING), pageUrl)?.url).toBe(
      'https://gitlab.com/group/project/-/merge_requests/42',
    );
  });

  it('keeps a nested group path and uses its last segment as the prefix', () => {
    const link = detectGitLabMr(
      load(HEADING),
      'https://gitlab.com/group/subgroup/my-service/-/merge_requests/42/diffs',
    );
    expect(link).toEqual({
      prefix: 'my-service!42',
      title: 'Add retry to upload',
      url: 'https://gitlab.com/group/subgroup/my-service/-/merge_requests/42',
      separator: ' | ',
    });
  });

  it('works on a self-managed host', () => {
    const link = detectGitLabMr(
      load(HEADING),
      'https://gitlab.example.com/group/project/-/merge_requests/7',
    );
    expect(link).toEqual({
      prefix: 'project!7',
      title: 'Add retry to upload',
      url: 'https://gitlab.example.com/group/project/-/merge_requests/7',
      separator: ' | ',
    });
  });

  it('falls back to the tab title without its GitLab suffix', () => {
    const doc = load('', 'Add retry to upload (!42) · Merge requests · Group / Project · GitLab');
    expect(detectGitLabMr(doc, MR_URL)?.title).toBe('Add retry to upload');
  });

  it('keeps a Draft: prefix in the tab title fallback', () => {
    const doc = load(
      '',
      'Draft: Add retry to upload (!42) · Merge requests · Group / Project · GitLab',
    );
    expect(detectGitLabMr(doc, MR_URL)?.title).toBe('Draft: Add retry to upload');
  });

  it('gives a blank title when the page has none', () => {
    expect(detectGitLabMr(load(''), MR_URL)?.title).toBe('');
  });

  it.each([
    'https://gitlab.com/group/project/-/issues/5',
    'https://gitlab.com/group/project',
    'https://gitlab.com/group/project/-/merge_requests',
    'https://jira.example.com/browse/ABC-123',
    'not a url',
  ])('returns null for %s', (pageUrl) => {
    expect(detectGitLabMr(load(HEADING), pageUrl)).toBeNull();
  });
});
