# claude-done

Native OS notifications when Claude Code finishes a task.

[![npm version](https://img.shields.io/npm/v/claude-done.svg)](https://www.npmjs.com/package/claude-done)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

When Claude Code completes a task, **claude-done** sends a native desktop notification showing the project name, type, and framework. Click the notification to bring your terminal back to the foreground.

## Quick Start

```bash
npm install -g claude-done
claude-done setup
```

That's it. You'll now get notifications whenever Claude Code finishes working.

## What You Get

- **Rich notifications** with project name and detected framework (e.g., `myapp (Node.js/Next.js) - Task complete`)
- **Click-to-focus** — click the notification to bring your terminal to the foreground
- **Cross-platform** — Windows, macOS, and Linux
- **i18n** — 8 languages (en, fr, es, de, pt, it, ja, zh)
- **Non-destructive** — merges with your existing Claude Code hooks

## CLI Reference

```
claude-done              # Hook mode: read stdin JSON, show notification
claude-done setup        # Configure Claude Code hooks
claude-done test         # Send a test notification
claude-done config       # View or change configuration
claude-done uninstall    # Remove hooks from Claude Code settings
claude-done --help       # Show help
claude-done --version    # Show version
```

### Configuration

```bash
claude-done config --lang fr          # Set language
claude-done config --sound false      # Disable notification sound
claude-done config --show             # Show current config
```

Configuration is stored in `~/.claude-done.json`.

## Project Detection

claude-done detects your project type from the working directory:

| File detected           | Type     | Frameworks detected                 |
|-------------------------|----------|-------------------------------------|
| `package.json`          | Node.js  | React, Next.js, Vue, Nuxt, Svelte, Express, Fastify, NestJS, Angular |
| `Cargo.toml`            | Rust     | —                                   |
| `pyproject.toml` / `requirements.txt` | Python | Django, Flask, FastAPI |
| `go.mod`                | Go       | —                                   |
| `pom.xml`               | Java     | Spring                              |
| `Gemfile`               | Ruby     | Rails, Sinatra                      |
| `*.sln` / `*.csproj`    | C#/.NET  | —                                   |

Falls back to the directory name if no project file is found.

## Supported Languages

| Code | Language   |
|------|------------|
| en   | English    |
| fr   | French     |
| es   | Spanish    |
| de   | German     |
| pt   | Portuguese |
| it   | Italian    |
| ja   | Japanese   |
| zh   | Chinese    |

Language is auto-detected from your system locale, or set manually with `claude-done config --lang <code>`.

## Click-to-Focus

| Platform  | Method                                  |
|-----------|-----------------------------------------|
| Windows   | PowerShell + Win32 `SetForegroundWindow` |
| macOS     | `osascript` (AppleScript)                |
| Linux     | `wmctrl` / `xdotool` (best-effort)      |

## How It Works

claude-done registers as a [Claude Code hook](https://docs.anthropic.com/en/docs/claude-code/hooks). When Claude Code triggers a `Notification` or `Stop` event, it pipes JSON to claude-done via stdin. claude-done parses the working directory, detects the project, and sends a native notification.

## Uninstall

```bash
claude-done uninstall    # Remove hooks from Claude Code settings
npm uninstall -g claude-done
```

## Development

```bash
git clone https://github.com/dyshay/claude-done.git
cd claude-done
npm install
npm test
```

## License

[MIT](LICENSE)
