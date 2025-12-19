#!/bin/bash

# record-demo-file.sh - Record a demo by running commands from a text file
# Usage: ./record-demo-file.sh commands.txt [output.cast]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
INPUT_FILE="${1}"
DEMO_CAST="${2:-demo.cast}"
DEMO_GIF="${DEMO_CAST%.cast}.gif"

if [ -z "$INPUT_FILE" ]; then
    echo "Usage: $0 <commands.txt> [output.cast]"
    exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: File $INPUT_FILE not found"
    exit 1
fi

# Check dependencies
for cmd in asciinema agg expect; do
    if ! command -v "$cmd" &> /dev/null; then
        echo "Error: $cmd not found"
        exit 1
    fi
done

echo -e "${BLUE}Recording demo from file: ${CYAN}$INPUT_FILE${NC}"
echo -e "Output: ${CYAN}$DEMO_CAST${NC}"

# Create the expect script
EXPECT_SCRIPT=$(mktemp)
cat > "$EXPECT_SCRIPT" << 'EOF'
#!/usr/bin/env expect

set timeout -1
set input_file [lindex $argv 0]

# Simulated typing speed
set send_slow {1 .05}

proc type_slowly {text} {
    foreach char [split $text ""] {
        send -s -- $char
        # Small random variation in typing speed
        sleep [expr {rand() * 0.03 + 0.02}]
    }
}

# Start shell with a specific prompt to ensure matching works reliably
# We use -f (no rcs) to get a clean environment
spawn zsh -f
expect -re {[%#] ?$}
send "export PROMPT='%# '\r"
expect "% "

# Open and read file
set fp [open $input_file r]
while {[gets $fp line] != -1} {
    # Skip empty lines
    if {[string trim $line] == ""} {
        continue
    }
    
    # Handle comments
    if {[string index [string trim $line] 0] == "#"} {
        puts ""
        type_slowly "$line"
        send "\r"
        sleep 1
        continue
    }

    # Type and run command
    type_slowly "$line"
    send "\r"
    
    # Wait for prompt before next command
    # Adjust wait time based on command type or just use a fixed delay
    sleep 2
    expect "% "
    sleep 1
}
close $fp

# Exit
send "exit\r"
expect eof
EOF

chmod +x "$EXPECT_SCRIPT"

# Record with asciinema
echo -e "${YELLOW}Recording...${NC}"
asciinema rec "$DEMO_CAST" \
    --overwrite \
    --title "hey-ai: Demo from $INPUT_FILE" \
    --command "expect -f $EXPECT_SCRIPT $INPUT_FILE"

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
    "$DEMO_CAST" \
    "$DEMO_GIF"

echo -e "${GREEN}Demo complete!${NC}"
echo -e "Files: $DEMO_CAST, $DEMO_GIF"
