const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const { join, dirname } = require('path');
const { homedir } = require('os');

const CONFIG_PATH = join(homedir(), '.claude-done.json');

const DEFAULTS = {
  lang: null,
  sound: true,
};

function loadConfig() {
  try {
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveConfig(config) {
  try {
    mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  } catch {}
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

module.exports = { loadConfig, saveConfig, CONFIG_PATH };
