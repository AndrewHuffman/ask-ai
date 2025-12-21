# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

`hey-ai` is an enhanced CLI for LLM interactions optimized for terminal productivity. It automatically gathers context from the environment (file structure, command history, session history) and supports active MCP (Model Context Protocol) tool use for agentic interactions.

## Development Commands

### Build and Development
```bash
# Build TypeScript to JavaScript
pnpm run build

# Run in development mode (uses tsx)
pnpm run dev

# Build and link globally for testing
pnpm run build:link
```

### Testing
```bash
# Run all tests
pnpm test

# Run specific test file
NODE_OPTIONS=--experimental-vm-modules npx jest tests/session.test.ts

# Run tests in watch mode
NODE_OPTIONS=--experimental-vm-modules npx jest --watch
```

### Installation from Source
```bash
pnpm install
pnpm run build
pnpm link --global
```

## Architecture

### Core Components

**RAG Engine** (`src/rag/engine.ts`)
- Central orchestrator for context and tool management
- Provides minimal pre-loaded context (OS info, command preferences, cwd)
- Exposes internal context tools for on-demand retrieval
- Key methods:
  - `assembleContext(query)` - returns minimal pre-loaded context
  - `getInternalTools()` - returns internal tool definitions
  - `executeInternalTool(name, args)` - executes internal context tools

**LLM Wrapper** (`src/llm/wrapper.ts`)
- Abstracts multi-provider LLM interaction using Vercel AI SDK
- Handles model selection, aliasing, and provider detection
- Converts MCP tool definitions to Vercel AI SDK format using Zod schemas
- Supports Anthropic (Claude), OpenAI (GPT), and Google (Gemini) providers
- Tool calling integration with visual feedback hooks

**MCP Manager** (`src/mcp/client.ts`)
- Manages connections to multiple MCP servers (stdio, http, sse transports)
- Indexes tools from all connected servers
- Handles tool invocation and response formatting
- Sanitizes JSON schemas for LLM compatibility

**Internal Tools** (`src/tools/internal.ts`)
- On-demand context retrieval tools that the LLM can call when needed
- 5 tools available:
  - `search_session_history` - Search past AI conversations using hybrid FTS+semantic search
  - `get_recent_commands` - Get recent terminal commands from zsh history
  - `list_project_files` - List files in current directory (respects .gitignore)
  - `read_file_content` - Read contents of a specific file
  - `get_command_docs` - Get tldr/man documentation for a command
- Tool routing in `index.ts` distinguishes internal tools from MCP tools
- Visual feedback shows `[Context: tool_name]` for internal tools vs `[MCP: tool_name]` for MCP tools

### Context Gathering System

**Session History** (`src/context/session.ts`)
- SQLite-backed persistent storage of AI interactions
- Hybrid search combining FTS5 (keyword) and vector embeddings (semantic)
- Uses `sqlite-vss` extension for vector similarity search
- Special Linux compatibility layer for sqlite-vss loading

**ZSH History** (`src/context/history.ts`)
- Parses and extracts recent commands from `~/.zsh_history`
- Provides terminal context for command suggestions

**File Context** (`src/context/files.ts`)
- Scans current directory respecting `.gitignore`
- Includes file content when explicitly mentioned in queries

**Command Detector** (`src/context/commands.ts`)
- Detects modern CLI alternatives installed on system (fd, rg, bat, eza, etc.)
- Prefers modern tools over legacy commands in suggestions

### Configuration

**Config Manager** (`src/config.ts`)
- Stores configuration at `~/.config/hey-ai/config.json`
- Manages default model settings and MCP server configurations
- Schema validation using Zod

### Entry Point

**Main CLI** (`src/index.ts`)
- Uses Commander.js for CLI argument parsing
- Supports single-query mode and interactive REPL mode
- Commands: `models`, `completion`, `config`, `mcp`
- Implements clipboard integration for suggested commands

## Testing Patterns

- Uses Jest with ts-jest for ESM support
- Mock external dependencies (embeddings, file system) in tests
- Temporary databases/files for isolation
- Test files located in `tests/` directory
- Key configuration: `jest.config.js` with ESM preset

## Key Implementation Details

### Context Retrieval Strategy
The system uses an on-demand approach where heavy context is fetched via tool calls:

**Pre-loaded Context** (always included, lightweight):
- OS/system information
- Command preferences (detected modern CLI alternatives)
- Current working directory
- Available tools list (internal + MCP)

**On-Demand Context** (fetched via internal tools when LLM decides it's needed):
- Session history - via `search_session_history` tool
- Terminal history - via `get_recent_commands` tool
- File listings - via `list_project_files` tool
- File contents - via `read_file_content` tool
- Command documentation - via `get_command_docs` tool

This approach reduces token usage for simple queries while allowing the LLM to fetch relevant context when genuinely needed.

### MCP Tool Integration
- Tools from all connected MCP servers are aggregated and presented to LLM
- Tool schemas are sanitized (removes `$schema`, `additionalProperties`, etc.)
- Visual feedback shows tool name, server source, and execution time
- Tool failures are non-fatal - LLM receives error message and can adapt

### Model Selection
- Default model can be set via `LLM_MODEL` env var or config file
- Supports friendly aliases (e.g., `haiku` → `claude-3-5-haiku-20241022`)
- Provider auto-detected from model name pattern
- Fallback to OpenAI if provider unclear

### Session History Search
Hybrid search strategy combines:
1. **FTS5 keyword search** - Fast BM25-based ranking for exact term matches
2. **Vector similarity** - Semantic search using embeddings for conceptual matches
3. **Score fusion** - Results from both methods merged and normalized, with boost for items found by both

### Linux sqlite-vss Compatibility
Special handling for Linux where better-sqlite3 appends `.so` to extension paths, causing `.so.so` errors. Falls back to manual loading with `.so` stripped if standard loading fails.

## Important Conventions

- **ES Modules**: Project uses `"type": "module"` - all imports require `.js` extensions
- **TypeScript**: Strict mode enabled, uses NodeNext module resolution
- **Error Handling**: Embedding failures are non-fatal - FTS search continues working
- **Process Exit**: Properly disconnects MCP clients before exit to avoid hanging processes
- **Clipboard**: First code block from response automatically copied to clipboard
- **System Prompt**: Emphasizes providing commands over executing tasks, strict single-block output format

## Git Workflow

- Uses Husky for pre-commit hooks
- Conventional commits enforced via commitlint
- Changelog auto-generated via conventional-changelog
- Main branch: `main`
