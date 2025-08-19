// Database initialization endpoint - run once to create tables
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow GET requests for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Missing Supabase configuration' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create component_downloads table
    const { error: error1 } = await supabase.rpc('create_downloads_table', {}, { count: 'exact' });
    
    // Since we can't run raw SQL easily, let's check if tables exist by trying to select from them
    const { data: testDownloads, error: downloadsError } = await supabase
      .from('component_downloads')
      .select('*')
      .limit(1);
    
    const { data: testStats, error: statsError } = await supabase
      .from('download_stats')
      .select('*')
      .limit(1);
    
    const response = {
      success: true,
      message: 'Database initialization check completed',
      tables: {
        component_downloads: {
          exists: !downloadsError || downloadsError.code !== 'PGRST116',
          error: downloadsError?.message
        },
        download_stats: {
          exists: !statsError || statsError.code !== 'PGRST116', 
          error: statsError?.message
        }
      },
      instructions: `
        If tables don't exist, please create them manually in Supabase SQL editor:
        
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
        
        CREATE INDEX IF NOT EXISTS idx_component_type ON component_downloads (component_type);
        CREATE INDEX IF NOT EXISTS idx_component_name ON component_downloads (component_name);
        CREATE INDEX IF NOT EXISTS idx_download_timestamp ON component_downloads (download_timestamp);
        CREATE INDEX IF NOT EXISTS idx_category ON component_downloads (category);
        CREATE INDEX IF NOT EXISTS idx_total_downloads ON download_stats (total_downloads DESC);
        CREATE INDEX IF NOT EXISTS idx_last_download ON download_stats (last_download DESC);
      `
    };
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Database init error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Database initialization failed',
      message: error.message
    });
  }
}