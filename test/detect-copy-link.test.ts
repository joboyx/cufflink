import { detectCopyLink } from '../src/lib/detect-copy-link';
import { load } from './load-document';

describe('detectCopyLink', () => {
  it('copies the merge request when its title has a Jira key', () => {
    const doc = load(
      '<h1 data-testid="title-content">feat(ABC-12): add retry to upload</h1>',
      'feat(ABC-12): add retry to upload (!42) · Merge requests · Group / Project · GitLab',
    );
    expect(
      detectCopyLink(doc, 'https://gitlab.example.com/group/project/-/merge_requests/42'),
    ).toEqual({
      prefix: 'project!42',
      title: 'feat(ABC-12): add retry to upload',
      url: 'https://gitlab.example.com/group/project/-/merge_requests/42',
      separator: ' | ',
    });
  });

  it('copies the GitHub pull request when its title has a Jira key', () => {
    const doc = load(
      '',
      'feat(ABC-12): add retry to upload by octocat · Pull Request #42 · octo-org/my-service',
    );
    expect(detectCopyLink(doc, 'https://github.com/octo-org/my-service/pull/42/files')).toEqual({
      prefix: 'my-service#42',
      title: 'feat(ABC-12): add retry to upload',
      url: 'https://github.com/octo-org/my-service/pull/42',
      separator: ' | ',
    });
  });

  it('copies the GitLab issue when its title has a Jira key', () => {
    const doc = load('', 'ABC-12 upload fails (#5) · Issue · group/project');
    expect(detectCopyLink(doc, 'https://gitlab.example.com/group/project/-/issues/5')).toEqual({
      prefix: 'project#5',
      title: 'ABC-12 upload fails',
      url: 'https://gitlab.example.com/group/project/-/issues/5',
      separator: ' | ',
    });
  });

  it('copies the Jira issue on a Jira page', () => {
    const doc = load(
      '<h1 data-testid="issue.views.issue-base.foundation.summary.heading">Reset password flow</h1>',
    );
    expect(detectCopyLink(doc, 'https://jira.example.com/browse/ABC-12')).toEqual({
      prefix: 'ABC-12',
      title: 'Reset password flow',
      url: 'https://jira.example.com/browse/ABC-12',
      separator: ': ',
    });
  });

  it('returns null when the page has neither', () => {
    expect(detectCopyLink(load('<p>Inbox</p>', 'Inbox'), 'https://example.com/mail')).toBeNull();
  });
});
