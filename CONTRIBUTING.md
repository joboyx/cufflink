# Contributing

Thank you for your help. Please read the [Code of Conduct](CODE_OF_CONDUCT.md) first.

## Set up

You need Node 20 or newer. `.nvmrc` pins Node 22, the version CI uses.

```bash
git clone https://github.com/joboyx/jira-link-copy.git
cd jira-link-copy
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

| Path                             | Purpose                                                                    |
| -------------------------------- | -------------------------------------------------------------------------- |
| `src/entrypoints/background.ts`  | Runs the copy script in the active tab on the shortcut or the toolbar icon |
| `src/entrypoints/copy-issue.ts`  | The script that the background injects; calls `copyCurrentLink`            |
| `src/lib/run-copy.ts`            | Detect, copy and show the card                                             |
| `src/lib/detect-copy-link.ts`    | Picks the detector for the page; code host pages go before Jira            |
| `src/lib/detect-issue.ts`        | Jira issue page and board card                                             |
| `src/lib/detect-github.ts`       | GitHub pull request and issue                                              |
| `src/lib/detect-gitlab-mr.ts`    | GitLab merge request                                                       |
| `src/lib/detect-gitlab-issue.ts` | GitLab issue and work item                                                 |
| `src/lib/read-page.ts`           | URL parsing and the heading or tab title fallback                          |
| `src/lib/issue-key.ts`           | Finds a Jira issue key in text                                             |
| `src/lib/format-link.ts`         | Link label, plain text and HTML; the 100-character cut                     |
| `src/lib/escape.ts`              | HTML escaping                                                              |
| `src/lib/clipboard.ts`           | Writes rich and plain text to the clipboard                                |
| `src/lib/toast.ts`               | The result card                                                            |
| `src/lib/theme.ts`               | Dark or light card colors from the page                                    |
| `src/lib/fonts.ts`               | Loads the bundled fonts for the card                                       |
| `test/*.test.ts`                 | Jest unit tests, one file per module                                       |
| `test/load-document.ts`          | Test helper that loads an HTML string into the test document               |
| `public/icon/`, `public/fonts/`  | Extension icons and bundled fonts with their licenses                      |
| `scripts/`                       | Font copy and icon generation scripts                                      |

## Test

Every change adds or updates unit tests in `test/`. `npm test` must pass before you open a pull request. CI runs the same command.

Use made-up names in tests, fixtures and docs (`ABC-123`, `octo-org/my-service`, `group/project`, `example.com`). Do not paste real URLs or titles from your company.

## Pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org/) with a scope, for example `fix(gitlab): keep the work item segment`.
- Run `npm test` and `npm run format:check` before you push.
- Describe what changed and how you tested it.
- Pull requests merge with a merge commit, not a squash, so each commit stays as written.

## Release process

Maintainers only. A merge to `main` releases a new version automatically. See the [Release](README.md#release) section of the README.
