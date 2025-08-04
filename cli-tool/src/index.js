const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const { detectProject } = require('./utils');
const { getTemplateConfig, TEMPLATES_CONFIG } = require('./templates');
const { createPrompts, interactivePrompts } = require('./prompts');
const { copyTemplateFiles, runPostInstallationValidation } = require('./file-operations');
const { getHooksForLanguage, getMCPsForLanguage } = require('./hook-scanner');
const { installAgents } = require('./agents');
const { runCommandStats } = require('./command-stats');
const { runHookStats } = require('./hook-stats');
const { runMCPStats } = require('./mcp-stats');
const { runAnalytics } = require('./analytics');
const { runHealthCheck } = require('./health-check');
const { trackingService } = require('./tracking-service');

async function showMainMenu() {
  console.log('');
  
  const initialChoice = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      {
        name: '📊 Analytics Dashboard - Monitor your Claude Code usage and sessions',
        value: 'analytics',
        short: 'Analytics Dashboard'
      },
      {
        name: '💬 Chats Dashboard - View and analyze your Claude conversations',
        value: 'chats',
        short: 'Chats Dashboard'
      },
      {
        name: '⚙️ Project Setup - Configure Claude Code for your project',
        value: 'setup',
        short: 'Project Setup'
      },
      {
        name: '🔍 Health Check - Verify your Claude Code setup and configuration',
        value: 'health',
        short: 'Health Check'
      }
    ],
    default: 'analytics'
  }]);
  
  if (initialChoice.action === 'analytics') {
    console.log(chalk.blue('📊 Launching Claude Code Analytics Dashboard...'));
    trackingService.trackAnalyticsDashboard({ page: 'dashboard', source: 'interactive_menu' });
    await runAnalytics({});
    return;
  }
  
  if (initialChoice.action === 'chats') {
    console.log(chalk.blue('💬 Launching Claude Code Chats Dashboard...'));
    trackingService.trackAnalyticsDashboard({ page: 'agents', source: 'interactive_menu' });
    await runAnalytics({ openTo: 'agents' });
    return;
  }
  
  if (initialChoice.action === 'health') {
    console.log(chalk.blue('🔍 Running Health Check...'));
    const healthResult = await runHealthCheck();
    
    // Track health check usage
    trackingService.trackHealthCheck({
      setup_recommended: healthResult.runSetup,
      issues_found: healthResult.issues || 0
    });
    
    if (healthResult.runSetup) {
      console.log(chalk.blue('⚙️  Starting Project Setup...'));
      // Continue with setup flow
      return await createClaudeConfig({});
    } else {
      console.log(chalk.green('👍 Health check completed. Returning to main menu...'));
      return await showMainMenu();
    }
  }
  
  // Continue with setup if user chose 'setup'
  console.log(chalk.blue('⚙️  Setting up Claude Code configuration...'));
  return await createClaudeConfig({ setupFromMenu: true });
}

async function createClaudeConfig(options = {}) {
  const targetDir = options.directory || process.cwd();
  
  // Handle individual component installation
  if (options.agent) {
    await installIndividualAgent(options.agent, targetDir, options);
    return;
  }
  
  if (options.command) {
    await installIndividualCommand(options.command, targetDir, options);
    return;
  }
  
  if (options.mcp) {
    await installIndividualMCP(options.mcp, targetDir, options);
    return;
  }
  
  // Handle workflow installation
  if (options.workflow) {
    await installWorkflow(options.workflow, targetDir, options);
    return;
  }
  
  // Handle command stats analysis (both singular and plural)
  if (options.commandStats || options.commandsStats) {
    await runCommandStats(options);
    return;
  }
  
  // Handle hook stats analysis (both singular and plural)
  if (options.hookStats || options.hooksStats) {
    await runHookStats(options);
    return;
  }
  
  // Handle MCP stats analysis (both singular and plural)
  if (options.mcpStats || options.mcpsStats) {
    await runMCPStats(options);
    return;
  }
  
  // Handle analytics dashboard
  if (options.analytics) {
    trackingService.trackAnalyticsDashboard({ page: 'dashboard', source: 'command_line' });
    await runAnalytics(options);
    return;
  }
  
  // Handle chats/agents dashboard
  if (options.chats || options.agents) {
    trackingService.trackAnalyticsDashboard({ page: 'agents', source: 'command_line' });
    await runAnalytics({ ...options, openTo: 'agents' });
    return;
  }
  
  // Handle health check
  let shouldRunSetup = false;
  if (options.healthCheck || options.health || options.check || options.verify) {
    const healthResult = await runHealthCheck();
    
    // Track health check usage
    trackingService.trackHealthCheck({
      setup_recommended: healthResult.runSetup,
      issues_found: healthResult.issues || 0,
      source: 'command_line'
    });
    
    if (healthResult.runSetup) {
      console.log(chalk.blue('⚙️  Starting Project Setup...'));
      shouldRunSetup = true;
    } else {
      console.log(chalk.green('👍 Health check completed. Returning to main menu...'));
      return await showMainMenu();
    }
  }
  
  // Add initial choice prompt (only if no specific options are provided and not continuing from health check or menu)
  if (!shouldRunSetup && !options.setupFromMenu && !options.yes && !options.language && !options.framework && !options.dryRun) {
    return await showMainMenu();
  } else {
    console.log(chalk.blue('🚀 Setting up Claude Code configuration...'));
  }
  
  console.log(chalk.gray(`Target directory: ${targetDir}`));
  
  // Detect existing project
  const spinner = ora('Detecting project type...').start();
  const projectInfo = await detectProject(targetDir);
  spinner.succeed('Project detection complete');
  
  let config;
  if (options.yes) {
    // Use defaults - prioritize --template over --language for backward compatibility
    const selectedLanguage = options.template || options.language || projectInfo.detectedLanguage || 'common';
    
    // Check if selected language is coming soon
    if (selectedLanguage && TEMPLATES_CONFIG[selectedLanguage] && TEMPLATES_CONFIG[selectedLanguage].comingSoon) {
      console.log(chalk.red(`❌ ${selectedLanguage} is not available yet. Coming soon!`));
      console.log(chalk.yellow('Available languages: common, javascript-typescript, python'));
      return;
    }
    const availableHooks = getHooksForLanguage(selectedLanguage);
    const defaultHooks = availableHooks.filter(hook => hook.checked).map(hook => hook.id);
    const availableMCPs = getMCPsForLanguage(selectedLanguage);
    const defaultMCPs = availableMCPs.filter(mcp => mcp.checked).map(mcp => mcp.id);
    
    config = {
      language: selectedLanguage,
      framework: options.framework || projectInfo.detectedFramework || 'none',
      features: [],
      hooks: defaultHooks,
      mcps: defaultMCPs
    };
  } else {
    // Interactive prompts with back navigation
    config = await interactivePrompts(projectInfo, options);
  }
  
  // Check if user confirmed the setup
  if (config.confirm === false) {
    console.log(chalk.yellow('⏹️  Setup cancelled by user.'));
    return;
  }

  // Handle analytics option from onboarding
  if (config.analytics) {
    console.log(chalk.blue('📊 Launching Claude Code Analytics Dashboard...'));
    await runAnalytics(options);
    return;
  }
  
  // Get template configuration
  const templateConfig = getTemplateConfig(config);
  
  // Add selected hooks to template config
  if (config.hooks) {
    templateConfig.selectedHooks = config.hooks;
    templateConfig.language = config.language; // Ensure language is available for hook filtering
  }
  
  // Add selected MCPs to template config
  if (config.mcps) {
    templateConfig.selectedMCPs = config.mcps;
    templateConfig.language = config.language; // Ensure language is available for MCP filtering
  }
  
  // Install selected agents
  if (config.agents && config.agents.length > 0) {
    console.log(chalk.blue('🤖 Installing Claude Code agents...'));
    await installAgents(config.agents, targetDir);
  }
  
  if (options.dryRun) {
    console.log(chalk.yellow('🔍 Dry run - showing what would be copied:'));
    templateConfig.files.forEach(file => {
      console.log(chalk.gray(`  - ${file.source} → ${file.destination}`));
    });
    return;
  }
  
  // Copy template files
  const copySpinner = ora('Copying template files...').start();
  try {
    const result = await copyTemplateFiles(templateConfig, targetDir, options);
    if (result === false) {
      copySpinner.info('Setup cancelled by user');
      return; // Exit early if user cancelled
    }
    copySpinner.succeed('Template files copied successfully');
  } catch (error) {
    copySpinner.fail('Failed to copy template files');
    throw error;
  }
  
  // Show success message
  console.log(chalk.green('✅ Claude Code configuration setup complete!'));
  console.log(chalk.cyan('📚 Next steps:'));
  console.log(chalk.white('  1. Review the generated CLAUDE.md file'));
  console.log(chalk.white('  2. Customize the configuration for your project'));
  console.log(chalk.white('  3. Start using Claude Code with: claude'));
  console.log('');
  console.log(chalk.blue('🌐 View all available templates at: https://aitmpl.com/'));
  console.log(chalk.blue('📖 Read the complete documentation at: https://aitmpl.com/docu/'));
  
  if (config.language !== 'common') {
    console.log(chalk.yellow(`💡 Language-specific features for ${config.language} have been configured`));
  }
  
  if (config.framework !== 'none') {
    console.log(chalk.yellow(`🎯 Framework-specific commands for ${config.framework} are available`));
  }
  
  if (config.hooks && config.hooks.length > 0) {
    console.log(chalk.magenta(`🔧 ${config.hooks.length} automation hooks have been configured`));
  }
  
  if (config.mcps && config.mcps.length > 0) {
    console.log(chalk.blue(`🔧 ${config.mcps.length} MCP servers have been configured`));
  }

  // Track successful template installation
  if (!options.agent && !options.command && !options.mcp) {
    trackingService.trackTemplateInstallation(config.language, config.framework, {
      installation_method: options.setupFromMenu ? 'interactive_menu' : 'command_line',
      dry_run: options.dryRun || false,
      hooks_count: config.hooks ? config.hooks.length : 0,
      mcps_count: config.mcps ? config.mcps.length : 0,
      project_detected: !!options.detectedProject
    });
  }
  
  // Run post-installation validation
  if (!options.dryRun) {
    await runPostInstallationValidation(targetDir, templateConfig);
  }
}

// Individual component installation functions
async function installIndividualAgent(agentName, targetDir, options) {
  console.log(chalk.blue(`🤖 Installing agent: ${agentName}`));
  
  try {
    // Support both category/agent-name and direct agent-name formats
    let githubUrl;
    if (agentName.includes('/')) {
      // Category/agent format: deep-research-team/academic-researcher
      githubUrl = `https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/agents/${agentName}.md`;
    } else {
      // Direct agent format: api-security-audit
      githubUrl = `https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/agents/${agentName}.md`;
    }
    
    console.log(chalk.gray(`📥 Downloading from GitHub (main branch)...`));
    
    const response = await fetch(githubUrl);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(chalk.red(`❌ Agent "${agentName}" not found`));
        await showAvailableAgents();
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const agentContent = await response.text();
    
    // Create .claude/agents directory if it doesn't exist
    const agentsDir = path.join(targetDir, '.claude', 'agents');
    await fs.ensureDir(agentsDir);
    
    // Write the agent file - always to flat .claude/agents directory
    let fileName;
    if (agentName.includes('/')) {
      const [category, filename] = agentName.split('/');
      fileName = filename; // Extract just the filename, ignore category for installation
    } else {
      fileName = agentName;
    }
    
    const targetFile = path.join(agentsDir, `${fileName}.md`);
    await fs.writeFile(targetFile, agentContent, 'utf8');
    
    if (!options.silent) {
      console.log(chalk.green(`✅ Agent "${agentName}" installed successfully!`));
      console.log(chalk.cyan(`📁 Installed to: ${path.relative(targetDir, targetFile)}`));
      console.log(chalk.cyan(`📦 Downloaded from: ${githubUrl}`));
    }
    
    // Track successful agent installation
    trackingService.trackDownload('agent', agentName, {
      installation_type: 'individual_component',
      target_directory: path.relative(process.cwd(), targetDir),
      source: 'github_main'
    });
    
  } catch (error) {
    console.log(chalk.red(`❌ Error installing agent: ${error.message}`));
  }
}

async function installIndividualCommand(commandName, targetDir, options) {
  console.log(chalk.blue(`⚡ Installing command: ${commandName}`));
  
  try {
    // Support both category/command-name and direct command-name formats
    let githubUrl;
    if (commandName.includes('/')) {
      // Category/command format: security/vulnerability-scan
      githubUrl = `https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/commands/${commandName}.md`;
    } else {
      // Direct command format: check-file
      githubUrl = `https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/commands/${commandName}.md`;
    }
    
    console.log(chalk.gray(`📥 Downloading from GitHub (main branch)...`));
    
    const response = await fetch(githubUrl);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(chalk.red(`❌ Command "${commandName}" not found`));
        console.log(chalk.yellow('Available commands: check-file, generate-tests'));
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const commandContent = await response.text();
    
    // Create .claude/commands directory if it doesn't exist
    const commandsDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(commandsDir);
    
    // Write the command file - always to flat .claude/commands directory
    let fileName;
    if (commandName.includes('/')) {
      const [category, filename] = commandName.split('/');
      fileName = filename; // Extract just the filename, ignore category for installation
    } else {
      fileName = commandName;
    }
    
    const targetFile = path.join(commandsDir, `${fileName}.md`);
    
    await fs.writeFile(targetFile, commandContent, 'utf8');
    
    if (!options.silent) {
      console.log(chalk.green(`✅ Command "${commandName}" installed successfully!`));
      console.log(chalk.cyan(`📁 Installed to: ${path.relative(targetDir, targetFile)}`));
      console.log(chalk.cyan(`📦 Downloaded from: ${githubUrl}`));
    }
    
    // Track successful command installation
    trackingService.trackDownload('command', commandName, {
      installation_type: 'individual_command',
      target_directory: path.relative(process.cwd(), targetDir),
      source: 'github_main'
    });
    
  } catch (error) {
    console.log(chalk.red(`❌ Error installing command: ${error.message}`));
  }
}

async function installIndividualMCP(mcpName, targetDir, options) {
  console.log(chalk.blue(`🔌 Installing MCP: ${mcpName}`));
  
  try {
    // Support both category/mcp-name and direct mcp-name formats
    let githubUrl;
    if (mcpName.includes('/')) {
      // Category/mcp format: database/mysql-integration
      githubUrl = `https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/mcps/${mcpName}.json`;
    } else {
      // Direct mcp format: web-fetch
      githubUrl = `https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/mcps/${mcpName}.json`;
    }
    
    console.log(chalk.gray(`📥 Downloading from GitHub (main branch)...`));
    
    const response = await fetch(githubUrl);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(chalk.red(`❌ MCP "${mcpName}" not found`));
        console.log(chalk.yellow('Available MCPs: web-fetch, filesystem-access, github-integration, memory-integration, mysql-integration, postgresql-integration, deepgraph-react, deepgraph-nextjs, deepgraph-typescript, deepgraph-vue'));
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const mcpConfigText = await response.text();
    const mcpConfig = JSON.parse(mcpConfigText);

    // Remove description field from each MCP server before merging
    if (mcpConfig.mcpServers) {
      for (const serverName in mcpConfig.mcpServers) {
        if (mcpConfig.mcpServers[serverName] && typeof mcpConfig.mcpServers[serverName] === 'object') {
          delete mcpConfig.mcpServers[serverName].description;
        }
      }
    }
    
    // Check if .mcp.json exists in target directory
    const targetMcpFile = path.join(targetDir, '.mcp.json');
    let existingConfig = {};
    
    if (await fs.pathExists(targetMcpFile)) {
      existingConfig = await fs.readJson(targetMcpFile);
      console.log(chalk.yellow('📝 Existing .mcp.json found, merging configurations...'));
    }
    
    // Merge configurations with deep merge for mcpServers
    const mergedConfig = {
      ...existingConfig,
      ...mcpConfig
    };
    
    // Deep merge mcpServers specifically to avoid overwriting existing servers
    if (existingConfig.mcpServers && mcpConfig.mcpServers) {
      mergedConfig.mcpServers = {
        ...existingConfig.mcpServers,
        ...mcpConfig.mcpServers
      };
    }
    
    // Write the merged configuration
    await fs.writeJson(targetMcpFile, mergedConfig, { spaces: 2 });
    
    if (!options.silent) {
      console.log(chalk.green(`✅ MCP "${mcpName}" installed successfully!`));
      console.log(chalk.cyan(`📁 Configuration merged into: ${path.relative(targetDir, targetMcpFile)}`));
      console.log(chalk.cyan(`📦 Downloaded from: ${githubUrl}`));
    }
    
    // Track successful MCP installation
    trackingService.trackDownload('mcp', mcpName, {
      installation_type: 'individual_mcp',
      merged_with_existing: existingConfig !== null,
      servers_count: Object.keys(mergedConfig.mcpServers || {}).length,
      source: 'github_main'
    });
    
  } catch (error) {
    console.log(chalk.red(`❌ Error installing MCP: ${error.message}`));
  }
}

// Helper functions to extract language/framework from agent content
function extractLanguageFromAgent(content, agentName) {
  // Try to determine language from agent content or filename
  if (agentName.includes('react') || content.includes('React')) return 'javascript-typescript';
  if (agentName.includes('django') || content.includes('Django')) return 'python';
  if (agentName.includes('fastapi') || content.includes('FastAPI')) return 'python';
  if (agentName.includes('flask') || content.includes('Flask')) return 'python';
  if (agentName.includes('rails') || content.includes('Rails')) return 'ruby';
  if (agentName.includes('api-security') || content.includes('API security')) return 'javascript-typescript';
  if (agentName.includes('database') || content.includes('database')) return 'javascript-typescript';
  
  // Default to javascript-typescript for general agents
  return 'javascript-typescript';
}

function extractFrameworkFromAgent(content, agentName) {
  // Try to determine framework from agent content or filename
  if (agentName.includes('react') || content.includes('React')) return 'react';
  if (agentName.includes('django') || content.includes('Django')) return 'django';
  if (agentName.includes('fastapi') || content.includes('FastAPI')) return 'fastapi';
  if (agentName.includes('flask') || content.includes('Flask')) return 'flask';
  if (agentName.includes('rails') || content.includes('Rails')) return 'rails';
  
  // For general agents, return none to install the base template
  return 'none';
}

/**
 * Fetch available agents dynamically from GitHub repository
 */
async function getAvailableAgentsFromGitHub() {
  try {
    const response = await fetch('https://api.github.com/repos/davila7/claude-code-templates/contents/cli-tool/components/agents');
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const contents = await response.json();
    const agents = [];
    
    for (const item of contents) {
      if (item.type === 'file' && item.name.endsWith('.md')) {
        // Direct agent file
        agents.push({
          name: item.name.replace('.md', ''),
          path: item.name.replace('.md', ''),
          category: 'root'
        });
      } else if (item.type === 'dir') {
        // Category directory, fetch its contents
        try {
          const categoryResponse = await fetch(`https://api.github.com/repos/davila7/claude-code-templates/contents/cli-tool/components/agents/${item.name}`);
          if (categoryResponse.ok) {
            const categoryContents = await categoryResponse.json();
            for (const categoryItem of categoryContents) {
              if (categoryItem.type === 'file' && categoryItem.name.endsWith('.md')) {
                agents.push({
                  name: categoryItem.name.replace('.md', ''),
                  path: `${item.name}/${categoryItem.name.replace('.md', '')}`,
                  category: item.name
                });
              }
            }
          }
        } catch (error) {
          console.warn(`Warning: Could not fetch category ${item.name}:`, error.message);
        }
      }
    }
    
    return agents;
  } catch (error) {
    console.warn('Warning: Could not fetch agents from GitHub, using fallback list');
    // Fallback to basic list if GitHub API fails
    return [
      { name: 'api-security-audit', path: 'api-security-audit', category: 'root' },
      { name: 'database-optimization', path: 'database-optimization', category: 'root' },
      { name: 'react-performance-optimization', path: 'react-performance-optimization', category: 'root' }
    ];
  }
}

/**
 * Show available agents organized by category
 */
async function showAvailableAgents() {
  console.log(chalk.yellow('\n📋 Available Agents:'));
  console.log(chalk.gray('Use format: category/agent-name or just agent-name for root level\n'));
  console.log(chalk.gray('⏳ Fetching latest agents from GitHub...\n'));
  
  const agents = await getAvailableAgentsFromGitHub();
  
  // Group agents by category
  const groupedAgents = agents.reduce((acc, agent) => {
    const category = agent.category === 'root' ? '🤖 General Agents' : `📁 ${agent.category}`;
    if (!acc[category]) acc[category] = [];
    acc[category].push(agent);
    return acc;
  }, {});
  
  // Display agents by category
  Object.entries(groupedAgents).forEach(([category, categoryAgents]) => {
    console.log(chalk.cyan(category));
    categoryAgents.forEach(agent => {
      console.log(chalk.gray(`  • ${agent.path}`));
    });
    console.log('');
  });
  
  console.log(chalk.blue('Examples:'));
  console.log(chalk.gray('  cct --agent api-security-audit'));
  console.log(chalk.gray('  cct --agent deep-research-team/academic-researcher'));
  console.log('');
}

/**
 * Install workflow from hash
 */
async function installWorkflow(workflowHash, targetDir, options) {
  console.log(chalk.blue(`🔧 Installing workflow from hash: ${workflowHash}`));
  
  try {
    // Extract hash from format #hash
    const hash = workflowHash.startsWith('#') ? workflowHash.substring(1) : workflowHash;
    
    if (!hash || hash.length < 3) {
      throw new Error('Invalid workflow hash format. Expected format: #hash');
    }
    
    console.log(chalk.gray(`📥 Fetching workflow configuration...`));
    
    // Fetch workflow configuration from a remote service
    // For now, we'll simulate this by using a local storage approach
    // In production, this would fetch from a workflow registry
    const workflowData = await fetchWorkflowData(hash);
    
    if (!workflowData) {
      throw new Error(`Workflow with hash "${hash}" not found. Please check the hash and try again.`);
    }
    
    console.log(chalk.green(`✅ Workflow found: ${workflowData.name}`));
    console.log(chalk.cyan(`📝 Description: ${workflowData.description}`));
    console.log(chalk.cyan(`🏷️  Tags: ${workflowData.tags.join(', ')}`));
    console.log(chalk.cyan(`📊 Steps: ${workflowData.steps.length}`));
    
    // Install all required components
    const installPromises = [];
    
    // Group components by type
    const agents = workflowData.steps.filter(step => step.type === 'agent');
    const commands = workflowData.steps.filter(step => step.type === 'command');
    const mcps = workflowData.steps.filter(step => step.type === 'mcp');
    
    console.log(chalk.blue(`\n📦 Installing workflow components...`));
    console.log(chalk.gray(`   Agents: ${agents.length}`));
    console.log(chalk.gray(`   Commands: ${commands.length}`));
    console.log(chalk.gray(`   MCPs: ${mcps.length}`));
    
    // Install agents
    for (const agent of agents) {
      console.log(chalk.gray(`   Installing agent: ${agent.name}`));
      await installIndividualAgent(agent.path, targetDir, { ...options, silent: true });
    }
    
    // Install commands
    for (const command of commands) {
      console.log(chalk.gray(`   Installing command: ${command.name}`));
      await installIndividualCommand(command.path, targetDir, { ...options, silent: true });
    }
    
    // Install MCPs
    for (const mcp of mcps) {
      console.log(chalk.gray(`   Installing MCP: ${mcp.name}`));
      await installIndividualMCP(mcp.path, targetDir, { ...options, silent: true });
    }
    
    // Generate and save workflow YAML
    const yamlContent = generateWorkflowYAML(workflowData);
    const workflowsDir = path.join(targetDir, '.claude', 'workflows');
    const workflowFile = path.join(workflowsDir, `${workflowData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.yaml`);
    
    // Ensure .claude/workflows directory exists
    await fs.ensureDir(workflowsDir);
    await fs.writeFile(workflowFile, yamlContent, 'utf8');
    
    console.log(chalk.green(`\n✅ Workflow "${workflowData.name}" installed successfully!`));
    console.log(chalk.cyan(`📁 Components installed to: .claude/`));
    console.log(chalk.cyan(`📄 Workflow file: ${path.relative(targetDir, workflowFile)}`));
    console.log(chalk.cyan(`🚀 Use the workflow file with Claude Code to execute the complete workflow`));
    
    // Track successful workflow installation
    trackingService.trackDownload('workflow', hash, {
      installation_type: 'workflow',
      workflow_name: workflowData.name,
      components_count: workflowData.steps.length,
      agents_count: agents.length,
      commands_count: commands.length,
      mcps_count: mcps.length,
      target_directory: path.relative(process.cwd(), targetDir)
    });
    
  } catch (error) {
    console.log(chalk.red(`❌ Error installing workflow: ${error.message}`));
    
    if (error.message.includes('not found')) {
      console.log(chalk.yellow('\n💡 Possible solutions:'));
      console.log(chalk.gray('   • Check that the workflow hash is correct'));
      console.log(chalk.gray('   • Verify the workflow was generated successfully'));
      console.log(chalk.gray('   • Try generating a new workflow from the builder'));
    }
  }
}

/**
 * Fetch workflow data from hash
 * In production, this would fetch from a remote workflow registry
 * For now, we'll simulate this functionality
 */
async function fetchWorkflowData(hash) {
  // Simulate fetching workflow data
  // In production, this would make an API call to a workflow registry
  // For demo purposes, we'll return a sample workflow if hash matches demo
  
  // Demo workflow for testing
  if (hash === 'demo123' || hash === 'abc123test') {
    console.log(chalk.green('🎯 Demo workflow found! Using sample configuration...'));
    return {
      name: 'Full Stack Development Workflow',
      description: 'Complete workflow for setting up a full-stack development environment with React frontend, Node.js backend, and security auditing',
      tags: ['development', 'fullstack', 'react', 'security'],
      version: '1.0.0',
      hash: hash,
      steps: [
        {
          type: 'agent',
          name: 'frontend-developer',
          path: 'development-team/frontend-developer',
          category: 'development-team',
          description: 'Setup React frontend development environment'
        },
        {
          type: 'agent',
          name: 'backend-architect',
          path: 'development-team/backend-architect',
          category: 'development-team',
          description: 'Configure Node.js backend architecture'
        },
        {
          type: 'command',
          name: 'generate-tests',
          path: 'testing/generate-tests',
          category: 'testing',
          description: 'Generate comprehensive test suite'
        },
        {
          type: 'agent',
          name: 'api-security-audit',
          path: 'security/api-security-audit',
          category: 'security',
          description: 'Perform security audit on APIs'
        },
        {
          type: 'mcp',
          name: 'github-integration',
          path: 'integration/github-integration',
          category: 'integration',
          description: 'Setup GitHub integration for repository management'
        }
      ]
    };
  }
  
  // This is where we would integrate with a workflow registry API
  // For now, return null to indicate workflow not found for other hashes
  console.log(chalk.yellow('\n⚠️  Workflow registry not yet implemented.'));
  console.log(chalk.gray('To test with demo workflow, use hash: demo123'));
  console.log(chalk.gray('Example: --workflow "#demo123"'));
  
  return null;
}

/**
 * Generate workflow YAML from workflow data
 */
function generateWorkflowYAML(workflowData) {
  const yaml = `#═══════════════════════════════════════════════════════════════════════════════
# 🤖 CLAUDE CODE WORKFLOW CONFIGURATION
#═══════════════════════════════════════════════════════════════════════════════
#
# WORKFLOW: ${workflowData.name}
# DESCRIPTION: ${workflowData.description}
# GENERATED: ${new Date().toISOString()}
# HASH: ${workflowData.hash || 'generated'}
#
#═══════════════════════════════════════════════════════════════════════════════
# 📋 INSTRUCTIONS FOR CLAUDE CODE
#═══════════════════════════════════════════════════════════════════════════════
#
# This is a WORKFLOW EXECUTION FILE for Claude Code. When you encounter this file,
# you should execute it as a complete automated workflow. Here's how:
#
# 🎯 EXECUTION BEHAVIOR:
# 1. READ this entire YAML file to understand the workflow structure
# 2. EXECUTE each step in the exact order listed below (sequential mode)
# 3. For AGENTS: Use the agent specified to perform the task described
# 4. For COMMANDS: Execute the Claude Code command as specified
# 5. For MCPs: Ensure the MCP server is available and use it as needed
# 6. STOP if any step fails (on_error: stop)
# 7. PROVIDE progress updates after each step completion
#
# 🔧 STEP EXECUTION PATTERN:
# - Announce: "Executing Step X: [step.name]"
# - Action: Perform the task using the specified component
# - Confirm: "✅ Step X completed successfully"
# - Continue to next step
#
# 💡 IMPORTANT NOTES:
# - All components are already installed in .claude/ directories
# - Each step builds upon the previous ones
# - Follow the descriptions exactly as specified
# - Use confirmation_required: true for user approval before starting
# - Maintain context and outputs between steps for workflow continuity
#
#═══════════════════════════════════════════════════════════════════════════════

name: "${workflowData.name}"
description: "${workflowData.description}"
tags: [${workflowData.tags.map(tag => `"${tag}"`).join(', ')}]
version: "${workflowData.version || '1.0.0'}"

#═══════════════════════════════════════════════════════════════════════════════
# 🚀 WORKFLOW STEPS - EXECUTE IN ORDER
#═══════════════════════════════════════════════════════════════════════════════

steps:
${workflowData.steps.map((step, index) => `  - step: ${index + 1}
    type: ${step.type}
    name: "${step.name}"
    path: "${step.path}"
    category: "${step.category}"
    description: "${step.description}"
    
    # CLAUDE CODE INSTRUCTIONS FOR THIS STEP:
    claude_instructions: |
      Execute this step using the ${step.type} located at .claude/${step.type}s/${step.name}.${step.type === 'mcp' ? 'json' : 'md'}
      Task: ${step.description}
      ${step.type === 'agent' ? 'Use this agent to perform the specified task with full context from previous steps.' : ''}
      ${step.type === 'command' ? 'Execute this command with appropriate parameters based on workflow context.' : ''}
      ${step.type === 'mcp' ? 'Ensure MCP server is running and utilize its capabilities for the task.' : ''}
      
    action_template: |
      echo "🔄 Executing Step ${index + 1}: ${step.name}"
      echo "📝 Task: ${step.description}"
      echo "🎯 Using ${step.type}: ${step.path}"
      # [CLAUDE CODE WILL REPLACE THIS WITH ACTUAL EXECUTION]
      echo "✅ Step ${index + 1} completed successfully"
`).join('\n')}

#═══════════════════════════════════════════════════════════════════════════════
# ⚙️ EXECUTION CONFIGURATION
#═══════════════════════════════════════════════════════════════════════════════

execution:
  mode: "sequential"           # Execute steps one by one, in order
  on_error: "stop"            # Stop workflow if any step fails
  timeout: 300                # Maximum time per step (5 minutes)
  continue_on_warning: true   # Continue if warnings occur
  save_outputs: true          # Save outputs between steps for context

#═══════════════════════════════════════════════════════════════════════════════
# 📦 INSTALLED COMPONENTS REFERENCE
#═══════════════════════════════════════════════════════════════════════════════

components:
  agents: [${workflowData.steps.filter(s => s.type === 'agent').map(s => `"${s.path}"`).join(', ')}]
  commands: [${workflowData.steps.filter(s => s.type === 'command').map(s => `"${s.path}"`).join(', ')}]
  mcps: [${workflowData.steps.filter(s => s.type === 'mcp').map(s => `"${s.path}"`).join(', ')}]

#═══════════════════════════════════════════════════════════════════════════════
# 🤖 CLAUDE CODE INTEGRATION SETTINGS
#═══════════════════════════════════════════════════════════════════════════════

claudecode:
  workflow_mode: true         # Enable workflow execution mode
  auto_execute: false         # Require user confirmation before starting
  confirmation_required: true # Ask user before each step
  show_progress: true         # Display progress indicators
  save_context: true          # Maintain context between steps
  
  # WORKFLOW EXECUTION INSTRUCTIONS FOR CLAUDE:
  execution_instructions: |
    When executing this workflow:
    
    1. 🎯 PREPARATION PHASE:
       - Confirm all components are installed in .claude/ directories
       - Verify user wants to execute this workflow
       - Explain what will happen in each step
    
    2. 🚀 EXECUTION PHASE:
       - Execute each step sequentially
       - Use the exact agent/command/mcp specified for each step
       - Maintain outputs and context between steps
       - Provide clear progress updates
    
    3. ✅ COMPLETION PHASE:
       - Summarize what was accomplished
       - Highlight any outputs or files created
       - Suggest next steps if applicable
    
    4. ❌ ERROR HANDLING:
       - If a step fails, stop execution immediately
       - Provide clear error message and suggested fixes
       - Offer to retry the failed step after fixes
    
    Remember: This workflow was designed to work as a complete automation.
    Each step builds upon the previous ones. Execute with confidence!

#═══════════════════════════════════════════════════════════════════════════════
# 📋 WORKFLOW SUMMARY
#═══════════════════════════════════════════════════════════════════════════════
# 
# This workflow will execute ${workflowData.steps.length} steps in sequence:
${workflowData.steps.map((step, index) => `# ${index + 1}. ${step.description} (${step.type}: ${step.name})`).join('\n')}
#
# Total estimated time: ${Math.ceil(workflowData.steps.length * 2)} minutes
# Components required: ${workflowData.steps.filter(s => s.type === 'agent').length} agents, ${workflowData.steps.filter(s => s.type === 'command').length} commands, ${workflowData.steps.filter(s => s.type === 'mcp').length} MCPs
#═══════════════════════════════════════════════════════════════════════════════
`;
  
  return yaml;
}

module.exports = { createClaudeConfig, showMainMenu };