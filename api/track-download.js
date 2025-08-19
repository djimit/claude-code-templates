// Download tracking API endpoint for Claude Code Templates
import { sql } from '@vercel/postgres';

// Create downloads table if it doesn't exist
async function ensureTableExists() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS component_downloads (
        id SERIAL PRIMARY KEY,
        component_type VARCHAR(20) NOT NULL,
        component_name VARCHAR(255) NOT NULL,
        component_path VARCHAR(500),
        category VARCHAR(100),
        download_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_agent TEXT,
        ip_address INET,
        country VARCHAR(2),
        cli_version VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_component_type ON component_downloads (component_type);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_component_name ON component_downloads (component_name);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_download_timestamp ON component_downloads (download_timestamp);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_category ON component_downloads (category);
    `;
    
    // Create aggregated stats table for fast queries
    await sql`
      CREATE TABLE IF NOT EXISTS download_stats (
        id SERIAL PRIMARY KEY,
        component_type VARCHAR(20) NOT NULL,
        component_name VARCHAR(255) NOT NULL,
        total_downloads INTEGER DEFAULT 1,
        last_download TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(component_type, component_name)
      );
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_total_downloads ON download_stats (total_downloads DESC);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_last_download ON download_stats (last_download DESC);
    `;
    
  } catch (error) {
    // Tables might already exist, which is fine
    console.log('Table creation info:', error.message);
  }
}

// Get IP address from request
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         '127.0.0.1';
}

// Get country from Vercel geo headers
function getCountry(req) {
  return req.headers['x-vercel-ip-country'] || null;
}

// Validate component data
function validateComponentData(data) {
  const { type, name, path, category } = data;
  
  if (!type || !name) {
    return { valid: false, error: 'Component type and name are required' };
  }
  
  const validTypes = ['agent', 'command', 'setting', 'hook', 'mcp', 'template'];
  if (!validTypes.includes(type)) {
    return { valid: false, error: 'Invalid component type' };
  }
  
  if (name.length > 255) {
    return { valid: false, error: 'Component name too long' };
  }
  
  return { valid: true };
}

// Main API handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed', 
      allowed: ['POST'] 
    });
  }
  
  try {
    // Ensure database tables exist
    await ensureTableExists();
    
    // Validate request body
    const { type, name, path, category, cliVersion } = req.body;
    const validation = validateComponentData({ type, name, path, category });
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Get client information
    const ipAddress = getClientIP(req);
    const country = getCountry(req);
    const userAgent = req.headers['user-agent'];
    
    // Insert download record
    await sql`
      INSERT INTO component_downloads 
      (component_type, component_name, component_path, category, user_agent, ip_address, country, cli_version)
      VALUES (${type}, ${name}, ${path}, ${category}, ${userAgent}, ${ipAddress}, ${country}, ${cliVersion})
    `;
    
    // Update aggregated stats
    await sql`
      INSERT INTO download_stats (component_type, component_name, total_downloads, last_download)
      VALUES (${type}, ${name}, 1, NOW())
      ON CONFLICT (component_type, component_name) 
      DO UPDATE SET 
        total_downloads = download_stats.total_downloads + 1,
        last_download = NOW(),
        updated_at = NOW()
    `;
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Download tracked successfully',
      data: {
        type,
        name,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Download tracking error:', error);
    
    // Return error response
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to track download'
    });
  }
}

// Health check endpoint
export async function health() {
  try {
    await sql`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
}