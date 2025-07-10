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
      const files = await fs.readdir(this.claudeDir);
      const jsonlFiles = files.filter(file => file.endsWith('.jsonl'));
      
      for (const file of jsonlFiles) {
        const filePath = path.join(this.claudeDir, file);
        const stats = await fs.stat(filePath);
        
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
          
          const conversation = {
            id: file.replace('.jsonl', ''),
            filename: file,
            messageCount: messages.length,
            fileSize: stats.size,
            lastModified: stats.mtime,
            created: stats.birthtime,
            tokens: this.estimateTokens(content),
            project: this.extractProjectFromConversation(messages),
            status: this.determineConversationStatus(messages, stats.mtime)
          };
          
          conversations.push(conversation);
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Could not parse ${file}:`, error.message));
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
    
    if (minutesAgo < 5) return 'active';
    if (minutesAgo < 60) return 'recent';
    return 'inactive';
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
    
    // Watch conversation files
    const conversationWatcher = chokidar.watch(path.join(this.claudeDir, '*.jsonl'), {
      persistent: true,
      ignoreInitial: true
    });
    
    conversationWatcher.on('change', async () => {
      await this.loadInitialData();
      console.log(chalk.green('🔄 Conversation data updated'));
    });
    
    conversationWatcher.on('add', async () => {
      await this.loadInitialData();
      console.log(chalk.green('📝 New conversation detected'));
    });
    
    this.watchers.push(conversationWatcher);
    
    // Watch project directories
    const projectWatcher = chokidar.watch(this.claudeDir, {
      persistent: true,
      ignoreInitial: true,
      depth: 1
    });
    
    projectWatcher.on('addDir', async () => {
      await this.loadInitialData();
      console.log(chalk.green('📁 New project detected'));
    });
    
    this.watchers.push(projectWatcher);
  }

  setupWebServer() {
    // Serve static files (we'll create the dashboard HTML)
    this.app.use(express.static(path.join(__dirname, 'analytics-web')));
    
    // API endpoints
    this.app.get('/api/data', (req, res) => {
      res.json(this.data);
    });
    
    this.app.get('/api/realtime', (req, res) => {
      res.json(this.data.realtimeStats);
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
    <title>Claude Code Analytics Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #4ade80;
            animation: pulse 2s infinite;
            margin-right: 8px;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
        }
        
        .stat-card h3 {
            color: #6b7280;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
        }
        
        .stat-card .value {
            font-size: 2rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 4px;
        }
        
        .stat-card .label {
            color: #9ca3af;
            font-size: 0.875rem;
        }
        
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .panel {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .panel h2 {
            color: #1f2937;
            margin-bottom: 20px;
            font-size: 1.25rem;
        }
        
        .conversation-item, .project-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .conversation-item:last-child, .project-item:last-child {
            border-bottom: none;
        }
        
        .item-info h4 {
            color: #1f2937;
            font-size: 0.875rem;
            margin-bottom: 4px;
        }
        
        .item-info p {
            color: #6b7280;
            font-size: 0.75rem;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .status-active {
            background: #d1fae5;
            color: #065f46;
        }
        
        .status-recent {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-inactive {
            background: #f3f4f6;
            color: #6b7280;
        }
        
        .loading {
            text-align: center;
            color: white;
            padding: 40px;
        }
        
        .error {
            background: #fef2f2;
            color: #dc2626;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        @media (max-width: 768px) {
            .content-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                <span class="status-indicator"></span>
                Claude Code Analytics
            </h1>
            <p>Real-time monitoring of your Claude Code usage</p>
        </div>
        
        <div id="loading" class="loading">
            <p>Loading analytics data...</p>
        </div>
        
        <div id="error" class="error" style="display: none;">
            <p>Failed to load analytics data. Please check if Claude Code is installed.</p>
        </div>
        
        <div id="dashboard" style="display: none;">
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Sessions</h3>
                    <div class="value" id="totalSessions">0</div>
                    <div class="label">Conversations</div>
                </div>
                <div class="stat-card">
                    <h3>Total Tokens</h3>
                    <div class="value" id="totalTokens">0</div>
                    <div class="label">Estimated</div>
                </div>
                <div class="stat-card">
                    <h3>Active Projects</h3>
                    <div class="value" id="activeProjects">0</div>
                    <div class="label">Currently</div>
                </div>
                <div class="stat-card">
                    <h3>Data Size</h3>
                    <div class="value" id="dataSize">0</div>
                    <div class="label">Total</div>
                </div>
            </div>
            
            <div class="content-grid">
                <div class="panel">
                    <h2>Recent Conversations</h2>
                    <div id="conversations">
                        <!-- Conversations will be loaded here -->
                    </div>
                </div>
                
                <div class="panel">
                    <h2>Active Projects</h2>
                    <div id="projects">
                        <!-- Projects will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        async function loadData() {
            try {
                const response = await fetch('/api/data');
                const data = await response.json();
                
                document.getElementById('loading').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                
                updateStats(data.summary);
                updateConversations(data.conversations);
                updateProjects(data.activeProjects);
                
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
        
        function updateConversations(conversations) {
            const container = document.getElementById('conversations');
            
            if (conversations.length === 0) {
                container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">No conversations found</p>';
                return;
            }
            
            container.innerHTML = conversations.slice(0, 10).map(conv => \`
                <div class="conversation-item">
                    <div class="item-info">
                        <h4>\${conv.project}</h4>
                        <p>\${conv.messageCount} messages • \${conv.tokens.toLocaleString()} tokens</p>
                    </div>
                    <span class="status-badge status-\${conv.status}">\${conv.status}</span>
                </div>
            \`).join('');
        }
        
        function updateProjects(projects) {
            const container = document.getElementById('projects');
            
            if (projects.length === 0) {
                container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">No projects found</p>';
                return;
            }
            
            container.innerHTML = projects.slice(0, 10).map(project => \`
                <div class="project-item">
                    <div class="item-info">
                        <h4>\${project.name}</h4>
                        <p>\${project.todoFiles} todo files</p>
                    </div>
                    <span class="status-badge status-\${project.status}">\${project.status}</span>
                </div>
            \`).join('');
        }
        
        // Load initial data
        loadData();
        
        // Refresh data every 10 seconds
        setInterval(loadData, 10000);
    </script>
</body>
</html>`;
  
  await fs.writeFile(path.join(webDir, 'index.html'), htmlContent);
}

module.exports = { runAnalytics };