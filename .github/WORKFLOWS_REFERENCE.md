# GitHub Workflows Reference

## ✅ Active Workflows

### `simple-tracking.yml` - **OFFICIAL DOWNLOAD TRACKING**
- **Status**: ✅ ACTIVE - Use this one
- **Purpose**: Download tracking with PR creation
- **Trigger**: Manual workflow_dispatch
- **Features**: 
  - Creates PRs with tracking updates
  - Updates `docs/analytics/download-stats.json`
  - Maintains repository security
  - Real-time analytics updates

### `deploy-docusaurus.yml` - **DOCUMENTATION DEPLOYMENT**
- **Status**: ✅ ACTIVE - Keep this one
- **Purpose**: Deploys Docusaurus documentation site
- **Trigger**: Push to main (docs changes)

### `pages-build-deployment` - **GITHUB PAGES**
- **Status**: ✅ ACTIVE - GitHub managed
- **Purpose**: Builds and deploys GitHub Pages
- **Trigger**: Automatic on changes

## ❌ Deprecated Workflows

### `analytics-processor.yml (DEPRECATED)`
- **Status**: ❌ DEPRECATED - Do not use
- **Original Purpose**: Issues-based tracking system
- **Why Deprecated**: Too complex, relied on GitHub Issues
- **Replaced By**: `simple-tracking.yml`

### `process-tracking-logs.yml (DEPRECATED)`
- **Status**: ❌ DEPRECATED - Do not use
- **Original Purpose**: Scheduled log processing
- **Why Deprecated**: No access to GitHub Pages logs, used simulated data
- **Replaced By**: `simple-tracking.yml`

### `tracking-dispatch.yml (DEPRECATED)`
- **Status**: ❌ DEPRECATED - Do not use
- **Original Purpose**: Repository dispatch event handling
- **Why Deprecated**: Authentication issues, complex setup
- **Replaced By**: `simple-tracking.yml`

## Usage Instructions

### For Download Tracking
**Use only**: `simple-tracking.yml`

```bash
# Trigger the workflow manually
gh workflow run "Simple Download Tracking" \
  --field component_type=agent \
  --field component_name=your-component \
  --field platform=production \
  --field cli_version=1.15.0
```

### For Documentation Updates
**Use**: `deploy-docusaurus.yml` (triggers automatically)

## Migration Notes

All deprecated workflows have been:
- ✅ Disabled (triggers commented out)
- ✅ Marked with `(DEPRECATED)` in the name
- ✅ Kept for reference and historical context
- ✅ Configured with warning inputs if manually triggered

**Do not delete** the deprecated workflows - they contain valuable implementation history and debugging information.

## Troubleshooting

If you see multiple tracking workflows running:
1. ✅ Use only `Simple Download Tracking`
2. ❌ Ignore any workflows with `(DEPRECATED)` in the name
3. 📞 Check this file if unsure which workflow to use

---

Last updated: 2025-08-01  
Active tracking system: `simple-tracking.yml`