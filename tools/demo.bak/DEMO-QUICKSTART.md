# Demo Recording Quick Start

Record a professional demo of `hey-ai` in seconds.

## TL;DR

```bash
# Install dependencies
brew install asciinema agg

# Record demo (fully automated)
./record-demo-enhanced.sh

# Done! Files created:
#   demo.cast  (recording)
#   demo.gif   (animated GIF)
```

## Scripts Overview

| Script | Type | Best For |
|--------|------|----------|
| `record-demo-enhanced.sh` | **Automated** | Production-ready demo with polish |
| `record-demo-auto.sh` | Automated | Quick automated recording |
| `record-demo-simple.sh` | Manual | Interactive recording with guide |
| `record-demo.sh` | Expect-based | Precise control (requires `expect`) |

## Features Demonstrated

The demo showcases:

1. **Natural Language Queries**
   - `hey-ai "find all typescript files"`
   - Get executable commands from plain English

2. **Automatic Context**
   - `--show-prefs` - Modern CLI tools detected
   - `--show-context` - Preview LLM context

3. **MCP Support**
   - `mcp presets` - Available servers
   - `mcp list` - Configured servers
   - `config list` - Current configuration

4. **Additional Features**
   - Model selection: `-m gpt-4o`
   - Fast mode: `--no-context`

## Quick Commands

### Record Default Demo
```bash
./record-demo-enhanced.sh
```

### Record Custom Named Demo
```bash
./record-demo-enhanced.sh my-demo.cast
# Creates: my-demo.cast + my-demo.gif
```

### Preview Recording
```bash
asciinema play demo.cast
```

### View GIF
```bash
open demo.gif
```

### Regenerate GIF with Different Settings
```bash
# Faster playback
agg --speed 2 demo.cast fast-demo.gif

# Different theme
agg --theme dracula demo.cast dark-demo.gif

# Smaller size
agg --cols 100 --rows 25 --font-size 12 demo.cast small-demo.gif

# All options
agg --theme nord --speed 1.8 --cols 110 --rows 35 --font-size 13 demo.cast custom.gif
```

## Customization

### Timing

Edit `record-demo-enhanced.sh`:

```bash
SHORT=0.5    # Quick pauses
MEDIUM=1.5   # Normal pauses
LONG=2.5     # Longer pauses
XLLONG=4     # Command execution pauses
```

### Visual Theme

Available themes for `agg`:
- `monokai` (default, dark)
- `dracula` (dark purple)
- `nord` (dark blue)
- `solarized-dark`
- `solarized-light`
- `one-dark`
- `asciinema` (light)

```bash
agg --theme nord demo.cast demo.gif
```

### Terminal Size

```bash
agg --cols 120 --rows 40 demo.cast demo.gif  # Larger
agg --cols 100 --rows 25 demo.cast demo.gif  # Smaller
```

### Playback Speed

```bash
agg --speed 1.0 demo.cast slow.gif      # Slower
agg --speed 1.5 demo.cast normal.gif    # Normal (default)
agg --speed 2.0 demo.cast fast.gif      # Faster
agg --speed 3.0 demo.cast veryfast.gif  # Very fast
```

## Troubleshooting

### Dependencies Not Found

```bash
brew install asciinema  # Terminal recorder
brew install agg        # GIF converter
npm install -g hey-ai   # The CLI tool
```

### Recording Looks Wrong

Try a clean environment:

```bash
TERM=xterm-256color ./record-demo-enhanced.sh
```

### GIF Too Large

Reduce file size:

```bash
agg --speed 2 --cols 100 --rows 25 --idle-time-limit 1.5 demo.cast small.gif
```

### Want Manual Control

Use the simple script:

```bash
./record-demo-simple.sh
```

## Advanced Usage

### Record Multiple Versions

```bash
./record-demo-enhanced.sh demo-v1.cast
./record-demo-enhanced.sh demo-v2.cast
./record-demo-enhanced.sh demo-v3.cast

# Pick the best one
open demo-v*.gif
```

### Create Different Styles

```bash
# Dark mode
agg --theme monokai demo.cast demo-dark.gif

# Light mode  
agg --theme asciinema demo.cast demo-light.gif

# Compact version
agg --theme nord --cols 100 --rows 25 --speed 2 demo.cast demo-compact.gif
```

### Test in Clean Shell

```bash
# Record in a fresh bash shell
SHELL=/bin/bash ./record-demo-enhanced.sh
```

## Adding to README

Add the GIF to your `README.md`:

```markdown
## Demo

![hey-ai CLI Demo](./demo.gif)

## Features

- 🧠 Natural language to terminal commands
- 🎯 Automatic context gathering
- 🔌 MCP (Model Context Protocol) support
- ⚡ Fast and flexible
```

## Tips for Great Demos

1. **Keep it short** - 30-60 seconds is ideal
2. **Show key features** - Query, Context, MCP
3. **Adjust speed** - Use `--speed 1.5` to 2.0
4. **Trim idle time** - Use `--idle-time-limit 2`
5. **Pick a theme** - Dark themes work best (monokai, dracula, nord)
6. **Right size** - 120x40 is good for most displays
7. **Test first** - Preview with `asciinema play` before converting

## Examples

### Quick Demo (30s)
```bash
# Edit record-demo-auto.sh to show just key features
./record-demo-auto.sh
agg --speed 2 --idle-time-limit 1.5 demo.cast quick-demo.gif
```

### Detailed Demo (60s)
```bash
./record-demo-enhanced.sh
# Uses default settings - perfect for documentation
```

### GitHub README Demo
```bash
# Optimized for GitHub
./record-demo-enhanced.sh
agg --theme monokai --speed 1.8 --cols 110 --rows 35 demo.cast demo.gif
```

## Resources

- [asciinema.org](https://asciinema.org/) - Terminal recorder
- [github.com/asciinema/agg](https://github.com/asciinema/agg) - GIF converter
- [hey-ai GitHub](https://github.com/andrewhuffman/hey-ai) - Project repository

---

**Need help?** Check `DEMO-RECORDING.md` for detailed documentation.

