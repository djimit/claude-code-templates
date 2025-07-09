const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { spawn } = require('child_process');

/**
 * Estimates token count for text content
 * Based on approximate tokenization rules: ~4 characters per token for English text
 * @param {string} text - Text to analyze
 * @returns {number} Estimated token count
 */
function estimateTokens(text) {
  // Remove excessive whitespace and normalize
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Basic estimation: ~4 characters per token for English text
  // Adjust for code content which typically has more tokens per character
  const baseTokens = Math.ceil(cleanText.length / 4);
  
  // Adjust for markdown and code content
  const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length;
  const inlineCode = (text.match(/`[^`]*`/g) || []).length;
  const markdownElements = (text.match(/[#*_\[\]()]/g) || []).length;
  
  // Add extra tokens for code and markdown formatting
  const adjustedTokens = baseTokens + (codeBlocks * 5) + (inlineCode * 2) + Math.ceil(markdownElements / 2);
  
  return adjustedTokens;
}

/**
 * Analyzes existing Claude Code commands in the current project
 * @param {string} targetDir - Directory to analyze (default: current directory)
 * @returns {Array} Array of command analysis results
 */
async function analyzeCommands(targetDir = process.cwd()) {
  const commandsDir = path.join(targetDir, '.claude', 'commands');
  
  // Check if .claude/commands directory exists
  if (!fs.existsSync(commandsDir)) {
    return {
      exists: false,
      message: 'No .claude/commands directory found in current project'
    };
  }

  try {
    const commandFiles = await fs.readdir(commandsDir);
    const markdownFiles = commandFiles.filter(file => file.endsWith('.md'));
    
    if (markdownFiles.length === 0) {
      return {
        exists: true,
        commands: [],
        message: 'No command files (.md) found in .claude/commands directory'
      };
    }

    const commands = [];
    
    for (const file of markdownFiles) {
      const filePath = path.join(commandsDir, file);
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Extract first line as title/description
      const lines = content.split('\n').filter(line => line.trim());
      const title = lines.find(line => line.startsWith('#')) || file;
      
      // Calculate token estimate
      const tokenCount = estimateTokens(content);
      
      commands.push({
        name: file.replace('.md', ''),
        filename: file,
        size: stats.size,
        lastModified: stats.mtime,
        title: title.replace(/^#+\s*/, ''),
        lines: lines.length,
        wordCount: content.split(/\s+/).length,
        tokens: tokenCount
      });
    }

    // Sort by last modified (newest first)
    commands.sort((a, b) => b.lastModified - a.lastModified);

    return {
      exists: true,
      commands,
      total: commands.length,
      totalSize: commands.reduce((sum, cmd) => sum + cmd.size, 0),
      totalTokens: commands.reduce((sum, cmd) => sum + cmd.tokens, 0)
    };
  } catch (error) {
    return {
      exists: true,
      error: `Error analyzing commands: ${error.message}`
    };
  }
}

/**
 * Displays command statistics in a formatted table
 * @param {Object} analysis - Result from analyzeCommands()
 */
function displayCommandStats(analysis) {
  console.log(chalk.cyan('\n📊 Claude Code Command Analysis'));
  console.log(chalk.gray('═'.repeat(90)));

  if (!analysis.exists) {
    console.log(chalk.yellow('⚠️  ' + analysis.message));
    console.log(chalk.blue('\n💡 Run the setup first: npx claude-code-templates'));
    return;
  }

  if (analysis.error) {
    console.log(chalk.red('❌ ' + analysis.error));
    return;
  }

  if (analysis.commands.length === 0) {
    console.log(chalk.yellow('⚠️  ' + analysis.message));
    console.log(chalk.blue('\n💡 No commands found to analyze'));
    return;
  }

  // Summary
  const totalSizeKB = (analysis.totalSize / 1024).toFixed(1);
  const totalTokens = analysis.totalTokens.toLocaleString();
  console.log(chalk.green(`✅ Found ${analysis.total} command file(s) (${totalSizeKB} KB, ~${totalTokens} tokens total)`));
  console.log('');

  // Table header
  const header = chalk.bold.blue(
    'Command'.padEnd(18) + 
    'Size'.padEnd(7) + 
    'Lines'.padEnd(6) + 
    'Words'.padEnd(6) + 
    'Tokens'.padEnd(7) + 
    'Last Modified'
  );
  console.log(header);
  console.log(chalk.gray('─'.repeat(90)));

  // Table rows
  analysis.commands.forEach(cmd => {
    const sizeFormatted = `${(cmd.size / 1024).toFixed(1)}KB`.padEnd(7);
    const linesFormatted = cmd.lines.toString().padEnd(6);
    const wordsFormatted = cmd.wordCount.toString().padEnd(6);
    const tokensFormatted = cmd.tokens.toString().padEnd(7);
    const dateFormatted = cmd.lastModified.toLocaleDateString();
    
    const row = chalk.white(cmd.name.padEnd(18)) +
                chalk.cyan(sizeFormatted) +
                chalk.yellow(linesFormatted) +
                chalk.green(wordsFormatted) +
                chalk.magenta(tokensFormatted) +
                chalk.gray(dateFormatted);
    
    console.log(row);
  });

  console.log(chalk.gray('─'.repeat(90)));
  console.log(chalk.bold(`Total: ${analysis.total} commands, ${totalSizeKB} KB, ~${totalTokens} tokens`));
}

/**
 * Prompts user for command optimization and executes Claude Code if approved
 * @param {Object} analysis - Result from analyzeCommands()
 * @param {string} targetDir - Project directory
 */
async function promptCommandOptimization(analysis, targetDir) {
  if (!analysis.exists || analysis.commands.length === 0) {
    return;
  }

  const inquirer = require('inquirer');
  
  console.log(chalk.cyan('\n🔧 Command Optimization'));
  console.log(chalk.gray('Claude Code can analyze your commands and suggest improvements based on your project structure.'));
  
  try {
    const { optimize } = await inquirer.prompt([{
      type: 'confirm',
      name: 'optimize',
      message: 'Would you like Claude Code to review and optimize your commands?',
      default: true,
      prefix: chalk.blue('🤖')
    }]);

    if (!optimize) {
      console.log(chalk.yellow('⏭️  Skipping optimization. You can run this anytime with --command-stats'));
      return;
    }

    console.log(chalk.blue('\n🚀 Starting Claude Code command optimization...'));
    console.log(chalk.gray('This will analyze your project structure and suggest command improvements.\n'));

    // Create optimization prompt for Claude
    const optimizationPrompt = createOptimizationPrompt(analysis, targetDir);
    
    // Execute Claude Code with optimization prompt
    const claudeCommand = `claude "${optimizationPrompt.replace(/"/g, '\\"')}"`;
    
    const claudeProcess = spawn('sh', ['-c', claudeCommand], {
      cwd: targetDir,
      stdio: 'inherit'
    });

    claudeProcess.on('error', (error) => {
      if (error.code === 'ENOENT') {
        console.log(chalk.yellow('\n⚠️  Claude Code CLI not found in PATH.'));
        console.log(chalk.blue('💡 To run optimization manually later, use: claude "Analyze and optimize .claude/commands/ based on project structure"'));
      } else {
        console.error(chalk.red('Error running Claude Code optimization:'), error.message);
      }
    });

    claudeProcess.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('\n✅ Claude Code optimization completed successfully!'));
      } else if (code !== null) {
        console.log(chalk.yellow(`\n⚠️  Claude Code optimization exited with code ${code}`));
      }
    });

  } catch (error) {
    console.error(chalk.red('Error during optimization setup:'), error.message);
    console.log(chalk.blue('💡 You can run optimization manually with: claude "Analyze .claude/commands/ directory"'));
  }
}

/**
 * Creates detailed optimization prompt for Claude Code
 * @param {Object} analysis - Command analysis results
 * @param {string} targetDir - Project directory
 * @returns {string} Formatted prompt for Claude
 */
function createOptimizationPrompt(analysis, targetDir) {
  const commandList = analysis.commands.map(cmd => `- ${cmd.name}.md (${cmd.lines} lines)`).join('\n');
  
  return `Analyze and optimize the Claude Code commands in this project:

1. **Review project structure**: Use LS to examine the current project (package.json, src/, etc.) and identify technologies/frameworks used

2. **Analyze existing commands**: Review all files in .claude/commands/ directory:
${commandList}

3. **Command optimization**:
   - Check if commands are relevant for this project's tech stack
   - Suggest improvements to existing commands based on project structure
   - Recommend missing commands that would be useful for this project
   - Update command content to match project's specific setup and dependencies

4. **Make improvements**: If you find commands that need updates or see missing useful commands, implement the changes directly to the .claude/commands/ files

Focus on making the commands as useful and specific as possible for this project's actual setup and development workflow.`;
}

/**
 * Main function to run command stats analysis
 * @param {Object} options - CLI options
 */
async function runCommandStats(options = {}) {
  const targetDir = options.directory || process.cwd();
  
  // Analyze existing commands
  const analysis = await analyzeCommands(targetDir);
  
  // Display results
  displayCommandStats(analysis);
  
  // Prompt for optimization
  await promptCommandOptimization(analysis, targetDir);
}

module.exports = {
  analyzeCommands,
  displayCommandStats,
  promptCommandOptimization,
  runCommandStats
};