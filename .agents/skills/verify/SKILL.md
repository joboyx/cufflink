---
name: verify
description: Proves a change to CuffLink works. Runs the full check and the format check, builds the extension, then runs the built copy script in a headless browser on made-up GitHub pull request, Jira and no-match pages and saves a screenshot of each result card. Use after a behavior change, before a release, or when asked to prove the copy works.
---

# verify

Run all steps from the repo root. Stop at the first failure and report it.

The detection and label rules have unit tests. This skill proves the wiring: the built script, the clipboard call and the card in a real browser.

## 1. Checks

```sh
npm ci
npm test               # lint, type coverage, unit tests, production build
npm run format:check
```

Both must exit 0. `npm test` leaves the build in `.output/chrome-mv3`. When the icon test fails after a logo SVG change, run `npm run icons` and commit the PNGs.

## 2. Manual load (optional)

Open `chrome://extensions`, enable Developer mode, choose Load unpacked and select `.output/chrome-mv3`. Open a page, press Alt+X and paste.

## 3. Headless check

Needs `python3` and the [`agent-browser`](https://github.com/vercel-labs/agent-browser) CLI. Any Chromium automation tool works the same way.

The trick: serve made-up pages on a local port, and map a made-up host to that port with a Chrome flag, so the page URL looks real. The page is plain `http`, so the browser has no `navigator.clipboard` and no `ClipboardItem`. The check stubs both, points `chrome.runtime.getURL` at the served fonts, and loads the built `copy-issue.js` as a page script.

### Set up the fixtures

```sh
REPO="$(git rev-parse --show-toplevel)"
OUT="${TMPDIR:-/tmp}/cufflink-verify-$(date +%Y%m%d-%H%M%S)"
SITE="$OUT/site"
mkdir -p "$SITE/_ext" "$SITE/octo-org/my-service/pull/42" "$SITE/browse/ABC-123" "$SITE/about"
cp -R "$REPO/.output/chrome-mv3/fonts" "$REPO/.output/chrome-mv3/copy-issue.js" "$SITE/_ext/"

cat > "$SITE/octo-org/my-service/pull/42/index.html" <<'EOF'
<!doctype html><html><head><meta charset="utf-8">
<title>Add retry to upload by octocat · Pull Request #42 · octo-org/my-service</title>
<style>body{margin:0;padding:32px;background:#0d1117;color:#e6edf3;font-family:sans-serif}</style>
</head><body><h1><bdi data-testid="issue-title">Add retry to upload</bdi> #42</h1></body></html>
EOF
cat > "$SITE/browse/ABC-123/index.html" <<'EOF'
<!doctype html><html><head><meta charset="utf-8"><title>[ABC-123] Fix login timeout - Jira</title>
<style>body{margin:0;padding:32px;background:#fff;color:#172b4d;font-family:sans-serif}</style>
</head><body><h1 data-testid="issue.views.issue-base.foundation.summary.heading">Fix login timeout</h1></body></html>
EOF
cat > "$SITE/about/index.html" <<'EOF'
<!doctype html><html><head><meta charset="utf-8"><title>About</title></head>
<body style="background:#fff"><h1>About</h1></body></html>
EOF
echo "$OUT"
```

Keep the printed `$OUT` path; shell state does not persist between tool calls.

### Start the server and the browser

Start the server in the background and stop it in Cleanup:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory "<OUT>/site"
```

Use a unique session name per run, for example `cufflink-verify-<timestamp>`. A host on the reserved `.test` domain is safe to map:

```sh
S=cufflink-verify-<timestamp>
agent-browser --session "$S" --args "--host-resolver-rules=MAP git.example.test 127.0.0.1:8765" set viewport 1280 640
```

### Run one scenario

```sh
copy_and_snap() { # copy_and_snap <url> <name>
  agent-browser --session "$S" open "$1"
  agent-browser --session "$S" eval "Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { write: (items) => { window.__copied = items.length; return Promise.resolve(); } } }); if (typeof ClipboardItem === 'undefined') { window.ClipboardItem = class { constructor(items) { this.items = items; } }; } window.chrome = window.chrome || {}; chrome.runtime = { getURL: (p) => '/_ext' + p }; document.head.append(Object.assign(document.createElement('script'), { src: '/_ext/copy-issue.js' })); 'ok'"
  agent-browser --session "$S" wait 700
  agent-browser --session "$S" eval "(() => { const h = document.getElementById('cufflink-root'); return h ? h.shadowRoot.querySelector('.card').innerText : 'no card'; })()"
  agent-browser --session "$S" screenshot "<OUT>/$2.png"
}
```

The card stays for 2.8 seconds, so take the screenshot right after the wait.

| #   | Scenario            | Command                                                                   | Pass when the card text is                                                                                           |
| --- | ------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | GitHub pull request | `copy_and_snap http://git.example.test/octo-org/my-service/pull/42 01-pr` | `CUFFED TO CLIPBOARD`, `my-service#42 \| Add retry to upload`, `http://git.example.test/octo-org/my-service/pull/42` |
| 2   | Jira issue          | `copy_and_snap http://git.example.test/browse/ABC-123 02-jira`            | `CUFFED TO CLIPBOARD`, `ABC-123: Fix login timeout`, `http://git.example.test/browse/ABC-123`                        |
| 3   | No match            | `copy_and_snap http://git.example.test/about 03-none`                     | `NOTHING TO CUFF`, `No issue, pull request or merge request on this page`                                            |

Check each screenshot by eye: the card shows in the bottom-right corner, dark on the dark page (scenario 1) and light on the light pages.

### Refresh the README and store images

The list of images, their source pages and viewports is in [CONTRIBUTING.md](../../../CONTRIBUTING.md#refresh-the-readme-and-store-images), section "Refresh the README and store images". For the card images, copy the fuller made-up pages from `docs/images/src/` over the fixtures, set the viewport from that table (a device scale goes third: `set viewport 640 360 2`), then run scenario 1 or 2 again with the image path as the output:

```sh
cp "$REPO/docs/images/src/pr-page.html" "$SITE/octo-org/my-service/pull/42/index.html"
cp "$REPO/docs/images/src/jira-page.html" "$SITE/browse/ABC-123/index.html"
```

The first screenshot after a viewport change can miss the card. Read each image and shoot again when the card is not in it.

## Cleanup

```sh
agent-browser --session "$S" close
```

Stop the background server. Keep `$OUT` for the report.

## Report

| #   | Scenario            | Result    | Proof               |
| --- | ------------------- | --------- | ------------------- |
| 1   | GitHub pull request | pass/fail | `<OUT>/01-pr.png`   |
| 2   | Jira issue          | pass/fail | `<OUT>/02-jira.png` |
| 3   | No match            | pass/fail | `<OUT>/03-none.png` |

Under the table, quote the card text of each failed scenario.
