---
sidebar_position: 5
---

# Cloudflare Tunnel

Enable secure remote access to your Claude Code tools from anywhere using Cloudflare's global network infrastructure.

## 🌐 What is Cloudflare Tunnel?

Cloudflare Tunnel creates secure, encrypted connections between your local Claude Code tools and the internet, allowing remote access without exposing your local network or compromising security.

## 🚀 Enable Tunnel

Cloudflare Tunnel works with other Claude Code tools by adding the `--tunnel` flag:

### With Analytics Dashboard
```bash
npx claude-code-templates@latest --analytics --tunnel
```

### With Chats Interface
```bash
npx claude-code-templates@latest --chats --tunnel
```

## 🔧 How It Works

### Secure Connection Process
1. **Tool Launch** - Your chosen tool (analytics or chats) starts locally
2. **Tunnel Creation** - Secure tunnel established through Cloudflare
3. **Public URL Generation** - Shareable HTTPS URL created
4. **Encrypted Traffic** - All traffic encrypted end-to-end
5. **Global Access** - Accessible from anywhere with internet

### Security Features
- **Zero Trust Access** - No open ports on your local network
- **End-to-end Encryption** - TLS encryption for all traffic
- **Cloudflare DDoS Protection** - Built-in attack mitigation
- **Global Network** - Cloudflare's edge network for performance
- **Automatic SSL** - HTTPS certificates managed automatically

## 🎯 Use Cases

### Remote Development
- **Work from anywhere** - Access your Claude Code tools remotely
- **Travel productivity** - Maintain development workflow while traveling
- **Multiple locations** - Use from home, office, co-working spaces
- **Device flexibility** - Access from laptops, tablets, phones
- **Network independence** - Work on any internet connection

### Team Collaboration
- **Share analytics** - Give team members access to usage dashboards
- **Collaborative sessions** - Multiple people using chats interface
- **Remote pair programming** - Share Claude Code access for collaboration
- **Cross-timezone work** - Asynchronous access for global teams
- **Client demonstrations** - Show Claude Code capabilities securely

### Mobile and Cross-Device
- **Mobile access** - Use chats interface from mobile devices anywhere
- **Device switching** - Continue work across different devices
- **Backup access** - Alternative access when primary setup unavailable
- **Family/shared computers** - Access personal Claude Code from shared devices
- **Emergency access** - Critical development access during emergencies

## 🔐 Security Considerations

### Access Control
- **URL Security** - Generated URLs are cryptographically secure
- **Session Management** - Automatic session timeouts for security
- **No Port Exposure** - Local network remains completely protected
- **Cloudflare Monitoring** - Built-in traffic analysis and protection
- **Revocable Access** - Tunnels can be stopped to immediately revoke access

### Best Practices
- **Don't share URLs publicly** - Keep tunnel URLs private
- **Use strong authentication** - Secure your local Claude Code setup
- **Monitor access logs** - Check who's accessing your tools
- **Regular tunnel rotation** - Restart tunnels periodically for new URLs
- **Team access control** - Only share with trusted team members

### Data Privacy
- **Local processing** - Your code and data remain on your machine
- **Encrypted transmission** - All traffic encrypted in transit
- **No Cloudflare storage** - Cloudflare doesn't store your data
- **Private conversations** - Claude Code conversations stay private
- **Audit trail** - Monitor all remote access activity

## 📊 Tunnel Management

### Active Tunnel Monitoring
- **Connection status** - Real-time tunnel health monitoring
- **Traffic analytics** - See usage patterns and access frequency
- **Performance metrics** - Monitor latency and connection quality
- **Error tracking** - Identify and resolve connection issues
- **Geographic access** - See where access is coming from

### URL Management
- **Secure URLs** - Each tunnel gets unique, secure URL
- **URL sharing** - Copy URLs for team collaboration
- **URL rotation** - Generate new URLs for security
- **Access logging** - Track who accesses shared URLs
- **URL expiration** - Set time limits on tunnel access

## 🌍 Global Performance

### Cloudflare Edge Network
- **200+ locations** - Global points of presence
- **Automatic routing** - Traffic routed to nearest edge
- **Load balancing** - Distributed traffic for reliability
- **Caching optimization** - Static assets cached globally
- **Bandwidth optimization** - Compression and optimization

### Connection Quality
- **Low latency** - Optimized routing for speed
- **High availability** - 99.9%+ uptime through redundancy
- **Scalable bandwidth** - Handles varying traffic loads
- **Quality monitoring** - Real-time performance tracking
- **Automatic failover** - Backup routes for reliability

## ⚙️ Configuration Options

### Tunnel Settings
- **Custom domains** - Use your own domain (advanced)
- **Access policies** - Control who can access tunnels
- **Traffic rules** - Configure routing and filtering
- **Bandwidth limits** - Set usage limits if needed
- **Geographic restrictions** - Limit access by location

### Integration Options
- **Multiple tools** - Run several tunneled tools simultaneously
- **Load balancing** - Distribute load across multiple instances
- **Health checks** - Automatic tunnel health monitoring
- **Backup tunnels** - Redundant tunnels for high availability
- **Custom routing** - Advanced traffic routing configurations

## 🔧 Troubleshooting

### Common Issues

**Tunnel won't start:**
```bash
# Check internet connection
ping cloudflare.com

# Verify tool is running locally first
npx claude-code-templates@latest --analytics
# Then add --tunnel flag
```

**Slow tunnel performance:**
- Check local internet speed
- Try different Cloudflare edge location
- Verify local tool performance without tunnel
- Check for network congestion

**Can't access tunnel URL:**
- Verify URL is correct and complete
- Check if tunnel is still active
- Try different browser or incognito mode
- Verify internet connection

### Performance Optimization
- **Optimize local tool** - Ensure base tool runs efficiently
- **Network stability** - Use stable internet connection
- **Browser optimization** - Keep browser updated
- **Clear caches** - Clear browser and tunnel caches
- **Monitor metrics** - Use analytics to identify bottlenecks

## 💡 Pro Tips

- **Test locally first** - Ensure tools work properly before tunneling
- **Use descriptive naming** - Organize tunnel URLs for easy identification
- **Monitor access patterns** - Track usage to optimize performance
- **Combine with health checks** - Verify system health before sharing access
- **Document tunnel URLs** - Keep secure record for team access
- **Regular security reviews** - Periodically audit tunnel access and usage
- **Backup access methods** - Maintain alternative access options

---

**Next:** Explore [E2B Sandbox](./sandbox) for secure cloud execution environments.