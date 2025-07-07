# Claude Code Templates Installer

A CLI tool to quickly setup Claude Code configurations for different programming languages and frameworks. No installation required - just use `npx`!

## 🚀 Quick Start

The fastest way to get started is with `npx` (no installation required):

```bash
# Navigate to your project directory
cd your-project

# Run the installer
npx claude-code-templates
```

## 📋 How to Use

### Step 1: Navigate to Your Project
```bash
cd your-project-directory
```

### Step 2: Run the Installer
```bash
npx claude-code-templates
```

### Step 3: Follow the Interactive Setup
The installer will:
1. 🔍 **Auto-detect** your project type (JavaScript, Python, etc.)
2. 🎯 **Ask about frameworks** (React, Django, Flask, etc.)
3. 📋 **Let you choose commands** (testing, linting, debugging)
4. 🔧 **Let you select automation hooks** (formatting, type checking, etc.)
5. ✅ **Confirm before installing**

### Step 4: Start Using Claude Code
```bash
claude
```

## 💡 Usage Examples

### Interactive Setup (Recommended)
```bash
cd my-react-app
npx claude-code-templates
# Follow the prompts - it will detect React automatically!
```

### Quick Setup for Specific Languages
```bash
# React project
cd my-react-app
npx claude-code-templates --language javascript-typescript --framework react

# Python Django project  
cd my-django-app
npx claude-code-templates --language python --framework django

# Node.js API
cd my-api
npx claude-code-templates --language javascript-typescript --framework node

# Generic Python project
cd my-python-project
npx claude-code-templates --language python
```

### Advanced Options
```bash
# Skip all prompts and use defaults
npx claude-code-templates --yes

# See what would be installed without actually installing
npx claude-code-templates --dry-run

# Install to a different directory
npx claude-code-templates --directory /path/to/project

# Get help
npx claude-code-templates --help
```

## 🔄 Alternative Commands

All these commands work exactly the same way:
```bash
npx claude-code-templates    # ✅ Recommended (package name)
npx claude-code-template     # Singular alias
npx create-claude-config     # Create-style command
npx claude-init              # Short alias
```

## ⚡ No Installation Required

**Why use `npx`?**
- ✅ Always gets the latest version
- ✅ No global installation needed
- ✅ Works on any machine with Node.js
- ✅ Follows npm best practices

If you prefer global installation:
```bash
npm install -g claude-code-templates
create-claude-config
```

## Supported Languages

- **Common** - Universal configuration for any project
- **JavaScript/TypeScript** - Modern JS/TS development with frameworks
- **Python** - Python development with popular frameworks
- **Rust** - Rust development with Cargo and clippy
- **Go** - Go development with modules and testing

## Supported Frameworks

### JavaScript/TypeScript
- React
- Vue.js
- Angular
- Node.js

### Python
- Django
- Flask
- FastAPI

## Features

- 🔍 **Auto-detection** - Automatically detects your project type
- 🎯 **Framework-specific** - Includes framework-specific commands and configurations
- 🔧 **Selective automation hooks** - Choose which automation features to enable
- 💾 **Backup existing files** - Safely backs up existing CLAUDE.md and .claude directories
- ⚙️ **Customizable** - Interactive prompts for command and hook selection
- 🚀 **Quick setup** - Get started with Claude Code in seconds

## 🔧 Automation Hooks

The CLI allows you to selectively enable automation hooks that enhance your development workflow:

### JavaScript/TypeScript Hooks
- **Console.log Detection** - Prevents committing debug statements
- **Prettier Auto-formatting** - Automatically formats code on save
- **TypeScript Type Checking** - Validates types after each edit
- **Import Validation** - Warns about performance-impacting wildcard imports
- **Auto-testing** - Runs relevant tests when files change
- **ESLint Integration** - Lints code before session ends

### Python Hooks
- **Print Statement Detection** - Warns about debug print statements
- **Black Auto-formatting** - Formats Python code automatically
- **Import Sorting** - Organizes imports with isort
- **Flake8 Linting** - Checks code quality standards
- **MyPy Type Checking** - Validates type hints
- **Security Auditing** - Scans for vulnerabilities with bandit

### Go Hooks
- **Print Statement Detection** - Warns about fmt.Print statements
- **Auto-formatting** - Formats code with gofmt and goimports
- **Go Vet Analysis** - Runs static analysis checks
- **Dependency Checking** - Lists and validates dependencies
- **Auto-testing** - Runs tests for modified files

### Rust Hooks
- **Print Macro Detection** - Warns about println! statements
- **Rustfmt Formatting** - Automatically formats Rust code
- **Cargo Check** - Validates code compilation
- **Clippy Linting** - Runs Rust's built-in linter
- **Security Auditing** - Checks for vulnerable dependencies

## What Gets Installed

### Core Files
- `CLAUDE.md` - Main configuration file for Claude Code
- `.claude/settings.json` - Language-specific settings with selected automation hooks
- `.claude/commands/` - Custom commands for common tasks
- `.mcp.json` - Model Context Protocol server configurations

### Automation Hooks
Each language template includes selectable automation hooks for:
- **PreToolUse**: Code quality checks before actions (e.g., detecting console.log statements)
- **PostToolUse**: Automatic formatting and validation after edits (e.g., Prettier, ESLint, type checking)
- **Stop**: Final checks before session ends (e.g., linting changed files, bundle analysis)
- **Notification**: Logging and monitoring of Claude Code activities

### MCP Servers (Model Context Protocol)
Configure external tools and services to extend Claude's capabilities:
- **IDE Integration** - VS Code language diagnostics and Jupyter kernel execution
- **Web Search** - Real-time web search for up-to-date information and documentation
- **Filesystem Tools** - Advanced file operations, monitoring, and directory management
- **Database Tools** - Database connections, schema inspection, and query execution

MCP servers are configured in `.mcp.json` and enable Claude to:
- Execute code in VS Code or Jupyter environments
- Search the web for current information
- Perform advanced file system operations
- Connect to databases and run queries

### Language-Specific Commands
Each language template includes optimized commands for:
- Testing (Jest, pytest, Cargo test, Go test)
- Linting and formatting (ESLint/Prettier, Black/flake8, clippy/rustfmt, gofmt/go vet)
- Building and deployment
- Debugging
- Framework-specific operations

## 📱 What Happens During Setup

### Interactive Experience
```bash
$ npx claude-code-templates

 ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗
██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝
██║     ██║     ███████║██║   ██║██║  ██║█████╗  
██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝  
╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗
 ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝

 ██████╗ ██████╗ ██████╗ ███████╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝
██║     ██║   ██║██║  ██║█████╗  
██║     ██║   ██║██║  ██║██╔══╝  
╚██████╗╚██████╔╝██████╔╝███████╗
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝

████████╗███████╗███╗   ███╗██████╗ ██╗      █████╗ ████████╗███████╗███████╗
╚══██╔══╝██╔════╝████╗ ████║██╔══██╗██║     ██╔══██╗╚══██╔══╝██╔════╝██╔════╝
   ██║   █████╗  ██╔████╔██║██████╔╝██║     ███████║   ██║   █████╗  ███████╗
   ██║   ██╔══╝  ██║╚██╔╝██║██╔═══╝ ██║     ██╔══██║   ██║   ██╔══╝  ╚════██║
   ██║   ███████╗██║ ╚═╝ ██║██║     ███████╗██║  ██║   ██║   ███████╗███████║
   ╚═╝   ╚══════╝╚═╝     ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝

                    🚀 Setup Claude Code for any project language 🚀

🚀 Setting up Claude Code configuration...
Target directory: /path/to/your/project
✔ Project detection complete
🔤 Select your programming language: (Use arrow keys)
❯ JavaScript/TypeScript
  Python  
  Common (Language-agnostic)
  Rust (Coming Soon)
  Go (Coming Soon)
```

### Step-by-Step Walkthrough

1. **Project Detection** 📡
   ```
   ✔ Project detection complete
   ```
   - Scans your project for `package.json`, `requirements.txt`, etc.
   - Auto-suggests the best language template

2. **Language Selection** 🔤
   ```
   🔤 Select your programming language: JavaScript/TypeScript
   ```
   - Choose from available languages
   - Auto-selected based on detection

3. **Framework Selection** 🎯
   ```
   🎯 Select your framework (optional): React
   ```
   - Shows relevant frameworks for your language
   - Auto-detected from dependencies

4. **Command Selection** 📋
   ```
   📋 Select commands to include (use space to select):
   ◉ Enhanced testing commands
   ◉ Code linting and formatting  
   ◯ Git hooks integration
   ◯ Debugging helpers
   ```

5. **Hook Selection** 🔧
   ```
   🔧 Select automation hooks to include (use space to select):
   ◉ PreToolUse: Block files containing console.log statements
   ◉ PostToolUse: Auto-format JavaScript/TypeScript files with Prettier
   ◉ PostToolUse: Run TypeScript type checking after edits
   ◯ PostToolUse: Run tests automatically for modified files
   ◉ Stop: Run ESLint on changed files before stopping
   ```

6. **MCP Server Selection** 🔧
   ```
   🔧 Select MCP servers to include (use space to select):
   ◉ IDE Integration - VS Code language diagnostics and code execution
   ◉ Web Search - Search the web for up-to-date information
   ◯ Filesystem Tools - Advanced file operations and monitoring
   ◯ Database Tools - Database connection and query capabilities
   ```
   - Choose Model Context Protocol servers to extend Claude's capabilities
   - IDE Integration provides VS Code diagnostics and Jupyter kernel execution
   - Web Search enables real-time web searches within Claude conversations
   - Additional tools for filesystem operations and database management

7. **Final Confirmation** 🚀
   ```
   🚀 Setup Claude Code for javascript-typescript with react (5 commands) (9 hooks) (4 MCP)? (Y/n)
   ```
   - Review your choices including selected commands, hooks, and MCP servers
   - Shows total count of each component being installed
   - Type 'n' to cancel, 'y' or Enter to proceed

8. **Installation** 📁
   ```
   📋 Existing CLAUDE.md backed up to CLAUDE.md.backup
   ✓ Copied javascript-typescript/CLAUDE.md → CLAUDE.md
   ✓ Copied base configuration and commands javascript-typescript/.claude → .claude
   ✓ Copied javascript-typescript/.mcp.json → .mcp.json (with selected MCPs)
   ✓ Copied framework commands javascript-typescript/examples/react-app/.claude/commands → .claude/commands
   🔧 Installed 9 automation hooks
   🔧 Installed 4 MCP servers
   ✅ Claude Code configuration setup complete!
   📚 Next steps:
     1. Review the generated CLAUDE.md file
     2. Customize the configuration for your project
     3. Start using Claude Code with: claude
   💡 Language-specific features for javascript-typescript have been configured
   🎯 Framework-specific commands for react are available
   🔧 9 automation hooks have been configured
   🔧 4 MCP servers have been configured
   ```

## 🛡️ Safe Installation

- **Backup Protection**: Existing files are safely backed up
- **Confirmation Required**: Always asks before making changes  
- **Dry Run Option**: Preview changes with `--dry-run`
- **Cancel Anytime**: Press Ctrl+C or answer 'No' to cancel

## CLI Options

| Option | Description | Example |
|--------|-------------|---------|
| `-l, --language` | Specify programming language | `--language python` |
| `-f, --framework` | Specify framework | `--framework react` |
| `-d, --directory` | Target directory | `--directory /path/to/project` |
| `-y, --yes` | Skip prompts and use defaults | `--yes` |
| `--dry-run` | Show what would be copied | `--dry-run` |
| `--help` | Show help information | `--help` |

## Development

### Setup for Contributing
```bash
git clone https://github.com/davila7/claude-code-templates.git
cd claude-code-templates/cli-tool
npm install
```

### Local Development
```bash
# Link the package for local testing
npm link

# Test locally (will use your local changes)
claude-code-templates

# Test with specific options
claude-code-templates --language python --framework django

# Run test suite
npm test

# Unlink when done
npm unlink -g claude-code-templates
```

### Testing Changes
```bash
# Run the comprehensive test suite
npm test

# Test specific scenarios manually
npm start -- --dry-run --language javascript-typescript --framework react
npm start -- --dry-run --language python --framework django
```

### Project Structure
```
cli-tool/
├── src/                    # Source code
│   ├── command-scanner.js  # Scans and loads commands
│   ├── file-operations.js  # Handles file copying
│   ├── hook-scanner.js     # Manages automation hooks
│   ├── index.js           # Main entry point
│   ├── prompts.js         # Interactive CLI prompts
│   ├── templates.js       # Template configuration
│   └── utils.js           # Utility functions
├── templates/             # Language and framework templates
│   ├── common/
│   ├── javascript-typescript/
│   ├── python/
│   ├── go/
│   └── rust/
└── bin/                   # Executable scripts
```

## Contributing

We welcome contributions! Here's how to get started:

### 1. Fork & Clone
```bash
# Fork the repository on GitHub, then:
git clone https://github.com/your-username/claude-code-templates.git
cd claude-code-templates
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 3. Make Your Changes
- Add new language templates in `templates/`
- Add new framework examples in `templates/language/examples/`
- Update commands, hooks, or core functionality
- Follow existing code patterns

### 4. Test Thoroughly
```bash
cd cli-tool
npm test                    # Run test suite
npm start -- --dry-run     # Manual testing
```

### 5. Submit a Pull Request
- Commit with clear, descriptive messages
- Push to your fork
- Open a PR with description of changes
- Link any related issues

### Adding New Languages
1. Create `templates/your-language/` directory
2. Add `CLAUDE.md`, `.claude/settings.json`, and `.mcp.json`
3. Create commands in `.claude/commands/`
4. Add framework examples in `examples/`
5. Update `src/templates.js` configuration

### Adding New Frameworks
1. Create `templates/language/examples/framework-name/`
2. Add framework-specific commands and CLAUDE.md
3. Update the framework detection logic if needed

## License

MIT License