const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const { writeFileSync, unlinkSync, existsSync } = require('fs');
const { join } = require('path');
const { tmpdir } = require('os');

describe('config', () => {
  let originalHome;
  const testDir = tmpdir();
  const testConfigPath = join(testDir, '.claude-done.json');

  beforeEach(() => {
    // Clean up any test config
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }
    // Clear module cache
    delete require.cache[require.resolve('../src/config.js')];
  });

  afterEach(() => {
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }
  });

  it('should return defaults when no config file exists', () => {
    const { loadConfig } = require('../src/config.js');
    const config = loadConfig();
    assert.strictEqual(config.lang, null);
    assert.strictEqual(config.sound, true);
  });

  it('should load and save config', () => {
    const { loadConfig, saveConfig, CONFIG_PATH } = require('../src/config.js');

    const config = loadConfig();
    config.lang = 'fr';
    config.sound = false;
    saveConfig(config);

    // Clear cache and reload
    delete require.cache[require.resolve('../src/config.js')];
    const { loadConfig: loadConfig2 } = require('../src/config.js');
    const loaded = loadConfig2();

    assert.strictEqual(loaded.lang, 'fr');
    assert.strictEqual(loaded.sound, false);

    // Cleanup
    if (existsSync(CONFIG_PATH)) {
      unlinkSync(CONFIG_PATH);
    }
  });
});
