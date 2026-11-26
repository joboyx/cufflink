# Chrome Web Store listing

Text and images for the Chrome Web Store item. Copy each field into the Developer Dashboard as written.

## Store listing

| Field    | Value                                                                                       |
| -------- | ------------------------------------------------------------------------------------------- |
| Name     | CuffLink                                                                                    |
| Category | Developer Tools                                                                             |
| Language | English                                                                                     |
| Icon     | `public/icon/128.png`                                                                       |
| Images   | `docs/store/screenshot-1.png` (1280×800), `docs/store/promo-440x280.png` (small promo tile) |

### Summary

At most 132 characters. This text is also the manifest `description` in `wxt.config.ts`.

```text
Off-the-cuff sharing, buttoned-up links. Copy Jira, GitHub and GitLab links with their key and title, in one shortcut.
```

### Description

```text
Off-the-cuff sharing, buttoned-up links.

A bare URL shows no issue key and no title, so readers must open it to know what it is. CuffLink copies the link with its key and title in one shortcut.

Press Alt+X (Option+X on Mac) or click the toolbar icon. CuffLink copies:

- Jira issue: "ABC-123: Fix login timeout", linked to the issue
- GitHub pull request or issue: "my-service#42 | Add retry to upload"
- GitLab merge request: "my-service!42 | Add retry to upload"
- GitLab issue or work item: "my-service#42 | Add retry to upload"

A normal paste gives the label as a link, for chat, docs and mail apps that keep links. Paste as plain text gives the same label with no link.

Features:
- Works on github.com, GitHub Enterprise, gitlab.com, self-managed GitLab and Jira, on any host.
- Copies the clean overview URL, without the tab, query or anchor. On a Jira board, it copies the issue URL of the selected card.
- Keeps the key and cuts a long title at 100 characters.
- Shows a small card with the result, in dark or light colors to match the page.

Privacy: CuffLink runs only on the active tab, and only when you press the shortcut or click the icon. It does not collect, store or send any data. It has no access to any site until you use it.

Change the shortcut in chrome://extensions/shortcuts.

Source code (MIT): https://github.com/joboyx/cufflink
```

## Privacy practices

### Single purpose

```text
CuffLink copies a link to the issue, pull request or merge request on the active tab, with its key and title, to the clipboard.
```

### Permission justification

| Permission          | Justification                                                                                                                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTab`         | CuffLink reads the URL, the heading and the title of the active tab, only after the user presses the shortcut or clicks the toolbar icon. It needs no access to any other tab.                                                |
| `scripting`         | CuffLink injects its copy script into the active tab when the user asks for a copy. The script reads the page, writes the link to the clipboard and shows a result card.                                                      |
| `clipboardWrite`    | CuffLink writes the formatted link to the clipboard as rich text and plain text. This is the single purpose of the extension.                                                                                                 |
| No host permissions | CuffLink requests no host permissions and no content scripts. `activeTab` gives access to one tab for one user action, which is all that a copy needs. It works on any Jira, GitHub or GitLab host without broad site access. |

### Are you using remote code?

Answer: **No**.

```text
All code is bundled in the extension package. CuffLink loads no script, module or WebAssembly from outside the package and does not evaluate strings as code.
```

### Data usage

Tick no data type: CuffLink collects no user data. It reads the active tab only to make the link, writes the link to the clipboard and makes no network requests.

Certify all three statements:

- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

### Privacy policy URL

```text
https://github.com/joboyx/cufflink/blob/main/PRIVACY.md
```

The policy is [`PRIVACY.md`](../../PRIVACY.md) at the repo root.

## Rebuild the images

The image sources are in `docs/images/src/`. The steps are in `.agents/skills/verify/SKILL.md`, section "Refresh the README and store images".
