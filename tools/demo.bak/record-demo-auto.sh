#!/bin/bash

# record-demo-auto.sh - Automated demo recording for hey-ai CLI
# This script automatically runs commands with delays for a realistic demo

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Configuration
DEMO_CAST="demo.cast"
DEMO_GIF="demo.gif"

# Timing (in seconds)
COMMENT_PAUSE=1.5
COMMAND_PAUSE=3
LONG_PAUSE=4

# Check dependencies
command -v asciinema >/dev/null 2>&1 || { echo "Error: asciinema not installed: brew install asciinema"; exit 1; }
command -v agg >/dev/null 2>&1 || { echo "Error: agg not installed: brew install agg"; exit 1; }
command -v hey-ai >/dev/null 2>&1 || { echo "Error: hey-ai not installed: npm install -g hey-ai"; exit 1; }

echo -e "${BLUE}Recording automated hey-ai demo...${NC}"
echo ""

# Create a demo execution script
EXEC_SCRIPT=$(mktemp)
cat > "$EXEC_SCRIPT" << 'DEMO_EOF'
#!/bin/bash

# Helper functions
pause() { sleep $1; }
comment() {
    echo -e "\033[0;90m# $1\033[0m"
    sleep 1.5
}
run_cmd() {
    echo -e "\033[0;36m\$ $1\033[0m"
    sleep 0.5
    eval "$1"
    sleep $2
}

clear
echo ""
echo -e "\033[1;34mHEY-AI CLI DEMO\033[0m"
echo -e "\033[1;34mAI-Powered Terminal Assistant\033[0m"
echo ""
sleep 2

comment "Part 1: Basic Query"
echo ""
sleep 1

comment "Ask hey-ai in natural language"
run_cmd "hey-ai 'find all typescript files in src directory'" 4

echo ""
sleep 1

comment "Part 2: Context Features"
echo ""
sleep 1

comment "Show detected modern CLI alternatives"
run_cmd "hey-ai --show-prefs" 3

echo ""
sleep 1

comment "Preview context sent to the LLM"
run_cmd "hey-ai --show-context 'list files' | head -20" 3

echo ""
sleep 1

comment "Part 3: MCP Servers"
echo ""
sleep 1

comment "List available MCP server presets"
run_cmd "hey-ai mcp presets | head -15" 4

echo ""
sleep 1

comment "Show current configuration"
run_cmd "hey-ai config list" 2

echo ""
sleep 1

comment "List configured MCP servers"
run_cmd "hey-ai mcp list" 2

echo ""
sleep 2

comment "Demo complete!"
echo ""
sleep 2

DEMO_EOF

chmod +x "$EXEC_SCRIPT"

# Record the demo
echo -e "${YELLOW}Recording demo cast...${NC}"
SHELL=/bin/bash asciinema rec "$DEMO_CAST" \
    --overwrite \
    --title "hey-ai: AI-Powered CLI Assistant" \
    --idle-time-limit 3 \
    --command "$EXEC_SCRIPT"

# Clean up
rm "$EXEC_SCRIPT"

echo ""
echo -e "${GREEN}Recording complete: $DEMO_CAST${NC}"
echo ""

# Convert to GIF
echo -e "${YELLOW}Converting to GIF...${NC}"
agg \
    --font-family "JetBrains Mono, Menlo, Monaco, monospace" \
    --font-size 14 \
    --line-height 1.4 \
    --theme monokai \
    --speed 1.5 \
    --cols 120 \
    --rows 35 \
    "$DEMO_CAST" \
    "$DEMO_GIF"

echo ""
echo -e "${GREEN}Demo GIF created: $DEMO_GIF${NC}"
echo ""
echo -e "${BLUE}Files created:${NC}"
echo -e "  Cast: ${CYAN}$DEMO_CAST${NC}"
echo -e "  GIF:  ${CYAN}$DEMO_GIF${NC}"
echo ""
echo -e "${YELLOW}Commands:${NC}"
echo -e "  Replay:  ${GRAY}asciinema play $DEMO_CAST${NC}"
echo -e "  View:    ${GRAY}open $DEMO_GIF${NC}"
echo ""
echo -e "${YELLOW}Customize GIF:${NC}"
echo -e "  ${GRAY}agg --theme dracula --speed 2 --cols 100 $DEMO_CAST custom.gif${NC}"
echo ""
echo -e "${GREEN}Available themes:${NC} asciinema, dracula, monokai, solarized-dark, solarized-light"

