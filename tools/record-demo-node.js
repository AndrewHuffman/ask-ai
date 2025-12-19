#!/usr/bin/env node

import fs from 'fs';
import { spawn, execSync, spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors
const COLORS = {
    GREEN: '\x1b[32m',
    BLUE: '\x1b[34m',
    YELLOW: '\x1b[33m',
    CYAN: '\x1b[36m',
    RESET: '\x1b[0m'
};

// Configuration
const inputFile = process.argv[2];
const demoCast = process.argv[3] || 'demo.cast';
const demoGif = demoCast.replace('.cast', '.gif');

if (!inputFile) {
    console.log(`Usage: ${path.basename(__filename)} <commands.txt> [output.cast]`);
    process.exit(1);
}

if (!fs.existsSync(inputFile)) {
    console.error(`Error: File ${inputFile} not found`);
    process.exit(1);
}

// Check dependencies
const dependencies = ['asciinema', 'agg'];
try {
    dependencies.forEach(cmd => {
        execSync(`which ${cmd}`);
    });
} catch (e) {
    console.error(`Error: Missing dependencies. Please install ${dependencies.join(', ')}`);
    process.exit(1);
}

console.log(`${COLORS.BLUE}Recording demo from file: ${COLORS.CYAN}${inputFile}${COLORS.RESET}`);
console.log(`Output: ${COLORS.CYAN}${demoCast}${COLORS.RESET}`);

// Create a temporary driver script that types and runs commands
const driverScript = path.join(process.cwd(), 'demo-driver.js');

// Use String.raw to avoid escaping issues
const driverContent = String.raw`
import { spawnSync } from 'child_process';
import fs from 'fs';

const inputFile = '${path.resolve(inputFile)}';
const commands = fs.readFileSync(inputFile, 'utf-8').split('\n');

const sleep = (ms) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {}
};

function typeSlowly(text) {
    for (const char of text) {
        process.stdout.write(char);
        sleep(Math.floor(Math.random() * 30) + 20);
    }
}

function printPrompt() {
    process.stdout.write('\x1b[32m$ \x1b[0m');
}

// Initial pause
sleep(500);

for (let line of commands) {
    line = line.trim();
    if (!line) continue;

    printPrompt();

    if (line.startsWith('#')) {
        // Comment - just type it and show newline
        typeSlowly(line);
        process.stdout.write('\r\n');
        sleep(1000);
        continue;
    }

    // Type the command
    typeSlowly(line);
    process.stdout.write('\r\n');
    
    // Run the command and show output
    sleep(200);
    const result = spawnSync('zsh', ['-c', line], {
        stdio: ['inherit', 'inherit', 'inherit'],
        env: { ...process.env, TERM: 'xterm-256color' }
    });
    
    sleep(1000);
}

printPrompt();
sleep(500);
`;

fs.writeFileSync(driverScript, driverContent);

console.log(`${COLORS.YELLOW}Recording...${COLORS.RESET}`);

const asciinema = spawn('asciinema', ['rec', demoCast, '--overwrite', '--title', `hey-ai: Demo from ${path.basename(inputFile)}`, '--command', `node ${driverScript}`], {
    stdio: 'inherit'
});

asciinema.on('close', (code) => {
    fs.unlinkSync(driverScript);
    
    if (code !== 0) {
        console.error(`Recording failed with code ${code}`);
        process.exit(code);
    }

    console.log(`${COLORS.YELLOW}Converting to GIF...${COLORS.RESET}`);
    
    const agg = spawn('agg', [
        '--font-family', 'JetBrains Mono, SF Mono, Menlo, Monaco, monospace',
        '--font-size', '14',
        '--line-height', '1.4',
        '--theme', 'monokai',
        '--speed', '1.5',
        '--cols', '120',
        '--rows', '40',
        demoCast,
        demoGif
    ], { stdio: 'inherit' });

    agg.on('close', (aggCode) => {
        if (aggCode === 0) {
            console.log(`${COLORS.GREEN}Demo complete!${COLORS.RESET}`);
            console.log(`Files: ${demoCast}, ${demoGif}`);
        } else {
            console.error(`Conversion failed with code ${aggCode}`);
        }
    });
});
