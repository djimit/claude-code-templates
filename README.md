[![npm version](https://img.shields.io/npm/v/claude-code-templates.svg)](https://www.npmjs.com/package/claude-code-templates)
[![npm downloads](https://img.shields.io/npm/dt/claude-code-templates.svg)](https://www.npmjs.com/package/claude-code-templates)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub stars](https://img.shields.io/github/stars/davila7/claude-code-templates.svg?style=social&label=Star)](https://github.com/davila7/claude-code-templates)
[![Open in DeepGraph](https://img.shields.io/badge/%E2%9C%A8%20Open%20in-DeepGraph-a465f7?style=flat)](https://www.deepgraph.co/davila7/claude-code-templates)

# Claude Code Templates

**CLI tool for configuring and monitoring Claude Code** - Quick setup for any project with framework-specific commands, mobile-first chats interface, and real-time monitoring dashboard.

## 🚀 Quick Start

```bash
# Interactive setup (recommended)
npx claude-code-templates@latest

# Mobile-first chats interface ⭐ NEW!
npx claude-code-templates@latest --chats

# With secure remote access via Cloudflare Tunnel
npx claude-code-templates@latest --chats --tunnel

# Real-time analytics dashboard  
npx claude-code-templates@latest --analytics

# System health check
npx claude-code-templates@latest --health-check
```

> **📌 Note**: For `--tunnel` option, you need [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) installed:
> ```bash
> # macOS
> brew install cloudflared
> 
> # Windows  
> winget install --id Cloudflare.cloudflared
> 
> # Linux
> apt-get install cloudflared
> ```

<img width="1279" height="827" alt="Claude Code Analytics Dashboard" src="https://github.com/user-attachments/assets/02cbe18b-21ed-4b8f-83e9-da86b4fcd95b" />

---

## ✨ Core Features

- **📱 Mobile Chats Interface** - AI-optimized mobile-first interface with intelligent auto-scroll and real-time WebSocket updates
- **🌐 Cloudflare Tunnel Support** - Secure remote access with automatic tunnel setup and URL detection
- **📋 Smart Project Setup** - Auto-detect and configure any project with framework-specific commands
- **📊 Real-time Analytics** - Monitor Claude Code sessions with live state detection and performance metrics  
- **🔍 Health Check** - Comprehensive system validation with actionable recommendations
- **🧩 Individual Components** - Install specialized agents, commands, and MCPs individually

## 🌐 Browse & Install Components

**[🎯 Browse All Components](https://aitmpl.com)** - Interactive web interface to explore and install templates, agents, commands, and MCPs.

<img width="1155" height="855" alt="Browse Components Interface" src="https://github.com/user-attachments/assets/72b89472-890f-40a1-b89f-28441e6a8ce4" />

## 🎯 What You Get

| Component | Description | Example |
|-----------|-------------|---------|
| **CLAUDE.md** | Project-specific configuration | Framework best practices, coding standards |
| **Commands** | Custom slash commands | `/generate-tests`, `/check-file`, `/optimize-bundle` |
| **Agents** | AI specialists for domains | API security audit, React performance, database optimization |
| **MCPs** | External service integrations | GitHub, databases, development tools |
| **Analytics** | Real-time monitoring dashboard | Live session tracking, usage statistics, exports |

## 📖 Documentation

**[📚 Complete Documentation](https://docs.aitmpl.com/)** - Comprehensive guides, examples, and API reference

Quick links:
- [Getting Started](https://docs.aitmpl.com/docs/intro) - Installation and first steps
- [Project Setup](https://docs.aitmpl.com/docs/project-setup/interactive-setup) - Configure your projects
- [Analytics Dashboard](https://docs.aitmpl.com/docs/analytics/overview) - Real-time monitoring
- [Individual Components](https://docs.aitmpl.com/docs/components/overview) - Agents, Commands, MCPs
- [CLI Options](https://docs.aitmpl.com/docs/cli-options) - All available commands
- **[🔍 Tracking System Architecture](TRACKING_SYSTEM.md)** - Technical documentation with Mermaid diagrams

## 🤝 Contributing

We welcome contributions from the open source community! 

**[🎯 Browse Components](https://aitmpl.com)** to see what's available, then check our [contributing guidelines](CONTRIBUTING.md) to add your own templates, agents, commands, or MCPs.

**Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.**

## Attribution

This collection includes components from multiple sources:

**Agents Collection:**
- **wshobson/agents Collection** by [wshobson](https://github.com/wshobson/agents) - Licensed under MIT License (48 agents)

**Commands Collection:**
- **awesome-claude-code Commands** by [hesreallyhim](https://github.com/hesreallyhim/awesome-claude-code) - Licensed under CC0 1.0 Universal (21 commands)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **🌐 Browse Components**: [aitmpl.com](https://aitmpl.com)
- **📚 Documentation**: [docs.aitmpl.com](https://docs.aitmpl.com)
- **🐛 Issues**: [GitHub Issues](https://github.com/davila7/claude-code-templates/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/davila7/claude-code-templates/discussions)
- **🔒 Security**: [Security Policy](SECURITY.md)

## ⭐ Star History

<a href="https://star-history.com/#davila7/claude-code-templates&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=davila7/claude-code-templates&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=davila7/claude-code-templates&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=davila7/claude-code-templates&type=Date" />
  </picture>
</a>

---

**⭐ Found this useful? Give us a star to support the project!**