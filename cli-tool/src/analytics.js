const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const chokidar = require('chokidar');
const open = require('open');
const os = require('os');

class ClaudeAnalytics {
  constructor() {
    this.app = express();
    this.port = 3333;
    this.data = {
      conversations: [],
      summary: {},
      activeProjects: [],
      realtimeStats: {
        totalSessions: 0,
        totalTokens: 0,
        activeProjects: 0,
        lastActivity: null
      }
    };
    this.watchers = [];
  }

  async initialize() {
    const homeDir = os.homedir();
    this.claudeDir = path.join(homeDir, '.claude');
    this.claudeDesktopDir = path.join(homeDir, 'Library', 'Application Support', 'Claude');
    
    // Check if Claude directories exist
    if (!await fs.pathExists(this.claudeDir)) {
      throw new Error(`Claude Code directory not found at ${this.claudeDir}`);
    }

    await this.loadInitialData();
    this.setupFileWatchers();
    this.setupWebServer();
  }

  async loadInitialData() {
    console.log(chalk.yellow('📊 Analyzing Claude Code data...'));
    
    try {
      // Load conversation files
      const conversations = await this.loadConversations();
      this.data.conversations = conversations;
      
      // Load active projects
      const projects = await this.loadActiveProjects();
      this.data.activeProjects = projects;
      
      // Calculate summary statistics
      this.data.summary = this.calculateSummary(conversations, projects);
      
      // Update realtime stats
      this.updateRealtimeStats();
      
      console.log(chalk.green('✅ Data analysis complete'));
      console.log(chalk.gray(`Found ${conversations.length} conversations across ${projects.length} projects`));
      
    } catch (error) {
      console.error(chalk.red('Error loading Claude data:'), error.message);
      throw error;
    }
  }

  async loadConversations() {
    const conversations = [];
    
    try {
      // Search for .jsonl files recursively in all subdirectories
      const findJsonlFiles = async (dir) => {
        const files = [];
        const items = await fs.readdir(dir);
        
        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stats = await fs.stat(itemPath);
          
          if (stats.isDirectory()) {
            // Recursively search subdirectories
            const subFiles = await findJsonlFiles(itemPath);
            files.push(...subFiles);
          } else if (item.endsWith('.jsonl')) {
            files.push(itemPath);
          }
        }
        
        return files;
      };
      
      const jsonlFiles = await findJsonlFiles(this.claudeDir);
      console.log(chalk.blue(`Found ${jsonlFiles.length} conversation files`));
      
      for (const filePath of jsonlFiles) {
        const stats = await fs.stat(filePath);
        const filename = path.basename(filePath);
        
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const lines = content.trim().split('\n').filter(line => line.trim());
          const messages = lines.map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          }).filter(Boolean);
          
          // Extract project name from path
          const projectFromPath = this.extractProjectFromPath(filePath);
          
          // Parse messages to get their content for status determination
          const parsedMessages = lines.map(line => {
            try {
              const item = JSON.parse(line);
              if (item.message && item.message.role) {
                return {
                  role: item.message.role,
                  timestamp: new Date(item.timestamp),
                  content: item.message.content
                };
              }
            } catch {}
            return null;
          }).filter(Boolean);

          const conversation = {
            id: filename.replace('.jsonl', ''),
            filename: filename,
            filePath: filePath,
            messageCount: parsedMessages.length,
            fileSize: stats.size,
            lastModified: stats.mtime,
            created: stats.birthtime,
            tokens: this.estimateTokens(content),
            project: projectFromPath || this.extractProjectFromConversation(parsedMessages),
            status: this.determineConversationStatus(parsedMessages, stats.mtime),
            conversationState: this.determineConversationState(parsedMessages, stats.mtime),
            statusSquares: this.generateStatusSquares(parsedMessages)
          };
          
          conversations.push(conversation);
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Could not parse ${filename}:`, error.message));
        }
      }
      
      return conversations.sort((a, b) => b.lastModified - a.lastModified);
    } catch (error) {
      console.error(chalk.red('Error loading conversations:'), error.message);
      return [];
    }
  }

  async loadActiveProjects() {
    const projects = [];
    
    try {
      const files = await fs.readdir(this.claudeDir);
      
      for (const file of files) {
        const filePath = path.join(this.claudeDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isDirectory() && !file.startsWith('.')) {
          const projectPath = filePath;
          const todoFiles = await this.findTodoFiles(projectPath);
          
          const project = {
            name: file,
            path: projectPath,
            lastActivity: stats.mtime,
            todoFiles: todoFiles.length,
            status: this.determineProjectStatus(stats.mtime)
          };
          
          projects.push(project);
        }
      }
      
      return projects.sort((a, b) => b.lastActivity - a.lastActivity);
    } catch (error) {
      console.error(chalk.red('Error loading projects:'), error.message);
      return [];
    }
  }

  async findTodoFiles(projectPath) {
    try {
      const files = await fs.readdir(projectPath);
      return files.filter(file => file.includes('todo') || file.includes('TODO'));
    } catch {
      return [];
    }
  }

  estimateTokens(text) {
    // Simple token estimation (roughly 4 characters per token)
    return Math.ceil(text.length / 4);
  }

  extractProjectFromPath(filePath) {
    // Extract project name from file path like:
    // /Users/user/.claude/projects/-Users-user-Projects-MyProject/conversation.jsonl
    const pathParts = filePath.split('/');
    const projectIndex = pathParts.findIndex(part => part === 'projects');
    
    if (projectIndex !== -1 && projectIndex + 1 < pathParts.length) {
      const projectDir = pathParts[projectIndex + 1];
      // Clean up the project directory name
      const cleanName = projectDir
        .replace(/^-/, '')
        .replace(/-/g, '/')
        .split('/')
        .pop() || 'Unknown';
      
      return cleanName;
    }
    
    return null;
  }

  extractProjectFromConversation(messages) {
    // Try to extract project information from conversation
    for (const message of messages.slice(0, 5)) {
      if (message.content && typeof message.content === 'string') {
        const pathMatch = message.content.match(/\/([^\/\s]+)$/);
        if (pathMatch) {
          return pathMatch[1];
        }
      }
    }
    return 'Unknown';
  }

  determineConversationStatus(messages, lastModified) {
    const now = new Date();
    const timeDiff = now - lastModified;
    const minutesAgo = timeDiff / (1000 * 60);
    
    if (messages.length === 0) {
      return minutesAgo < 5 ? 'active' : 'inactive';
    }
    
    // Sort messages by timestamp to get the actual conversation flow
    const sortedMessages = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const lastMessage = sortedMessages[sortedMessages.length - 1];
    const lastMessageTime = new Date(lastMessage.timestamp);
    const lastMessageMinutesAgo = (now - lastMessageTime) / (1000 * 60);
    
    // Simplified status logic - typing is now part of active
    if (lastMessage.role === 'user' && lastMessageMinutesAgo < 3) {
      return 'active';
    } else if (lastMessage.role === 'assistant' && lastMessageMinutesAgo < 5) {
      return 'active';
    }
    
    // Fallback to file modification time for edge cases
    if (minutesAgo < 5) return 'active';
    if (minutesAgo < 60) return 'recent';
    return 'inactive';
  }

  determineConversationState(messages, lastModified) {
    const now = new Date();
    const timeDiff = now - lastModified;
    const minutesAgo = timeDiff / (1000 * 60);
    
    if (messages.length === 0) {
      return minutesAgo < 5 ? 'Waiting for input...' : 'Idle';
    }
    
    // Sort messages by timestamp to get the actual conversation flow
    const sortedMessages = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const lastMessage = sortedMessages[sortedMessages.length - 1];
    const lastMessageTime = new Date(lastMessage.timestamp);
    const lastMessageMinutesAgo = (now - lastMessageTime) / (1000 * 60);
    
    // Detailed conversation state logic
    if (lastMessage.role === 'user') {
      // User sent last message
      if (lastMessageMinutesAgo < 0.5) {
        return 'Claude Code working...';
      } else if (lastMessageMinutesAgo < 3) {
        return 'Awaiting response...';
      } else {
        return 'User typing...';
      }
    } else if (lastMessage.role === 'assistant') {
      // Assistant sent last message
      if (lastMessageMinutesAgo < 2) {
        return 'Awaiting user input...';
      } else if (lastMessageMinutesAgo < 5) {
        return 'User may be typing...';
      }
    }
    
    // Fallback states
    if (minutesAgo < 5) return 'Recently active';
    if (minutesAgo < 60) return 'Idle';
    return 'Inactive';
  }

  generateStatusSquares(messages) {
    if (!messages || messages.length === 0) {
      return [];
    }

    // Sort messages by timestamp and take last 10 for status squares
    const sortedMessages = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const recentMessages = sortedMessages.slice(-10);
    
    return recentMessages.map((message, index) => {
      const messageNum = sortedMessages.length - recentMessages.length + index + 1;
      
      // Determine status based on message content and role
      if (message.role === 'user') {
        return {
          type: 'pending',
          tooltip: `Message #${messageNum}: User input`
        };
      } else if (message.role === 'assistant') {
        // Check if the message contains tool usage or errors
        const content = message.content || '';
        
        if (typeof content === 'string') {
          if (content.includes('[Tool:') || content.includes('tool_use')) {
            return {
              type: 'tool',
              tooltip: `Message #${messageNum}: Tool execution`
            };
          } else if (content.includes('error') || content.includes('Error') || content.includes('failed')) {
            return {
              type: 'error',
              tooltip: `Message #${messageNum}: Error in response`
            };
          } else {
            return {
              type: 'success',
              tooltip: `Message #${messageNum}: Successful response`
            };
          }
        } else if (Array.isArray(content)) {
          // Check for tool_use blocks in array content
          const hasToolUse = content.some(block => block.type === 'tool_use');
          const hasError = content.some(block => 
            block.type === 'text' && (block.text?.includes('error') || block.text?.includes('Error'))
          );
          
          if (hasError) {
            return {
              type: 'error',
              tooltip: `Message #${messageNum}: Error in response`
            };
          } else if (hasToolUse) {
            return {
              type: 'tool',
              tooltip: `Message #${messageNum}: Tool execution`
            };
          } else {
            return {
              type: 'success',
              tooltip: `Message #${messageNum}: Successful response`
            };
          }
        }
      }
      
      return {
        type: 'pending',
        tooltip: `Message #${messageNum}: Unknown status`
      };
    });
  }

  determineProjectStatus(lastActivity) {
    const now = new Date();
    const timeDiff = now - lastActivity;
    const hoursAgo = timeDiff / (1000 * 60 * 60);
    
    if (hoursAgo < 1) return 'active';
    if (hoursAgo < 24) return 'recent';
    return 'inactive';
  }

  calculateSummary(conversations, projects) {
    const totalTokens = conversations.reduce((sum, conv) => sum + conv.tokens, 0);
    const totalSessions = conversations.length;
    const activeConversations = conversations.filter(c => c.status === 'active').length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    
    const avgTokensPerSession = totalSessions > 0 ? Math.round(totalTokens / totalSessions) : 0;
    const totalFileSize = conversations.reduce((sum, conv) => sum + conv.fileSize, 0);
    
    return {
      totalSessions,
      totalTokens,
      activeConversations,
      activeProjects,
      avgTokensPerSession,
      totalFileSize: this.formatBytes(totalFileSize),
      lastActivity: conversations.length > 0 ? conversations[0].lastModified : null
    };
  }

  updateRealtimeStats() {
    this.data.realtimeStats = {
      totalSessions: this.data.conversations.length,
      totalTokens: this.data.conversations.reduce((sum, conv) => sum + conv.tokens, 0),
      activeProjects: this.data.activeProjects.filter(p => p.status === 'active').length,
      lastActivity: this.data.summary.lastActivity
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  setupFileWatchers() {
    console.log(chalk.blue('👀 Setting up file watchers for real-time updates...'));
    
    // Watch conversation files recursively in all subdirectories
    const conversationWatcher = chokidar.watch([
      path.join(this.claudeDir, '**/*.jsonl')
    ], {
      persistent: true,
      ignoreInitial: true
    });
    
    conversationWatcher.on('change', async () => {
      console.log(chalk.yellow('🔄 Conversation file changed, updating data...'));
      await this.loadInitialData();
      console.log(chalk.green('✅ Data updated'));
    });
    
    conversationWatcher.on('add', async () => {
      console.log(chalk.yellow('📝 New conversation file detected...'));
      await this.loadInitialData();
      console.log(chalk.green('✅ Data updated'));
    });
    
    this.watchers.push(conversationWatcher);
    
    // Watch project directories
    const projectWatcher = chokidar.watch(this.claudeDir, {
      persistent: true,
      ignoreInitial: true,
      depth: 2  // Increased depth to catch subdirectories
    });
    
    projectWatcher.on('addDir', async () => {
      console.log(chalk.yellow('📁 New project directory detected...'));
      await this.loadInitialData();
      console.log(chalk.green('✅ Data updated'));
    });
    
    projectWatcher.on('change', async () => {
      console.log(chalk.yellow('📁 Project directory changed...'));
      await this.loadInitialData();
      console.log(chalk.green('✅ Data updated'));
    });
    
    this.watchers.push(projectWatcher);
    
    // Also set up periodic refresh to catch any missed changes
    setInterval(async () => {
      console.log(chalk.blue('⏱️  Periodic data refresh...'));
      await this.loadInitialData();
    }, 30000); // Every 30 seconds
  }

  setupWebServer() {
    // Serve static files (we'll create the dashboard HTML)
    this.app.use(express.static(path.join(__dirname, 'analytics-web')));
    
    // API endpoints
    this.app.get('/api/data', async (req, res) => {
      // Add timestamp to verify data freshness
      const dataWithTimestamp = {
        ...this.data,
        timestamp: new Date().toISOString(),
        lastUpdate: new Date().toLocaleString()
      };
      res.json(dataWithTimestamp);
    });
    
    this.app.get('/api/realtime', async (req, res) => {
      const realtimeWithTimestamp = {
        ...this.data.realtimeStats,
        timestamp: new Date().toISOString(),
        lastUpdate: new Date().toLocaleString()
      };
      res.json(realtimeWithTimestamp);
    });
    
    // Force refresh endpoint
    this.app.get('/api/refresh', async (req, res) => {
      console.log(chalk.blue('🔄 Manual refresh requested...'));
      await this.loadInitialData();
      res.json({ 
        success: true, 
        message: 'Data refreshed',
        timestamp: new Date().toISOString()
      });
    });
    
    // Session detail endpoint
    this.app.get('/api/session/:sessionId', async (req, res) => {
      const sessionId = req.params.sessionId;
      
      try {
        const session = this.data.conversations.find(conv => conv.id === sessionId);
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }
        
        // Read the actual conversation file
        const content = await fs.readFile(session.filePath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.trim());
        const rawMessages = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);
        
        // Extract actual messages from Claude Code format
        const messages = rawMessages.map(item => {
          if (item.message && item.message.role) {
            let content = '';
            
            if (typeof item.message.content === 'string') {
              content = item.message.content;
            } else if (Array.isArray(item.message.content)) {
              content = item.message.content
                .map(block => {
                  if (block.type === 'text') return block.text;
                  if (block.type === 'tool_use') return `[Tool: ${block.name}]`;
                  if (block.type === 'tool_result') return '[Tool Result]';
                  return block.content || '';
                })
                .join('\n');
            } else if (item.message.content && item.message.content.length) {
              content = item.message.content[0].text || '';
            }
            
            return {
              role: item.message.role,
              content: content || 'No content',
              timestamp: item.timestamp,
              type: item.type
            };
          }
          return null;
        }).filter(Boolean);
        
        res.json({
          session: session,
          messages: messages,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error(chalk.red('Error loading session details:'), error.message);
        res.status(500).json({ error: 'Failed to load session details' });
      }
    });
    
    // Main dashboard route
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'analytics-web', 'index.html'));
    });
  }

  async startServer() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(chalk.green(`🚀 Analytics dashboard started at http://localhost:${this.port}`));
        resolve();
      });
    });
  }

  async openBrowser() {
    try {
      await open(`http://localhost:${this.port}`);
      console.log(chalk.blue('🌐 Opening browser...'));
    } catch (error) {
      console.log(chalk.yellow('Could not open browser automatically. Please visit:'));
      console.log(chalk.cyan(`http://localhost:${this.port}`));
    }
  }

  stop() {
    // Clean up watchers
    this.watchers.forEach(watcher => watcher.close());
    
    // Stop server
    if (this.server) {
      this.server.close();
    }
    
    console.log(chalk.yellow('Analytics dashboard stopped'));
  }
}

async function runAnalytics(options = {}) {
  console.log(chalk.blue('📊 Starting Claude Code Analytics Dashboard...'));
  
  const analytics = new ClaudeAnalytics();
  
  try {
    await analytics.initialize();
    
    // Create web dashboard files
    await createWebDashboard();
    
    await analytics.startServer();
    await analytics.openBrowser();
    
    console.log(chalk.green('✅ Analytics dashboard is running!'));
    console.log(chalk.gray('Press Ctrl+C to stop the server'));
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛑 Shutting down analytics dashboard...'));
      analytics.stop();
      process.exit(0);
    });
    
    // Keep the process running
    await new Promise(() => {});
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to start analytics dashboard:'), error.message);
    process.exit(1);
  }
}

async function createWebDashboard() {
  const webDir = path.join(__dirname, 'analytics-web');
  await fs.ensureDir(webDir);
  
  // Create the HTML dashboard
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code Analytics - Terminal</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            background: #0d1117;
            color: #c9d1d9;
            min-height: 100vh;
            line-height: 1.4;
        }
        
        .terminal {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .terminal-header {
            border-bottom: 1px solid #30363d;
            padding-bottom: 20px;
            margin-bottom: 20px;
            position: relative;
        }
        
        .terminal-title {
            color: #d57455;
            font-size: 1.25rem;
            font-weight: normal;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #3fb950;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        
        .terminal-subtitle {
            color: #7d8590;
            font-size: 0.875rem;
            margin-top: 4px;
        }
        
        .github-star-btn {
            position: absolute;
            top: 0;
            right: 0;
            background: #21262d;
            border: 1px solid #30363d;
            color: #c9d1d9;
            padding: 8px 12px;
            border-radius: 6px;
            text-decoration: none;
            font-family: inherit;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
            cursor: pointer;
        }
        
        .github-star-btn:hover {
            border-color: #d57455;
            background: #30363d;
            color: #d57455;
            text-decoration: none;
        }
        
        .github-star-btn .star-icon {
            font-size: 0.75rem;
        }
        
        .stats-bar {
            display: flex;
            gap: 40px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        
        .stat {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .stat-label {
            color: #7d8590;
            font-size: 0.875rem;
        }
        
        .stat-value {
            color: #d57455;
            font-weight: bold;
        }
        
        .filter-bar {
            display: flex;
            align-items: center;
            gap: 16px;
            margin: 20px 0;
            padding: 12px 0;
            border-top: 1px solid #21262d;
            border-bottom: 1px solid #21262d;
        }
        
        .filter-label {
            color: #7d8590;
            font-size: 0.875rem;
        }
        
        .filter-buttons {
            display: flex;
            gap: 8px;
        }
        
        .filter-btn {
            background: none;
            border: 1px solid #30363d;
            color: #7d8590;
            padding: 4px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            font-size: 0.875rem;
            transition: all 0.2s ease;
        }
        
        .filter-btn:hover {
            border-color: #d57455;
            color: #d57455;
        }
        
        .filter-btn.active {
            background: #d57455;
            border-color: #d57455;
            color: #0d1117;
        }
        
        .sessions-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .sessions-table th {
            text-align: left;
            padding: 8px 12px;
            color: #7d8590;
            font-size: 0.875rem;
            font-weight: normal;
            border-bottom: 1px solid #30363d;
        }
        
        .sessions-table td {
            padding: 8px 12px;
            font-size: 0.875rem;
            border-bottom: 1px solid #21262d;
        }
        
        .sessions-table tr:hover {
            background: #161b22;
        }
        
        .session-id {
            color: #d57455;
            font-family: monospace;
        }
        
        .session-id-container {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .session-project {
            color: #c9d1d9;
        }
        
        .session-messages {
            color: #7d8590;
        }
        
        .session-tokens {
            color: #f85149;
        }
        
        .session-time {
            color: #7d8590;
            font-size: 0.8rem;
        }
        
        .status-active {
            color: #3fb950;
            font-weight: bold;
        }
        
        .status-recent {
            color: #d29922;
        }
        
        .status-inactive {
            color: #7d8590;
        }
        
        .conversation-state {
            color: #d57455;
            font-style: italic;
            font-size: 0.8rem;
        }
        
        .conversation-state.working {
            animation: working-pulse 1.5s infinite;
        }
        
        .conversation-state.typing {
            animation: typing-pulse 1.5s infinite;
        }
        
        @keyframes working-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        @keyframes typing-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        
        .status-squares {
            display: flex;
            gap: 2px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .status-square {
            width: 10px !important;
            height: 10px !important;
            min-width: 10px !important;
            min-height: 10px !important;
            max-width: 10px !important;
            max-height: 10px !important;
            border-radius: 2px;
            cursor: help;
            position: relative;
            flex-shrink: 0;
            box-sizing: border-box;
        }
        
        .status-square.success {
            background: #d57455;
        }
        
        .status-square.tool {
            background: #f97316;
        }
        
        .status-square.error {
            background: #dc2626;
        }
        
        .status-square.pending {
            background: #6b7280;
        }
        
        .status-square:hover::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #1c1c1c;
            color: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            white-space: nowrap;
            z-index: 1000;
            margin-bottom: 4px;
            border: 1px solid #30363d;
        }
        
        .status-square:hover::before {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 4px solid transparent;
            border-top-color: #30363d;
            z-index: 1000;
        }
        
        .loading, .error {
            text-align: center;
            padding: 40px;
            color: #7d8590;
        }
        
        .error {
            color: #f85149;
        }
        
        .no-sessions {
            text-align: center;
            padding: 40px;
            color: #7d8590;
            font-style: italic;
        }
        
        .session-detail {
            display: none;
            margin-top: 20px;
        }
        
        .session-detail.active {
            display: block;
        }
        
        .detail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid #30363d;
            margin-bottom: 20px;
        }
        
        .detail-title {
            color: #d57455;
            font-size: 1.1rem;
        }
        
        .detail-actions {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        
        .export-format-select {
            background: #21262d;
            border: 1px solid #30363d;
            color: #c9d1d9;
            padding: 6px 12px;
            border-radius: 4px;
            font-family: inherit;
            font-size: 0.875rem;
            cursor: pointer;
        }
        
        .export-format-select:focus {
            outline: none;
            border-color: #d57455;
        }
        
        .export-format-select option {
            background: #21262d;
            color: #c9d1d9;
        }
        
        .btn {
            background: none;
            border: 1px solid #30363d;
            color: #7d8590;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            font-size: 0.875rem;
            transition: all 0.2s ease;
        }
        
        .btn:hover {
            border-color: #d57455;
            color: #d57455;
        }
        
        .btn-primary {
            background: #d57455;
            border-color: #d57455;
            color: #0d1117;
        }
        
        .btn-primary:hover {
            background: #e8956f;
            border-color: #e8956f;
        }
        
        .session-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .info-label {
            color: #7d8590;
            font-size: 0.75rem;
            text-transform: uppercase;
        }
        
        .info-value {
            color: #c9d1d9;
            font-size: 0.875rem;
        }
        
        .conversation-history {
            border: 1px solid #30363d;
            border-radius: 6px;
            max-height: 600px;
            overflow-y: auto;
        }
        
        .message {
            padding: 16px;
            border-bottom: 1px solid #21262d;
        }
        
        .message:last-child {
            border-bottom: none;
        }
        
        .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .message-role {
            color: #58a6ff;
            font-size: 0.875rem;
            font-weight: bold;
        }
        
        .message-role.user {
            color: #3fb950;
        }
        
        .message-role.assistant {
            color: #d57455;
        }
        
        .message-time {
            color: #7d8590;
            font-size: 0.75rem;
        }
        
        .message-content {
            color: #c9d1d9;
            font-size: 0.875rem;
            line-height: 1.5;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .back-btn {
            margin-bottom: 20px;
        }
        
        @media (max-width: 768px) {
            .stats-bar {
                gap: 20px;
            }
            
            .filter-bar {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
            
            .sessions-table {
                font-size: 0.8rem;
            }
            
            .sessions-table th,
            .sessions-table td {
                padding: 6px 8px;
            }
            
            .github-star-btn {
                position: relative;
                margin-top: 12px;
                align-self: flex-start;
            }
            
            .terminal-header {
                display: flex;
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="terminal">
        <div class="terminal-header">
            <div class="terminal-title">
                <span class="status-dot"></span>
                claude-code-analytics
            </div>
            <div class="terminal-subtitle">real-time monitoring dashboard</div>
            <div class="terminal-subtitle" id="lastUpdate"></div>
            
            <a href="https://github.com/davila7/claude-code-templates" target="_blank" class="github-star-btn" title="Give us a star on GitHub to support the project!">
                <span class="star-icon">⭐</span>
                <span>Star on GitHub</span>
            </a>
        </div>
        
        <div id="loading" class="loading">
            loading claude code data...
        </div>
        
        <div id="error" class="error" style="display: none;">
            error: failed to load claude code data
        </div>
        
        <div id="dashboard" style="display: none;">
            <div class="stats-bar">
                <div class="stat">
                    <span class="stat-label">sessions:</span>
                    <span class="stat-value" id="totalSessions">0</span>
                </div>
                <div class="stat">
                    <span class="stat-label">tokens:</span>
                    <span class="stat-value" id="totalTokens">0</span>
                </div>
                <div class="stat">
                    <span class="stat-label">projects:</span>
                    <span class="stat-value" id="activeProjects">0</span>
                </div>
                <div class="stat">
                    <span class="stat-label">storage:</span>
                    <span class="stat-value" id="dataSize">0</span>
                </div>
            </div>
            
            <div class="filter-bar">
                <span class="filter-label">filter sessions:</span>
                <div class="filter-buttons">
                    <button class="filter-btn active" data-filter="active">active</button>
                    <button class="filter-btn" data-filter="recent">recent</button>
                    <button class="filter-btn" data-filter="inactive">inactive</button>
                    <button class="filter-btn" data-filter="all">all</button>
                </div>
            </div>
            
            <table class="sessions-table">
                <thead>
                    <tr>
                        <th>session id</th>
                        <th>project</th>
                        <th>messages</th>
                        <th>tokens</th>
                        <th>last activity</th>
                        <th>conversation state</th>
                        <th>status</th>
                    </tr>
                </thead>
                <tbody id="sessionsTable">
                    <!-- Sessions will be loaded here -->
                </tbody>
            </table>
            
            <div id="noSessions" class="no-sessions" style="display: none;">
                no sessions found for current filter
            </div>
            
            <div id="sessionDetail" class="session-detail">
                <button class="btn back-btn" onclick="showSessionsList()">← back to sessions</button>
                
                <div class="detail-header">
                    <div class="detail-title" id="detailTitle">session details</div>
                    <div class="detail-actions">
                        <select id="exportFormat" class="export-format-select">
                            <option value="csv">CSV</option>
                            <option value="json">JSON</option>
                        </select>
                        <button class="btn" onclick="exportSession()">export</button>
                        <button class="btn btn-primary" onclick="refreshSessionDetail()">refresh</button>
                    </div>
                </div>
                
                <div class="session-info" id="sessionInfo">
                    <!-- Session info will be loaded here -->
                </div>
                
                <div>
                    <h3 style="color: #7d8590; margin-bottom: 16px; font-size: 0.875rem; text-transform: uppercase;">conversation history</h3>
                    <div class="conversation-history" id="conversationHistory">
                        <!-- Conversation history will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let allConversations = [];
        let currentFilter = 'active';
        let currentSession = null;
        
        async function loadData() {
            try {
                const response = await fetch('/api/data');
                const data = await response.json();
                
                console.log('Data loaded:', data.timestamp);
                
                document.getElementById('loading').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                
                // Update timestamp
                document.getElementById('lastUpdate').textContent = 
                    \`last update: \${data.lastUpdate}\`;
                
                updateStats(data.summary);
                allConversations = data.conversations;
                updateSessionsTable();
                
            } catch (error) {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').style.display = 'block';
                console.error('Failed to load data:', error);
            }
        }
        
        function updateStats(summary) {
            document.getElementById('totalSessions').textContent = summary.totalSessions.toLocaleString();
            document.getElementById('totalTokens').textContent = summary.totalTokens.toLocaleString();
            document.getElementById('activeProjects').textContent = summary.activeProjects;
            document.getElementById('dataSize').textContent = summary.totalFileSize;
        }
        
        function updateSessionsTable() {
            const tableBody = document.getElementById('sessionsTable');
            const noSessionsDiv = document.getElementById('noSessions');
            
            // Filter conversations based on current filter
            let filteredConversations = allConversations;
            if (currentFilter !== 'all') {
                filteredConversations = allConversations.filter(conv => conv.status === currentFilter);
            }
            
            if (filteredConversations.length === 0) {
                tableBody.innerHTML = '';
                noSessionsDiv.style.display = 'block';
                return;
            }
            
            noSessionsDiv.style.display = 'none';
            
            tableBody.innerHTML = filteredConversations.map(conv => \`
                <tr onclick="showSessionDetail('\${conv.id}')" style="cursor: pointer;">
                    <td>
                        <div class="session-id-container">
                            <div class="session-id">\${conv.id.substring(0, 8)}...</div>
                            <div class="status-squares">
                                \${generateStatusSquaresHTML(conv.statusSquares || [])}
                            </div>
                        </div>
                    </td>
                    <td class="session-project">\${conv.project}</td>
                    <td class="session-messages">\${conv.messageCount}</td>
                    <td class="session-tokens">\${conv.tokens.toLocaleString()}</td>
                    <td class="session-time">\${formatTime(conv.lastModified)}</td>
                    <td class="conversation-state \${getStateClass(conv.conversationState)}">\${conv.conversationState}</td>
                    <td class="status-\${conv.status}">\${conv.status}</td>
                </tr>
            \`).join('');
        }
        
        function formatTime(date) {
            const now = new Date();
            const diff = now - new Date(date);
            const minutes = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            if (minutes < 1) return 'now';
            if (minutes < 60) return \`\${minutes}m ago\`;
            if (hours < 24) return \`\${hours}h ago\`;
            return \`\${days}d ago\`;
        }
        
        function formatMessageTime(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
        }
        
        function getStateClass(conversationState) {
            if (conversationState.includes('working') || conversationState.includes('Working')) {
                return 'working';
            }
            if (conversationState.includes('typing') || conversationState.includes('Typing')) {
                return 'typing';
            }
            return '';
        }
        
        function generateStatusSquaresHTML(statusSquares) {
            if (!statusSquares || statusSquares.length === 0) {
                return '';
            }
            
            return statusSquares.map(square => 
                \`<div class="status-square \${square.type}" data-tooltip="\${square.tooltip}"></div>\`
            ).join('');
        }
        
        // Filter button handlers
        document.addEventListener('DOMContentLoaded', function() {
            const filterButtons = document.querySelectorAll('.filter-btn');
            
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Update current filter
                    currentFilter = this.dataset.filter;
                    
                    // Update table
                    updateSessionsTable();
                });
            });
        });
        
        // Session detail functions
        async function showSessionDetail(sessionId) {
            currentSession = allConversations.find(conv => conv.id === sessionId);
            if (!currentSession) return;
            
            // Hide sessions list and show detail
            document.querySelector('.filter-bar').style.display = 'none';
            document.querySelector('.sessions-table').style.display = 'none';
            document.getElementById('noSessions').style.display = 'none';
            document.getElementById('sessionDetail').classList.add('active');
            
            // Update title
            document.getElementById('detailTitle').textContent = \`session: \${sessionId.substring(0, 8)}...\`;
            
            // Load session info
            updateSessionInfo(currentSession);
            
            // Load conversation history
            await loadConversationHistory(currentSession);
        }
        
        function showSessionsList() {
            document.getElementById('sessionDetail').classList.remove('active');
            document.querySelector('.filter-bar').style.display = 'flex';
            document.querySelector('.sessions-table').style.display = 'table';
            updateSessionsTable();
            currentSession = null;
        }
        
        function updateSessionInfo(session) {
            const container = document.getElementById('sessionInfo');
            
            container.innerHTML = \`
                <div class="info-item">
                    <div class="info-label">session id</div>
                    <div class="info-value">\${session.id}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">project</div>
                    <div class="info-value">\${session.project}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">messages</div>
                    <div class="info-value">\${session.messageCount}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">tokens (estimated)</div>
                    <div class="info-value">\${session.tokens.toLocaleString()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">file size</div>
                    <div class="info-value">\${formatBytes(session.fileSize)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">created</div>
                    <div class="info-value">\${new Date(session.created).toLocaleString()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">last modified</div>
                    <div class="info-value">\${new Date(session.lastModified).toLocaleString()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">conversation state</div>
                    <div class="info-value conversation-state \${getStateClass(session.conversationState)}">\${session.conversationState}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">status</div>
                    <div class="info-value status-\${session.status}">\${session.status}</div>
                </div>
            \`;
        }
        
        async function loadConversationHistory(session) {
            try {
                const response = await fetch(\`/api/session/\${session.id}\`);
                const sessionData = await response.json();
                
                const container = document.getElementById('conversationHistory');
                
                if (!sessionData.messages || sessionData.messages.length === 0) {
                    container.innerHTML = '<div style="padding: 20px; text-align: center; color: #7d8590;">no messages found</div>';
                    return;
                }
                
                container.innerHTML = sessionData.messages.map((message, index) => \`
                    <div class="message">
                        <div class="message-header">
                            <div class="message-role \${message.role}">\${message.role}</div>
                            <div class="message-time">
                                #\${index + 1} • \${message.timestamp ? formatMessageTime(message.timestamp) : 'unknown time'}
                            </div>
                        </div>
                        <div class="message-content">\${truncateContent(message.content || 'no content')}</div>
                    </div>
                \`).join('');
                
            } catch (error) {
                document.getElementById('conversationHistory').innerHTML = 
                    '<div style="padding: 20px; text-align: center; color: #f85149;">error loading conversation history</div>';
                console.error('Failed to load conversation history:', error);
            }
        }
        
        function truncateContent(content, maxLength = 1000) {
            if (typeof content !== 'string') return 'no content';
            if (!content.trim()) return 'empty message';
            if (content.length <= maxLength) return content;
            return content.substring(0, maxLength) + '\\n\\n[... message truncated ...]';
        }
        
        function formatBytes(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        function exportSession() {
            if (!currentSession) return;
            
            const format = document.getElementById('exportFormat').value;
            
            // Fetch conversation history and export
            fetch(\`/api/session/\${currentSession.id}\`)
                .then(response => response.json())
                .then(sessionData => {
                    if (format === 'csv') {
                        exportSessionAsCSV(sessionData);
                    } else if (format === 'json') {
                        exportSessionAsJSON(sessionData);
                    }
                })
                .catch(error => {
                    console.error(\`Failed to export \${format.toUpperCase()}:\`, error);
                    alert(\`Failed to export \${format.toUpperCase()}. Please try again.\`);
                });
        }
        
        function exportSessionAsCSV(sessionData) {
            // Create CSV content
            let csvContent = 'Session ID,Project,Message Count,Tokens,File Size,Created,Last Modified,Conversation State,Status\\n';
            csvContent += \`"\${currentSession.id}","\${currentSession.project}",\${currentSession.messageCount},\${currentSession.tokens},\${currentSession.fileSize},"\${new Date(currentSession.created).toISOString()}","\${new Date(currentSession.lastModified).toISOString()}","\${currentSession.conversationState}","\${currentSession.status}"\\n\\n\`;
            
            csvContent += 'Message #,Role,Timestamp,Content\\n';
            
            // Add conversation history
            if (sessionData.messages) {
                sessionData.messages.forEach((message, index) => {
                    const content = (message.content || 'no content').replace(/"/g, '""');
                    const timestamp = message.timestamp ? new Date(message.timestamp).toISOString() : 'unknown';
                    csvContent += \`\${index + 1},"\${message.role}","\${timestamp}","\${content}"\\n\`;
                });
            }
            
            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            downloadFile(blob, \`claude-session-\${currentSession.id.substring(0, 8)}.csv\`);
        }
        
        function exportSessionAsJSON(sessionData) {
            // Create comprehensive JSON export
            const exportData = {
                session: {
                    id: currentSession.id,
                    filename: currentSession.filename,
                    project: currentSession.project,
                    messageCount: currentSession.messageCount,
                    tokens: currentSession.tokens,
                    fileSize: currentSession.fileSize,
                    created: currentSession.created,
                    lastModified: currentSession.lastModified,
                    conversationState: currentSession.conversationState,
                    status: currentSession.status
                },
                messages: sessionData.messages || [],
                metadata: {
                    exportedAt: new Date().toISOString(),
                    exportFormat: 'json',
                    toolVersion: '1.5.7'
                }
            };
            
            // Download JSON
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
            downloadFile(blob, \`claude-session-\${currentSession.id.substring(0, 8)}.json\`);
        }
        
        function downloadFile(blob, filename) {
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
        
        function refreshSessionDetail() {
            if (currentSession) {
                loadConversationHistory(currentSession);
            }
        }
        
        // Manual refresh function
        async function forceRefresh() {
            try {
                const response = await fetch('/api/refresh');
                const result = await response.json();
                console.log('Manual refresh:', result);
                await loadData();
            } catch (error) {
                console.error('Failed to refresh:', error);
            }
        }
        
        // Load initial data
        loadData();
        
        // Refresh data every 5 seconds
        setInterval(loadData, 5000);
        
        // Add keyboard shortcut for refresh (F5 or Ctrl+R)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                forceRefresh();
            }
        });
    </script>
</body>
</html>`;
  
  await fs.writeFile(path.join(webDir, 'index.html'), htmlContent);
}

module.exports = { runAnalytics };