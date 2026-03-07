# Installation

## Requirements

- Node.js 18 or later
- Claude Code CLI installed

## Install from npm

```bash
npm install -g claude-done
```

The `postinstall` script will automatically configure Claude Code hooks. If it doesn't (e.g., due to permissions), run manually:

```bash
claude-done setup
```

## Install from source

```bash
git clone https://github.com/dyshay/claude-done.git
cd claude-done
npm install
npm link
claude-done setup
```

## Verify installation

```bash
claude-done test
```

You should see a native notification appear.

## Platform notes

### Windows

Works out of the box. Uses Windows Toast notifications via `node-notifier`.

### macOS

Works out of the box. Click-to-focus uses AppleScript to activate your terminal app.

### Linux

Requires `notify-send` (usually pre-installed on GNOME/KDE). For click-to-focus, install `wmctrl` or `xdotool`:

```bash
sudo apt install wmctrl   # Debian/Ubuntu
sudo apt install xdotool  # Alternative
```

Note: `notify-send` does not support click callbacks. Click-to-focus on Linux is best-effort using `wmctrl`/`xdotool`.
