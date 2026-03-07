const notifier = require('node-notifier');
const { resolve } = require('path');
const { t } = require('./i18n.js');
const { loadConfig } = require('./config.js');
const { detectProject, formatTitle } = require('./project.js');
const { focusTerminal } = require('./focus.js');

/**
 * Read stdin JSON from Claude Code hook, then send a notification.
 */
async function handleHookInput() {
  const input = await readStdin();
  if (!input) {
    process.exit(0);
    return;
  }

  let data;
  try {
    data = JSON.parse(input);
  } catch {
    process.exit(0);
    return;
  }

  // Only notify on relevant events
  const event = data.hook_event_name;
  if (event === 'Notification' || event === 'Stop') {
    const cwd = data.cwd || process.cwd();
    const project = detectProject(cwd);
    const title = formatTitle(
      project,
      t('notification.title'),
      t('notification.title_fallback')
    );
    const message = t('notification.message');

    await sendNotification(title, message);
  }

  process.exit(0);
}

/**
 * Send a test notification.
 */
async function sendTestNotification() {
  const title = t('notification.test_title');
  const message = t('notification.test_message');
  await sendNotification(title, message);
}

/**
 * Send a native notification via node-notifier.
 */
function sendNotification(title, message) {
  const config = loadConfig();

  return new Promise((resolve) => {
    notifier.notify(
      {
        title,
        message,
        sound: config.sound,
        wait: true,
        appID: 'claude-done',
      },
      () => {
        // Callback fires when notification is dismissed or times out
        resolve();
      }
    );

    notifier.on('click', () => {
      focusTerminal();
      resolve();
    });

    // Safety timeout: never hang more than 30 seconds
    setTimeout(() => {
      resolve();
    }, 30000);
  });
}

/**
 * Read all data from stdin.
 */
function readStdin() {
  return new Promise((resolve) => {
    // If stdin is a TTY (no pipe), return empty
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }

    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data.trim());
    });
    process.stdin.on('error', () => {
      resolve('');
    });

    // Safety timeout for stdin read
    setTimeout(() => {
      resolve(data.trim());
    }, 5000);
  });
}

module.exports = { handleHookInput, sendTestNotification, sendNotification, readStdin };
