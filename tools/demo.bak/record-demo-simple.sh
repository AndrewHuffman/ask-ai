#!/bin/bash

# record-demo-simple.sh - Simple manual demo recording for hey-ai CLI
# This script provides a template for manually recording a demo

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DEMO_CAST="demo.cast"
DEMO_GIF="demo.gif"

echo -e "${BLUE}Hey-AI Demo Recording Script${NC}"
echo ""

# Check dependencies
check_dependency() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo -e "${RED}Error: $1 is not installed.${NC}"
        echo -e "   Install with: ${YELLOW}$2${NC}"
        exit 1
    else
        echo -e "${GREEN}OK${NC} $1 is installed"
    fi
}

echo "Checking dependencies..."
check_dependency "asciinema" "brew install asciinema"
check_dependency "agg" "brew install agg"
check_dependency "hey-ai" "npm install -g hey-ai"
echo ""

# Create demo script file
DEMO_SCRIPT="demo-commands.txt"
cat > "$DEMO_SCRIPT" << 'EOF'
# HEY-AI CLI DEMO

# Part 1: Basic Query - Natural language to commands
hey-ai "find all typescript files in src directory"

# Part 2: Context Features

# Show command preferences (modern alternatives detected)
hey-ai --show-prefs

# Preview context that will be sent to LLM
hey-ai --show-context "list files"

# Part 3: MCP (Model Context Protocol)

# List available MCP server presets
hey-ai mcp presets

# Add a preset MCP server
hey-ai mcp add-preset filesystem

# List configured servers
hey-ai mcp list

# Query using MCP capabilities
hey-ai "how many typescript files are in this project?"

# Configuration management
hey-ai config list

# Done!
EOF

echo -e "${BLUE}Demo script created: $DEMO_SCRIPT${NC}"
echo ""
echo -e "${YELLOW}Recording Instructions:${NC}"
echo "1. Review the commands in $DEMO_SCRIPT"
echo "2. When ready, run:"
echo -e "   ${GREEN}asciinema rec $DEMO_CAST${NC}"
echo ""
echo "3. In the recording session, manually run each command from $DEMO_SCRIPT"
echo "   (Copy-paste or type them for a natural feel)"
echo ""
echo "4. Press Ctrl+D or type 'exit' when done"
echo ""
echo "5. Convert to GIF:"
echo -e "   ${GREEN}agg --font-size 14 --theme monokai --speed 1.5 --cols 120 --rows 30 $DEMO_CAST $DEMO_GIF${NC}"
echo ""
echo -e "${BLUE}Quick Options:${NC}"
echo ""
echo "Option 1 - Record now (manual typing):"
echo -e "  ${YELLOW}asciinema rec $DEMO_CAST${NC}"
echo ""
echo "Option 2 - Record with this script as a guide:"
echo -e "  ${YELLOW}asciinema rec $DEMO_CAST --command 'bash'${NC}"
echo ""
echo "Option 3 - Auto-record (run commands automatically):"
echo -e "  ${YELLOW}./record-demo-auto.sh${NC}"
echo ""

# Ask if user wants to start recording
read -p "$(echo -e ${YELLOW}Start recording now? [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Starting recording in 3 seconds...${NC}"
    sleep 3
    asciinema rec "$DEMO_CAST" \
        --overwrite \
        --title "hey-ai CLI Demo" \
        --idle-time-limit 2
    
    echo ""
    echo -e "${GREEN}Recording saved to $DEMO_CAST${NC}"
    echo ""
    read -p "$(echo -e ${YELLOW}Convert to GIF now? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Converting to GIF...${NC}"
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
        
        echo -e "${GREEN}GIF created: $DEMO_GIF${NC}"
        echo ""
        echo "To view:"
        echo -e "  ${YELLOW}open $DEMO_GIF${NC}"
    fi
else
    echo -e "${BLUE}No problem! Run the commands above when ready.${NC}"
fi

echo ""
echo -e "${GREEN}Tip:${NC} For best results:"
echo "  • Keep commands concise and clear"
echo "  • Add brief pauses between commands"
echo "  • Use --idle-time-limit to trim long waits"
echo "  • Adjust agg --speed to control playback"

