// Simple debug endpoint for database connection
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }
  
  try {
    // Check if environment variable exists
    const postgresUrl = process.env.POSTGRES_URL;
    const postgresUrlNonPooling = process.env.POSTGRES_URL_NON_POOLING;
    
    console.log('Environment check:', {
      hasPostgresUrl: !!postgresUrl,
      hasPostgresUrlNonPooling: !!postgresUrlNonPooling
    });
    
    if (!postgresUrl && !postgresUrlNonPooling) {
      return res.status(500).json({
        error: 'Missing database configuration',
        message: 'Neither POSTGRES_URL nor POSTGRES_URL_NON_POOLING is set'
      });
    }
    
    // Simple database test
    const result = await sql`SELECT 1 as test, NOW() as current_time`;
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      test_result: result.rows[0],
      env_info: {
        hasPostgresUrl: !!postgresUrl,
        hasPostgresUrlNonPooling: !!postgresUrlNonPooling
      }
    });
    
  } catch (error) {
    console.error('Database debug error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}