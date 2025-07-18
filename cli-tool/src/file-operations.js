const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { getHooksForLanguage, filterHooksBySelection, getMCPsForLanguage, filterMCPsBySelection } = require('./hook-scanner');

async function checkExistingFiles(targetDir, templateConfig) {
  const existingFiles = [];
  
  // Check for existing CLAUDE.md
  const claudeFile = path.join(targetDir, 'CLAUDE.md');
  if (await fs.pathExists(claudeFile)) {
    existingFiles.push('CLAUDE.md');
  }
  
  // Check for existing .claude directory
  const claudeDir = path.join(targetDir, '.claude');
  if (await fs.pathExists(claudeDir)) {
    existingFiles.push('.claude/');
  }
  
  // Check for existing .mcp.json
  const mcpFile = path.join(targetDir, '.mcp.json');
  if (await fs.pathExists(mcpFile)) {
    existingFiles.push('.mcp.json');
  }
  
  return existingFiles;
}

async function promptUserForOverwrite(existingFiles, targetDir) {
  if (existingFiles.length === 0) {
    return 'proceed'; // No existing files, safe to proceed
  }
  
  console.log(chalk.yellow('\n⚠️  Existing Claude Code configuration detected!'));
  console.log(chalk.yellow('The following files/directories already exist:'));
  existingFiles.forEach(file => {
    console.log(chalk.yellow(`   • ${file}`));
  });
  
  const choices = [
    {
      name: '🔄 Backup and overwrite - Create backups and install new configuration',
      value: 'backup',
      short: 'Backup and overwrite'
    },
    {
      name: '🔀 Merge configurations - Combine existing with new templates', 
      value: 'merge',
      short: 'Merge'
    },
    {
      name: '❌ Cancel setup - Keep existing configuration unchanged',
      value: 'cancel',
      short: 'Cancel'
    }
  ];
  
  const answer = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'How would you like to proceed?',
    choices,
    default: 'backup'
  }]);
  
  return answer.action;
}

async function createBackups(existingFiles, targetDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  for (const file of existingFiles) {
    const sourcePath = path.join(targetDir, file);
    const backupPath = path.join(targetDir, `${file.replace('/', '')}.backup-${timestamp}`);
    
    try {
      await fs.copy(sourcePath, backupPath);
      console.log(chalk.green(`📋 Backed up ${file} → ${path.basename(backupPath)}`));
    } catch (error) {
      console.error(chalk.red(`✗ Failed to backup ${file}:`), error.message);
      throw error;
    }
  }
}

async function copyTemplateFiles(templateConfig, targetDir, options = {}) {
  const templateDir = path.join(__dirname, '../templates');
  
  // Check for existing files and get user preference
  const existingFiles = await checkExistingFiles(targetDir, templateConfig);
  let userAction = 'proceed';
  
  if (!options.yes && !options.dryRun) {
    userAction = await promptUserForOverwrite(existingFiles, targetDir);
    
    if (userAction === 'cancel') {
      console.log(chalk.blue('✓ Setup cancelled. Your existing configuration remains unchanged.'));
      return false; // Indicate cancellation
    }
  } else if (existingFiles.length > 0) {
    // In --yes mode, default to backup behavior
    userAction = 'backup';
  }
  
  // Create backups if requested
  if (userAction === 'backup' && existingFiles.length > 0) {
    await createBackups(existingFiles, targetDir);
  }
  
  // Determine overwrite behavior based on user choice
  const shouldOverwrite = userAction !== 'merge';
  
  // Copy base files and framework-specific files
  for (const file of templateConfig.files) {
    const sourcePath = path.join(templateDir, file.source);
    const destPath = path.join(targetDir, file.destination);
    
    try {
      // Handle framework-specific command files specially
      if (file.source.includes('.claude/commands') && file.source.includes('examples/')) {
        // This is a framework-specific commands directory - merge with existing commands
        await fs.ensureDir(destPath);
        
        // Copy framework-specific commands to the commands directory
        const frameworkFiles = await fs.readdir(sourcePath);
        for (const frameworkFile of frameworkFiles) {
          const srcFile = path.join(sourcePath, frameworkFile);
          const destFile = path.join(destPath, frameworkFile);
          
          // In merge mode, skip if file already exists
          if (userAction === 'merge' && await fs.pathExists(destFile)) {
            console.log(chalk.blue(`⏭️  Skipped ${frameworkFile} (already exists)`));
            continue;
          }
          
          await fs.copy(srcFile, destFile, { overwrite: shouldOverwrite });
        }
        
        console.log(chalk.green(`✓ Copied framework commands ${file.source} → ${file.destination}`));
      } else if (file.source.includes('.claude') && !file.source.includes('examples/')) {
        // This is base .claude directory - copy it but handle commands specially
        await fs.copy(sourcePath, destPath, { 
          overwrite: shouldOverwrite,
          filter: (src) => {
            // Skip the commands directory itself - we'll handle it separately
            return !src.endsWith('.claude/commands');
          }
        });
        
        // Now handle base commands specifically
        const baseCommandsPath = path.join(sourcePath, 'commands');
        const destCommandsPath = path.join(destPath, 'commands');
        
        if (await fs.pathExists(baseCommandsPath)) {
          await fs.ensureDir(destCommandsPath);
          
          // Copy base commands, but exclude framework-specific ones that were moved
          const baseCommands = await fs.readdir(baseCommandsPath);
          const excludeCommands = ['react-component.md', 'route.md', 'api-endpoint.md']; // Commands moved to framework dirs
          
          for (const baseCommand of baseCommands) {
            if (!excludeCommands.includes(baseCommand)) {
              const srcFile = path.join(baseCommandsPath, baseCommand);
              const destFile = path.join(destCommandsPath, baseCommand);
              
              // In merge mode, skip if file already exists
              if (userAction === 'merge' && await fs.pathExists(destFile)) {
                console.log(chalk.blue(`⏭️  Skipped ${baseCommand} (already exists)`));
                continue;
              }
              
              await fs.copy(srcFile, destFile, { overwrite: shouldOverwrite });
            }
          }
        }
        
        console.log(chalk.green(`✓ Copied base configuration and commands ${file.source} → ${file.destination}`));
      } else if (file.source.includes('settings.json') && templateConfig.selectedHooks) {
        // In merge mode, merge settings instead of overwriting
        if (userAction === 'merge') {
          await mergeSettingsFile(sourcePath, destPath, templateConfig);
          console.log(chalk.green(`✓ Merged ${file.source} → ${file.destination} (with selected hooks)`));
        } else {
          await processSettingsFile(sourcePath, destPath, templateConfig);
          console.log(chalk.green(`✓ Copied ${file.source} → ${file.destination} (with selected hooks)`));
        }
      } else if (file.source.includes('.mcp.json') && templateConfig.selectedMCPs) {
        // In merge mode, merge MCP config instead of overwriting
        if (userAction === 'merge') {
          await mergeMCPFile(sourcePath, destPath, templateConfig);
          console.log(chalk.green(`✓ Merged ${file.source} → ${file.destination} (with selected MCPs)`));
        } else {
          await processMCPFile(sourcePath, destPath, templateConfig);
          console.log(chalk.green(`✓ Copied ${file.source} → ${file.destination} (with selected MCPs)`));
        }
      } else {
        // Copy regular files (CLAUDE.md, etc.)
        // In merge mode, skip if file already exists
        if (userAction === 'merge' && await fs.pathExists(destPath)) {
          console.log(chalk.blue(`⏭️  Skipped ${file.destination} (already exists)`));
          continue;
        }
        
        await fs.copy(sourcePath, destPath, { 
          overwrite: shouldOverwrite,
          filter: (src) => {
            // Skip commands directory during regular copy - we handle them above
            return !src.includes('.claude/commands');
          }
        });
        console.log(chalk.green(`✓ Copied ${file.source} → ${file.destination}`));
      }
    } catch (error) {
      console.error(chalk.red(`✗ Failed to copy ${file.source}:`), error.message);
      throw error;
    }
  }
  
  return true; // Indicate successful completion
  
  // Copy selected commands individually
  if (templateConfig.selectedCommands && templateConfig.selectedCommands.length > 0) {
    const commandsDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(commandsDir);
    
    for (const command of templateConfig.selectedCommands) {
      try {
        const commandFileName = `${command.name}.md`;
        const destPath = path.join(commandsDir, commandFileName);
        
        await fs.copy(command.filePath, destPath);
        console.log(chalk.green(`✓ Added command: ${command.displayName}`));
      } catch (error) {
        console.error(chalk.red(`✗ Failed to copy command ${command.name}:`), error.message);
        // Don't throw - continue with other commands
      }
    }
    
    console.log(chalk.cyan(`📋 Installed ${templateConfig.selectedCommands.length} commands`));
  }
  
  // Report hook selection
  if (templateConfig.selectedHooks && templateConfig.selectedHooks.length > 0) {
    console.log(chalk.magenta(`🔧 Installed ${templateConfig.selectedHooks.length} automation hooks`));
  }
  
  // Report MCP selection
  if (templateConfig.selectedMCPs && templateConfig.selectedMCPs.length > 0) {
    console.log(chalk.blue(`🔧 Installed ${templateConfig.selectedMCPs.length} MCP`));
  }
}

async function runPostInstallationValidation(targetDir, templateConfig) {
  const inquirer = require('inquirer');
  const { spawn } = require('child_process');
  
  console.log(chalk.cyan('\n🔍 Post-Installation Validation'));
  console.log(chalk.gray('Claude Code can now review the installed configuration to ensure everything is properly set up.'));
  
  try {
    const { runValidation } = await inquirer.prompt([{
      type: 'confirm',
      name: 'runValidation',
      message: 'Would you like Claude Code to review and validate the installation?',
      default: true,
      prefix: chalk.blue('🤖')
    }]);
    
    if (!runValidation) {
      console.log(chalk.yellow('⏭️  Skipping validation. You can run "claude" anytime to review your configuration.'));
      return;
    }
    
    console.log(chalk.blue('\n🚀 Starting Claude Code validation...'));
    console.log(chalk.gray('This will review all installed files and configurations.\n'));
    
    // Prepare validation prompt for Claude
    const validationPrompt = createValidationPrompt(templateConfig);
    
    // Run claude command with validation prompt as a task
    // Escape quotes in the prompt and create proper shell command
    const escapedPrompt = validationPrompt.replace(/"/g, '\\"');
    const claudeCommand = `claude "${escapedPrompt}"`;
    
    const claudeProcess = spawn('sh', ['-c', claudeCommand], {
      cwd: targetDir,
      stdio: 'inherit'
    });
    
    claudeProcess.on('error', (error) => {
      if (error.code === 'ENOENT') {
        console.log(chalk.yellow('\n⚠️  Claude Code CLI not found in PATH.'));
        console.log(chalk.blue('💡 To run validation manually later, use: claude "Review the Claude Code configuration and validate all installed files"'));
      } else {
        console.error(chalk.red('Error running Claude Code validation:'), error.message);
      }
    });
    
    claudeProcess.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('\n✅ Claude Code validation completed successfully!'));
      } else if (code !== null) {
        console.log(chalk.yellow(`\n⚠️  Claude Code validation exited with code ${code}`));
      }
    });
    
  } catch (error) {
    console.error(chalk.red('Error during validation setup:'), error.message);
    console.log(chalk.blue('💡 You can run validation manually later with: claude "Review the Claude Code configuration"'));
  }
}

function createValidationPrompt(templateConfig) {
  const language = templateConfig.language || 'unknown';
  const framework = templateConfig.framework || 'none';
  
  return `Validate Claude Code Templates installation for this ${language}${framework !== 'none' ? ` ${framework}` : ''} project. 1) Check project structure (package.json, src/, etc.) 2) Review CLAUDE.md, .claude/settings.json, .claude/commands/ 3) Compare with actual project dependencies 4) Suggest specific improvements. Make configuration match this project's actual setup.`;
}

async function processSettingsFile(sourcePath, destPath, templateConfig) {
  try {
    // Read the original settings file
    const originalSettings = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
    
    // If hooks are selected, filter them
    if (templateConfig.selectedHooks && templateConfig.selectedHooks.length > 0) {
      const availableHooks = getHooksForLanguage(templateConfig.language);
      const filteredSettings = filterHooksBySelection(
        originalSettings,
        templateConfig.selectedHooks,
        availableHooks
      );
      
      // Write the filtered settings
      await fs.ensureDir(path.dirname(destPath));
      await fs.writeFile(destPath, JSON.stringify(filteredSettings, null, 2));
    } else {
      // No hooks selected, copy original without hooks
      const settingsWithoutHooks = { ...originalSettings };
      delete settingsWithoutHooks.hooks;
      
      await fs.ensureDir(path.dirname(destPath));
      await fs.writeFile(destPath, JSON.stringify(settingsWithoutHooks, null, 2));
    }
  } catch (error) {
    console.error(chalk.red(`Failed to process settings file: ${error.message}`));
    // Fallback to copying original file
    await fs.copy(sourcePath, destPath);
  }
}

async function processMCPFile(sourcePath, destPath, templateConfig) {
  try {
    // Read the original MCP file
    const originalMCPData = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
    
    // If MCPs are selected, filter them
    if (templateConfig.selectedMCPs && templateConfig.selectedMCPs.length > 0) {
      const availableMCPs = getMCPsForLanguage(templateConfig.language);
      const filteredMCPData = filterMCPsBySelection(
        originalMCPData,
        templateConfig.selectedMCPs,
        availableMCPs
      );
      
      // Write the filtered MCP data
      await fs.ensureDir(path.dirname(destPath));
      await fs.writeFile(destPath, JSON.stringify(filteredMCPData, null, 2));
    } else {
      // No MCPs selected, create empty MCP file
      const emptyMCPData = { mcpServers: {} };
      
      await fs.ensureDir(path.dirname(destPath));
      await fs.writeFile(destPath, JSON.stringify(emptyMCPData, null, 2));
    }
  } catch (error) {
    console.error(chalk.red(`Failed to process MCP file: ${error.message}`));
    // Fallback to copying original file
    await fs.copy(sourcePath, destPath);
  }
}

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.ensureDir(dirPath);
    return true;
  } catch (error) {
    console.error(chalk.red(`Failed to create directory ${dirPath}:`), error.message);
    return false;
  }
}

async function checkWritePermissions(targetDir) {
  try {
    const testFile = path.join(targetDir, '.claude-test-write');
    await fs.writeFile(testFile, 'test');
    await fs.remove(testFile);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  copyTemplateFiles,
  ensureDirectoryExists,
  checkWritePermissions,
  processSettingsFile,
  processMCPFile,
  runPostInstallationValidation
};