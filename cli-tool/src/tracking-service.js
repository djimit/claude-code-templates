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
        
        // Enable by default (anonymous usage data only)
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
     * Send tracking data to Vercel serverless function (anonymous)
     */
    async sendTrackingData(trackingData) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            // Use Vercel serverless function (no auth needed)
            const response = await fetch('https://vercel-tracking-mj8fcml40-daniel-avilas-projects-2d322e1e.vercel.app/api/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'claude-code-templates-cli'
                },
                body: JSON.stringify({
                    component_type: trackingData.component_type,
                    component_name: trackingData.component_name,
                    timestamp: trackingData.timestamp,
                    session_id: trackingData.session_id,
                    environment: trackingData.environment,
                    metadata: trackingData.metadata || {}
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Tracking API responded with ${response.status}: ${errorText}`);
            }

            // Only show success message when debugging
            if (process.env.CCT_DEBUG === 'true') {
                console.debug('📊 Download tracked successfully via Vercel function');
            }
            
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
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