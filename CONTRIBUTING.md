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
| `scripts/`                       | Font copy and icon generation scripts                                       |
| `docs/images/`, `docs/store/`    | README images, Chrome Web Store listing; HTML sources in `docs/images/src/` |

After you change a logo SVG, run `node scripts/generate-icons.mjs` and commit the PNGs in `public/icon/`.

## Test

Every change adds or updates unit tests in `test/`. `npm test` must pass before you open a pull request. CI runs the same command.

Use made-up names in tests, fixtures and docs (`ABC-123`, `octo-org/my-service`, `group/project`, `example.com`). Do not paste real URLs or titles from your company.

## Refresh the README and store images

The image sources are HTML pages in `docs/images/src/`. Take each screenshot in a Chromium browser at the viewport in the tables, and check every image by eye before you commit it. Chrome screenshots are RGB PNG files with no alpha channel, as the Chrome Web Store requires.

Images without a card: serve the repo root over HTTP (for example `python3 -m http.server 8765`), so that the pages can load the logo from `assets/` and the fonts from `public/fonts/`. Then open the page and save a screenshot.

| Image                            | Source page           | Viewport                  | Used for                                                                            |
| -------------------------------- | --------------------- | ------------------------- | ----------------------------------------------------------------------------------- |
| `docs/images/hero.png`           | `hero.html`           | 1280×560                  | README before and after image                                                       |
| `docs/store/screenshot-1.png`    | `hero.html`           | 1280×800 (adds a caption) | Chrome Web Store screenshot 1                                                       |
| `docs/images/social-preview.png` | `social-preview.html` | 1280×640                  | GitHub social preview; upload it by hand in the repository settings, Social preview |
| `docs/store/promo-440x280.png`   | `promo.html`          | 440×280                   | Chrome Web Store small promo tile                                                   |

Images with a card: the card must come from the built copy script.

1. Run `npm run build`.
2. Serve a folder that holds the page at its made-up path, and `copy-issue.js` and `fonts/` from `.output/chrome-mv3/` in `_ext/`.
3. Start Chromium with `--host-resolver-rules="MAP git.example.test 127.0.0.1:<port>"` and open the page at `http://git.example.test/<path>`.
4. In the page, stub `navigator.clipboard.write` and `chrome.runtime.getURL` (it returns `/_ext` plus the path), then add `/_ext/copy-issue.js` as a script.
5. Take the screenshot while the card shows (2.8 seconds).

The headless check in `.agents/skills/verify/SKILL.md` has the exact commands for steps 2 to 5.

| Image                              | Source page, served at                            | Viewport                  |
| ---------------------------------- | ------------------------------------------------- | ------------------------- |
| `docs/images/copied-card.png`      | `pr-page.html` at `/octo-org/my-service/pull/42/` | 640×360 at device scale 2 |
| `docs/images/copied-card-jira.png` | `jira-page.html` at `/browse/ABC-123/`            | 640×360 at device scale 2 |
| `docs/store/screenshot-2.png`      | `pr-page.html` at `/octo-org/my-service/pull/42/` | 1280×800                  |

## Pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org/) with a scope, for example `fix(gitlab): keep the work item segment`.
- Run `npm test` and `npm run format:check` before you push.
- Describe what changed and how you tested it.
- Pull requests merge with a merge commit, not a squash, so each commit stays as written.

## Release process

Maintainers only. A merge to `main` releases a new version automatically. See the [Release](README.md#release) section of the README.
