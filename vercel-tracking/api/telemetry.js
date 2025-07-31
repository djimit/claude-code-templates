/**
 * Public telemetry endpoint - No authentication required
 * Receives download events and creates GitHub issues for analytics processing
 */

export default async function handler(req, res) {
  // Handle CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests (like image tracking)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract data from query parameters
    const {
      type,      // component_type
      name,      // component_name  
      platform,  // user platform
      cli,       // cli version
      session    // session id (first 8 chars only)
    } = req.query;

    // Validate required fields
    if (!type || !name) {
      return res.status(400).json({ error: 'Missing required fields: type, name' });
    }

    // Create timestamp
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];

    // Create issue title and body
    const issueTitle = `📊 ${type}:${name} - ${date}`;
    
    const trackingData = {
      event: "component_download",
      component_type: type,
      component_name: name,
      timestamp: timestamp,
      session_id: session || 'anonymous',
      environment: {
        platform: platform || 'unknown',
        cli_version: cli || 'unknown'
      }
    };

    const issueBody = `\`\`\`json
${JSON.stringify(trackingData, null, 2)}
\`\`\`

<!-- ANALYTICS_DATA -->
Component: **${name}** (${type})  
Platform: ${platform || 'unknown'}  
CLI: ${cli || 'unknown'}  
Session: \`${session || 'anonymous'}\`

*Tracked via public telemetry endpoint*`;

    // Create issue using GitHub API with server token
    const githubResponse = await fetch('https://api.github.com/repos/davila7/claude-code-templates/issues', {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'claude-code-templates-telemetry'
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels: ['📊 analytics', 'download-tracking', `type:${type}`]
      })
    });

    if (!githubResponse.ok) {
      console.error('GitHub API error:', await githubResponse.text());
      // Return success anyway - don't break user experience
      return res.status(200).json({ success: false, error: 'tracking_failed' });
    }

    // Return a 1x1 transparent GIF (like Google Analytics)
    const gif = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
      0x01, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00,
      0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x0C,
      0x0A, 0x00, 0x3B
    ]);

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Length', gif.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(gif);

  } catch (error) {
    console.error('Telemetry error:', error);
    
    // Always return a GIF, even on error - don't break user experience
    const gif = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
      0x01, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00,
      0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x0C,
      0x0A, 0x00, 0x3B
    ]);
    
    res.setHeader('Content-Type', 'image/gif');
    return res.status(200).send(gif);
  }
}