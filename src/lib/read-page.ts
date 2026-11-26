/**
 * Parses the page URL, or gives null when it is not a valid URL.
 */
export function parseUrl(pageUrl: string): URL | null {
  try {
    return new URL(pageUrl);
  } catch {
    return null;
  }
}

/**
 * Reads a page title from the first heading that has text, else from the tab title.
 * `fromTabTitle` gets `document.title` and returns the title without the site suffix,
 * or a blank string when the tab title has no usable title.
 */
export function headingOrTabTitle(
  doc: Document,
  headingSelectors: readonly string[],
  fromTabTitle: (tabTitle: string) => string,
): string {
  for (const selector of headingSelectors) {
    const heading = collapseSpace(doc.querySelector(selector)?.textContent ?? '');
    if (heading) {
      return heading;
    }
  }
  return collapseSpace(fromTabTitle(doc.title));
}

// Collapses each run of white space to one space and trims the ends.
function collapseSpace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}
