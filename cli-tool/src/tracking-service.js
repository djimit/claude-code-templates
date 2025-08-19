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
     * Send tracking data via database endpoint and fallback to public telemetry
     */
    async sendTrackingData(trackingData) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            // Primary: Send to Vercel database endpoint
            await this.sendToDatabase(trackingData, controller.signal);

            // Secondary: Send to existing telemetry endpoint (for compatibility)
            await this.sendToTelemetry(trackingData, controller.signal);

            clearTimeout(timeoutId);

            if (process.env.CCT_DEBUG === 'true') {
                console.debug('📊 Download tracked successfully via database and telemetry');
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
     * Send tracking data to Vercel database
     */
    async sendToDatabase(trackingData, signal) {
        try {
            // Extract component path from metadata
            const componentPath = trackingData.metadata?.target_directory || 
                                trackingData.metadata?.path || 
                                trackingData.component_name;

            // Extract category from metadata or component name
            const category = trackingData.metadata?.category || 
                           (trackingData.component_name.includes('/') ? 
                            trackingData.component_name.split('/')[0] : 'general');

            const payload = {
                type: trackingData.component_type,
                name: trackingData.component_name,
                path: componentPath,
                category: category,
                cliVersion: trackingData.environment?.cli_version || 'unknown'
            };

            const response = await fetch('https://aitmpl.com/api/track-download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': `claude-code-templates/${trackingData.environment?.cli_version || 'unknown'}`
                },
                body: JSON.stringify(payload),
                signal: signal
            });

            if (process.env.CCT_DEBUG === 'true') {
                if (response.ok) {
                    console.debug('📊 Successfully saved to database');
                } else {
                    console.debug(`📊 Database save failed with status: ${response.status}`);
                }
            }

        } catch (error) {
            if (process.env.CCT_DEBUG === 'true') {
                console.debug('📊 Database tracking failed:', error.message);
            }
            // Don't throw - we want to continue to telemetry fallback
        }
    }

    /**
     * Send tracking data to existing telemetry endpoint (fallback)
     */
    async sendToTelemetry(trackingData, signal) {
        try {
            // Build query parameters for GET request (like image tracking)
            const params = new URLSearchParams({
                type: trackingData.component_type,
                name: trackingData.component_name,
                platform: trackingData.environment.platform || 'unknown',
                cli: trackingData.environment.cli_version || 'unknown',
                session: trackingData.session_id.substring(0, 8) // Only first 8 chars for privacy
            });

            // Use GitHub Pages tracking endpoint via custom domain (no auth needed)
            await fetch(`https://aitmpl.com/api/track.html?${params}`, {
                method: 'GET',
                mode: 'no-cors', // Prevents CORS errors
                signal: signal
            });

        } catch (error) {
            if (process.env.CCT_DEBUG === 'true') {
                console.debug('📊 Telemetry tracking failed:', error.message);
            }
            // Silent fail for telemetry too
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