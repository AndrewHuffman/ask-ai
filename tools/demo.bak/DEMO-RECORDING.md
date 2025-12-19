# Demo Recording Guide

This guide explains how to create demo recordings of `hey-ai` using asciinema and agg.

## Prerequisites

Install the required tools:

```bash
# Install asciinema (terminal recorder)
brew install asciinema

# Install agg (asciinema to GIF converter)
brew install agg

# Make sure hey-ai is installed
npm install -g hey-ai
# or run from source: pnpm run build && pnpm link
```

## Quick Start

Three recording options are available:

### Option 1: Automated Recording (Recommended)

Fully automated - runs commands with realistic timing:

```bash
./record-demo-auto.sh
```

This will:
- Automatically run demo commands
- Record to `demo.cast`
- Convert to `demo.gif`
- No manual intervention needed!

### Option 2: Manual Recording with Expect

Uses expect script for precise control:

```bash
./record-demo.sh
```

Requires: `expect` (install with `brew install expect`)

### Option 3: Simple Manual Recording

Record yourself running commands:

```bash
./record-demo-simple.sh
```

This creates a command template and guides you through manual recording.

## Demo Content

The demo showcases three main features:

### 1. **Query** - Natural Language to Commands
```bash
hey-ai "find all typescript files in src directory"
```

### 2. **Context** - Automatic Context Gathering
```bash
# Show detected modern CLI alternatives
hey-ai --show-prefs

# Preview context sent to LLM
hey-ai --show-context "list files"
```

### 3. **MCP** - Model Context Protocol
```bash
# List available MCP presets
hey-ai mcp presets

# Add a preset server
hey-ai mcp add-preset filesystem

# List configured servers
hey-ai mcp list

# Show configuration
hey-ai config list
```

## Customization

### Recording Settings

Edit timing in the scripts:
```bash
COMMENT_PAUSE=1.5  # Pause after comments
COMMAND_PAUSE=3    # Pause after commands
LONG_PAUSE=4       # Longer pause for complex output
```

### GIF Conversion Options

Customize the GIF output:

```bash
agg \
    --theme monokai \              # Color theme
    --speed 1.5 \                  # Playback speed multiplier
    --font-size 14 \               # Font size
    --cols 120 \                   # Terminal columns
    --rows 35 \                    # Terminal rows
    --idle-time-limit 3 \          # Max idle time (seconds)
    demo.cast \
    demo.gif
```

### Available Themes

- `asciinema` (default)
- `monokai`
- `dracula`
- `solarized-dark`
- `solarized-light`
- `nord`
- `one-dark`

## Manual Recording Tips

If recording manually:

1. **Clear terminal** before starting: `clear`
2. **Slow down** - Type naturally, not too fast
3. **Add comments** to explain what's happening:
   ```bash
   # This demonstrates basic query usage
   hey-ai "your query here"
   ```
4. **Pause** after commands to let output display
5. **Use `--idle-time-limit`** to trim long pauses:
   ```bash
   asciinema rec demo.cast --idle-time-limit 2
   ```

## Advanced Usage

### Record in a Specific Directory

```bash
cd /tmp/demo-project
asciinema rec demo.cast --command "bash -c 'source ~/.zshrc && bash'"
```

### Multiple Takes

Record multiple versions:

```bash
asciinema rec take1.cast
asciinema rec take2.cast
asciinema rec take3.cast

# Convert the best one
agg --speed 2 take2.cast final-demo.gif
```

### Preview Before Converting

```bash
# Record
asciinema rec demo.cast

# Preview in terminal
asciinema play demo.cast

# If good, convert to GIF
agg demo.cast demo.gif
```

### Fine-tune Speed

Test different speeds:

```bash
agg --speed 1.0 demo.cast slow.gif      # Slower
agg --speed 1.5 demo.cast medium.gif    # Medium (recommended)
agg --speed 2.0 demo.cast fast.gif      # Faster
agg --speed 3.0 demo.cast veryfast.gif  # Very fast
```

## Troubleshooting

### asciinema not found
```bash
brew install asciinema
```

### agg not found
```bash
brew install agg
```

### expect not found (for record-demo.sh)
```bash
brew install expect
```

### Font rendering issues
Specify a different font family:
```bash
agg --font-family "Menlo, Monaco, monospace" demo.cast demo.gif
```

### GIF too large
- Reduce columns/rows: `--cols 100 --rows 25`
- Reduce font size: `--font-size 12`
- Increase speed: `--speed 2`
- Trim idle time: `--idle-time-limit 1.5`

### Colors look wrong
Try a different theme:
```bash
agg --theme dracula demo.cast demo.gif
```

## Output Files

After running the scripts, you'll have:

- `demo.cast` - Asciinema recording (JSON format)
- `demo.gif` - Animated GIF for README/docs
- `demo-commands.txt` - Command reference (from simple script)

## Adding to README

Once you have a good `demo.gif`, add it to your README:

```markdown
## Demo

![hey-ai demo](demo.gif)

*or with a link:*

![hey-ai demo](https://github.com/yourusername/hey-ai/raw/main/demo.gif)
```

## Resources

- [Asciinema Documentation](https://asciinema.org/)
- [agg GitHub](https://github.com/asciinema/agg)
- [Terminal GIF Best Practices](https://github.com/icholy/ttygif)

