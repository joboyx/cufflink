/**
 * Puts `html` in the jsdom body, sets the tab title, and returns the document.
 */
export function load(html: string, title = ''): Document {
  document.body.innerHTML = html;
  document.title = title;
  return document;
}
