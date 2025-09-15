---
sidebar_position: 3
---

# Health Check

Comprehensive system validation and optimization recommendations for your Claude Code setup.

## 🏥 What is Health Check?

Health Check is a diagnostic tool that validates your entire Claude Code environment, analyzes your configuration, and provides actionable recommendations for optimal performance.

## 🚀 Run Health Check

```bash
npx claude-code-templates@latest --health-check
```

**Alternative commands:**
```bash
npx claude-code-templates@latest --health
npx claude-code-templates@latest --check  
npx claude-code-templates@latest --verify
```

## 🔍 What Gets Checked

### System Requirements Verification
- **Node.js version** - Ensures v14.0.0+ compatibility
- **npm version** - Verifies v6.0.0+ installation
- **Git installation** - Checks for Git availability
- **Memory availability** - Validates sufficient RAM
- **Network connectivity** - Tests internet and GitHub access
- **Disk space** - Ensures adequate storage for components

### Claude Code Setup Validation
- **Installation integrity** - Verifies Claude Code installation
- **Authentication status** - Checks API key configuration
- **Permission levels** - Validates file system permissions
- **Configuration files** - Analyzes `.claude/` directory structure
- **Environment variables** - Checks required environment setup

### Project Configuration Analysis
- **CLAUDE.md file** - Validates project-specific instructions
- **Component installation** - Verifies installed agents, commands, MCPs
- **Settings validation** - Checks configuration file integrity
- **Hook functionality** - Tests automation hook setup
- **File structure** - Analyzes project organization

### Component Integrity Check
- **Agent validation** - Verifies agent configurations and dependencies
- **Command availability** - Tests custom slash command functionality
- **MCP connections** - Validates external service integrations
- **Setting effectiveness** - Checks configuration impact
- **Hook execution** - Tests automation trigger functionality

### Performance Assessment
- **Response times** - Measures Claude Code performance
- **Memory usage** - Analyzes resource consumption
- **File access speed** - Tests file system performance
- **Network latency** - Measures API communication speed
- **Component load times** - Checks startup performance

## 📊 Health Score System

### Overall Health Percentage
The health check provides an overall score (0-100%) based on:
- **Critical issues** (major impact on functionality)
- **Warnings** (performance or configuration concerns)
- **Recommendations** (optimization opportunities)
- **Best practices** (adherence to recommended setup)

### Score Categories
- **90-100%**: Excellent - Optimal configuration
- **75-89%**: Good - Minor improvements possible
- **60-74%**: Fair - Some issues need attention
- **40-59%**: Poor - Multiple problems requiring fixes
- **0-39%**: Critical - Major issues preventing proper function

## 🛠️ Common Issues and Fixes

### Environment Issues
**Node.js version too old:**
```bash
# Update Node.js to v14.0.0 or higher
# Visit nodejs.org for latest version
```

**Missing Git installation:**
```bash
# Install Git from git-scm.com
# Or use package manager (brew, apt, etc.)
```

**Network connectivity problems:**
```bash
# Check internet connection
# Verify GitHub access: git ls-remote https://github.com/anthropics/claude-code-templates
```

### Configuration Problems
**Missing API keys:**
```bash
# Add to .env file:
# ANTHROPIC_API_KEY=your_key_here
```

**Corrupted component files:**
```bash
# Reinstall affected components
npx claude-code-templates@latest --agent development/frontend-developer --yes
```

**Permission errors:**
```bash
# Fix file permissions
chmod -R 755 .claude/
```

### Performance Issues
**Slow response times:**
- **Clear component cache** - Remove `.claude/cache/` directory
- **Update components** - Reinstall with latest versions
- **Check system resources** - Close unnecessary applications

**High memory usage:**
- **Review installed components** - Remove unused agents/commands
- **Optimize settings** - Use performance optimization settings
- **Restart Claude Code** - Fresh session can resolve memory leaks

## 📋 Health Check Report

### Report Sections
1. **Executive Summary** - Overall health score and critical issues
2. **System Environment** - Hardware and software requirements
3. **Claude Code Configuration** - Installation and setup status
4. **Component Analysis** - Individual component health
5. **Performance Metrics** - Speed and resource usage
6. **Recommendations** - Actionable improvement suggestions

### Report Formats
- **Terminal output** - Immediate results in command line
- **Detailed logging** - Complete analysis saved to file
- **JSON export** - Machine-readable results for automation
- **HTML report** - Formatted report for sharing

## ⏰ When to Run Health Check

### Regular Maintenance
- **Weekly** - For active development projects
- **After updates** - When updating Claude Code or components
- **Before important work** - Prior to critical development sessions
- **When experiencing issues** - For troubleshooting problems

### Specific Triggers
- **New project setup** - Validate initial configuration
- **Component installation** - Verify successful installation
- **Performance degradation** - Diagnose slowdowns or errors
- **Team onboarding** - Ensure consistent setup across team

### Integration Points
- **CI/CD pipelines** - Automated environment validation
- **Development scripts** - Pre-development environment checks
- **Team workflows** - Shared health validation processes
- **Deployment preparation** - Pre-deployment environment verification

## 🔧 Advanced Options

### Verbose Mode
```bash
npx claude-code-templates@latest --health-check --verbose
```
Provides detailed diagnostic information for troubleshooting.

### Component-Specific Checks
```bash
# Check specific component types
npx claude-code-templates@latest --health-check --agents-only
npx claude-code-templates@latest --health-check --mcps-only
```

### Export Results
```bash
# Save results to file
npx claude-code-templates@latest --health-check --output health-report.json
```

## 💡 Pro Tips

- **Run before important work** to ensure optimal Claude Code performance
- **Schedule regular checks** to maintain system health over time
- **Share reports with team** to ensure consistent development environments
- **Use verbose mode** when troubleshooting specific issues
- **Combine with analytics** to correlate health issues with performance metrics
- **Document improvements** to track system optimization over time

---

**Next:** Try the [Chats Interface](./chats) for mobile-optimized Claude Code conversations.