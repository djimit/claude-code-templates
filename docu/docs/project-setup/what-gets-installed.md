---
sidebar_position: 3
---

# What Gets Installed

When you use `claude-code-templates` to set up your project, it installs several core files and configurations to integrate Claude Code effectively into your development environment. You can choose between **complete templates** (comprehensive project setup) or **individual components** (selective functionality).

## Installation Methods

### Complete Template Installation
For comprehensive project setup with all recommended components:

```bash
# Interactive setup (recommended)
npx claude-code-templates@latest

# Direct template installation
npx claude-code-templates@latest --language=javascript-typescript --framework=react
```

### Individual Component Installation
For selective component installation, you can install specific components:

#### Agents (🤖)
Agents are typically installed as part of template setups, providing specialized AI assistance:
- React Performance Optimization Agent
- API Security Audit Agent  
- Database Optimization Agent
- And more framework-specific agents

#### Commands (⚡)
Install custom slash commands directly:

```bash
# Create commands directory
mkdir -p .claude/commands

# Install specific commands
curl -o .claude/commands/check-file.md \
  https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/commands/check-file.md

curl -o .claude/commands/generate-tests.md \
  https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/commands/generate-tests.md
```

#### MCPs (🔌)
Install Model Context Protocol integrations:

```bash
# GitHub integration
curl -o ./github-integration.json \
  https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/mcps/github-integration.json

# Database integration
curl -o ./database-integration.json \
  https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/mcps/database-integration.json
```

## Core Files Installed

### Complete Template Installation Files

-   **`CLAUDE.md`**: This is the main configuration file for Claude Code, containing language-specific best practices and instructions.
-   **`.claude/settings.json`**: This file stores automation hooks and general Claude Code settings.
-   **`.claude/commands/`**: This directory contains custom commands tailored for common development tasks within your project.
-   **`.mcp.json`**: This file holds Model Context Protocol (MCP) server configurations, extending Claude Code's capabilities.

### Individual Component Files

#### Agent Files
- **Embedded in `CLAUDE.md`**: Agent configurations are integrated into the main Claude Code configuration file
- **Specialized prompts**: Domain-specific instructions for focused AI assistance

#### Command Files
- **`.claude/commands/*.md`**: Individual command files in Markdown format
- **Custom slash commands**: Extend Claude Code with project-specific functionality

#### MCP Files
- **`*.json`**: MCP configuration files for external service integrations
- **Authentication configs**: Secure connection settings for external services

## When to Use Templates vs Individual Components

### Use Complete Templates When:
- ✅ Setting up a new project from scratch
- ✅ You want a comprehensive, tested configuration
- ✅ You're new to Claude Code and want everything configured properly
- ✅ You prefer opinionated setups with best practices included

### Use Individual Components When:
- ✅ You have an existing Claude Code setup to enhance
- ✅ You only need specific functionality (e.g., just GitHub integration)
- ✅ You want to gradually add capabilities to your workflow
- ✅ You're experimenting with new tools and integrations
- ✅ You have custom requirements that don't match standard templates

## Component Discovery

You can discover and install components through:

1. **Web Interface**: Visit the [unified component browser](https://davila7.github.io/claude-code-templates/) to explore all available templates and components
2. **Interactive CLI**: Run `npx claude-code-templates@latest` and select "⚙️ Project Setup"
3. **GitHub Repository**: Browse components directly in the [repository structure](https://github.com/davila7/claude-code-templates)

For detailed information about each component type, see:
- [Individual Components Overview](../components/overview)
- [Agents Documentation](../components/agents)
- [Commands Documentation](../components/commands)
- [MCPs Documentation](../components/mcps)
