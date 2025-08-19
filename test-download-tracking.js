#!/usr/bin/env node
/**
 * Test script for download tracking functionality
 * Tests both database and telemetry endpoints
 */

const { trackingService } = require('./cli-tool/src/tracking-service');

async function testDownloadTracking() {
    console.log('🧪 Testing Download Tracking System');
    console.log('=====================================\n');

    // Enable debug mode for testing
    process.env.CCT_DEBUG = 'true';

    console.log('📊 Testing component downloads...\n');

    // Test different component types
    const testCases = [
        {
            type: 'agent',
            name: 'api-security-audit',
            metadata: {
                installation_type: 'individual_component',
                category: 'security',
                source: 'test'
            }
        },
        {
            type: 'command',
            name: 'generate-tests',
            metadata: {
                installation_type: 'individual_component',
                category: 'testing',
                source: 'test'
            }
        },
        {
            type: 'mcp',
            name: 'github-integration',
            metadata: {
                installation_type: 'individual_component',
                category: 'integration',
                source: 'test'
            }
        },
        {
            type: 'setting',
            name: 'enable-telemetry',
            metadata: {
                installation_type: 'individual_component',
                category: 'telemetry',
                source: 'test'
            }
        },
        {
            type: 'hook',
            name: 'backup-before-edit',
            metadata: {
                installation_type: 'individual_component',
                category: 'automation',
                source: 'test'
            }
        }
    ];

    let successCount = 0;
    let totalTests = testCases.length;

    for (let i = 0; i < testCases.length; i++) {
        const test = testCases[i];
        console.log(`${i + 1}. Testing ${test.type}: ${test.name}`);
        
        try {
            await trackingService.trackDownload(test.type, test.name, test.metadata);
            console.log(`   ✅ Successfully tracked ${test.type}`);
            successCount++;
            
            // Add delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.log(`   ❌ Failed to track ${test.type}:`, error.message);
        }
    }

    console.log('\n📈 Testing special cases...\n');

    // Test template installation
    try {
        await trackingService.trackTemplateInstallation('javascript-typescript', 'react', {
            installation_method: 'test',
            dry_run: false,
            hooks_count: 2,
            mcps_count: 1
        });
        console.log('✅ Template installation tracking successful');
        successCount++;
        totalTests++;
    } catch (error) {
        console.log('❌ Template installation tracking failed:', error.message);
        totalTests++;
    }

    // Test health check tracking
    try {
        await trackingService.trackHealthCheck({
            setup_recommended: false,
            issues_found: 0,
            source: 'test'
        });
        console.log('✅ Health check tracking successful');
        successCount++;
        totalTests++;
    } catch (error) {
        console.log('❌ Health check tracking failed:', error.message);
        totalTests++;
    }

    // Test analytics dashboard tracking
    try {
        await trackingService.trackAnalyticsDashboard({
            page: 'dashboard',
            source: 'test'
        });
        console.log('✅ Analytics dashboard tracking successful');
        successCount++;
        totalTests++;
    } catch (error) {
        console.log('❌ Analytics dashboard tracking failed:', error.message);
        totalTests++;
    }

    console.log('\n📊 Test Results');
    console.log('================');
    console.log(`✅ Successful: ${successCount}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - successCount}/${totalTests}`);
    
    if (successCount === totalTests) {
        console.log('\n🎉 All tests passed! Download tracking is working correctly.');
    } else if (successCount > 0) {
        console.log('\n⚠️  Some tests passed. Check network connectivity and endpoint availability.');
    } else {
        console.log('\n💥 All tests failed. Check your network connection and API endpoint.');
    }

    console.log('\n💡 Note: This test sends real tracking data to the endpoints.');
    console.log('   Check your database and analytics to verify the data was received.');
    
    // Instructions for verification
    console.log('\n🔍 Verification Steps:');
    console.log('1. Check Vercel deployment logs for API requests');
    console.log('2. Query the database to see tracked downloads');
    console.log('3. Check existing telemetry endpoint for fallback data');
    console.log('4. Set CCT_DEBUG=false to test silent mode');
}

// Run the test
if (require.main === module) {
    testDownloadTracking()
        .then(() => {
            console.log('\n✨ Test completed.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Test failed with error:', error);
            process.exit(1);
        });
}

module.exports = { testDownloadTracking };