# 📱 Telegram Notifications Setup Guide

## Overview
Get real-time Telegram notifications when Claude Code finishes working, encounters long operations, or needs attention.

## Available Hooks

### 1. `telegram-notifications` - Basic Notifications
- ✅ Notifies when main Claude Code session ends
- 🎯 Notifies when subagent tasks complete
- Simple timestamp information

### 2. `telegram-detailed-notifications` - Advanced Session Tracking
- 🚀 Session start notifications
- ✅ Detailed completion notifications with duration
- 💾 Memory usage information
- 📁 Project name tracking

### 3. `telegram-error-notifications` - Productivity Monitoring
- ⚠️ Alerts for long-running Bash operations (>30 seconds)
- 🔔 Notifications when Claude Code waits for user input
- Helps catch stuck processes

## Setup Instructions

### Step 1: Create a Telegram Bot
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Copy the **Bot Token** (looks like: `123456789:ABCD-EFGHijklmnop_qrstuvwxyz`)

### Step 2: Get Your Chat ID
1. Start a conversation with your bot
2. Send any message to the bot
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Find your **Chat ID** in the response (usually a number like `123456789`)

### Step 3: Set Environment Variables

#### Option A: Global Configuration (Recommended)
Add to your shell profile (`.bashrc`, `.zshrc`, or `.profile`):

```bash
export TELEGRAM_BOT_TOKEN="123456789:ABCD-EFGHijklmnop_qrstuvwxyz"
export TELEGRAM_CHAT_ID="123456789"
```

#### Option B: Project-Specific Configuration
Add to your project's `.env` file or `.claude/settings.local.json`:

```json
{
  "env": {
    "TELEGRAM_BOT_TOKEN": "123456789:ABCD-EFGHijklmnop_qrstuvwxyz",
    "TELEGRAM_CHAT_ID": "123456789"
  }
}
```

### Step 4: Install the Hook
```bash
# Basic notifications
npx claude-code-templates@latest --hook=automation/telegram-notifications

# Detailed session tracking
npx claude-code-templates@latest --hook=automation/telegram-detailed-notifications

# Productivity monitoring
npx claude-code-templates@latest --hook=automation/telegram-error-notifications
```

## Testing
After setup, test the hook by running:
```bash
# This should trigger a notification when the command completes
echo "Test complete"
```

## Security Notes
- ⚠️ **Never commit bot tokens to version control**
- 🔒 Use `.claude/settings.local.json` for sensitive credentials
- 🏢 For teams, consider using enterprise managed settings
- 🔐 Regularly rotate bot tokens for security

## Troubleshooting

### No notifications received?
1. Verify environment variables: `echo $TELEGRAM_BOT_TOKEN`
2. Check bot token format (should contain `:`)
3. Ensure you've messaged the bot first
4. Verify chat ID is correct (numeric)

### Bot responds with "Forbidden"?
- The chat ID might be incorrect
- You need to start a conversation with the bot first

### Hook not triggering?
- Verify hook is installed: check `.claude/settings.json`
- Test with a simple command first
- Check Claude Code version compatibility

## Message Examples

### Basic Notification
```
🤖 Claude Code finished working at 2025-01-15 14:30:45
```

### Detailed Notification
```
✅ Claude Code Session Completed
📁 Project: my-awesome-project
⏱️ Duration: 15m 32s
💾 Memory Used: 245MB
⏰ Finished: 14:30:45
📅 Date: 2025-01-15
```

### Long Operation Alert
```
⚠️ Long Bash Operation
⏱️ Duration: 2m 15s
📁 Project: data-processing
⏰ Time: 14:28:30
```

## Advanced Configuration

### Custom Message Format
You can modify the hooks to customize message format:
- Edit the `MESSAGE` variable in the hook command
- Use HTML formatting with `parse_mode=HTML`
- Add emojis and custom text

### Group Notifications
- Add the bot to a Telegram group
- Use the group chat ID instead of personal chat ID
- Perfect for team notifications

### Multiple Projects
- Use different bots for different projects
- Set project-specific environment variables
- Configure in `.claude/settings.local.json` per project