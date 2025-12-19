# Demo Scripts Summary

All the tools you need to create professional CLI demos for `hey-ai`.

## 📁 Files Created

### Recording Scripts

1. **`record-demo-enhanced.sh`** ⭐ **Recommended**
   - Fully automated with polished visuals
   - Headers, sections, proper timing
   - Creates professional-looking demos
   - Usage: `./record-demo-enhanced.sh` or `npm run demo`

2. **`record-demo-auto.sh`**
   - Quick automated recording
   - Simpler than enhanced version
   - Good for testing
   - Usage: `./record-demo-auto.sh` or `npm run demo:auto`

3. **`record-demo-simple.sh`**
   - Interactive manual recording guide
   - Creates command templates
   - Walk-through instructions
   - Usage: `./record-demo-simple.sh` or `npm run demo:simple`

4. **`record-demo.sh`**
   - Uses `expect` for precise control
   - Requires expect installation
   - Advanced automation
   - Usage: `./record-demo.sh`

### Documentation

5. **`DEMO-RECORDING.md`**
   - Complete recording guide
   - Detailed customization options
   - Troubleshooting tips
   - Best practices

6. **`DEMO-QUICKSTART.md`**
   - Quick reference guide
   - Common commands
   - Fast solutions
   - TL;DR instructions

7. **`demo-scripts-summary.md`** (this file)
   - Overview of all files
   - Quick comparison
   - Usage examples

### Package Scripts

Added to `package.json`:
```json
"demo": "./record-demo-enhanced.sh",
"demo:auto": "./record-demo-auto.sh", 
"demo:simple": "./record-demo-simple.sh",
"demo:play": "asciinema play demo.cast",
"demo:open": "open demo.gif"
```

## 🚀 Quick Start

### Option 1: Enhanced (Recommended)
```bash
npm run demo
# Creates: demo.cast + demo.gif
```

### Option 2: Automated
```bash
npm run demo:auto
```

### Option 3: Manual with Guide
```bash
npm run demo:simple
```

### View Results
```bash
npm run demo:play  # Preview in terminal
npm run demo:open  # Open GIF
```

## 📊 Comparison

| Script | Automation | Quality | Customization | Dependencies |
|--------|-----------|---------|---------------|--------------|
| **enhanced** | Full | ⭐⭐⭐⭐⭐ | Easy | asciinema, agg |
| **auto** | Full | ⭐⭐⭐⭐ | Easy | asciinema, agg |
| **simple** | Manual | ⭐⭐⭐⭐⭐ | Full | asciinema, agg |
| **expect** | Full | ⭐⭐⭐⭐ | Advanced | asciinema, agg, expect |

## 🎯 Demo Content

All scripts showcase these three main features:

### 1. Query - Natural Language
```bash
hey-ai "find all typescript files in src directory"
hey-ai "list files larger than 1MB created today"
```

### 2. Context - Automatic Gathering
```bash
hey-ai --show-prefs      # Show modern CLI alternatives
hey-ai --show-context    # Preview LLM context
```

### 3. MCP - Model Context Protocol
```bash
hey-ai mcp presets       # List available servers
hey-ai mcp add-preset    # Add a server
hey-ai mcp list          # Show configured servers
hey-ai config list       # Show configuration
```

## 🛠️ Customization

### Change Output Filename
```bash
./record-demo-enhanced.sh my-demo.cast
# Creates: my-demo.cast + my-demo.gif
```

### Regenerate GIF with Different Style
```bash
# After recording demo.cast, regenerate with:
agg --theme dracula --speed 2 demo.cast fast-dark.gif
agg --theme nord --cols 100 --rows 25 demo.cast compact.gif
agg --theme monokai --speed 1.5 demo.cast standard.gif
```

### Common agg Options
```bash
--theme <name>           # monokai, dracula, nord, solarized-dark, etc.
--speed <multiplier>     # 1.0=slow, 1.5=normal, 2.0=fast, 3.0=very fast
--cols <number>          # Terminal width (default: 120)
--rows <number>          # Terminal height (default: 40)
--font-size <pixels>     # Font size (default: 14)
--idle-time-limit <sec>  # Max pause length (default: 3)
```

## 📋 Prerequisites

Install once:
```bash
brew install asciinema    # Terminal recorder
brew install agg          # GIF converter
npm install -g hey-ai     # The CLI tool (or build from source)
```

Optional:
```bash
brew install expect       # For record-demo.sh
```

## 🎨 Themes

Popular themes for `agg`:
- `monokai` - Dark, high contrast (default)
- `dracula` - Dark purple theme
- `nord` - Dark blue theme
- `solarized-dark` - Muted dark
- `solarized-light` - Muted light
- `one-dark` - Atom's dark theme
- `asciinema` - Light default

## 🔧 Workflow Examples

### Quick Test
```bash
npm run demo            # Record
npm run demo:play       # Preview in terminal
npm run demo:open       # View GIF
```

### Create Multiple Versions
```bash
npm run demo
agg --theme monokai --speed 1.5 demo.cast demo-standard.gif
agg --theme dracula --speed 2.0 demo.cast demo-fast.gif  
agg --theme nord --speed 1.8 demo.cast demo-nordic.gif
```

### Manual Recording for Perfect Results
```bash
npm run demo:simple
# Follow the interactive prompts
# Type commands naturally
# Press Ctrl+D when done
# Convert to GIF with custom settings
```

## 📝 Tips

1. **Keep demos short** - 30-60 seconds ideal
2. **Use dark themes** - More readable in docs
3. **Adjust speed** - 1.5-2.0x for most content
4. **Trim idle time** - Use `--idle-time-limit 2`
5. **Test first** - Preview with `asciinema play`
6. **Right size** - 110-120 cols works for most displays
7. **Clear commands** - Show one feature at a time

## 🐛 Troubleshooting

### asciinema not found
```bash
brew install asciinema
```

### agg not found
```bash
brew install agg
```

### Demo looks weird
```bash
# Try with clean environment
TERM=xterm-256color npm run demo
```

### GIF too large
```bash
agg --speed 2 --cols 100 --rows 25 demo.cast smaller.gif
```

### Want different timing
Edit the script files and adjust:
```bash
SHORT=0.5
MEDIUM=1.5
LONG=2.5
XLLONG=4
```

## 📚 Documentation

- **Quick Start**: See `DEMO-QUICKSTART.md`
- **Full Guide**: See `DEMO-RECORDING.md`
- **Project README**: See `README.md`

## 🎬 Example Output

After running `npm run demo`, you'll have:

```
demo.cast  - Asciinema recording (JSON format, ~50KB)
demo.gif   - Animated GIF (2-5MB depending on settings)
```

Add to your README:
```markdown
## Demo

![hey-ai demo](./demo.gif)
```

## ⚡ One-Liner

```bash
npm run demo && npm run demo:open
```

Record and view in one command!

---

**Questions?** Check the detailed guides:
- `DEMO-QUICKSTART.md` - Fast reference
- `DEMO-RECORDING.md` - Complete guide

