#!/bin/bash

# record-demo-enhanced.sh - Enhanced automated demo with better visuals
# This creates a polished demo with headers, sections, and realistic pacing

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
DEMO_CAST="${1:-demo.cast}"
DEMO_GIF="${DEMO_CAST%.cast}.gif"

echo -e "${BLUE}Recording enhanced hey-ai demo...${NC}"
echo -e "   Output: ${CYAN}$DEMO_CAST${NC} → ${CYAN}$DEMO_GIF${NC}"
echo ""

# Check dependencies
for cmd in asciinema agg hey-ai; do
    if ! command -v "$cmd" &> /dev/null; then
        echo -e "${YELLOW}Warning: $cmd not found${NC}"
        case $cmd in
            asciinema) echo "   Install: brew install asciinema" ;;
            agg) echo "   Install: brew install agg" ;;
            hey-ai) echo "   Install: npm install -g hey-ai" ;;
        esac
        exit 1
    fi
done

# Create execution script with realistic demo
EXEC_SCRIPT=$(mktemp)
cat > "$EXEC_SCRIPT" << 'DEMO_SCRIPT'
#!/bin/bash

# Styling
BOLD='\033[1m'
DIM='\033[2m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
GRAY='\033[0;90m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Timing
SHORT=0.5
MEDIUM=1.5
LONG=2.5
XLLONG=4

# Helper functions
pause() { sleep ${1:-1}; }
comment() {
    echo -e "${GRAY}# $1${NC}"
    pause ${2:-$MEDIUM}
}
prompt() {
    echo -ne "${GREEN}$ ${NC}"
    pause $SHORT
}
run() {
    prompt
    echo -e "${CYAN}$1${NC}"
    pause $SHORT
    eval "$1" 2>&1
    pause ${2:-$LONG}
}
header() {
    echo ""
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo ""
    pause $MEDIUM
}

clear
echo ""
echo -e "${BOLD}${BLUE}HEY-AI CLI DEMO${NC}"
echo -e "${BOLD}${BLUE}AI-Powered Terminal Assistant with Context & MCP${NC}"
echo ""
pause $LONG

header "1. Natural Language Queries"

comment "Ask questions in plain English"
run "hey-ai 'find all typescript files in src directory'" $XLLONG

echo ""
pause $MEDIUM

comment "Get executable commands instantly"
run "hey-ai 'list files larger than 1MB created today'" $XLLONG

echo ""
pause $LONG

header "2. Automatic Context Gathering"

comment "hey-ai detects modern CLI tools you have installed"
run "hey-ai --show-prefs" $LONG

echo ""
pause $MEDIUM

comment "Preview the context sent to the LLM"
run "hey-ai --show-context 'analyze this project' | head -25" $LONG

echo ""
pause $LONG

header "3. MCP (Model Context Protocol)"

comment "View available MCP server presets"
run "hey-ai mcp presets | head -20" $LONG

echo ""
pause $MEDIUM

comment "Check current configuration"
run "hey-ai config list" $MEDIUM

echo ""
pause $MEDIUM

comment "List any configured MCP servers"
run "hey-ai mcp list" $MEDIUM

echo ""
pause $LONG

header "4. Additional Features"

comment "Use different models"
run "hey-ai -m gpt-4o 'explain git rebase'" $XLLONG

echo ""
pause $MEDIUM

comment "Fast mode (skip context gathering)"
run "hey-ai --no-context 'what is docker?'" $LONG

echo ""
pause $LONG

echo ""
echo -e "${BOLD}${GREEN}Demo Complete!${NC}"
echo -e "${BOLD}${GREEN}Learn more: github.com/andrewhuffman/hey-ai${NC}"
echo ""
pause $LONG

DEMO_SCRIPT

chmod +x "$EXEC_SCRIPT"

# Record with asciinema
echo -e "${YELLOW}Recording...${NC}"
SHELL=/bin/bash asciinema rec "$DEMO_CAST" \
    --overwrite \
    --title "hey-ai: AI-Powered CLI Assistant" \
    --idle-time-limit 3 \
    --env SHELL=/bin/bash \
    --command "$EXEC_SCRIPT" 2>&1 | grep -v "asciinema: "

rm "$EXEC_SCRIPT"

if [ ! -f "$DEMO_CAST" ]; then
    echo -e "${YELLOW}Warning: Recording may have failed${NC}"
    exit 1
fi

echo -e "${GREEN}Recording complete${NC}"
echo ""

# Convert to GIF
echo -e "${YELLOW}Converting to GIF...${NC}"
agg \
    --font-family "JetBrains Mono, SF Mono, Menlo, Monaco, monospace" \
    --font-size 14 \
    --line-height 1.4 \
    --theme monokai \
    --speed 1.5 \
    --cols 120 \
    --rows 40 \
    --idle-time-limit 2.5 \
    "$DEMO_CAST" \
    "$DEMO_GIF" 2>&1 | grep -v "Finished"

echo -e "${GREEN}Demo complete!${NC}"
echo ""
echo -e "${BOLD}Files created:${NC}"
echo -e "  ${CYAN}$DEMO_CAST${NC} (asciinema recording)"
echo -e "  ${CYAN}$DEMO_GIF${NC} (animated GIF)"
echo ""
echo -e "${BOLD}Preview:${NC}"
echo -e "  ${GRAY}asciinema play $DEMO_CAST${NC}"
echo -e "  ${GRAY}open $DEMO_GIF${NC}"
echo ""
echo -e "${BOLD}Regenerate GIF with custom settings:${NC}"
echo -e "  ${GRAY}agg --theme dracula --speed 2 --cols 100 $DEMO_CAST output.gif${NC}"
echo ""
echo -e "${DIM}Themes: asciinema, monokai, dracula, solarized-dark, nord${NC}"

