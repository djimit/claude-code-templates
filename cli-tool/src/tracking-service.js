/**
 * TrackingService - Download analytics using GitHub Issues as backend
 * Records component installations for analytics without impacting user experience
 */

class TrackingService {
    constructor() {
        this.repoOwner = 'davila7';
        this.repoName = 'claude-code-templates';
        this.trackingEnabled = this.shouldEnableTracking();
        this.timeout = 5000; // 5s timeout for tracking requests
    }

    /**
     * Check if tracking should be enabled (respects user privacy)
     */
    shouldEnableTracking() {
        // Allow users to opt-out
        if (process.env.CCT_NO_TRACKING === 'true' || 
            process.env.CCT_NO_ANALYTICS === 'true' ||
            process.env.CI === 'true') {
            return false;
        }
        
        // Enable public telemetry tracking
        return true;
    }

    /**
     * Track a component download/installation
     * @param {string} componentType - 'agent', 'command', or 'mcp'
     * @param {string} componentName - Name of the component
     * @param {object} metadata - Additional context (optional)
     */
    async trackDownload(componentType, componentName, metadata = {}) {
        if (!this.trackingEnabled) {
            return;
        }

        try {
            // Create tracking payload
            const trackingData = this.createTrackingPayload(componentType, componentName, metadata);
            
            // Fire-and-forget tracking (don't block user experience)
            this.sendTrackingData(trackingData)
                .catch(error => {
                    // Silent failure - tracking should never impact functionality
                    // Only show debug info when explicitly enabled
                    if (process.env.CCT_DEBUG === 'true') {
                        console.debug('📊 Tracking info (non-critical):', error.message);
                    }
                });

        } catch (error) {
            // Silently handle any tracking errors
            // Only show debug info when explicitly enabled
            if (process.env.CCT_DEBUG === 'true') {
                console.debug('📊 Analytics error (non-critical):', error.message);
            }
        }
    }

    /**
     * Create standardized tracking payload
     */
    createTrackingPayload(componentType, componentName, metadata) {
        const timestamp = new Date().toISOString();
        
        return {
            event: 'component_download',
            component_type: componentType,
            component_name: componentName,
            timestamp: timestamp,
            session_id: this.generateSessionId(),
            environment: {
                node_version: process.version,
                platform: process.platform,
                arch: process.arch,
                cli_version: this.getCliVersion()
            },
            metadata: metadata
        };
    }

    /**
     * Send tracking data via public telemetry endpoint (like Google Analytics)
     */
    async sendTrackingData(trackingData) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            // Build query parameters for GET request (like image tracking)
            const params = new URLSearchParams({
                type: trackingData.component_type,
                name: trackingData.component_name,
                platform: trackingData.environment.platform || 'unknown',
                cli: trackingData.environment.cli_version || 'unknown',
                session: trackingData.session_id.substring(0, 8) // Only first 8 chars for privacy
            });

            // Use public telemetry endpoint (no auth needed, returns GIF)
            await fetch(`https://vercel-tracking-m1wrh55ev-daniel-avilas-projects-2d322e1e.vercel.app/api/telemetry?${params}`, {
                method: 'GET',
                mode: 'no-cors', // Prevents CORS errors
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // No need to check response with no-cors mode
            // Only show success message when debugging
            if (process.env.CCT_DEBUG === 'true') {
                console.debug('📊 Download tracked successfully via telemetry');
            }
            
        } catch (error) {
            clearTimeout(timeoutId);
            // Silent fail - tracking should never break user experience
            if (process.env.CCT_DEBUG === 'true') {
                console.debug('📊 Tracking failed (non-critical):', error.message);
            }
        }
    }

    /**
     * Generate a session ID for grouping related downloads
     */
    generateSessionId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    /**
     * Get CLI version from package.json
     */
    getCliVersion() {
        try {
            const path = require('path');
            const fs = require('fs');
            const packagePath = path.join(__dirname, '..', 'package.json');
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            return packageData.version || 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Track template installation (full project setup)
     */
    async trackTemplateInstallation(language, framework, metadata = {}) {
        return this.trackDownload('template', `${language}/${framework}`, {
            ...metadata,
            installation_type: 'full_template'
        });
    }

    /**
     * Track health check usage
     */
    async trackHealthCheck(results = {}) {
        return this.trackDownload('health-check', 'system-validation', {
            installation_type: 'health_check',
            results_summary: results
        });
    }

    /**
     * Track analytics dashboard usage
     */
    async trackAnalyticsDashboard(metadata = {}) {
        return this.trackDownload('analytics', 'dashboard-launch', {
            installation_type: 'analytics_dashboard',
            ...metadata
        });
    }
}

// Export singleton instance
const trackingService = new TrackingService();

module.exports = {
    TrackingService,
    trackingService
};