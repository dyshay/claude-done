const { readFileSync } = require('fs');
const { join } = require('path');
const { loadConfig } = require('./config.js');

const LOCALES_DIR = join(__dirname, '..', 'locales');
const SUPPORTED = ['en', 'fr', 'es', 'de', 'pt', 'it', 'ja', 'zh'];

let _strings = null;
let _locale = null;

function detectLocale() {
  // 1. Config file
  const config = loadConfig();
  if (config.lang && SUPPORTED.includes(config.lang)) {
    return config.lang;
  }

  // 2. Environment variables
  const envLang = process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES || '';
  const code = envLang.split(/[_.]/)[0];
  if (code && SUPPORTED.includes(code)) {
    return code;
  }

  // 3. Fallback
  return 'en';
}

function loadStrings(locale) {
  try {
    const raw = readFileSync(join(LOCALES_DIR, `${locale}.json`), 'utf-8');
    return JSON.parse(raw);
  } catch {
    // Fallback to English
    const raw = readFileSync(join(LOCALES_DIR, 'en.json'), 'utf-8');
    return JSON.parse(raw);
  }
}

function getStrings() {
  if (!_strings) {
    _locale = detectLocale();
    _strings = loadStrings(_locale);
  }
  return _strings;
}

function getLocale() {
  if (!_locale) {
    _locale = detectLocale();
  }
  return _locale;
}

/**
 * Translate a key with dot notation and optional placeholders.
 * t('notification.title', { project: 'foo', type: 'Rust' })
 */
function t(key, vars = {}) {
  const strings = getStrings();
  const parts = key.split('.');
  let value = strings;

  for (const part of parts) {
    if (value == null || typeof value !== 'object') {
      return key; // Key not found, return as-is
    }
    value = value[part];
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Replace {{placeholder}} with values
  return value.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    return vars[name] !== undefined ? vars[name] : `{{${name}}}`;
  });
}

function resetCache() {
  _strings = null;
  _locale = null;
}

module.exports = { t, detectLocale, getLocale, resetCache, SUPPORTED };
