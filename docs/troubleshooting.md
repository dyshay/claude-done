# Troubleshooting

## No notification appears

1. **Test notifications**: Run `claude-done test`. If no notification appears, the issue is with `node-notifier` or your OS notification settings.

2. **Check hooks**: Verify that claude-done hooks are in `~/.claude/settings.json`:
   ```bash
   claude-done setup
   ```

3. **Debug mode**: Run with debug output:
   ```bash
   CLAUDE_DONE_DEBUG=1 claude-done test
   ```

4. **Windows**: Ensure notifications are enabled in Windows Settings > System > Notifications.

5. **Linux**: Ensure `notify-send` is installed:
   ```bash
   which notify-send || sudo apt install libnotify-bin
   ```

## Click-to-focus doesn't work

### Windows
- The terminal process must have a visible window handle. Some terminal emulators may not expose their window handle to `SetForegroundWindow`.

### macOS
- AppleScript needs permission. Go to System Preferences > Security & Privacy > Privacy > Automation.

### Linux
- `notify-send` does not support click callbacks. Install `wmctrl` or `xdotool` for best-effort focus switching:
  ```bash
  sudo apt install wmctrl
  ```

## Hooks conflict with existing hooks

claude-done uses non-destructive merge. Your existing hooks are preserved. If you still see conflicts:

1. Check `~/.claude/settings.json` manually
2. Run `claude-done uninstall` to remove claude-done hooks
3. Run `claude-done setup` to re-add them cleanly

## Wrong language

Set language explicitly:
```bash
claude-done config --lang en
```

## Notification blocks Claude Code

claude-done is designed to never block Claude Code:
- stdin read has a 5-second timeout
- Notification has a 30-second timeout
- All errors are caught and exit with code 0
- Hook timeout is set to 15 seconds

If you still experience blocking, check the hook timeout in `~/.claude/settings.json`.
