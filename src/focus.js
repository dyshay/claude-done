const { execSync, spawn } = require('child_process');

/**
 * Attempt to bring the terminal window to the foreground.
 * Fails silently — this is best-effort.
 */
function focusTerminal() {
  try {
    switch (process.platform) {
      case 'win32':
        focusWindows();
        break;
      case 'darwin':
        focusMacOS();
        break;
      case 'linux':
        focusLinux();
        break;
    }
  } catch {
    // Silently fail — focus is best-effort
  }
}

function focusWindows() {
  // Try to activate Windows Terminal, then fallback to cmd/powershell
  const ps = `
    Add-Type -TypeDefinition @"
    using System;
    using System.Runtime.InteropServices;
    public class Win32 {
      [DllImport("user32.dll")]
      public static extern bool SetForegroundWindow(IntPtr hWnd);
    }
"@
    $terminals = @('WindowsTerminal', 'pwsh', 'powershell', 'cmd')
    foreach ($name in $terminals) {
      $proc = Get-Process -Name $name -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($proc -and $proc.MainWindowHandle -ne 0) {
        [Win32]::SetForegroundWindow($proc.MainWindowHandle)
        break
      }
    }
  `;

  spawn('powershell.exe', ['-NoProfile', '-Command', ps], {
    stdio: 'ignore',
    detached: true,
    windowsHide: true,
  }).unref();
}

function focusMacOS() {
  // Try common terminal apps
  const terminals = ['iTerm2', 'Alacritty', 'kitty', 'Hyper', 'Terminal'];
  for (const app of terminals) {
    try {
      execSync(
        `osascript -e 'tell application "System Events" to set frontmost of process "${app}" to true' 2>/dev/null`,
        { timeout: 2000, stdio: 'ignore' }
      );
      return;
    } catch {}
  }
}

function focusLinux() {
  // notify-send doesn't support click callbacks.
  // Try wmctrl or xdotool as best-effort.
  try {
    execSync('wmctrl -a Terminal 2>/dev/null', { timeout: 2000, stdio: 'ignore' });
    return;
  } catch {}

  try {
    execSync('xdotool search --name terminal windowactivate 2>/dev/null', {
      timeout: 2000,
      stdio: 'ignore',
    });
  } catch {}
}

module.exports = { focusTerminal };
