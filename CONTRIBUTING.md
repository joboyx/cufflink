# Contributing

Thank you for your help. Please read the [Code of Conduct](CODE_OF_CONDUCT.md) first.

## Set up

You need Node 20 or newer. `.nvmrc` pins Node 22, the version CI uses.

```bash
git clone https://github.com/joboyx/cufflink.git
cd cufflink
nvm use
npm ci
```

`npm ci` also installs the Git pre-commit hook, which formats staged files with Prettier.

To try your build in Chrome, run `npm run build`, open `chrome://extensions`, enable Developer mode, choose Load unpacked and select `.output/chrome-mv3`.

## Scripts

| Command                   | What it does                                                 |
| ------------------------- | ------------------------------------------------------------ |
| `npm run setup`           | Install dependencies (`npm ci`)                              |
| `npm start`               | Build in watch mode                                          |
| `npm run build`           | Production build into `.output/chrome-mv3`                   |
| `npm test`                | Lint, type coverage, unit tests, and build (the CI check)    |
| `npm run test:unit`       | Unit tests with coverage                                     |
| `npm run test:unit:watch` | Unit tests in watch mode                                     |
| `npm run lint`            | ESLint with no warnings allowed                              |
| `npm run type-coverage`   | Fails when type coverage is below 100%                       |
| `npm run format`          | Format all files with Prettier                               |
| `npm run format:check`    | Check the format without changes                             |
| `npm run zip`             | Pack a Chrome zip into `.output/`                            |
| `npm run fonts`           | Copy the bundled fonts from `node_modules` to `public/fonts` |
| `npm run icons`           | Render the icons in `public/icon` from the logo SVGs         |
| `npm run clean`           | Remove build output and coverage                             |

## Code layout

| Path                             | Purpose                                                                     |
| -------------------------------- | --------------------------------------------------------------------------- |
| `src/entrypoints/background.ts`  | Runs the copy script in the active tab on the shortcut or the toolbar icon  |
| `src/entrypoints/copy-issue.ts`  | The script that the background injects; calls `copyCurrentLink`             |
| `src/lib/run-copy.ts`            | Detect, copy and show the card                                              |
| `src/lib/detect-copy-link.ts`    | Picks the detector for the page; code host pages go before Jira             |
| `src/lib/detect-issue.ts`        | Jira issue page and board card                                              |
| `src/lib/detect-github.ts`       | GitHub pull request and issue                                               |
| `src/lib/detect-gitlab-mr.ts`    | GitLab merge request                                                        |
| `src/lib/detect-gitlab-issue.ts` | GitLab issue and work item                                                  |
| `src/lib/read-page.ts`           | URL parsing and the heading or tab title fallback                           |
| `src/lib/issue-key.ts`           | Finds a Jira issue key in text                                              |
| `src/lib/format-link.ts`         | Link label, plain text and HTML; the 100-character cut                      |
| `src/lib/escape.ts`              | HTML escaping                                                               |
| `src/lib/clipboard.ts`           | Writes rich and plain text to the clipboard                                 |
| `src/lib/toast.ts`               | The result card                                                             |
| `src/lib/theme.ts`               | Dark or light card colors from the page                                     |
| `src/lib/fonts.ts`               | Loads the bundled fonts for the card                                        |
| `test/*.test.ts`                 | Jest unit tests, one file per module                                        |
| `test/load-document.ts`          | Test helper that loads an HTML string into the test document                |
| `assets/`                        | Logo SVGs: `icon.svg` (48 and 128 px) and `icon-small.svg` (16 and 32 px)   |
| `public/icon/`, `public/fonts/`  | Extension icons and bundled fonts with their licenses                       |
| `scripts/`                       | Font copy and icon render scripts                                           |
| `docs/images/`, `docs/store/`    | README images, Chrome Web Store listing; HTML sources in `docs/images/src/` |

After you change a logo SVG, run `npm run icons` and commit the PNGs in `public/icon/`. The icon test fails when a committed PNG does not match a fresh render of its SVG.

## Test

Every change adds or updates unit tests in `test/`. `npm test` must pass before you open a pull request. CI runs the same command.

Use made-up names in tests, fixtures and docs (`ABC-123`, `octo-org/my-service`, `group/project`, `example.com`). Do not paste real URLs or titles from your company.

## Refresh the README and store images

The image sources are HTML pages in `docs/images/src/`. Take each screenshot in Chrome at the viewport and device scale in the tables, and check every image by eye before you commit it. Chrome screenshots are RGB PNG files with no alpha channel, as the Chrome Web Store requires.

To shoot a page in Chrome:

1. Open DevTools and turn on the device toolbar (Ctrl+Shift+M, or Cmd+Shift+M on macOS).
2. Choose Responsive, then type the width and the height. Set the device pixel ratio (DPR) to the device scale. When the DPR field does not show, add it from the toolbar's more-options menu. For a DPR that the list does not have, such as 1.6, add a custom device in DevTools Settings, Devices.
3. Open the command menu (Ctrl+Shift+P, or Cmd+Shift+P) and run "Capture screenshot".

### Images without a card

Serve the repo root over HTTP (for example `python3 -m http.server 8765`), so that the pages can load the logo from `assets/` and the fonts from `public/fonts/`. Then open `http://localhost:8765/docs/images/src/<page>` and shoot it.

| Image                            | Source page           | Viewport, device scale          | Used for                                                                            |
| -------------------------------- | --------------------- | ------------------------------- | ----------------------------------------------------------------------------------- |
| `docs/images/hero.png`           | `hero.html`           | 830×400 at 2 (the README width) | README before and after image                                                       |
| `docs/store/screenshot-1.png`    | `hero.html`           | 800×500 at 1.6 (adds a caption) | Chrome Web Store screenshot 1                                                       |
| `docs/images/social-preview.png` | `social-preview.html` | 1280×640 at 1                   | GitHub social preview; upload it by hand in the repository settings, Social preview |
| `docs/store/promo-440x280.png`   | `promo.html`          | 440×280 at 1                    | Chrome Web Store small promo tile                                                   |

### Images with a card

The card must come from the built copy script. A plain `http` page has no clipboard, so you stub it in the page and then load the script.

1. Build, and put the made-up pages and the built script in a new folder:

   ```bash
   npm run build
   SITE="$(mktemp -d)"
   mkdir -p "$SITE/_ext" "$SITE/octo-org/my-service/pull/42" "$SITE/browse/ABC-123"
   cp -R .output/chrome-mv3/copy-issue.js .output/chrome-mv3/fonts "$SITE/_ext/"
   cp docs/images/src/pr-page.html "$SITE/octo-org/my-service/pull/42/index.html"
   cp docs/images/src/jira-page.html "$SITE/browse/ABC-123/index.html"
   python3 -m http.server 8765 --directory "$SITE"
   ```

2. Start a separate Chrome with an empty profile and a made-up host mapped to the server, so that the card shows a clean URL. On macOS, the Chrome binary is `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.

   ```bash
   google-chrome --user-data-dir="$(mktemp -d)" --host-resolver-rules="MAP git.example.test 127.0.0.1:8765"
   ```

3. Open the page at its path on `http://git.example.test/` and set the viewport from the table.
4. In the DevTools console, run this code. It stubs the clipboard and the extension URL, keeps the card on screen until the next reload, and loads the script:

   ```js
   Object.defineProperty(navigator, 'clipboard', { value: { write: () => Promise.resolve() } });
   window.ClipboardItem ??= class {};
   window.chrome = window.chrome || {};
   chrome.runtime = { getURL: (p) => '/_ext' + p };
   window.setTimeout = () => 0;
   document.head.append(
     Object.assign(document.createElement('script'), { src: '/_ext/copy-issue.js' }),
   );
   ```

5. Capture the screenshot as above.

| Image                              | Page URL path                  | Viewport, device scale | Card         |
| ---------------------------------- | ------------------------------ | ---------------------- | ------------ |
| `docs/images/copied-card.png`      | `/octo-org/my-service/pull/42` | 640×400 at 2           | Dark, GitHub |
| `docs/images/copied-card-jira.png` | `/browse/ABC-123`              | 640×360 at 2           | Light, Jira  |
| `docs/store/screenshot-2.png`      | `/browse/ABC-123`              | 640×400 at 2           | Light, Jira  |

Check that the card sits over empty page area and that no text line is cut at an edge of the image. For an automated, headless run of the same steps, see the repo skill `.agents/skills/verify/SKILL.md`.

## Pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org/) with a scope, for example `fix(gitlab): keep the work item segment`.
- Run `npm test` and `npm run format:check` before you push.
- Describe what changed and how you tested it.
- Pull requests merge with a merge commit, not a squash, so each commit stays as written.

## Release process

Maintainers only. A merge to `main` releases a new version automatically. See the [Release](README.md#release) section of the README.
