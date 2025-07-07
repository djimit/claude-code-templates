# Claude Code Templates

[![npm version](https://badge.fury.io/js/claude-code-templates.svg)](https://badge.fury.io/js/claude-code-templates)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Ready-to-use Claude Code configurations and templates for your projects. Get up and running with Claude Code in seconds with framework-specific commands, optimized setups, and best practices.

## 🚀 Quick Start

The fastest way to set up Claude Code for your project:

```bash
# Navigate to your project
cd your-project

# Run the installer (no installation required!)
npx claude-code-templates
```

## 🎨 Interactive Experience

The installer provides a beautiful, step-by-step setup process with navigation:

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

✔ Project detection complete

🔤 Select your programming language: 
  ❯ Common (Language-agnostic)
    JavaScript/TypeScript
    Python
    Rust
    Go

🎯 Select your framework (optional):
  ← Back
  ❯ None / Generic
    React
    Vue.js
    Angular
    Node.js

📋 Select commands to include (use space to select): 
  ← Back
  ❯ ◯ API Endpoint - Generate API endpoint
    ◉ Debug - Debug issues
    ◉ Lint - Fix linting issues
    ◯ NPM Scripts - Manage NPM scripts
    ◉ Refactor - Refactor code
    ◉ Test - Run tests
    ◯ TS Migration - Migrate to TypeScript
    ◯ Component - Create component
    ◯ Hooks - React hooks helper
    ◯ State Mgmt - Manage state

🔧 Select automation hooks to include (use space to select):
  ← Back
  ❯ ◉ PreToolUse: Block console.log statements in JS/TS files
    ◉ PostToolUse: Auto-format JS/TS files with Prettier
    ◉ PostToolUse: Run TypeScript type checking
    ◯ PostToolUse: Warn about wildcard imports
    ◯ PostToolUse: Run tests automatically for modified files
    ◯ Stop: Run ESLint on changed files
    ◯ Stop: Analyze bundle size impact
    ◯ Notification: Log Claude Code notifications
  
🚀 Setup Claude Code for javascript-typescript with react (5 commands) (9 hooks) (1 MCP)?
  ← Back to modify settings
  ❯ ✅ Yes, proceed with setup
    ❌ No, cancel setup

✅ Yes, proceed with setup
  ⠋ Copying template files...✓ Copied javascript-typescript/CLAUDE.md → CLAUDE.md
  ✓ Copied base configuration and commands javascript-typescript/.claude → .claude
  ✓ Copied javascript-typescript/.mcp.json → .mcp.json
  ✓ Copied framework commands javascript-typescript/examples/react-app/.claude/commands → .claude/commands
  ✓ Added command: API Endpoint
  ✓ Added command: Debug
  ✓ Added command: Lint
  ✓ Added command: Refactor
  ✓ Added command: Test
  📋 Installed 5 commands
  🔧 Installed 9 automation hooks
  🔧 Installed 1 MCP
  ✔ Template files copied successfully
  ✅ Claude Code configuration setup complete!
```

That's it! The installer will auto-detect your project type and set up everything for you.

## ⚡ Direct Installation Commands

Skip the interactive setup with these direct commands:

### JavaScript/TypeScript Projects

```bash
# React application
npx claude-code-templates --language javascript-typescript --framework react --yes

# Vue.js application  
npx claude-code-templates --language javascript-typescript --framework vue --yes

# Angular application
npx claude-code-templates --language javascript-typescript --framework angular --yes

# Node.js API/Backend
npx claude-code-templates --language javascript-typescript --framework node --yes

# Generic JavaScript/TypeScript project
npx claude-code-templates --language javascript-typescript --framework none --yes
```

### Python Projects

```bash
# Django web application
npx claude-code-templates --language python --framework django --yes

# Flask web application
npx claude-code-templates --language python --framework flask --yes

# FastAPI application
npx claude-code-templates --language python --framework fastapi --yes

# Generic Python project
npx claude-code-templates --language python --framework none --yes
```

### Generic/Multi-language Projects

```bash
# Universal configuration for any language
npx claude-code-templates --language common --yes
```

### Coming Soon
```bash
# Rust projects - Coming Soon!
# Go projects - Coming Soon!
```

## ✨ Features

- 🔍 **Smart Auto-Detection** - Automatically detects your programming language and framework
- 🎯 **Framework-Specific Commands** - React hooks, Vue composables, Angular services, Node.js middleware
- 💾 **Safe Installation** - Backs up existing files before making changes
- ⚙️ **Interactive Setup** - Choose exactly what you need through guided prompts with back navigation
- 🚀 **Zero Configuration** - Works out of the box with sensible defaults
- 📦 **No Installation Required** - Uses `npx` for instant access to latest version
- ↩️ **Enhanced Navigation** - Go back to modify previous selections during setup

## 🛠️ Supported Technologies

### Programming Languages
- **JavaScript/TypeScript** ✅ - Modern ES6+, TypeScript, comprehensive framework support
- **Python** ✅ - Django, Flask, FastAPI with complete automation hooks and commands
- **Common** ✅ - Universal configuration for any language
- **Rust** ⏳ - Coming Soon
- **Go** ⏳ - Coming Soon

### JavaScript/TypeScript Frameworks

#### ⚛️ React
- **Commands**: Component creation, hooks management, state management
- **Features**: TypeScript support, testing with Jest/Vitest, modern React patterns
- **Best Practices**: Functional components, custom hooks, performance optimization

#### 🟢 Vue.js  
- **Commands**: Component creation, composables, Vue 3 patterns
- **Features**: Composition API, single-file components, TypeScript integration
- **Best Practices**: Composable patterns, reactive programming, Vue 3 conventions

#### 🅰️ Angular
- **Commands**: Component generation, service creation, dependency injection
- **Features**: TypeScript-first, RxJS patterns, Angular CLI integration
- **Best Practices**: OnPush change detection, reactive forms, testing with TestBed

#### 🟢 Node.js
- **Commands**: API routes, middleware creation, database operations
- **Features**: Express.js patterns, TypeScript support, API development
- **Best Practices**: RESTful design, error handling, security middleware

### Python Frameworks

#### 🐍 Django
- **Commands**: Model creation, admin setup, view generation, testing, linting
- **Features**: ORM integration, admin interface, authentication, REST APIs
- **Best Practices**: MVT architecture, security settings, database optimization

#### 🌶️ Flask
- **Commands**: Blueprint creation, route management, database setup, testing, deployment
- **Features**: Micro-framework flexibility, SQLAlchemy integration, template inheritance
- **Best Practices**: Application factory pattern, modular design, security headers

#### ⚡ FastAPI
- **Commands**: API endpoint generation, authentication, database integration, testing
- **Features**: Automatic documentation, Pydantic validation, async support
- **Best Practices**: Type hints, dependency injection, async patterns

## 📦 What Gets Installed

When you run the installer, it adds these files to your project:

### Core Configuration
- **`CLAUDE.md`** - Main configuration file with language and framework-specific guidance
- **`.claude/settings.json`** - Optimized settings for your language and framework

### Framework-Specific Commands
Each framework template includes ready-to-use commands:

#### Base Commands (All Projects)
- **`/debug`** - Debugging configurations and helpers
- **`/lint`** - Code linting and formatting
- **`/test`** - Testing setup and execution
- **`/npm-scripts`** - Package management and scripts
- **`/typescript-migrate`** - TypeScript migration helpers
- **`/refactor`** - Code refactoring assistance

#### React-Specific Commands
- **`/component`** - Create React components with TypeScript
- **`/hooks`** - Create and manage custom React hooks
- **`/state-management`** - Implement state management (Redux, Zustand, Context)

#### Vue.js-Specific Commands
- **`/components`** - Create Vue components with TypeScript
- **`/composables`** - Create Vue 3 composables

#### Angular-Specific Commands
- **`/components`** - Create Angular components with TypeScript
- **`/services`** - Create services with dependency injection

#### Node.js-Specific Commands
- **`/route`** - Create API routes and endpoints
- **`/middleware`** - Create Express middleware
- **`/api-endpoint`** - Generate complete API endpoints
- **`/database`** - Set up database operations and models

## 🔧 Automation Hooks

When you select automation hooks during setup, Claude Code will automatically execute scripts at key moments to improve your development workflow. Here are the available hooks:

### JavaScript/TypeScript Hooks

#### PreToolUse Hooks (Execute Before Claude Uses Tools)

**🗂️ Bash Command Logging**
- **When**: Before any bash command execution
- **What**: Logs all bash commands to `~/.claude/bash-command-log.txt`
- **Purpose**: Track command history for debugging and auditing

**🚫 Console.log Detection**
- **When**: Before writing JavaScript/TypeScript files
- **What**: Prevents files containing `console.log` statements from being saved
- **Purpose**: Enforces clean code practices by blocking debug statements

**🛡️ NPM Security Audit**
- **When**: Before writing `package.json` files
- **What**: Runs `npm audit --audit-level=moderate` to check for vulnerabilities
- **Purpose**: Automatically scans for security issues in dependencies

#### PostToolUse Hooks (Execute After Claude Uses Tools)

**✨ Auto-formatting with Prettier**
- **When**: After writing/editing JavaScript/TypeScript files
- **What**: Runs `npx prettier --write` on the modified file
- **Purpose**: Ensures consistent code formatting across your project

**📝 TypeScript Type Checking**
- **When**: After writing/editing TypeScript files
- **What**: Runs `npx tsc --noEmit` to verify type correctness
- **Purpose**: Catches type errors immediately after code changes

**⚠️ Wildcard Import Detection**
- **When**: After writing/editing JavaScript/TypeScript files
- **What**: Warns about `import * from` statements
- **Purpose**: Promotes better tree-shaking and bundle optimization

**🧪 Automatic Test Execution**
- **When**: After modifying JavaScript/TypeScript files
- **What**: Automatically runs corresponding test files (`.test.` or `.spec.`)
- **Purpose**: Ensures tests run immediately after code changes

#### Notification Hooks

**📢 General Notification Logging**
- **When**: On any Claude Code notification
- **What**: Logs notification events to `~/.claude/notifications.log`
- **Purpose**: Track system events and debugging information

#### Stop Hooks (Execute When Session Ends)

**🔍 ESLint on Changed Files**
- **When**: At the end of a coding session
- **What**: Runs ESLint on all modified JavaScript/TypeScript files
- **Purpose**: Final code quality check before committing

**📊 Bundle Size Analysis**
- **When**: At the end of a coding session
- **What**: Analyzes bundle size impact using bundlesize or webpack-bundle-analyzer
- **Purpose**: Monitor performance impact of code changes

### Python Hooks

#### PreToolUse Hooks
- **🗂️ Bash Command Logging** - Track all bash commands
- **🚫 Print Statement Detection** - Prevent files with `print()` statements
- **🛡️ pip Security Check** - Audit dependencies when requirements.txt changes

#### PostToolUse Hooks
- **✨ Auto-formatting with Black** - Format Python code automatically
- **📝 Type Checking with MyPy** - Verify type hints
- **🧪 Automatic Test Execution** - Run pytest on modified files

### Go Hooks

#### PreToolUse Hooks
- **🗂️ Bash Command Logging** - Track all bash commands
- **🚫 Debug Statement Detection** - Prevent files with `fmt.Print` statements
- **🛡️ go mod Security Check** - Audit dependencies when go.mod changes

#### PostToolUse Hooks
- **✨ Auto-formatting with gofmt** - Format Go code automatically
- **🧪 Automatic Test Execution** - Run go test on modified files

### Rust Hooks

#### PreToolUse Hooks
- **🗂️ Bash Command Logging** - Track all bash commands
- **🚫 Debug Statement Detection** - Prevent files with `println!` statements
- **🛡️ cargo Security Check** - Audit dependencies when Cargo.toml changes

#### PostToolUse Hooks
- **✨ Auto-formatting with rustfmt** - Format Rust code automatically
- **🧪 Automatic Test Execution** - Run cargo test on modified files

### How Hook Selection Works

#### Understanding Hook Events

Hooks are **automatic events** that execute at specific moments in Claude Code's workflow:

- **PreToolUse**: Before Claude uses a tool (Write, Edit, Bash, etc.)
- **PostToolUse**: After Claude uses a tool
- **Stop**: At the end of a coding session
- **Notification**: When a system notification occurs

#### Practical Example: Auto-formatting with Prettier

When you select the **"PostToolUse: Auto-format JS/TS files with Prettier"** hook, here's what happens:

```bash
# 1. Claude modifies a TypeScript file
✏️  Claude edits: src/components/Button.tsx

# 2. The PostToolUse hook triggers automatically
🔧 PostToolUse Hook triggered:
   → Detecting file: src/components/Button.tsx
   → File is .tsx (TypeScript React) ✓
   → Running: npx prettier --write "src/components/Button.tsx"
   → Code formatted successfully ✅

# 3. The file is automatically formatted
📝 Result: Button.tsx is now properly formatted
```

Without the hook, you'd need to manually run:
```bash
npx prettier --write src/components/Button.tsx
```

#### Interactive Selection

During the interactive setup, you can choose which hooks to enable:

```bash
🔧 Select automation hooks to include (use space to select):
  ❯ ◉ PreToolUse: Block console.log statements in JS/TS files
    ◉ PostToolUse: Auto-format JS/TS files with Prettier
    ◉ PostToolUse: Run TypeScript type checking
    ◯ PostToolUse: Warn about wildcard imports
    ◯ PostToolUse: Run tests automatically for modified files
    ◯ Stop: Run ESLint on changed files
    ◯ Stop: Analyze bundle size impact
    ◯ Notification: Log Claude Code notifications
```

**Controls:**
- **Space** - Toggle specific hook on/off
- **Enter** - Confirm selection
- **← Back** - Return to previous step

### Hook Benefits

- **🔄 Automatic Quality Assurance** - Code formatting, linting, and type checking happen automatically
- **⚡ Faster Development** - No need to manually run formatting or testing commands
- **🛡️ Security** - Automatic dependency auditing and vulnerability detection
- **📊 Performance Monitoring** - Bundle size analysis and optimization warnings
- **🧪 Test Coverage** - Automatic test execution ensures code quality

## 🔧 MCP Server Integration

MCP (Model Context Protocol) servers extend Claude Code with additional capabilities. During setup, you can select which MCP servers to include in your project:

### What are MCP Servers?

MCP servers are external tools that Claude Code can communicate with to access specialized functionality like databases, APIs, file systems, and more. Each server provides specific tools and resources that enhance Claude's capabilities.

### Available MCP Servers by Language

#### JavaScript/TypeScript MCPs

**🛠️ TypeScript SDK**
- **Purpose**: Official Anthropic SDK for building MCP servers and clients
- **Use Case**: Develop custom MCP servers or integrate with existing ones

**🐙 GitHub MCP**
- **Purpose**: Integration with GitHub API for managing repos, issues, and PRs
- **Use Case**: Automate GitHub workflows, manage issues, create PRs

**🤖 Puppeteer MCP**
- **Purpose**: Browser automation using Google Puppeteer
- **Use Case**: Web scraping, automated testing, screenshot generation

**💬 Slack MCP**
- **Purpose**: Access to real-time Slack conversations and workflows
- **Use Case**: Automate Slack messaging, monitor channels, workflow integration

**📁 File System MCP**
- **Purpose**: Local file management compatible with any language
- **Use Case**: Advanced file operations, directory management, file monitoring

#### Python MCPs

**🐍 Python SDK**
- **Purpose**: Official Python SDK with FastMCP for rapid development
- **Use Case**: Build Python-based MCP servers quickly

**🐳 Docker MCP**
- **Purpose**: Isolated code execution via Docker containers
- **Use Case**: Safe code execution, environment isolation, container management

**📓 Jupyter MCP**
- **Purpose**: Integration with interactive Jupyter notebooks
- **Use Case**: Data analysis, machine learning workflows, interactive computing

**🗄️ PostgreSQL MCP**
- **Purpose**: Natural language queries to PostgreSQL databases
- **Use Case**: Database operations, data analysis, SQL query generation

**📊 Opik MCP**
- **Purpose**: Observability for LLM apps with tracing and metrics
- **Use Case**: Monitor AI applications, performance tracking, debugging

#### Rust MCPs

**⚡ Rust MCP SDK**
- **Purpose**: High-performance asynchronous SDK for Rust
- **Use Case**: Build fast, concurrent MCP servers

**🖥️ HT MCP**
- **Purpose**: Pure Rust implementation for headless terminal interaction
- **Use Case**: Terminal automation, CLI tool integration

**📚 Rust Docs MCP**
- **Purpose**: Prevents outdated code suggestions with updated Rust documentation
- **Use Case**: Always current Rust API documentation and examples

**⛓️ Substrate MCP**
- **Purpose**: Interact with Substrate-based blockchains
- **Use Case**: Blockchain development, smart contract interaction

**🔄 MCP Proxy**
- **Purpose**: Fast proxy between stdio and SSE protocols
- **Use Case**: Protocol bridging, performance optimization

#### Go MCPs

**🟢 Go SDK**
- **Purpose**: Official SDK maintained with Google for Go development
- **Use Case**: Build Go-based MCP servers with official support

**🔍 MCP Language Server**
- **Purpose**: Semantic tools for Go: definitions, references, diagnostics
- **Use Case**: Code analysis, refactoring assistance, symbol navigation

**🌐 Gin MCP**
- **Purpose**: Expose Gin APIs automatically as MCP tools
- **Use Case**: Web API development, REST service integration

**🗃️ Go MySQL MCP**
- **Purpose**: Easy-to-use MySQL server built in Go
- **Use Case**: Database operations, MySQL integration

**🏹 Go Archer**
- **Purpose**: Visual dependency analysis for Go packages
- **Use Case**: Code architecture visualization, dependency management

#### Multi-Language MCPs

**🧠 Memory Bank MCP**
- **Purpose**: Centralized memory system for AI agents
- **Use Case**: Persistent context, session management, knowledge retention

**🤔 Sequential Thinking MCP**
- **Purpose**: Helps LLMs decompose complex tasks into logical steps
- **Use Case**: Problem-solving assistance, task planning, workflow optimization

**🔍 Brave Search MCP**
- **Purpose**: Privacy-focused web search tool
- **Use Case**: Web research, information gathering, search automation

**🗺️ Google Maps MCP**
- **Purpose**: Integrates Google Maps for geolocation and directions
- **Use Case**: Location services, mapping, geographic data

**🕸️ Deep Graph MCP (Code Graph)**
- **Purpose**: Transforms source code into semantic graphs via DeepGraph
- **Use Case**: Code analysis, dependency visualization, architecture understanding

### How MCP Selection Works

During the interactive setup, you can choose which MCP servers to enable:

```bash
🔧 Select MCP servers to include (use space to select):
  ❯ ◉ TypeScript SDK - Official Anthropic SDK for building MCP servers and clients in JS/TS
    ◉ File System MCP - Local file management; compatible with any language
    ◉ Memory Bank MCP - Centralized memory system for AI agents
    ◯ GitHub MCP - Integration with GitHub API for managing repos, issues, and PRs
    ◯ Puppeteer MCP - Browser automation using Google Puppeteer
    ◯ Slack MCP - Access to real-time Slack conversations and workflows
    ◯ Sequential Thinking MCP - Helps LLMs decompose complex tasks into logical steps
    ◯ Brave Search MCP - Privacy-focused web search tool
    ◯ Google Maps MCP - Integrates Google Maps for geolocation and directions
    ◯ Deep Graph MCP (Code Graph) - Transforms source code into semantic graphs via DeepGraph
```

**Controls:**
- **Space** - Toggle specific MCP server on/off
- **Enter** - Confirm selection
- **← Back** - Return to previous step

### MCP Configuration

Selected MCP servers are configured in the `.mcp.json` file:

```json
{
  "mcpServers": {
    "typescript-sdk": {
      "name": "TypeScript SDK",
      "description": "Official Anthropic SDK for building MCP servers and clients in JS/TS",
      "command": "node",
      "args": ["path/to/ts-sdk-server.js"],
      "env": {}
    },
    "github": {
      "name": "GitHub MCP",
      "description": "Integration with GitHub API for managing repos, issues, and PRs",
      "command": "node",
      "args": ["path/to/server-github"],
      "env": {
        "GITHUB_TOKEN": "..."
      }
    }
  }
}
```

### MCP Benefits

- **🔌 Extended Capabilities** - Access specialized tools and services beyond Claude's base functionality
- **🏗️ Custom Integrations** - Connect Claude to your existing tools and workflows
- **📊 Data Access** - Query databases, APIs, and external services directly
- **🤖 Automation** - Automate complex workflows that require multiple systems
- **🛡️ Controlled Environment** - Each MCP server runs in its own controlled context

## 💡 Usage Examples

### Interactive Setup (Recommended)
```bash
cd my-react-app
npx claude-code-templates
# The installer detects React and suggests optimal configuration
# Use ← Back to modify selections during setup
```

### Framework-Specific Quick Setup
```bash
# React + TypeScript project with all React-specific commands
npx claude-code-templates --language javascript-typescript --framework react --yes

# Node.js API with database and middleware commands
npx claude-code-templates --language javascript-typescript --framework node --yes

# Vue.js project with composables and component commands
npx claude-code-templates --language javascript-typescript --framework vue --yes

# Angular project with services and component commands
npx claude-code-templates --language javascript-typescript --framework angular --yes
```

### Advanced Options
```bash
# Preview what would be installed
npx claude-code-templates --dry-run

# Skip prompts and use defaults
npx claude-code-templates --yes

# Install to different directory
npx claude-code-templates --directory /path/to/project

# Specific language without framework
npx claude-code-templates --language javascript-typescript --framework none --yes
```

## 🗂️ Repository Structure

This repository contains optimized templates for different languages and use cases:

```
claude-code-templates/
├── 📦 cli-tool/              # NPM package for automated installation
├── 📁 common/                # Universal templates for any language
├── 📁 javascript-typescript/ # JS/TS templates with framework support
│   ├── examples/
│   │   ├── react-app/        # React-specific commands
│   │   ├── vue-app/          # Vue.js-specific commands  
│   │   ├── angular-app/      # Angular-specific commands
│   │   └── node-api/         # Node.js-specific commands
│   ├── CLAUDE.md
│   └── .claude/
├── 📁 python/                # Python templates (coming soon)
├── 📁 rust/                  # Rust templates (coming soon)
└── 📁 go/                    # Go templates (coming soon)
```

Each language folder includes:
- **`CLAUDE.md`** - Language-specific configuration and best practices
- **`README.md`** - Detailed setup and usage instructions
- **`.claude/`** - Base commands and settings
- **`examples/`** - Framework-specific configurations and commands

## 🛡️ Safety Features

- **Automatic Backups** - Existing `CLAUDE.md` and `.claude/` files are backed up
- **Confirmation Required** - Always asks before making changes (unless `--yes` flag is used)
- **Dry Run Mode** - Preview what will be installed with `--dry-run`
- **Cancel Anytime** - Press Ctrl+C or answer 'No' to cancel installation
- **Back Navigation** - Go back to modify previous selections during interactive setup

## 🌟 Why Use Claude Code Templates?

### Before (Manual Setup)
```bash
# Create CLAUDE.md manually
# Research best practices for your language and framework
# Set up custom commands for React/Vue/Angular/Node.js/Django/Flask/FastAPI
# Configure linting and formatting for each framework
# Add testing workflows for different frameworks
# Set up automation hooks for code quality
# ... hours of configuration research
```

### After (With Our Templates)
```bash
# JavaScript/TypeScript + React
npx claude-code-templates --language javascript-typescript --framework react --yes

# Python + Django
npx claude-code-templates --language python --framework django --yes

# ✅ Done in 30 seconds with framework-specific commands and automation!
```

### Benefits
- **Save Time** - Skip hours of configuration research and setup
- **Framework-Aware** - Get commands tailored to your specific framework (React hooks, Django models, FastAPI endpoints, etc.)
- **Best Practices** - Use proven configurations optimized for each framework
- **Automation Ready** - Pre-configured hooks for code formatting, linting, testing, and type checking
- **Stay Updated** - Always get the latest templates with `npx`
- **Consistency** - Use the same configuration patterns across all your projects
- **Enhanced UX** - Navigate back and forth during setup to perfect your configuration

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ (for the installer)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed

### Step 1: Install Claude Code
```bash
npm install -g @anthropic-ai/claude-code
```

### Step 2: Set Up Your Project
```bash
cd your-project
npx claude-code-templates
```

### Step 3: Start Coding with Claude
```bash
claude
```

## 📚 Manual Installation (Alternative)

If you prefer manual setup, you can copy templates directly:

```bash
# Clone the repository
git clone https://github.com/davila7/claude-code-templates.git

# Copy templates for JavaScript/TypeScript + React
cp -r claude-code-templates/javascript-typescript/CLAUDE.md your-project/
cp -r claude-code-templates/javascript-typescript/.claude/ your-project/
cp -r claude-code-templates/javascript-typescript/examples/react-app/.claude/commands/* your-project/.claude/commands/

# Or copy Node.js API templates
cp -r claude-code-templates/javascript-typescript/CLAUDE.md your-project/
cp -r claude-code-templates/javascript-typescript/.claude/ your-project/
cp -r claude-code-templates/javascript-typescript/examples/node-api/.claude/commands/* your-project/.claude/commands/
```

## 🤝 Contributing

We welcome contributions! Help us make Claude Code even better for everyone.

### How to Contribute
1. **Fork** this repository
2. **Create** a feature branch (`git checkout -b feature/amazing-template`)
3. **Add** your improvements or new language support
4. **Test** your templates with real projects
5. **Submit** a pull request

### What We're Looking For
- **New Language Support** - Rust, Go, Java, C#, PHP, etc.
- **Framework Templates** - Svelte, Next.js, Nuxt.js, NestJS, Laravel, Spring Boot, etc.
- **Improved Commands** - Better testing, deployment, debugging workflows
- **Documentation** - Clearer guides and examples
- **Bug Fixes** - Improvements to existing templates

### Template Guidelines
- Follow the established folder structure
- Include comprehensive `CLAUDE.md` and `README.md` files
- Add practical custom commands in `.claude/commands/`
- Provide real-world examples
- Test with actual projects before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** for creating Claude Code
- **The Community** - All contributors who help improve these templates
- **Open Source Projects** - Inspiration from create-react-app, vue-cli, and similar tools

## 📞 Support

- **Issues** - [Report bugs or request features](https://github.com/davila7/claude-code-templates/issues)
- **Discussions** - [Join community discussions](https://github.com/davila7/claude-code-templates/discussions)
- **Documentation** - [Claude Code Official Docs](https://docs.anthropic.com/en/docs/claude-code)

---

**⭐ Found this useful? Give us a star on GitHub!**

**🚀 Ready to supercharge your development with Claude Code? Run `npx claude-code-templates` now!**
