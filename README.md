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
    - Python (Coming Soon)
    - Rust (Coming Soon)  
    - Go (Coming Soon)

🎯 Select your framework (optional):
  ← Back
  ❯ None / Generic
    React
    Vue.js
    Angular
    Node.js

⚙️ Select additional features:
  ← Back
  ❯ ◉ Enhanced testing commands
    ◉ Code linting and formatting
    ◯ Git hooks integration
    ◯ Debugging helpers

🚀 Setup Claude Code for JavaScript/TypeScript with React?
  ← Back to modify settings
  ❯ ✅ Yes, proceed with setup
    ❌ No, cancel setup

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

### Generic/Multi-language Projects

```bash
# Universal configuration for any language
npx claude-code-templates --language common --yes
```

### Coming Soon
```bash
# Python projects (uses basic configuration for now)
npx claude-code-templates --language python --yes

# Rust projects (uses basic configuration for now)  
npx claude-code-templates --language rust --yes

# Go projects (uses basic configuration for now)
npx claude-code-templates --language go --yes
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
- **Python** ⏳ - Coming Soon (basic configuration available)
- **Rust** ⏳ - Coming Soon (basic configuration available)
- **Go** ⏳ - Coming Soon (basic configuration available)
- **Common** ✅ - Universal configuration for any language

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
# Set up custom commands for React/Vue/Angular/Node.js
# Configure linting and formatting for each framework
# Add testing workflows for different frameworks
# ... hours of configuration research
```

### After (With Our Templates)
```bash
npx claude-code-templates --language javascript-typescript --framework react --yes
# ✅ Done in 30 seconds with React-specific commands!
```

### Benefits
- **Save Time** - Skip hours of configuration research and setup
- **Framework-Aware** - Get commands tailored to your specific framework (React hooks, Vue composables, etc.)
- **Best Practices** - Use proven configurations optimized for each framework
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
- **New Language Support** - Python, Rust, Go, Java, C#, PHP, etc.
- **Framework Templates** - Svelte, Next.js, Nuxt.js, NestJS, FastAPI, etc.
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
