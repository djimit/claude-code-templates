/**
 * Vercel Serverless Function for Claude Code Templates Analytics
 * Receives download tracking data and creates GitHub issues
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const {
      component_type,
      component_name,
      timestamp,
      session_id,
      environment,
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!component_type || !component_name || !timestamp) {
      return res.status(400).json({ 
        error: 'Missing required fields: component_type, component_name, timestamp' 
      });
    }

    // Create GitHub issue
    const issueTitle = `📊 ${component_type}:${component_name} - ${timestamp.split('T')[0]}`;
    
    const issueBody = `\`\`\`json
{
  "event": "component_download",
  "component_type": "${component_type}",
  "component_name": "${component_name}",
  "timestamp": "${timestamp}",
  "session_id": "${session_id || 'unknown'}",
  "environment": ${JSON.stringify(environment || {}, null, 2)},
  "metadata": ${JSON.stringify(metadata, null, 2)}
}
\`\`\`

<!-- ANALYTICS_DATA -->
Component: **${component_name}** (${component_type})  
Platform: ${environment?.platform || 'unknown'} ${environment?.arch || ''}  
Node: ${environment?.node_version || 'unknown'}  
CLI: ${environment?.cli_version || 'unknown'}  
Session: \`${session_id || 'unknown'}\`

*Tracked via Vercel serverless function*`;

    // Create issue using GitHub API
    const githubResponse = await fetch('https://api.github.com/repos/davila7/claude-code-templates/issues', {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'claude-code-templates-vercel-tracker'
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels: ['📊 analytics', 'download-tracking', `type:${component_type}`]
      })
    });

    if (!githubResponse.ok) {
      console.error('GitHub API error:', await githubResponse.text());
      return res.status(500).json({ 
        error: 'Failed to create tracking issue',
        status: githubResponse.status 
      });
    }

    const issue = await githubResponse.json();
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Download tracked successfully',
      issue_number: issue.number,
      issue_url: issue.html_url
    });

  } catch (error) {
    console.error('Tracking error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}