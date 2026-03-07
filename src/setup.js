const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');
const { t } = require('./i18n.js');

const SETTINGS_PATH = join(homedir(), '.claude', 'settings.json');
const HOOK_COMMAND = 'claude-done';
const HOOK_MARKER = 'claude-done';

/**
 * Add claude-done hooks to Claude Code settings.
 * Non-destructive merge: preserves existing hooks.
 */
async function setup({ silent = false } = {}) {
  try {
    const settings = loadSettings();

    if (!settings.hooks) {
      settings.hooks = {};
    }

    // Check if already configured
    if (isAlreadyConfigured(settings)) {
      if (!silent) console.log(t('setup.already_configured'));
      return;
    }

    // Remove old PowerShell notify hook if present
    removeOldPowerShellHook(settings);

    // Add Notification hook
    addHook(settings, 'Notification');

    // Add Stop hook
    addHook(settings, 'Stop');

    saveSettings(settings);
    if (!silent) console.log(t('setup.success'));
  } catch (err) {
    if (!silent) console.log(t('setup.error', { error: err.message }));
  }
}

/**
 * Remove claude-done hooks from Claude Code settings.
 * Only removes our hooks, preserves everything else.
 */
async function uninstall() {
  try {
    const settings = loadSettings();

    if (!settings.hooks) {
      console.log(t('uninstall.not_found'));
      return;
    }

    let removed = false;

    for (const eventName of ['Notification', 'Stop']) {
      if (!Array.isArray(settings.hooks[eventName])) continue;

      settings.hooks[eventName] = settings.hooks[eventName].filter((entry) => {
        const isOurs = entry.hooks && entry.hooks.some(
          (h) => h.command && h.command.includes(HOOK_MARKER)
        );
        if (isOurs) removed = true;
        return !isOurs;
      });

      // Clean up empty arrays
      if (settings.hooks[eventName].length === 0) {
        delete settings.hooks[eventName];
      }
    }

    // Clean up empty hooks object
    if (Object.keys(settings.hooks).length === 0) {
      delete settings.hooks;
    }

    if (removed) {
      saveSettings(settings);
      console.log(t('uninstall.success'));
    } else {
      console.log(t('uninstall.not_found'));
    }
  } catch (err) {
    console.log(t('uninstall.error', { error: err.message }));
  }
}

function isAlreadyConfigured(settings) {
  for (const eventName of ['Notification', 'Stop']) {
    const entries = settings.hooks[eventName];
    if (Array.isArray(entries)) {
      for (const entry of entries) {
        if (entry.hooks && entry.hooks.some(
          (h) => h.command && h.command.includes(HOOK_MARKER)
        )) {
          return true;
        }
      }
    }
  }
  return false;
}

function removeOldPowerShellHook(settings) {
  if (!Array.isArray(settings.hooks.Notification)) return;

  settings.hooks.Notification = settings.hooks.Notification.filter((entry) => {
    if (!entry.hooks) return true;
    return !entry.hooks.some(
      (h) => h.command && h.command.includes('notify.ps1')
    );
  });

  if (settings.hooks.Notification.length === 0) {
    delete settings.hooks.Notification;
  }
}

function addHook(settings, eventName) {
  if (!settings.hooks[eventName]) {
    settings.hooks[eventName] = [];
  }

  settings.hooks[eventName].push({
    matcher: '',
    hooks: [
      {
        type: 'command',
        command: HOOK_COMMAND,
        timeout: 15,
      },
    ],
  });
}

function loadSettings() {
  if (!existsSync(SETTINGS_PATH)) {
    return {};
  }
  const raw = readFileSync(SETTINGS_PATH, 'utf-8');
  return JSON.parse(raw);
}

function saveSettings(settings) {
  const dir = join(homedir(), '.claude');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
}

module.exports = { setup, uninstall };
