#!/usr/bin/env node
import { Command } from 'commander';
import clipboardy from 'clipboardy';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { RagEngine } from './rag/engine.js';
import { LlmWrapper } from './llm/wrapper.js';
import { CommandDetector } from './context/commands.js';
import { ConfigManager } from './config.js';

async function processQuery(query: string, options: any, rag: RagEngine, llm: LlmWrapper, log: Function) {
  try {
    let context = '';
    
    if (options.context === false) {
      log('Skipping context (--no-context)');
    } else {
      context = await rag.assembleContext(query);
      log('Context length:', context.length);
    }

    const configManager = new ConfigManager();
    const config = await configManager.loadConfig();
    const model = options.model || config.defaultModel;

    const systemPrompt = options.system || 
      `You are a helpful CLI assistant. Provide accurate, executable zsh commands in markdown code blocks. Be concise.`;

    const finalPrompt = context 
      ? `${context}\n\n## User Query\n${query}`
      : query;

    console.log(chalk.blue('Thinking...'));
    
    const response = await llm.streamPrompt(finalPrompt, {
      model: model,
      system: systemPrompt
    });

    // Save to session history
    await rag.saveInteraction(query, response);

    // Extract code blocks for clipboard
    const codeBlockRegex = /```(?:zsh|bash|sh)?\n([\s\S]*?)\n```/g;
    const commands: string[] = [];
    let match;
    
    while ((match = codeBlockRegex.exec(response)) !== null) {
      commands.push(match[1].trim());
    }

    if (commands.length > 0) {
      const lastCommand = commands[commands.length - 1];
      try {
        await clipboardy.write(lastCommand);
        console.log(chalk.green('\n✓ Command copied to clipboard!'));
      } catch (e) {
        log('Clipboard error:', e);
      }
    }
    
    return response;
  } catch (error) {
    console.error(chalk.red('Error:'), error);
    throw error;
  }
}

export function createProgram() {
  const program = new Command();

  program
    .name('llm-cli')
    .description('Enhanced CLI for LLM interactions with context and MCP support')
    .version('1.0.0')
    .argument('[query]', 'The query to ask the LLM (omitting starts interactive mode)')
    .option('-m, --model <model>', 'Specify the model to use')
    .option('--no-history', 'Do not include history context')
    .option('--no-files', 'Do not include file context')
    .option('--system <prompt>', 'System prompt override')
    .option('--no-context', 'Skip context gathering (fast mode)')
    .option('-v, --verbose', 'Show debug output')
    .option('--show-context', 'Show assembled context without calling LLM')
    .option('--show-prefs', 'Show detected command preferences')
    .action(async (query, options) => {
      const log = options.verbose 
        ? (...args: any[]) => console.log(chalk.gray('[debug]'), ...args)
        : () => {};

      // Show preferences mode
      if (options.showPrefs) {
        const detector = new CommandDetector();
        const prefs = detector.getPreferences();
        console.log(chalk.bold('Detected command preferences:'));
        if (Object.keys(prefs).length === 0) {
          console.log(chalk.gray('  No alternative commands detected'));
        } else {
          for (const [generic, preferred] of Object.entries(prefs)) {
            console.log(`  ${chalk.red(generic)} → ${chalk.green(preferred)}`);
          }
        }
        console.log(chalk.gray('\nAlternatives searched: fd, rg, bat, eza, delta, sd, dust, htop, tldr, z, procs...'));
        return;
      }

      const rag = new RagEngine();
      const llm = new LlmWrapper();

      // Show context mode (doesn't need a real query)
      if (options.showContext) {
        console.log(chalk.gray('Gathering context...'));
        await rag.init();
        const context = await rag.assembleContext(query || '');
        console.log(chalk.bold('\n=== Assembled Context ===\n'));
        console.log(context || '(no context)');
        console.log(chalk.bold('\n=== End Context ===\n'));
        return;
      }

      if (!query) {
        if (!process.stdin.isTTY) {
          const chunks = [];
          for await (const chunk of process.stdin) {
            chunks.push(chunk);
          }
          query = Buffer.concat(chunks).toString().trim();
        } else {
          // Interactive mode
          console.log(chalk.cyan.bold('Entering interactive mode. Type "exit" or "quit" to leave.'));
          await rag.init();
          
          while (true) {
            const { input } = await inquirer.prompt([{
              type: 'input',
              name: 'input',
              message: '❯',
              prefix: ''
            }]);

            if (!input || input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
              break;
            }

            await processQuery(input, options, rag, llm, log);
            console.log(); // Newline for spacing
          }
          return;
        }
      }

      try {
        await rag.init();
        await processQuery(query, options, rag, llm, log);
      } catch (error) {
        process.exit(1);
      }
    });

  program
    .command('completion')
    .description('Generate zsh completion script')
    .action(() => {
      const script = `#compdef llm-cli

_llm-cli() {
  local line state

  _arguments -C \
    '(-m --model)'{-m,--model}'[Specify the model to use]:model' \
    '--no-history[Do not include history context]' \
    '--no-files[Do not include file context]' \
    '--system[System prompt override]:prompt' \
    '--no-context[Skip context gathering (fast mode)]' \
    '(-v --verbose)'{-v,--verbose}'[Show debug output]' \
    '--show-context[Show assembled context without calling LLM]' \
    '--show-prefs[Show detected command preferences]' \
    '(-h --help)'{-h,--help}'[display help for command]' \
    '(-V --version)'{-V,--version}'[output the version number]' \
    '1: :->command' \
    '*: :->args'

  case $state in
    command)
      local -a subcommands
      subcommands=(
        'completion:Generate zsh completion script'
        'config:Manage configuration'
      )
      _describe -t subcommands 'subcommand' subcommands
      _message 'query'
      ;;
    args)
      case $line[1] in
        config)
          local -a config_cmds
          config_cmds=(
            'set:Set a configuration value'
            'list:Show current configuration'
            'show:Show current configuration'
          )
          _describe -t config_cmds 'config command' config_cmds
          ;;
      esac
      ;;
  esac
}

_llm-cli "$@"
`;
      console.log(script);
    });

  const configCmd = program
    .command('config')
    .description('Manage configuration');

  configCmd
    .command('set')
    .description('Set a configuration value')
    .argument('<key>', 'Configuration key (e.g., defaultModel)')
    .argument('<value>', 'Configuration value')
    .action(async (key, value) => {
      const configManager = new ConfigManager();
      if (key === 'defaultModel' || key === 'model') {
        await configManager.setConfig({ defaultModel: value });
        console.log(chalk.green(`✓ Default model set to: ${value}`));
      } else {
        console.error(chalk.red(`Error: Unknown configuration key "${key}"`));
        process.exit(1);
      }
    });

  configCmd
    .command('list')
    .alias('show')
    .description('Show current configuration')
    .action(async () => {
      const configManager = new ConfigManager();
      const config = await configManager.loadConfig();
      
      console.log(chalk.bold('Current configuration:'));
      console.log();
      
      if (config.defaultModel) {
        console.log(`  ${chalk.cyan('defaultModel')}: ${config.defaultModel}`);
      } else {
        console.log(`  ${chalk.cyan('defaultModel')}: ${chalk.gray('(not set)')}`);
      }
      
      const mcpCount = Object.keys(config.mcpServers || {}).length;
      console.log(`  ${chalk.cyan('mcpServers')}: ${mcpCount} configured`);
      
      if (mcpCount > 0) {
        for (const name of Object.keys(config.mcpServers || {})) {
          console.log(`    - ${name}`);
        }
      }
    });

  return program;
}

export const program = createProgram();

const isMain = process.argv[1] && (
  process.argv[1].endsWith('index.ts') || 
  process.argv[1].endsWith('llm-cli') ||
  process.argv[1].endsWith('index.js')
);

if (isMain) {
  program.parse();
}
