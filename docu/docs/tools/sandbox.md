---
sidebar_position: 6
---

# E2B Sandbox

Execute Claude Code in isolated cloud environments for safe testing, experimentation, and resource-intensive tasks.

## ☁️ What is E2B Sandbox?

E2B Sandbox provides secure, isolated cloud environments where you can run Claude Code safely without affecting your local system. Perfect for testing experimental code, running resource-intensive tasks, or ensuring clean execution environments.

## 🔑 Setup Requirements

### API Keys Required
Add these to your `.env` file:

```bash
ANTHROPIC_API_KEY=your_anthropic_key_here
# Required for Claude Code access
E2B_API_KEY=your_e2b_key_here
```

**Get API Keys:**
- [Anthropic API Key](https://console.anthropic.com/) - For Claude Code access
- [E2B API Key](https://e2b.dev/) - For cloud sandbox environments

### System Requirements
- **Claude Code v1.0.0+** - Latest version support
- **Internet connection** - For cloud environment access
- **Valid API keys** - Both Anthropic and E2B keys required

## 🚀 Execute in Sandbox

### Basic Sandbox Execution
```bash
npx claude-code-templates@latest --sandbox e2b --prompt "your development task"
```

### With Specific Components
```bash
# With specific agent
npx claude-code-templates@latest --sandbox e2b --agent development/frontend-developer --prompt "optimize my React components"

# With multiple components
npx claude-code-templates@latest --sandbox e2b --agent data-ai/ml-engineer --command testing/generate-tests --prompt "analyze this dataset and create tests"
```

### Advanced Execution
```bash
# With specific environment and timeout
npx claude-code-templates@latest --sandbox e2b --agent security/security-auditor --prompt "audit this codebase" --timeout 300
```

## 🔒 Isolation Features

### Complete Environment Isolation
- **Sandboxed execution** - No access to your local file system
- **Network isolation** - Controlled internet access
- **Process isolation** - Separate process space from your system
- **Resource limits** - Memory and CPU usage boundaries
- **Automatic cleanup** - Environment destroyed after execution

### Security Benefits
- **Safe code testing** - Run potentially harmful code safely
- **Malware protection** - Isolated from your main system
- **Data protection** - Local files remain untouched
- **Clean state** - Fresh environment for each execution
- **No persistent changes** - No permanent modifications to your system

## 🛠️ Cloud Environment Features

### Full Development Environment
- **Complete toolchain** - All major development tools pre-installed
- **Multiple languages** - Support for Python, Node.js, Go, Rust, and more
- **Package managers** - npm, pip, cargo, go modules available
- **Version control** - Git and other VCS tools included
- **Development utilities** - Editors, compilers, interpreters ready

### Pre-installed Tools
- **Languages**: Python 3.x, Node.js, Go, Rust, Java, C/C++
- **Package Managers**: npm, yarn, pip, poetry, cargo, maven
- **Development Tools**: git, vim, nano, curl, wget
- **Database Tools**: sqlite, postgresql-client, mysql-client
- **Cloud CLIs**: aws-cli, gcloud, azure-cli
- **Utilities**: jq, grep, sed, awk, and standard Unix tools

### Resource Specifications
- **CPU**: Multi-core processing capability
- **Memory**: Sufficient RAM for development tasks
- **Storage**: Temporary storage for session files
- **Network**: High-speed internet for package downloads
- **Runtime**: Configurable execution timeouts

## 🎯 Use Cases

### Safe Code Testing
- **Experimental code** - Test new libraries or frameworks safely
- **Third-party code** - Run untrusted code in isolation
- **Security testing** - Test security tools and vulnerability scanners
- **Destructive operations** - Test code that might damage file systems
- **System modifications** - Test system-level changes safely

### Resource-Intensive Tasks
- **Large data processing** - Handle big datasets without local resource limits
- **Machine learning training** - Train models using cloud resources
- **Compilation tasks** - Compile large codebases faster
- **Performance testing** - Run benchmarks without affecting local system
- **Parallel processing** - Utilize cloud parallelization capabilities

### Clean Environment Testing
- **Dependency testing** - Test code with fresh dependency installations
- **Environment validation** - Verify code works in clean environments
- **Installation testing** - Test installation scripts and procedures
- **Cross-platform testing** - Test on different OS configurations
- **Reproducible builds** - Ensure consistent build environments

### Development and Learning
- **Learning new technologies** - Experiment without cluttering local system
- **Code tutorials** - Follow tutorials in isolated environments
- **Prototyping** - Rapid prototyping without local setup overhead
- **Code reviews** - Review and test code changes safely
- **Debugging** - Debug issues in controlled environments

## 📊 Real-time Execution

### Live Output Streaming
- **Real-time results** - See execution output as it happens
- **Progress monitoring** - Track long-running task progress
- **Error reporting** - Immediate feedback on errors and issues
- **Interactive debugging** - Debug issues as they occur
- **Performance metrics** - Monitor resource usage during execution

### Execution Controls
- **Timeout management** - Set maximum execution times
- **Resource monitoring** - Track CPU and memory usage
- **Process control** - Start, stop, and manage running processes
- **Output buffering** - Manage large output streams efficiently
- **Error handling** - Graceful handling of execution failures

## ⚙️ Environment Configuration

### Environment Types
- **Standard Environment** - General-purpose development environment
- **Specialized Environments** - Optimized for specific languages or frameworks
- **Custom Environments** - User-defined environment configurations
- **Minimal Environments** - Lightweight environments for simple tasks
- **GPU Environments** - GPU-enabled environments for ML/AI workloads

### Configuration Options
- **Language versions** - Specify exact language versions needed
- **Package pre-installation** - Pre-install commonly used packages
- **Environment variables** - Set custom environment variables
- **Working directory** - Configure initial working directory
- **Resource limits** - Set CPU, memory, and storage limits

### Persistence Options
- **Session persistence** - Maintain state across multiple executions
- **File persistence** - Keep files between sandbox sessions
- **Package caching** - Cache installed packages for faster startup
- **Environment snapshots** - Save environment state for reuse
- **Result export** - Export execution results and artifacts

## 🔧 Best Practices

### Security Best Practices
- **API key management** - Store API keys securely in `.env` files
- **Access control** - Limit sandbox access to trusted users
- **Code review** - Review code before sandbox execution
- **Resource monitoring** - Monitor usage to prevent abuse
- **Regular cleanup** - Clean up unused sandbox instances

### Performance Optimization
- **Efficient code** - Write efficient code to reduce execution time
- **Resource planning** - Plan resource usage for optimal performance
- **Parallel execution** - Use parallelization when possible
- **Caching strategies** - Use caching to reduce redundant operations
- **Monitoring usage** - Track usage patterns for optimization

### Development Workflow
- **Local testing first** - Test locally before using sandbox
- **Incremental development** - Use sandbox for iterative development
- **Version control** - Use version control for sandbox code
- **Documentation** - Document sandbox usage and configurations
- **Team coordination** - Coordinate sandbox usage in team environments

## 💡 Pro Tips

- **Test locally first** - Ensure code works locally before sandbox execution
- **Use with components** - Combine sandbox with specific agents for enhanced capabilities
- **Monitor resource usage** - Keep track of API usage and costs
- **Save important results** - Export or save important execution results
- **Use appropriate timeouts** - Set reasonable timeouts for your tasks
- **Leverage pre-installed tools** - Use built-in tools to avoid setup overhead
- **Batch related tasks** - Combine related operations in single sandbox sessions

---

**Complete your toolkit:** Return to [Additional Tools Overview](./overview) to explore tool combinations and advanced workflows.