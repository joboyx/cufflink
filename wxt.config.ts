import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'Jira Link Copy',
    description:
      'Copy a formatted link to a Jira issue, a GitHub pull request or issue, or a GitLab merge request or issue from the current tab.',
    permissions: ['activeTab', 'scripting', 'clipboardWrite'],
    web_accessible_resources: [{ resources: ['fonts/*.woff2'], matches: ['<all_urls>'] }],
    action: {
      default_title: 'Copy issue, pull request or merge request link',
    },
    commands: {
      _execute_action: {
        suggested_key: {
          default: 'Alt+X',
          mac: 'Alt+X',
        },
        description: 'Copy issue, pull request or merge request link',
      },
    },
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
  },
});
