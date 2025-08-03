#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const boxen = require('boxen');
const { createClaudeConfig } = require('../src/index');

const pkg = require('../package.json');

const title = 'Claude Code Templates';
const subtitle = 'Your starting point for Claude Code projects';

const colorGradient = ['#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFEBD6'];

function colorizeTitle(text) {
  const chars = text.split('');
  const steps = colorGradient.length;
  return chars
    .map((char, i) => {
      const color = colorGradient[i % steps];
      return chalk.hex(color)(char);
    })
    .join('');
}

console.clear();
console.log(chalk.hex('#F97316')('════════════════════════════════════════════════════════════════'));
console.log('\n');
console.log('       🔮 ' + colorizeTitle(title));
console.log('\n');
console.log('       ' + chalk.hex('#FDBA74')(subtitle));
console.log('\n');
console.log(chalk.hex('#F97316')('════════════════════════════════════════════════════════════════\n'));

console.log(
  chalk.hex('#D97706')('🚀 Setup Claude Code for any project language 🚀') +
  chalk.gray(`\n                             v${pkg.version}\n\n`) +
  chalk.blue('🌐 Templates: ') + chalk.underline('https://aitmpl.com') + '\n' +
  chalk.blue('📖 Documentation: ') + chalk.underline('https://docs.aitmpl.com') + '\n'
);

program
  .name('create-claude-config')
  .description('Setup Claude Code configurations for different programming languages')
  .version(require('../package.json').version)
  .option('-l, --language <language>', 'specify programming language (deprecated, use --template)')
  .option('-f, --framework <framework>', 'specify framework (deprecated, use --template)')
  .option('-t, --template <template>', 'specify template (e.g., common, javascript-typescript, python, ruby)')
  .option('-d, --directory <directory>', 'target directory (default: current directory)')
  .option('-y, --yes', 'skip prompts and use defaults')
  .option('--dry-run', 'show what would be copied without actually copying')
  .option('--command-stats, --commands-stats', 'analyze existing Claude Code commands and offer optimization')
  .option('--hook-stats, --hooks-stats', 'analyze existing automation hooks and offer optimization')
  .option('--mcp-stats, --mcps-stats', 'analyze existing MCP server configurations and offer optimization')
  .option('--analytics', 'launch real-time Claude Code analytics dashboard')
  .option('--chats, --agents', 'launch Claude Code chats/agents dashboard (opens directly to conversations)')
  .option('--health-check, --health, --check, --verify', 'run comprehensive health check to verify Claude Code setup')
  .option('--agent <agent>', 'install specific agent component')
  .option('--command <command>', 'install specific command component')
  .option('--mcp <mcp>', 'install specific MCP component')
  .action(async (options) => {
    try {
      await createClaudeConfig(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);