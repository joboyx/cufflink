---
name: release
description: Explains and drives the release of Jira Link Copy. A merge to main releases the next patch automatically; a pull request that raises the package.json version releases that version. Checks the start state, picks the version, watches the tag-release and Release workflows, and checks the GitHub Release and its Chrome zip. Use when asked to release, cut a version, or check why a release did not appear.
---

# release

Releases are automatic. Do not push a tag by hand, and do not change `.github/workflows/tag-release.yml` or `release.yml` to make a release.

## How the automation works

| Step | Where                                  | What happens                                                                                                                                                                                                                               |
| ---- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Push to `main` (a merged pull request) | `tag-release.yml` starts.                                                                                                                                                                                                                  |
| 2    | `tag-release.yml`                      | If `HEAD` already has a `v*` tag, it stops. If the tag `v<package.json version>` does not exist, it uses that version. Else it bumps the patch number of the latest `v*` tag. It pushes the annotated tag `vX.Y.Z` (tags only, no commit). |
| 3    | `tag-release.yml`                      | It dispatches `release.yml` on the new tag, because a tag pushed with `GITHUB_TOKEN` does not start other workflows.                                                                                                                       |
| 4    | `release.yml`                          | `npm ci`, sets the `package.json` version to the tag (not committed), `npm test`, `npm run zip`, then publishes the GitHub Release with `.output/*.zip` and generated release notes.                                                       |

So `package.json` on `main` holds the base version only. Patch releases do not change it.

## 1. Check the start state

```sh
git fetch origin --tags
git status -sb                         # on your branch, clean
git describe --tags --abbrev=0 origin/main
git log --oneline "$(git describe --tags --abbrev=0 origin/main)"..origin/main
```

## 2. Pick the version

| Change since the last tag       | Bump  | What to do                                      |
| ------------------------------- | ----- | ----------------------------------------------- |
| Fixes only                      | patch | Nothing. The next merge to `main` releases it.  |
| New behavior, old behavior kept | minor | Raise the version in the pull request (step 3). |
| Removed or changed behavior     | major | Raise the version in the pull request (step 3). |

## 3. Minor or major: raise the version in the pull request

On the feature branch, or on a branch of its own:

```sh
npm version X.Y.0 --no-git-tag-version
npm test
git add package.json package-lock.json
git commit -m "chore(release): vX.Y.0"
```

Add a line about the new version to the pull request description. When the pull request merges, `tag-release.yml` finds no `vX.Y.0` tag and releases `X.Y.0`.

Merging the pull request is the release. Do it only on the owner's explicit yes, with a merge commit (never a squash).

## 4. Watch the workflows

```sh
gh run list --workflow tag-release.yml --limit 3
gh run list --workflow release.yml --limit 3
gh run watch <run id> --exit-status
```

## 5. Check the release

```sh
gh release view --json tagName,assets,url --jq '{tag: .tagName, url: .url, assets: [.assets[].name]}'
```

Pass: the tag is the expected `vX.Y.Z`, and the assets list one Chrome zip (`*-chrome.zip`).

## When something fails

| Symptom                                      | Fix                                                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `tag-release.yml` failed before the tag push | Fix the cause, then `gh run rerun <run id>`.                                                                   |
| The tag exists, but `release.yml` failed     | Fix the cause on `main` if needed, then `gh run rerun <run id>` or `gh workflow run release.yml --ref vX.Y.Z`. |
| No release after a merge                     | Check step 2 of the table: `HEAD` may already have a tag.                                                      |

Never delete or move a published tag, and never force-push, without the owner's explicit yes.
