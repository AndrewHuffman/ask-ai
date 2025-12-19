#!/bin/bash

# record-demo.sh - Automated demo recording for hey-ai CLI
# This script uses asciinema to record a demo and agg to convert it to GIF

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEMO_CAST="demo.cast"
DEMO_GIF="demo.gif"
TYPING_SPEED=0.05  # seconds between characters
PAUSE_SHORT=1      # short pause in seconds
PAUSE_MEDIUM=2     # medium pause in seconds
PAUSE_LONG=3       # long pause in seconds

echo -e "${BLUE}Recording hey-ai demo...${NC}"

# Check dependencies
command -v asciinema >/dev/null 2>&1 || { echo "Error: asciinema is not installed. Install with: brew install asciinema"; exit 1; }
command -v agg >/dev/null 2>&1 || { echo "Error: agg is not installed. Install with: brew install agg"; exit 1; }

# Create a temporary expect script for automation
EXPECT_SCRIPT=$(mktemp)
cat > "$EXPECT_SCRIPT" << 'EOF'
#!/usr/bin/env expect

set timeout -1
set send_slow {10 .001}

proc type_slowly {text} {
    foreach char [split $text ""] {
        send -s -- $char
        sleep 0.05
    }
}

proc run_command {cmd {pause 2}} {
    type_slowly $cmd
    send "\r"
    sleep $pause
}

proc comment {text {pause 1}} {
    type_slowly "# $text"
    send "\r"
    sleep $pause
}

# Start recording
spawn bash -c "PS1='$ ' bash"

# Wait for prompt
expect "$ "

# ============================================
# PART 1: Basic Query Demo
# ============================================
comment "Demo: hey-ai - AI-powered CLI assistant" 2

comment "Part 1: Basic Query" 1
run_command "hey-ai 'find all typescript files in src directory'" 4

send "\r"
sleep 1

# ============================================
# PART 2: Context Features
# ============================================
comment "Part 2: Context Features" 1

comment "Show detected command preferences" 1
run_command "hey-ai --show-prefs" 3

comment "Preview context gathering" 1
run_command "hey-ai --show-context 'list files'" 4

# ============================================
# PART 3: MCP Server Management
# ============================================
comment "Part 3: MCP (Model Context Protocol)" 1

comment "List available MCP presets" 1
run_command "hey-ai mcp presets" 3

comment "Add filesystem MCP server" 1
run_command "hey-ai mcp add-preset filesystem" 2

comment "List configured MCP servers" 1
run_command "hey-ai mcp list" 2

comment "Query with MCP support" 1
run_command "hey-ai 'how many typescript files are in this project?'" 4

comment "Demo complete!" 2

# Exit
send "exit\r"
expect eof
EOF

chmod +x "$EXPECT_SCRIPT"

# Record the demo
echo -e "${YELLOW}Recording with asciinema...${NC}"
asciinema rec "$DEMO_CAST" \
    --overwrite \
    --title "hey-ai CLI Demo" \
    --command "$EXPECT_SCRIPT"

# Clean up expect script
rm "$EXPECT_SCRIPT"

# Convert to GIF using agg
echo -e "${YELLOW}Converting to GIF with agg...${NC}"
agg \
    --font-family "JetBrains Mono, Menlo, Monaco, monospace" \
    --font-size 14 \
    --line-height 1.4 \
    --theme monokai \
    --speed 1.5 \
    --cols 120 \
    --rows 30 \
    "$DEMO_CAST" \
    "$DEMO_GIF"

echo -e "${GREEN}Demo recording complete!${NC}"
echo -e "   Cast file: ${BLUE}$DEMO_CAST${NC}"
echo -e "   GIF file:  ${BLUE}$DEMO_GIF${NC}"
echo ""
echo -e "To replay the recording:"
echo -e "  ${YELLOW}asciinema play $DEMO_CAST${NC}"
echo ""
echo -e "To regenerate GIF with different settings:"
echo -e "  ${YELLOW}agg --theme monokai --speed 2 $DEMO_CAST output.gif${NC}"

