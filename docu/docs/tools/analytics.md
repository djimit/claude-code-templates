---
sidebar_position: 2
---

# Analytics Dashboard

Real-time monitoring and analysis of your Claude Code sessions with a comprehensive web interface.

## 📊 What is Analytics Dashboard?

The Analytics Dashboard provides live monitoring of your Claude Code conversations, usage statistics, and performance metrics through a clean, terminal-style web interface.

## 🚀 Launch Analytics

```bash
npx claude-code-templates@latest --analytics
```

The dashboard automatically opens in your browser at `http://localhost:3333`.

## 🎯 Key Features

### Real-time Session Tracking
- **Live conversation monitoring** - See active Claude Code sessions as they happen
- **Conversation state detection** - "Claude working...", "User typing...", "Awaiting input..."
- **Session timeline** - Track conversation flow and duration
- **Multi-session support** - Monitor multiple Claude Code instances

### Usage Statistics
- **Total sessions** - Complete count of Claude Code conversations
- **Token usage tracking** - Monitor API usage and costs
- **Activity trends** - Daily, weekly, and monthly usage patterns
- **Peak usage times** - Identify when you use Claude Code most

### Conversation History
- **Complete session logs** - Access full conversation transcripts
- **Search functionality** - Find specific conversations or topics
- **Export capabilities** - Download data in CSV or JSON format
- **Conversation metadata** - Timestamps, duration, token counts

### Performance Metrics
- **System health monitoring** - CPU, memory, and network usage
- **Claude Code performance** - Response times and processing speeds
- **Error tracking** - Monitor and log any issues or failures
- **Optimization suggestions** - Recommendations for better performance

### Web Interface Features
- **Terminal-style design** - Clean, developer-friendly interface
- **Real-time updates** - Live data refresh without page reload
- **WebSocket integration** - Efficient real-time communication
- **Responsive design** - Works on desktop, tablet, and mobile
- **Browser notifications** - Desktop alerts for important state changes

## 🌐 Remote Access

Combine with Cloudflare Tunnel for remote access:

```bash
npx claude-code-templates@latest --analytics --tunnel
```

**Benefits:**
- **Access from anywhere** - Monitor your Claude Code usage remotely
- **Team collaboration** - Share analytics with team members
- **Cross-device monitoring** - Check stats from mobile or other devices
- **Secure access** - Cloudflare-powered encrypted connections

## 📈 Use Cases

### Personal Development
- **Track productivity** - Monitor how much you use Claude Code
- **Optimize workflow** - Identify peak usage times and patterns
- **Cost monitoring** - Keep track of API usage and costs
- **Session analysis** - Review successful conversation patterns

### Team Management
- **Team usage monitoring** - Track Claude Code usage across team members
- **Performance benchmarking** - Compare usage patterns and efficiency
- **Cost allocation** - Understand team API usage distribution
- **Collaboration insights** - See how team members use Claude Code

### Project Analysis
- **Project-specific metrics** - Track Claude Code usage per project
- **Development phases** - Monitor usage during different project stages
- **Efficiency tracking** - Measure Claude Code impact on development speed
- **Quality metrics** - Analyze conversation quality and outcomes

## ⚙️ Configuration

### Default Settings
- **Port**: 3333 (customizable)
- **Auto-open**: Browser opens automatically
- **Update frequency**: Real-time via WebSocket
- **Data retention**: Configurable history retention

### Customization Options
- **Dashboard theme** - Light/dark mode options
- **Metric preferences** - Choose which metrics to display
- **Alert settings** - Configure notification preferences
- **Export formats** - Customize data export options

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Analytics will find next available port automatically
npx claude-code-templates@latest --analytics
```

**Browser doesn't open:**
- Check if default browser is set
- Manually navigate to `http://localhost:3333`
- Try different browser

**No data showing:**
- Ensure Claude Code is running
- Check WebSocket connection in browser console
- Restart analytics dashboard

### Performance Tips
- **Close unused tabs** to improve performance
- **Clear browser cache** if interface seems slow
- **Use latest browser** for best WebSocket support
- **Check system resources** if experiencing lag

## 💡 Pro Tips

- **Leave analytics running** while using Claude Code for continuous monitoring
- **Use with tunnel** for remote access during travel or remote work
- **Export data regularly** for long-term analysis and reporting
- **Combine with health checks** to ensure optimal Claude Code performance
- **Share dashboard URL** with team members for collaborative monitoring

---

**Next:** Try the [Health Check](./health-check) tool to validate your Claude Code setup.