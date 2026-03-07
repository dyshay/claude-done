const { describe, it } = require('node:test');
const assert = require('node:assert');
const { readStdin } = require('../src/notify.js');

describe('notify', () => {
  it('should export handleHookInput function', () => {
    const { handleHookInput } = require('../src/notify.js');
    assert.strictEqual(typeof handleHookInput, 'function');
  });

  it('should export sendTestNotification function', () => {
    const { sendTestNotification } = require('../src/notify.js');
    assert.strictEqual(typeof sendTestNotification, 'function');
  });

  it('should export sendNotification function', () => {
    const { sendNotification } = require('../src/notify.js');
    assert.strictEqual(typeof sendNotification, 'function');
  });

  it('readStdin should return empty string when stdin is TTY', async () => {
    // In test environment, stdin is typically a TTY
    if (process.stdin.isTTY) {
      const result = await readStdin();
      assert.strictEqual(result, '');
    }
  });
});
