[![npm version](https://img.shields.io/npm/v/claude-code-templates.svg)](https://www.npmjs.com/package/claude-code-templates)
[![npm downloads](https://img.shields.io/npm/dt/claude-code-templates.svg)](https://www.npmjs.com/package/claude-code-templates)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

```bash

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
```

An open-source CLI tool that provides framework-specific commands, automation hooks, and MCP server integration for JavaScript/TypeScript, Python, Go, Rust, and more. Built by the community, for the community.

<!-- [gif] -->

## 📋 Quick Start

```bash
# Navigate to your project
cd your-project-directory

# Run the installer (no installation required!)
npx claude-code-templates@latest

# Start coding with Claude
claude
```

The installer will auto-detect your project type and guide you through selecting commands, hooks, and MCP servers.

## 🎯 Supported Languages & Frameworks

| Language | Frameworks | Status | Commands | Hooks | MCP |
|----------|------------|---------|----------|--------|-----|
| **JavaScript/TypeScript** | React, Vue, Angular, Node.js | ✅ Ready | 7+ | 9+ | 4+ |
| **Python** | Django, Flask, FastAPI | ✅ Ready | 5+ | 8+ | 4+ |
| **Common** | Universal | ✅ Ready | 2+ | 1+ | 4+ |
| **Go** | Gin, Echo, Fiber | 🚧 Coming Soon | - | - | - |
| **Rust** | Axum, Warp, Actix | 🚧 Coming Soon | - | - | - |

## 🔧 Core Features

### 📋 Smart Commands
Framework-specific commands for testing, linting, building, debugging, and deployment.

### 🤖 Automation Hooks
Execute at key moments during Claude Code workflow:
- **PreToolUse**: Security checks, logging, statement detection
- **PostToolUse**: Auto-formatting, type checking, testing
- **Stop**: Final linting, bundle analysis
- **Notification**: Activity logging and monitoring

### 🔌 MCP Integration
Extend Claude Code with specialized capabilities:
- **IDE Integration**: VS Code diagnostics & Jupyter execution
- **Web Search**: Real-time information retrieval
- **Database Tools**: PostgreSQL, MySQL connections
- **Development Tools**: Docker, GitHub, filesystem operations

### 📊 Analysis Tools
Analyze and optimize your existing Claude Code configuration:

#### Command Analysis
```bash
# View detailed command statistics
npx claude-code-templates --command-stats
```

**What you get:**
- Command name, file size, and token count
- Lines, words, and last modified date
- AI-powered optimization recommendations
- Project-specific improvement suggestions

#### Hook Analysis
```bash
# Analyze automation hooks configuration
npx claude-code-templates --hook-stats
```

**What you get:**
- Hook name, type, and status (enabled/disabled)
- Hook descriptions and purpose
- Hook summary by type (PreToolUse, PostToolUse, etc.)
- AI-powered hook optimization suggestions
- Missing hook recommendations for your workflow

#### MCP Server Analysis
```bash
# Analyze MCP server configurations
npx claude-code-templates --mcp-stats
```

**What you get:**
- Server name, category, and status (enabled/disabled)
- Command, complexity rating, and descriptions
- Server summary by category (IDE, Database, Web, etc.)
- AI-powered MCP configuration optimization
- Missing server recommendations for your workflow

## 💡 Usage Examples

### Interactive Setup (Recommended)
```bash
cd my-react-app
npx claude-code-templates
# Auto-detects React and suggests optimal configuration
```

### Framework-Specific Quick Setup
```bash
# React + TypeScript project
npx claude-code-templates --language javascript-typescript --framework react --yes

# Python + Django project
npx claude-code-templates --language python --framework django --yes

# Go + Gin API project
npx claude-code-templates --language go --framework gin --yes

# Rust + Axum project
npx claude-code-templates --language rust --framework axum --yes
```

### Advanced Options
```bash
# Preview installation without making changes
npx claude-code-templates --dry-run

# Skip all prompts and use defaults
npx claude-code-templates --yes

# Install to custom directory
npx claude-code-templates --directory /path/to/project

# Analyze existing commands
npx claude-code-templates --command-stats

# Analyze automation hooks
npx claude-code-templates --hook-stats

# Analyze MCP server configurations
npx claude-code-templates --mcp-stats
```

### Alternative Commands
All these commands work exactly the same way:
```bash
npx claude-code-templates    # ✅ Recommended (package name)
npx claude-code-template     # Singular alias
npx create-claude-config     # Create-style command
npx claude-init              # Short alias
```

## 🛡️ Safety Features

- **Automatic Backups**: Existing files are backed up before changes
- **Confirmation Required**: Always asks before making changes (unless `--yes` flag)
- **Dry Run Mode**: Preview installation with `--dry-run`
- **Cancel Anytime**: Press Ctrl+C or answer 'No' to cancel
- **Back Navigation**: Modify previous selections during setup

## 🌟 What Makes This Special?

### Before (Manual Setup)
- Hours of configuration research
- Manual CLAUDE.md creation
- Framework-specific command setup
- Automation hook configuration
- MCP server integration

### After (With Templates)
```bash
npx claude-code-templates --language javascript-typescript --framework react --yes
# ✅ Done in 30 seconds!
```

### Open Source Benefits
- **Community-Driven**: Built by developers, for developers
- **Always Updated**: Latest best practices and framework support
- **Extensible**: Easy to add new languages and frameworks
- **Transparent**: All code is open and auditable
- **Free Forever**: MIT license, no vendor lock-in

## 🏗️ Project Architecture

```
claude-code-templates/
├── cli-tool/                    # 📦 NPM Package
│   ├── src/                     # Core CLI implementation
│   │   ├── index.js            # Main entry point
│   │   ├── prompts.js          # Interactive prompts
│   │   ├── command-stats.js    # Command analysis
│   │   └── templates.js        # Template configuration
│   ├── templates/              # Language and framework templates
│   │   ├── common/             # Universal templates
│   │   ├── javascript-typescript/ # JS/TS with React, Vue, Angular, Node.js
│   │   ├── python/             # Python with Django, Flask, FastAPI
│   │   ├── go/                 # Go with Gin, Echo, Fiber
│   │   └── rust/               # Rust with Axum, Warp, Actix
│   └── bin/                    # Executable scripts
├── CONTRIBUTING.md             # Contribution guidelines
├── LICENSE                     # MIT License
└── README.md                   # This file
```

## 🔧 Language-Specific Features

### JavaScript/TypeScript
- **Frameworks**: React, Vue, Angular, Node.js
- **Hooks**: Console.log detection, Prettier formatting, TypeScript checking, ESLint
- **MCP**: TypeScript SDK, GitHub, Puppeteer, Slack, File System
- **Commands**: Testing (Jest), building (Webpack/Vite), debugging, deployment

### Python
- **Frameworks**: Django, Flask, FastAPI
- **Hooks**: Print statement detection, Black formatting, MyPy type checking, pytest
- **MCP**: Python SDK, Docker, Jupyter, PostgreSQL, Opik
- **Commands**: Testing (pytest), linting (flake8), virtual env management

### Go (comming soon)
- **Frameworks**: Gin, Echo, Fiber
- **Hooks**: Print statement detection, gofmt formatting, go vet analysis
- **MCP**: Go SDK, Language Server, MySQL
- **Commands**: Testing (go test), building, dependency management

### Rust (comming soon)
- **Frameworks**: Axum, Warp, Actix
- **Hooks**: Print macro detection, rustfmt formatting, clippy linting
- **MCP**: Rust SDK, Documentation, Substrate
- **Commands**: Testing (cargo test), building (cargo build), clippy analysis

## 🤝 Contributing

We welcome contributions from the open source community! This project thrives on community input and collaboration.

**📋 Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing to ensure a welcoming environment for everyone.**

### Ways to Contribute
- **🆕 Add new languages** - Rust, Go, Java, C#, PHP, etc.
- **🎯 Add frameworks** - Svelte, Next.js, Nuxt.js, NestJS, Laravel, Spring Boot
- **🔧 Improve commands** - Better testing, deployment, debugging workflows
- **📖 Write documentation** - Clearer guides and examples
- **🐛 Fix bugs** - Improvements to existing templates
- **💡 Suggest features** - New CLI features and options

### Quick Start for Contributors
```bash
# Fork and clone the repository
git clone https://github.com/your-username/claude-code-templates.git
cd claude-code-templates

# Set up development environment
cd cli-tool
npm install && npm link

# Test your changes
npm test
npm start -- --dry-run

# Submit a pull request
git checkout -b feature/your-feature
# Make changes, test, commit, push
```

**📖 See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines**

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ (for the installer)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed

### Installation
```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Set up your project (no installation required!)
cd your-project
npx claude-code-templates

# Start coding with Claude
claude
```

### CLI Options

| Option | Description | Example |
|--------|-------------|---------|
| `-l, --language` | Specify programming language | `--language python` |
| `-f, --framework` | Specify framework | `--framework react` |
| `-d, --directory` | Target directory | `--directory /path/to/project` |
| `-y, --yes` | Skip prompts and use defaults | `--yes` |
| `--dry-run` | Show what would be installed | `--dry-run` |
| `--command-stats` | Analyze existing commands | `--command-stats` |
| `--hook-stats` | Analyze automation hooks | `--hook-stats` |
| `--mcp-stats` | Analyze MCP server configurations | `--mcp-stats` |
| `--help` | Show help information | `--help` |

## 🛠️ What Gets Installed

### Core Files
- **`CLAUDE.md`** - Main configuration file with language-specific best practices
- **`.claude/settings.json`** - Automation hooks and Claude Code settings
- **`.claude/commands/`** - Custom commands for common development tasks
- **`.mcp.json`** - Model Context Protocol server configurations

### Language-Specific Commands
Each language template includes optimized commands for:
- **Testing**: Jest, pytest, go test, cargo test
- **Linting**: ESLint, flake8, go vet, clippy
- **Formatting**: Prettier, Black, gofmt, rustfmt
- **Building**: Webpack, setuptools, go build, cargo build
- **Debugging**: Chrome DevTools, pdb, delve, gdb
- **Framework Operations**: Component generation, migrations, scaffolding

### Automation Hooks
- **PreToolUse**: Code quality checks, security scans, statement detection
- **PostToolUse**: Auto-formatting, type checking, test execution
- **Stop**: Final linting, bundle analysis, cleanup
- **Notification**: Activity logging, performance monitoring

### MCP Servers
- **IDE Integration**: VS Code diagnostics, Jupyter kernel execution
- **Web Search**: Real-time web search for documentation and solutions
- **Database Tools**: PostgreSQL, MySQL, SQLite connections
- **Development Tools**: Docker containers, GitHub API, filesystem operations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Open Source Community

This project is built by the community, for the community. We believe in:

- **🌍 Open Collaboration**: Everyone can contribute and improve the project
- **🔄 Knowledge Sharing**: Share best practices and learn from others
- **🤝 Inclusive Environment**: Welcome developers of all skill levels
- **📈 Continuous Improvement**: Always evolving with community feedback
- **🆓 Free Forever**: MIT license ensures it stays open and free

### Recognition
- **Contributors**: All contributors are recognized in our GitHub contributors page
- **Community**: Join discussions and help others in GitHub Discussions
- **Star History**: Show your support by starring the repository

## 📞 Support

- **🐛 Issues**: [Report bugs or request features](https://github.com/davila7/claude-code-templates/issues)
- **💬 Discussions**: [Join community discussions](https://github.com/davila7/claude-code-templates/discussions)
- **🔒 Security**: [Report security vulnerabilities](SECURITY.md)
- **📖 Documentation**: [Claude Code Official Docs](https://docs.anthropic.com/en/docs/claude-code)
- **🤝 Contributing**: [Read our contribution guidelines](CONTRIBUTING.md)

---

**⭐ Found this useful? Give us a star on GitHub to support the project!**

**🤝 Want to contribute? Check out our [contribution guidelines](CONTRIBUTING.md) - all skill levels welcome!**