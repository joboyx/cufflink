import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'CuffLink',
    description:
      'Off-the-cuff sharing, buttoned-up links. Copy Jira, GitHub and GitLab links with their key and title, in one shortcut.',
    permissions: ['activeTab', 'scripting', 'clipboardWrite'],
    web_accessible_resources: [{ resources: ['fonts/*.woff2'], matches: ['<all_urls>'] }],
    action: {
      default_title: 'CuffLink: copy a named link (Alt+X)',
    },
    commands: {
      _execute_action: {
        suggested_key: {
          default: 'Alt+X',
          mac: 'Alt+X',
        },
        description: 'Copy a named link to the issue, pull request or merge request',
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
