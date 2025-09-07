#!/usr/bin/env node

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const chalk = require('chalk');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3444;

// Load .env file from current working directory (where user runs the command)
function loadEnvFile() {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        console.log(chalk.blue('📄 Loading .env file from:'), chalk.gray(envPath));
        
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = envContent.split('\n')
            .filter(line => line.trim() && !line.startsWith('#'))
            .reduce((acc, line) => {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, ''); // Remove quotes
                    acc[key.trim()] = value;
                }
                return acc;
            }, {});
        
        // Set environment variables
        Object.assign(process.env, envVars);
        
        const hasE2B = !!process.env.E2B_API_KEY;
        const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
        
        console.log(chalk.green('✅ Environment variables loaded:'));
        console.log(chalk.gray(`   • E2B_API_KEY: ${hasE2B ? 'Found' : 'Missing'}`));
        console.log(chalk.gray(`   • ANTHROPIC_API_KEY: ${hasAnthropic ? 'Found' : 'Missing'}`));
        
        return hasE2B && hasAnthropic;
    } else {
        console.log(chalk.yellow('⚠️  No .env file found in:'), chalk.gray(envPath));
        return false;
    }
}

// Load environment variables on startup
const hasApiKeys = loadEnvFile();

// Simple CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// JSON parsing middleware
app.use(express.json());

// Store active tasks
const activeTasks = new Map();

// Serve the sandbox interface at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../docs/sandbox-interface.html'));
});

// Serve static files for CSS, JS, etc. (but not index.html at root)
app.use('/css', express.static(path.join(__dirname, '../../docs/css')));
app.use('/js', express.static(path.join(__dirname, '../../docs/js')));
app.use('/assets', express.static(path.join(__dirname, '../../docs/assets')));

// API endpoint to execute sandbox task
app.post('/api/execute', async (req, res) => {
    const { prompt, agent = 'development-team/frontend-developer' } = req.body;
    
    if (!prompt || prompt.trim().length < 10) {
        return res.status(400).json({
            success: false,
            error: 'Please provide a detailed prompt (at least 10 characters)'
        });
    }
    
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Create task object
    const task = {
        id: taskId,
        title: prompt.substring(0, 60) + (prompt.length > 60 ? '...' : ''),
        prompt: prompt.trim(),
        agent: agent,
        status: 'running',
        startTime: new Date(),
        progress: 0,
        output: [],
        sandboxId: null
    };
    
    activeTasks.set(taskId, task);
    
    // Start the sandbox execution
    executeE2BTask(task);
    
    res.json({
        success: true,
        taskId: taskId,
        message: 'Task started successfully'
    });
});

// API endpoint to get task status
app.get('/api/task/:taskId', (req, res) => {
    const task = activeTasks.get(req.params.taskId);
    if (!task) {
        return res.status(404).json({
            success: false,
            error: 'Task not found'
        });
    }
    
    res.json({
        success: true,
        task: {
            id: task.id,
            title: task.title,
            status: task.status,
            progress: task.progress,
            output: task.output.join('\\n'),
            startTime: task.startTime,
            endTime: task.endTime,
            sandboxId: task.sandboxId
        }
    });
});

// API endpoint to get all tasks
app.get('/api/tasks', (req, res) => {
    const tasks = Array.from(activeTasks.values()).map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        progress: task.progress,
        startTime: task.startTime,
        endTime: task.endTime,
        sandboxId: task.sandboxId,
        output: task.output.slice(-3).join('\\n') // Last 3 lines for preview
    }));
    
    res.json({
        success: true,
        tasks: tasks.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    });
});

async function executeE2BTask(task) {
    try {
        task.output.push('🚀 Initializing E2B sandbox execution...');
        task.progress = 10;
        
        const e2bLauncherPath = path.join(__dirname, '../components/sandbox/e2b/e2b-launcher.py');
        const agentParam = `--agent=${task.agent} --yes`;
        
        // Build command arguments
        const args = [
            e2bLauncherPath,
            task.prompt,
            agentParam
        ];
        
        // Add API keys from environment if available
        if (process.env.E2B_API_KEY) {
            args.push(process.env.E2B_API_KEY);
        }
        if (process.env.ANTHROPIC_API_KEY) {
            args.push(process.env.ANTHROPIC_API_KEY);
        }
        
        task.output.push('🔧 Starting Python E2B launcher...');
        task.progress = 20;
        
        // Execute the E2B launcher from the user's working directory
        const child = spawn('python3', args, {
            cwd: process.cwd(), // This ensures it runs from where the user executed the command
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env, // Pass all environment variables including loaded ones
                PATH: process.env.PATH
            }
        });
        
        // Handle stdout
        child.stdout.on('data', (data) => {
            const lines = data.toString().split('\\n').filter(line => line.trim());
            lines.forEach(line => {
                task.output.push(line);
                
                // Update progress based on output
                if (line.includes('Sandbox created:')) {
                    task.sandboxId = line.split('Sandbox created: ')[1] || 'unknown';
                    task.progress = 40;
                } else if (line.includes('Installing')) {
                    task.progress = 60;
                } else if (line.includes('Executing Claude Code')) {
                    task.progress = 80;
                } else if (line.includes('Downloaded:')) {
                    task.progress = 95;
                } else if (line.includes('Execution completed successfully')) {
                    task.progress = 100;
                    task.status = 'completed';
                    task.endTime = new Date();
                }
            });
        });
        
        // Handle stderr
        child.stderr.on('data', (data) => {
            const lines = data.toString().split('\\n').filter(line => line.trim());
            lines.forEach(line => {
                task.output.push(`⚠️ ${line}`);
            });
        });
        
        // Handle process exit
        child.on('close', (code) => {
            if (code === 0) {
                if (task.status !== 'completed') {
                    task.status = 'completed';
                    task.endTime = new Date();
                    task.progress = 100;
                }
                task.output.push('✅ Task completed successfully!');
            } else {
                task.status = 'failed';
                task.endTime = new Date();
                
                // Check if it's an API key error
                const outputText = task.output.join(' ');
                if (outputText.includes('E2B API key is required') || outputText.includes('Anthropic API key is required')) {
                    task.output.push('❌ Missing API keys! Please add E2B_API_KEY and ANTHROPIC_API_KEY to your .env file');
                    task.output.push('🔑 Get E2B key: https://e2b.dev/dashboard');
                    task.output.push('🔑 Get Anthropic key: https://console.anthropic.com');
                } else {
                    task.output.push(`❌ Process exited with code: ${code}`);
                }
            }
        });
        
        // Handle process error
        child.on('error', (error) => {
            task.status = 'failed';
            task.endTime = new Date();
            task.output.push(`❌ Execution error: ${error.message}`);
        });
        
    } catch (error) {
        task.status = 'failed';
        task.endTime = new Date();
        task.output.push(`❌ Failed to start execution: ${error.message}`);
    }
}

// Start server
app.listen(PORT, () => {
    console.log(chalk.blue('\\n☁️ AITMPL Cloud Agent Server'));
    console.log(chalk.cyan('═══════════════════════════════════════'));
    console.log(chalk.green(`🚀 Server running on http://localhost:${PORT}`));
    console.log(chalk.gray('💡 E2B sandbox management interface ready'));
    
    if (hasApiKeys) {
        console.log(chalk.green('\\n✅ All API keys are configured and ready!'));
    } else {
        console.log(chalk.yellow('\\n⚠️  API Keys Status:'));
        console.log(chalk.gray(`   • E2B_API_KEY: ${process.env.E2B_API_KEY ? 'Found' : 'Missing'}`));
        console.log(chalk.gray(`   • ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'Found' : 'Missing'}`));
        console.log(chalk.yellow('   • Please add these keys to your .env file'));
    }
    console.log('');
});

module.exports = app;