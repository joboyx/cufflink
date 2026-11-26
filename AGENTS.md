# Jira Link Copy

Chrome MV3 extension, built with WXT and TypeScript. When you press the shortcut (Alt+X) or click the toolbar icon, it injects a script into the active tab. The script finds a Jira issue, a GitHub pull request or issue, or a GitLab merge request or issue on the page, copies a formatted link (rich HTML and plain text) to the clipboard, and shows a result card. User docs are in `README.md`; contributor docs are in `CONTRIBUTING.md`.

## Layout

| Path                            | Content                                                                    |
| ------------------------------- | -------------------------------------------------------------------------- |
| `wxt.config.ts`                 | Manifest: name, permissions, shortcut, icons                               |
| `src/entrypoints/background.ts` | On the shortcut or icon click, injects `copy-issue.js` into the active tab |
| `src/entrypoints/copy-issue.ts` | Injected script; calls `copyCurrentLink`                                   |
| `src/lib/run-copy.ts`           | Detect, copy, show the card (wiring only; no unit tests)                   |
| `src/lib/detect-*.ts`           | One detector per page type; `detect-copy-link.ts` picks the order          |
| `src/lib/format-link.ts`        | Label, plain text and HTML of a `CopyLink`                                 |
| `src/lib/clipboard.ts`          | Clipboard write with a plain-text fallback                                 |
| `src/lib/toast.ts`, `theme.ts`  | Result card and its dark or light colors                                   |
| `src/lib/fonts.ts`              | Loads the bundled fonts from extension bytes                               |
| `test/`                         | Jest unit tests (jsdom), one file per module                               |
| `public/icon/`, `public/fonts/` | Icons (from `scripts/generate-icons.mjs`) and fonts with OFL license files |
| `docs/images/`                  | README screenshot                                                          |
| `.github/workflows/`            | `ci.yml` (tests), `tag-release.yml` and `release.yml` (releases)           |
| `.agents/skills/`               | Repo skills `verify` and `release` (`.claude/skills` links here)           |
| `.output/chrome-mv3/`           | Build output to load unpacked; git-ignored                                 |

## Commands

Run from the repo root.

| Task                                    | Command                                                     |
| --------------------------------------- | ----------------------------------------------------------- |
| Install                                 | `npm ci`                                                    |
| Full check (CI)                         | `npm test` (lint, type coverage 100%, unit tests and build) |
| Unit tests only                         | `npm run test:unit`                                         |
| Format check                            | `npm run format:check` (fix: `npm run format`)              |
| Production build                        | `npm run build` → `.output/chrome-mv3`                      |
| Watch build                             | `npm start`                                                 |
| Chrome zip                              | `npm run zip`                                               |
| Load in Chrome                          | `chrome://extensions` → Developer mode → Load unpacked      |
| Prove the change in a real page         | Repo skill `verify`                                         |
| Release (normally automatic on a merge) | Repo skill `release`                                        |

## Behavior

- Detector order: GitLab merge request, GitLab issue, GitHub pull request, GitHub issue, then Jira. The code host detectors go first because the Jira detector also reads a key from the tab title.
- Detectors match the URL path, not the host, so self-managed GitLab and GitHub Enterprise work.
- Labels: Jira `ABC-123: Title`; code hosts `my-service!42 | Title` (merge request) or `my-service#42 | Title` (pull request or issue). A label longer than 100 graphemes gets a cut title that ends with `…`; the prefix is never cut.
- The copied URL is the canonical page: `/browse/<key>` for Jira; the overview URL without tab, query or anchor for a code host.
- The title comes from the page heading, else from the tab title without the site suffix. A blank title gives a label with only the prefix.
- A group-level GitLab work item (`/groups/<group>/-/work_items/<iid>`) is not matched.
- No match: the card shows `Not found`. A failed clipboard write: `Copy failed`. A tab where Chrome blocks injection: a red `!` badge on the icon for 2 seconds.
- The clipboard gets `text/html` and `text/plain`. Without `ClipboardItem`, a plain-text fallback runs.
- Permissions stay `activeTab`, `scripting` and `clipboardWrite`. Do not add host permissions.

## Rules

- Use made-up names only in examples, tests, fixtures and docs: `ABC-123`, `octo-org/my-service`, `group/project`, `example.com`. Never paste real URLs, keys or titles.
- Keep the extension free of one person's or one team's conventions: no fixed hosts, project keys or account names.
- Page logic stays in pure modules under `src/lib/` with unit tests. Entry points and `run-copy.ts` hold only the wiring.
- Every change adds or updates unit tests. `npm test` and `npm run format:check` must pass.
- Every exported function, type and constant has a JSDoc block.
- Commits: Conventional Commits with a scope. Pull requests merge with a merge commit, never a squash.

## Skills

- `verify` (`.agents/skills/verify/SKILL.md`): run the checks, build, and prove the copy and the card in a headless browser on a made-up page. Run it after a behavior change.
- `release` (`.agents/skills/release/SKILL.md`): how a merge to `main` releases a version, and how to ship a minor or major version.
