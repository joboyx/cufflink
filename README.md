<p align="center">
  <img src="public/icon/128.png" alt="Jira Link Copy icon: a light card with a blue top bar, a dark dot and two text lines, on a dark background" width="128">
</p>

<h1 align="center">Jira Link Copy</h1>

<p align="center">A Chrome extension that copies a formatted link to a Jira issue, a GitHub pull request or issue, or a GitLab merge request or issue from the current tab.</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3"><img src="https://img.shields.io/badge/Chrome-MV3%20extension-4285f4.svg" alt="Chrome MV3 extension"></a>
  <a href="https://github.com/joboyx/jira-link-copy/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/joboyx/jira-link-copy/ci.yml?branch=main&label=CI" alt="CI status"></a>
  <a href="https://github.com/joboyx/jira-link-copy/releases/latest"><img src="https://img.shields.io/github/v/release/joboyx/jira-link-copy" alt="Latest release"></a>
</p>

![A dark GitHub pull request page titled "Add retry to upload #42" in the made-up repo octo-org/my-service. In the bottom-right corner, a card reads "COPIED", then "my-service#42 | Add retry to upload", then the URL "http://git.example.test/octo-org/my-service/pull/42".](docs/images/copied-card.png)

## Why

A pasted URL shows no issue key and no title, so readers must open it to know what it is. Typing a link with a key and a title by hand is slow. This extension copies the link, the key and the title with one shortcut, as rich text for apps that keep links and as plain text for apps that do not.

## What it copies

- Rich text (normal paste): `ABC-123: Summary` as a link to `https://<host>/browse/ABC-123`
- Rich text on a GitLab merge request: `my-service!42 | Title` as a link to `https://<host>/group/subgroup/my-service/-/merge_requests/42`
- Rich text on a GitHub pull request or issue: `my-service#42 | Title` as a link to `https://<host>/octo-org/my-service/pull/42` or `.../issues/42`
- Rich text on a GitLab issue: `my-service#42 | Title` as a link to `https://<host>/group/subgroup/my-service/-/issues/42` (or `.../-/work_items/42`)
- Plain text (paste as plain text): the same label with no hyperlink
- A label longer than 100 characters gets a cut title that ends with `…`. The `ABC-123`, `my-service!42` or `my-service#42` part is never cut, and the link target stays the full URL.

Paste as plain text:

- Windows: Ctrl+Shift+V
- macOS Cocoa apps: Option-Shift-Command-V (Paste and Match Style)
- Google Docs and similar web apps: Command-Shift-V (paste without formatting)

The extension reads the link on:

- a Jira issue page (`/browse/ABC-123`)
- a Jira board when a card is selected or focused
- a GitLab merge request page, any tab (`/<project path>/-/merge_requests/42`), on gitlab.com or a self-managed host
- a GitLab issue page (`/<project path>/-/issues/42` or `/-/work_items/42`), on gitlab.com or a self-managed host
- a GitHub pull request page, any tab (`/<owner>/<repo>/pull/42`), on github.com or a GitHub Enterprise host
- a GitHub issue page (`/<owner>/<repo>/issues/42`), on github.com or a GitHub Enterprise host

The copied URL is always the browse URL for a Jira issue, not the board URL. For a merge request, pull request or GitHub or GitLab issue it is the overview URL, without the tab, query or anchor.

After each copy, a card in the bottom-right corner shows the result. It uses the Tokyo Night colors on a dark page and Tokyo Day on a light page.

## Install

Download the latest release zip. You do not need to clone the repo or run a build.

1. Open the latest GitHub Release.
2. Download the Chrome zip.
3. Unzip the file.
4. Open `chrome://extensions`.
5. Enable Developer mode.
6. Choose Load unpacked and select the unzipped folder.

Release page: https://github.com/joboyx/jira-link-copy/releases/latest

## Shortcut

Default: Alt+X (Option+X on Mac). Change the shortcut in `chrome://extensions/shortcuts`.

Click the toolbar icon to copy the same way.

## Permissions

The extension injects a script into the active tab when you copy. It does not request host access to every site.

## Limitations

- **Active tab only, on request.** The extension acts only on the active tab, and only when you press the shortcut or click the toolbar icon.
- **Title fallback.** The title comes from the page heading. When the page has no heading yet, the title comes from the tab title. When the tab title has no usable title, the label is only the key, such as `ABC-123`.
- **No group-level GitLab work items.** A work item at the group level (`/groups/<group>/-/work_items/42`, such as an epic) is not supported.
- **No match.** On a page with no issue, pull request or merge request, the card shows `Not found`.
- **Browser pages.** Chrome does not let an extension run on its own pages, such as `chrome://` pages. There, the toolbar icon shows a red `!` badge for 2 seconds.

## Develop

Requires Node 20 or newer (`.nvmrc` pins 22).

1. Run `npm run setup`
2. Run `npm run build`
3. Open `chrome://extensions`
4. Enable Developer mode
5. Choose Load unpacked and select `.output/chrome-mv3`

For local reload while you edit, run `npm start` and load `.output/chrome-mv3` the same way.

## Commands

| Command         | What it does                               |
| --------------- | ------------------------------------------ |
| `npm run setup` | Install dependencies                       |
| `npm start`     | Build in watch mode                        |
| `npm run build` | Production build                           |
| `npm test`      | Lint, type coverage, unit tests, and build |
| `npm run zip`   | Pack a Chrome zip                          |
| `npm run fonts` | Copy the bundled fonts into `public/fonts` |

## Fonts

The card uses JetBrains Mono and IBM Plex Sans, bundled in `public/fonts` because many Jira sites block web font hosts. Both fonts use the SIL Open Font License 1.1; the license files are next to the fonts.

## Release

Every merge to `main` publishes the next patch release from the latest tag, with the Chrome zip attached.

The `package.json` version is the base. A pull request that raises it releases that version instead:
`npm version X.Y.0 --no-git-tag-version`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). To report a security problem, see [SECURITY.md](SECURITY.md).

## Acknowledgements

The card bundles [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) and [IBM Plex Sans](https://github.com/IBM/plex), both under the [SIL Open Font License 1.1](https://openfontlicense.org). License files: [`public/fonts/OFL-JetBrainsMono.txt`](public/fonts/OFL-JetBrainsMono.txt) and [`public/fonts/OFL-IBMPlexSans.txt`](public/fonts/OFL-IBMPlexSans.txt).

## License

MIT. See [LICENSE](LICENSE).
