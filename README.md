# llm-cli

`llm-cli` is an enhanced command-line interface for LLM interactions, designed specifically for terminal productivity. It automatically gathers context from your current environment—including file structure, command history, and session history—to provide more accurate and executable terminal commands.

## Key Features

- **🧠 Automatic Context Gathering**:
  - **ZSH History**: Includes the last 15 commands to understand what you're currently doing.
  - **File Context**: Scans the current directory (respecting `.gitignore`) and includes the content of files mentioned in your query.
  - **Session History**: Persistent SQLite-backed history of previous AI interactions for conversational continuity.
  - **Modern Command Detection**: Detects modern CLI tools you have installed (like `fd`, `rg`, `bat`, `eza`, `delta`) and instructs the AI to prefer them over legacy commands.

- **🔌 MCP (Model Context Protocol) Support**: Connects to MCP servers to expand the LLM's capabilities.
  - **Tools**: Automatically includes available MCP tools in the context so the AI knows what's possible.
  - **Resources**: Fetches and includes relevant MCP resources in the prompt context.
- **📋 Clipboard Integration**: Automatically extracts the last executable command block from the AI's response and copies it to your clipboard.
- **🚀 Fast & Flexible**: Built on top of the excellent [`llm`](https://llm.datasette.io/) CLI. Supports streaming and easy model switching.

## Prerequisites

- [**llm**](https://llm.datasette.io/en/stable/setup.html): This tool acts as a wrapper around the `llm` CLI.
- **zsh**: Currently optimized for zsh history parsing.

## Installation

```bash
# Clone the repository
git clone https://github.com/andrewhuffman/llm-cli.git
cd llm-cli

# Install dependencies and link globally
npm install
npm run build
npm link
```

## Usage

Ask a question directly:
```bash
llm-cli "how do I find all large files in the current directory?"
```

Enter **interactive mode** by omitting the query:
```bash
llm-cli
```

The tool will:
1. Gather context (files, history, preferred commands).
2. Call the LLM with the context and your query.
3. Stream the response to the terminal.
4. **Copy the suggested command to your clipboard** automatically.

### Options

```bash
llm-cli [query] [options]

Options:
  -m, --model <model>  Specify the model to use (passed to llm)
  --no-history         Do not include history context
  --no-files           Do not include file context
  --system <prompt>    System prompt override
  --no-context         Skip context gathering (fast mode)
  -v, --verbose        Show debug output
  --show-context       Show assembled context without calling LLM
  --show-prefs         Show detected command preferences
  -V, --version        output the version number
  -h, --help           display help for command
```

### Shell Completions

Generate zsh completions:
```bash
llm-cli completion > ~/.zsh/completion/_llm-cli
```
Then add the following to your `~/.zshrc`:
```bash
fpath=(~/.zsh/completion $fpath)
autoload -Uz compinit
compinit
```

## Configuration

### MCP Servers

You can configure MCP servers in `~/.config/llm-cli/mcp.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/server.js"]
    }
  }
}
```

### Command Preferences

To see which modern command alternatives were detected on your system:

```bash
llm-cli --show-prefs
```

### Default Model

You can set a default model in three ways:

1. **Environment Variable**: Set `LLM_MODEL` in your shell.
   ```bash
   export LLM_MODEL=gpt-4o
   ```
2. **CLI Config**: Use the built-in config command.
   ```bash
   llm-cli config set defaultModel gpt-4o
   ```
3. **LLM Tool Default**: `llm-cli` will respect the default model set in the underlying `llm` tool.
   ```bash
   llm models default gpt-4o
   ```

## License

ISC

