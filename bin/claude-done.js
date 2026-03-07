#!/usr/bin/env node

const { resolve } = require('path');
const pkg = require(resolve(__dirname, '..', 'package.json'));

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  const { t } = require(resolve(__dirname, '..', 'src', 'i18n.js'));
  console.log(`
claude-done v${pkg.version}
${t('cli.description')}

${t('cli.usage')}:
  claude-done              ${t('cli.hook_mode')}
  claude-done setup        ${t('cli.setup')}
  claude-done test         ${t('cli.test')}
  claude-done config       ${t('cli.config')}
  claude-done uninstall    ${t('cli.uninstall')}
  claude-done --help       ${t('cli.help')}
  claude-done --version    ${t('cli.version_flag')}

${t('cli.config_options')}:
  --lang <code>            ${t('cli.config_lang')}
  --sound <true|false>     ${t('cli.config_sound')}
  --show                   ${t('cli.config_show')}
`);
}

async function main() {
  try {
    switch (command) {
      case 'setup': {
        const { setup } = require(resolve(__dirname, '..', 'src', 'setup.js'));
        const silent = args.includes('--silent');
        await setup({ silent });
        break;
      }
      case 'test': {
        const { sendTestNotification } = require(resolve(__dirname, '..', 'src', 'notify.js'));
        await sendTestNotification();
        break;
      }
      case 'config': {
        const { loadConfig, saveConfig } = require(resolve(__dirname, '..', 'src', 'config.js'));
        const { t } = require(resolve(__dirname, '..', 'src', 'i18n.js'));
        const config = loadConfig();

        let changed = false;
        const langIdx = args.indexOf('--lang');
        if (langIdx !== -1 && args[langIdx + 1]) {
          config.lang = args[langIdx + 1];
          changed = true;
        }
        const soundIdx = args.indexOf('--sound');
        if (soundIdx !== -1 && args[soundIdx + 1]) {
          config.sound = args[soundIdx + 1] === 'true';
          changed = true;
        }

        if (changed) {
          saveConfig(config);
          console.log(t('config.saved'));
        }

        if (args.includes('--show') || !changed) {
          console.log(t('config.current'));
          console.log(JSON.stringify(config, null, 2));
        }
        break;
      }
      case 'uninstall': {
        const { uninstall } = require(resolve(__dirname, '..', 'src', 'setup.js'));
        await uninstall();
        break;
      }
      case '--help':
      case '-h': {
        printHelp();
        break;
      }
      case '--version':
      case '-v': {
        console.log(pkg.version);
        break;
      }
      default: {
        // Hook mode: read stdin JSON
        const { handleHookInput } = require(resolve(__dirname, '..', 'src', 'notify.js'));
        await handleHookInput();
        break;
      }
    }
  } catch (err) {
    // Never block Claude Code — always exit cleanly
    if (process.env.CLAUDE_DONE_DEBUG) {
      console.error(err);
    }
    process.exit(0);
  }
}

main().then(() => {
  // For non-notification commands, exit immediately
  if (command && command !== 'test' && !command.startsWith('-')) {
    process.exit(0);
  }
});
