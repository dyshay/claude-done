# Configuration

## Config file

Configuration is stored in `~/.claude-done.json`.

```json
{
  "lang": "en",
  "sound": true
}
```

## Options

| Option  | Type    | Default | Description                    |
|---------|---------|---------|--------------------------------|
| `lang`  | string  | `null`  | Language code (auto-detected if null) |
| `sound` | boolean | `true`  | Play sound with notification   |

## CLI commands

### View current config

```bash
claude-done config --show
```

### Set language

```bash
claude-done config --lang fr
```

### Toggle sound

```bash
claude-done config --sound false
```

### Multiple options

```bash
claude-done config --lang de --sound true
```

## Language auto-detection

When `lang` is not set, claude-done detects the language from:

1. `~/.claude-done.json` `lang` field
2. `LANG` / `LC_ALL` / `LC_MESSAGES` environment variables
3. Falls back to `en` (English)
