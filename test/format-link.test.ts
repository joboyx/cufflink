import {
  JIRA_SEPARATOR,
  MAX_LABEL_LENGTH,
  CODE_HOST_SEPARATOR,
  formatHtml,
  formatLinkLabel,
  formatPlainText,
} from '../src/lib/format-link';
import { escapeHtml } from '../src/lib/escape';

const issue = {
  prefix: 'ABC-12',
  title: 'Reset password flow',
  url: 'https://jira.example.com/browse/ABC-12',
  separator: JIRA_SEPARATOR,
};

const mergeRequest = {
  prefix: 'my-service!42',
  title: 'Add retry to upload',
  url: 'https://gitlab.example.com/group/subgroup/my-service/-/merge_requests/42',
  separator: CODE_HOST_SEPARATOR,
};

describe('formatLinkLabel', () => {
  it('joins key and summary', () => {
    expect(formatLinkLabel(issue)).toBe('ABC-12: Reset password flow');
  });

  it('uses the key when summary is blank', () => {
    expect(formatLinkLabel({ ...issue, title: '  ' })).toBe('ABC-12');
  });

  it('joins a merge request prefix and title with a vertical bar', () => {
    expect(formatLinkLabel(mergeRequest)).toBe('my-service!42 | Add retry to upload');
  });

  it('uses the merge request prefix when the title is blank', () => {
    expect(formatLinkLabel({ ...mergeRequest, title: ' ' })).toBe('my-service!42');
  });
});

describe('label length cap', () => {
  // 'ABC-12: ' is 8 characters, so a summary of n characters gives a label of n + 8.
  const withSummaryLength = (n: number, fill = 'x') => ({ ...issue, title: fill.repeat(n) });

  it('keeps a label of exactly 100 characters', () => {
    const label = formatLinkLabel(withSummaryLength(92));
    expect(MAX_LABEL_LENGTH).toBe(100);
    expect(label).toHaveLength(100);
    expect(label).toBe(`ABC-12: ${'x'.repeat(92)}`);
  });

  it('cuts a label of 101 characters to 100 and ends with one ellipsis', () => {
    const label = formatLinkLabel(withSummaryLength(93));
    expect(label).toHaveLength(100);
    expect(label).toBe(`ABC-12: ${'x'.repeat(91)}…`);
    expect(label.endsWith('...')).toBe(false);
  });

  it('cuts only the title of a merge request label', () => {
    // 'my-service!42 | ' is 16 characters, so 85 x give 101 characters.
    const label = formatLinkLabel({ ...mergeRequest, title: 'x'.repeat(85) });
    expect(label).toHaveLength(100);
    expect(label).toBe(`my-service!42 | ${'x'.repeat(83)}…`);
  });

  it('keeps a long prefix whole and cuts the title to fit', () => {
    const prefix = `${'p'.repeat(57)}!42`;
    const label = formatLinkLabel({ ...mergeRequest, prefix, title: 'x'.repeat(100) });
    expect(label).toHaveLength(100);
    expect(label).toBe(`${prefix} | ${'x'.repeat(36)}…`);
  });

  it('keeps a prefix longer than the cap whole and replaces the title with the ellipsis', () => {
    const prefix = `${'p'.repeat(110)}!42`;
    const label = formatLinkLabel({ ...mergeRequest, prefix, title: 'Add retry to upload' });
    expect(label).toBe(`${prefix} | …`);
  });

  it('puts the same cut label in plain text and HTML, and keeps the full href', () => {
    const long = { ...issue, title: 'word '.repeat(40) };
    const label = formatLinkLabel(long);
    expect(label.length).toBeLessThanOrEqual(MAX_LABEL_LENGTH);
    expect(label.endsWith('…')).toBe(true);
    expect(formatPlainText(long)).toBe(label);
    expect(formatHtml(long)).toBe(`<a href="https://jira.example.com/browse/ABC-12">${label}</a>`);
  });

  it('leaves no space before the ellipsis when the cut falls after a space', () => {
    // The first 99 characters end with a space: 'ABC-12: ' + 90 x + ' ' + 'y'.
    const label = formatLinkLabel({ ...issue, title: `${'x'.repeat(90)} ${'y'.repeat(10)}` });
    expect(label).toBe(`ABC-12: ${'x'.repeat(90)}…`);
  });

  it('does not split an emoji at the cut', () => {
    // Each family emoji is one visible character made of several code points.
    const family = '\u{1F468}‍\u{1F469}‍\u{1F467}';
    const label = formatLinkLabel({ ...issue, title: family.repeat(100) });
    expect([
      ...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(label),
    ]).toHaveLength(100);
    expect(label).toBe(`ABC-12: ${family.repeat(91)}…`);
  });

  it('does not split a combining mark from its base letter', () => {
    const accented = 'é';
    const label = formatLinkLabel({ ...issue, title: accented.repeat(100) });
    expect(label).toBe(`ABC-12: ${accented.repeat(91)}…`);
  });

  it('cuts before HTML escaping, so the label ends with a whole entity', () => {
    // 'ABC-12: ' + 91 '&' + 'tail' is 103 characters, so the 99th kept character is a '&'.
    const html = formatHtml({ ...issue, title: `${'&'.repeat(91)}tail` });
    expect(html).toBe(
      `<a href="https://jira.example.com/browse/ABC-12">ABC-12: ${'&amp;'.repeat(91)}…</a>`,
    );
  });
});

describe('formatPlainText', () => {
  it('returns the visible label with no hyperlink', () => {
    expect(formatPlainText(issue)).toBe('ABC-12: Reset password flow');
  });

  it('does not wrap a summary with brackets as a markdown link', () => {
    expect(formatPlainText({ ...issue, title: 'Fix [beta] flag' })).toBe('ABC-12: Fix [beta] flag');
  });
});

describe('formatHtml', () => {
  it('returns an anchor tag', () => {
    expect(formatHtml(issue)).toBe(
      '<a href="https://jira.example.com/browse/ABC-12">ABC-12: Reset password flow</a>',
    );
  });

  it('returns a merge request anchor tag', () => {
    expect(formatHtml(mergeRequest)).toBe(
      '<a href="https://gitlab.example.com/group/subgroup/my-service/-/merge_requests/42">my-service!42 | Add retry to upload</a>',
    );
  });

  it('escapes HTML in the summary', () => {
    expect(formatHtml({ ...issue, title: 'A <b>bold</b> fix' })).toBe(
      '<a href="https://jira.example.com/browse/ABC-12">ABC-12: A &lt;b&gt;bold&lt;/b&gt; fix</a>',
    );
  });
});

describe('escape helpers', () => {
  it('escapes HTML entities', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });
});
