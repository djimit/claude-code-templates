#!/usr/bin/env node
/**
 * Simple test to verify tracking functionality locally
 */

// Set debug mode
process.env.CCT_DEBUG = 'true';

// Import the tracking service
const { trackingService } = require('./cli-tool/src/tracking-service');

async function testTracking() {
    console.log('🧪 Simple Tracking Test');
    console.log('======================\n');

    try {
        console.log('📊 Testing agent download tracking...');
        
        // Test a simple agent download
        await trackingService.trackDownload('agent', 'api-security-audit', {
            installation_type: 'test',
            category: 'security',
            source: 'local_test'
        });
        
        console.log('✅ Test completed successfully!');
        console.log('\n💡 Check the debug output above to see what happened.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testTracking();