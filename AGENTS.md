# Jira Link Copy

Chrome extension. Copies a formatted link to a Jira issue, a GitHub pull request or issue, or a GitLab merge request or issue from the current tab.

## Testing

From the repo root:

```bash
npm ci
npm test
```

`npm test` runs lint, type coverage, unit tests, and a production build.

Focused unit tests:

```bash
npm run test:unit
```

Load the unpacked build from `.output/chrome-mv3`.
