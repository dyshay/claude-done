const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');

const LOCALES_DIR = join(__dirname, '..', 'locales');

describe('i18n', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    delete process.env.LANG;
    delete process.env.LC_ALL;
    delete process.env.LC_MESSAGES;
    // Clear module cache so config loads fresh
    delete require.cache[require.resolve('../src/i18n.js')];
    delete require.cache[require.resolve('../src/config.js')];
    // Reset i18n cache
    const i18n = require('../src/i18n.js');
    i18n.resetCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    // Clear module cache for fresh loads
    delete require.cache[require.resolve('../src/i18n.js')];
    delete require.cache[require.resolve('../src/config.js')];
  });

  it('should load English strings by default', () => {
    const { t } = require('../src/i18n.js');
    const result = t('notification.test_title');
    assert.strictEqual(result, 'claude-done - Test notification');
  });

  it('should replace placeholders', () => {
    const { t } = require('../src/i18n.js');
    const result = t('notification.title', { project: 'myapp', type: 'Rust' });
    assert.strictEqual(result, 'myapp (Rust) - Task complete');
  });

  it('should return key for missing translations', () => {
    const { t } = require('../src/i18n.js');
    const result = t('nonexistent.key');
    assert.strictEqual(result, 'nonexistent.key');
  });

  it('should keep unreplaced placeholders', () => {
    const { t } = require('../src/i18n.js');
    const result = t('notification.title', { project: 'myapp' });
    assert.ok(result.includes('{{type}}'));
  });

  it('should detect locale from LANG env', () => {
    process.env.LANG = 'fr_FR.UTF-8';
    const i18n = require('../src/i18n.js');
    i18n.resetCache();
    const locale = i18n.detectLocale();
    assert.strictEqual(locale, 'fr');
  });

  it('should fallback to en for unsupported locales', () => {
    process.env.LANG = 'xx_XX.UTF-8';
    const i18n = require('../src/i18n.js');
    i18n.resetCache();
    const locale = i18n.detectLocale();
    assert.strictEqual(locale, 'en');
  });

  it('all locale files should have the same keys as en.json', () => {
    const enRaw = readFileSync(join(LOCALES_DIR, 'en.json'), 'utf-8');
    const enKeys = getAllKeys(JSON.parse(enRaw));

    const localeFiles = readdirSync(LOCALES_DIR).filter(
      (f) => f.endsWith('.json') && f !== 'en.json'
    );

    for (const file of localeFiles) {
      const raw = readFileSync(join(LOCALES_DIR, file), 'utf-8');
      const keys = getAllKeys(JSON.parse(raw));
      assert.deepStrictEqual(
        keys.sort(),
        enKeys.sort(),
        `${file} has different keys than en.json`
      );
    }
  });
});

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}
