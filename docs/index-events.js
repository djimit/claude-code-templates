// Index Events - Handles events specific to index.html

class IndexPageManager {
    constructor() {
        this.currentFilter = 'agents';
        this.currentCategoryFilter = 'all';
        this.templatesData = null;
        this.componentsData = null;
        this.availableCategories = {
            agents: new Set(),
            commands: new Set(),
            mcps: new Set()
        };
    }

    async init() {
        try {
            // Load both templates and components data
            await Promise.all([
                this.loadTemplatesData(),
                this.loadComponentsData()
            ]);
            
            this.setupEventListeners();
            this.displayCurrentFilter();
        } catch (error) {
            console.error('Error initializing index page:', error);
            this.showError('Failed to load data. Please refresh the page.');
        }
    }

    async loadTemplatesData() {
        try {
            this.templatesData = await window.dataLoader.loadTemplates();
        } catch (error) {
            console.error('Error loading templates:', error);
            // Continue without templates - show only components
        }
    }

    async loadComponentsData() {
        this.componentsData = await window.dataLoader.loadComponents();
        this.collectAvailableCategories();
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setFilter(filter);
            });
        });

        // Copy buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn')) {
                const command = e.target.previousElementSibling.textContent;
                this.copyToClipboard(command);
            }
        });
        
        // Card flip functionality for template cards
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.template-card');
            if (card && !e.target.closest('button')) {
                card.classList.toggle('flipped');
            }
        });
        
        // ESC key to close all flipped cards
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.template-card.flipped').forEach(card => {
                    card.classList.remove('flipped');
                });
            }
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.displayCurrentFilter();
    }

    // Set category filter
    setCategoryFilter(category) {
        this.currentCategoryFilter = category;
        
        // Update category filter buttons
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const targetBtn = document.querySelector(`[data-category="${category}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
        
        // Regenerate the component display
        this.displayCurrentFilter();
    }

    // Update category sub-filters in the unified-filter-bar
    updateCategorySubFilters() {
        const unifiedFilterBar = document.querySelector('.unified-filter-bar');
        if (!unifiedFilterBar) return;
        
        // Remove existing category filters
        const existingCategoryFilters = unifiedFilterBar.querySelector('.category-filter-row');
        if (existingCategoryFilters) {
            existingCategoryFilters.remove();
        }
        
        // Get categories for current filter type
        const currentCategories = Array.from(this.availableCategories[this.currentFilter] || []).sort();
        
        if (currentCategories.length <= 1 || this.currentFilter === 'templates') {
            // Don't show sub-filters if there's only one category, none, or templates
            return;
        }
        
        // Create category filter row
        const categoryFilterRow = document.createElement('div');
        categoryFilterRow.className = 'category-filter-row';
        categoryFilterRow.innerHTML = `
            <div class="category-filter-label">Categories:</div>
            <div class="category-filter-buttons">
                <button class="category-filter-btn ${this.currentCategoryFilter === 'all' ? 'active' : ''}" 
                        data-category="all">
                    All
                </button>
                ${currentCategories.map(category => `
                    <button class="category-filter-btn ${this.currentCategoryFilter === category ? 'active' : ''}" 
                            data-category="${category}">
                        ${this.formatComponentName(category)}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Add click event listeners
        categoryFilterRow.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setCategoryFilter(btn.getAttribute('data-category'));
            });
        });
        
        // Append to unified filter bar
        unifiedFilterBar.appendChild(categoryFilterRow);
    }

    // Get filtered components based on current filter and category filter
    getFilteredComponents(type) {
        if (!type) type = this.currentFilter;
        if (type === 'templates') {
            return [];
        }
        
        let components = this.componentsData[type] || [];
        
        // Apply category filter if not 'all'
        if (this.currentCategoryFilter !== 'all') {
            components = components.filter(component => {
                const category = component.category || 'general';
                return category === this.currentCategoryFilter;
            });
        }
        
        return components;
    }

    // Collect available categories from loaded components
    collectAvailableCategories() {
        // Reset categories
        this.availableCategories.agents.clear();
        this.availableCategories.commands.clear();
        this.availableCategories.mcps.clear();
        
        // Collect categories from each component type
        if (this.componentsData.agents && Array.isArray(this.componentsData.agents)) {
            this.componentsData.agents.forEach(component => {
                const category = component.category || 'general';
                this.availableCategories.agents.add(category);
            });
        }
        
        if (this.componentsData.commands && Array.isArray(this.componentsData.commands)) {
            this.componentsData.commands.forEach(component => {
                const category = component.category || 'general';  
                this.availableCategories.commands.add(category);
            });
        }
        
        if (this.componentsData.mcps && Array.isArray(this.componentsData.mcps)) {
            this.componentsData.mcps.forEach(component => {
                const category = component.category || 'general';
                this.availableCategories.mcps.add(category);
            });
        }
    }

    displayCurrentFilter() {
        const grid = document.getElementById('unifiedGrid');
        if (!grid) return;

        // Set proper grid class based on current filter
        if (this.currentFilter === 'templates') {
            grid.className = 'unified-grid templates-mode';
        } else {
            grid.className = 'unified-grid components-mode';
        }

        // Update filter button counts
        this.updateFilterCounts();

        switch (this.currentFilter) {
            case 'templates':
                this.displayTemplates(grid);
                break;
            case 'agents':
            case 'commands':
            case 'mcps':
                this.displayComponents(grid, this.currentFilter);
                break;
            default:
                grid.innerHTML = '<div class="error">Unknown filter</div>';
        }
    }

    displayTemplates(grid) {
        if (!this.templatesData) {
            grid.innerHTML = '<div class="loading">Loading templates...</div>';
            return;
        }

        let html = '';
        Object.entries(this.templatesData).forEach(([category, templates]) => {
            templates.forEach(template => {
                html += this.generateTemplateCard(template);
            });
        });

        grid.innerHTML = html || '<div class="no-data">No templates available</div>';
    }

    displayComponents(grid, type) {
        if (!this.componentsData) {
            grid.innerHTML = '<div class="loading">Loading components...</div>';
            return;
        }

        // Update category sub-filters in the unified-filter-bar
        this.updateCategorySubFilters();
        
        const components = this.getFilteredComponents(type);
        let html = '';
        
        // Add "Add New" card first
        html += this.createAddComponentCard(type);
        
        components.forEach(component => {
            html += this.generateComponentCard(component);
        });

        grid.innerHTML = html || '<div class="no-data">No components available</div>';
    }

    generateTemplateCard(template) {
        const installCommand = `npx claude-code-templates@latest --template "${template.id}"`;
        
        return `
            <div class="unified-card template-card" data-type="template">
                <div class="card-header">
                    <div class="card-icon">📦</div>
                    <div class="card-title-section">
                        <h3 class="card-title">${template.name}</h3>
                        <span class="card-type template">TEMPLATE</span>
                    </div>
                </div>
                <div class="card-content">
                    <p class="card-description">${template.description}</p>
                    <div class="card-meta">
                        <span class="card-category">${template.category}</span>
                        ${template.files ? `<span class="file-count">${template.files.length} files</span>` : ''}
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-primary" onclick="copyToClipboard('${installCommand}')">
                        Copy Install Command
                    </button>
                    <button class="btn-secondary" onclick="showComponentDetails('template', '${template.id}', '${template.folderPath}', '${template.category}')">
                        Details
                    </button>
                </div>
            </div>
        `;
    }

    generateComponentCard(component) {
        const installCommand = `npx claude-code-templates@latest --${component.type} "${component.path || component.name}"`;
        const typeConfig = {
            agent: { icon: '🤖', color: '#ff6b6b' },
            command: { icon: '⚡', color: '#4ecdc4' },
            mcp: { icon: '🔌', color: '#45b7d1' }
        };
        
        const config = typeConfig[component.type];
        
        // Escape quotes and special characters for onclick attributes
        const escapedType = component.type.replace(/'/g, "\\'");
        const escapedName = (component.name || '').replace(/'/g, "\\'");
        const escapedPath = (component.path || component.name || '').replace(/'/g, "\\'");
        const escapedCategory = (component.category || 'general').replace(/'/g, "\\'");
        const escapedCommand = installCommand.replace(/'/g, "\\'");
        
        // Create category label (use "General" if no category)
        const categoryName = component.category || 'general';
        const categoryLabel = `<div class="category-label">${this.formatComponentName(categoryName)}</div>`;
        
        return `
            <div class="template-card" data-type="${component.type}">
                <div class="card-inner">
                    <div class="card-front">
                        ${categoryLabel}
                        <div class="framework-logo" style="color: ${config.color}">
                            <span class="component-icon">${config.icon}</span>
                        </div>
                        <h3 class="template-title">${this.formatComponentName(component.name)}</h3>
                        <p class="template-description">${this.getComponentDescription(component)}</p>
                    </div>
                    <div class="card-back">
                        <div class="command-display">
                            <h3>Installation Command</h3>
                            <div class="command-code">${installCommand}</div>
                            <div class="action-buttons">
                                <button class="view-files-btn" onclick="showComponentDetails('${escapedType}', '${escapedName}', '${escapedPath}', '${escapedCategory}')">
                                    📁 View Details
                                </button>
                                <button class="copy-command-btn" onclick="copyToClipboard('${escapedCommand}')">
                                    📋 Copy Command
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Command copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            this.showNotification('Failed to copy command', 'error');
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    formatComponentName(name) {
        return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    getComponentDescription(component) {
        let description = '';
        
        if (component.description) {
            description = component.description;
        } else if (component.content) {
            // Try to extract description from frontmatter
            const descMatch = component.content.match(/description:\s*(.+?)(?:\n|$)/);
            if (descMatch) {
                description = descMatch[1].trim().replace(/^["']|["']$/g, '');
            } else {
                // Use first paragraph if no frontmatter description
                const lines = component.content.split('\n');
                const firstParagraph = lines.find(line => line.trim() && !line.startsWith('---') && !line.startsWith('#'));
                if (firstParagraph) {
                    description = firstParagraph.trim();
                }
            }
        }
        
        if (!description) {
            description = `A ${component.type} component for Claude Code.`;
        }
        
        // Truncate description to max 120 characters for proper card display
        if (description.length > 120) {
            description = description.substring(0, 117) + '...';
        }
        
        return description;
    }

    // Update filter button counts
    updateFilterCounts() {
        if (!this.componentsData) return;
        
        const agentsCount = this.componentsData.agents ? this.componentsData.agents.length : 0;
        const commandsCount = this.componentsData.commands ? this.componentsData.commands.length : 0;
        const mcpsCount = this.componentsData.mcps ? this.componentsData.mcps.length : 0;
        
        // Update each filter button with count
        const agentsBtn = document.querySelector('[data-filter="agents"]');
        const commandsBtn = document.querySelector('[data-filter="commands"]');
        const mcpsBtn = document.querySelector('[data-filter="mcps"]');
        const templatesBtn = document.querySelector('[data-filter="templates"]');
        
        if (agentsBtn) {
            agentsBtn.innerHTML = `🤖 Agents (${agentsCount})`;
        }
        if (commandsBtn) {
            commandsBtn.innerHTML = `⚡ Commands (${commandsCount})`;
        }
        if (mcpsBtn) {
            mcpsBtn.innerHTML = `🔌 MCPs (${mcpsCount})`;
        }
        if (templatesBtn) {
            templatesBtn.innerHTML = `📦 Templates`; // Templates count is handled separately
        }
    }

    // Create Add Component card
    createAddComponentCard(type) {
        const typeConfig = {
            agents: { 
                icon: '🤖', 
                name: 'Agent', 
                description: 'Create a new AI specialist agent',
                color: '#ff6b6b'
            },
            commands: { 
                icon: '⚡', 
                name: 'Command', 
                description: 'Add a custom slash command',
                color: '#4ecdc4'
            },
            mcps: { 
                icon: '🔌', 
                name: 'MCP', 
                description: 'Build a Model Context Protocol integration',
                color: '#45b7d1'
            }
        };
        
        const config = typeConfig[type];
        if (!config) return '';
        
        return `
            <div class="template-card add-template-card add-component-card" onclick="showComponentContributeModal('${type}')">
                <div class="card-inner">
                    <div class="card-front">
                        <div class="framework-logo" style="color: ${config.color}">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                            </svg>
                        </div>
                        <h3 class="template-title">Add New ${config.name}</h3>
                        <p class="template-description">${config.description}</p>
                    </div>
                </div>
            </div>
        `;
    }

    showError(message) {
        const grid = document.getElementById('unifiedGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message">
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn-primary">Retry</button>
                </div>
            `;
        }
    }

    // Framework icons mapping
    getFrameworkIcon(framework) {
        const icons = {
            'common': 'devicon-gear-plain',
            'javascript-typescript': 'devicon-javascript-plain',
            'python': 'devicon-python-plain',
            'ruby': 'devicon-ruby-plain',
            'rust': 'devicon-rust-plain',
            'go': 'devicon-go-plain',
            'react': 'devicon-react-original',
            'vue': 'devicon-vuejs-plain',
            'angular': 'devicon-angularjs-plain',
            'node': 'devicon-nodejs-plain',
            'django': 'devicon-django-plain',
            'flask': 'devicon-flask-original',
            'fastapi': 'devicon-fastapi-plain',
            'rails': 'devicon-rails-plain',
            'sinatra': 'devicon-ruby-plain',
            'default': 'devicon-devicon-plain'
        };
        return icons[framework] || icons['default'];
    }

    // Create Add Template card
    createAddTemplateCard() {
        const card = document.createElement('div');
        card.className = 'template-card add-template-card';
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <div class="framework-logo">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                        </svg>
                    </div>
                    <h3 class="template-title">Add New Template</h3>
                    <p class="template-description">Contribute a new language or framework to the community</p>
                </div>
            </div>
        `;
        
        // Add click handler
        card.addEventListener('click', () => {
            this.showContributeModal();
        });
        
        return card;
    }

    // Create individual template card
    createTemplateCard(languageKey, languageData, frameworkKey, frameworkData) {
        const card = document.createElement('div');
        card.className = `template-card ${languageData.comingSoon ? 'coming-soon' : ''}`;
        
        const displayName = frameworkKey === 'none' ? 
            frameworkData.name : 
            `${languageData.name.split('/')[0]}/${frameworkData.name}`;
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    ${languageData.comingSoon ? '<div class="coming-soon-badge">Coming Soon</div>' : ''}
                    <div class="framework-logo">
                        <i class="${frameworkData.icon} colored"></i>
                    </div>
                    <h3 class="template-title">${displayName}</h3>
                    <p class="template-description">${(languageData.description || '').substring(0, 120)}${(languageData.description || '').length > 120 ? '...' : ''}</p>
                </div>
                <div class="card-back">
                    <div class="command-display">
                        <h3>Installation Options</h3>
                        <div class="command-code">${frameworkData.command}</div>
                        <div class="action-buttons">
                            <button class="view-files-btn" onclick="showInstallationFiles('${languageKey}', '${frameworkKey}', '${displayName}')">
                                📁 View Files
                            </button>
                            <button class="copy-command-btn" onclick="copyToClipboard('${frameworkData.command}')">
                                📋 Copy Command
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add click handler for card flip (only if not coming soon)
        if (!languageData.comingSoon) {
            card.addEventListener('click', (e) => {
                // Don't flip if clicking on buttons
                if (!e.target.closest('button')) {
                    card.classList.toggle('flipped');
                }
            });
        }
        
        return card;
    }

    // Fetch templates configuration from GitHub
    async fetchTemplatesConfig() {
        const GITHUB_CONFIG = {
            owner: 'davila7',
            repo: 'claude-code-templates',
            branch: 'main',
            templatesPath: 'cli-tool/src/templates.js'
        };
        
        try {
            const url = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.templatesPath}?t=${Date.now()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const templateFileContent = await response.text();
            this.templatesData = this.parseTemplatesConfig(templateFileContent);
            
            return this.templatesData;
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw error;
        }
    }

    // Parse templates configuration
    parseTemplatesConfig(fileContent) {
        try {
            const configMatch = fileContent.match(/const TEMPLATES_CONFIG = ({[\s\S]*?});/);
            if (!configMatch) {
                throw new Error('TEMPLATES_CONFIG not found in file');
            }
            
            let configString = configMatch[1];
            configString = configString.replace(/'/g, '"');
            configString = configString.replace(/(\w+):/g, '"$1":');
            configString = configString.replace(/,(\s*[}\]])/g, '$1');
            
            return JSON.parse(configString);
        } catch (error) {
            console.error('Error parsing templates config:', error);
            return null;
        }
    }

    // Show contribute modal
    showContributeModal() {
        alert('Contribute modal would open here - this needs to be implemented with the full modal HTML from script.js');
    }
}

// Global function for component details (called from onclick)
function showComponentDetails(type, name, path, category) {
    let component;
    
    if (type === 'template') {
        // Find template in templates data
        if (window.indexManager && window.indexManager.templatesData) {
            Object.values(window.indexManager.templatesData).forEach(templates => {
                const found = templates.find(t => t.id === name);
                if (found) component = found;
            });
        }
    } else {
        // Find component in components data
        if (window.indexManager && window.indexManager.componentsData) {
            const components = window.indexManager.componentsData[type + 's'] || [];
            component = components.find(c => c.name === name || c.path === path);
        }
    }
    
    if (component) {
        // Make sure showComponentModal is available from modal-helpers.js
        if (typeof window.showComponentModal === 'function') {
            window.showComponentModal(component);
        } else if (typeof showComponentModal === 'function') {
            showComponentModal(component);
        } else {
            console.error('showComponentModal function not found');
            alert('Error: Modal function not available. Please refresh the page.');
        }
    } else {
        console.warn('Component not found:', type, name, 'path:', path, 'category:', category);
    }
}

// Global function for copying (called from onclick)
function copyToClipboard(text) {
    if (window.indexManager) {
        window.indexManager.copyToClipboard(text);
    }
}

// Global function for setting filter (called from onclick)
function setUnifiedFilter(filter) {
    if (window.indexManager) {
        window.indexManager.setFilter(filter);
    }
}

// Global function for setting category filter (called from onclick)
function setCategoryFilter(category) {
    if (window.indexManager) {
        window.indexManager.setCategoryFilter(category);
    }
}

// Global function for component contribute modal
function showComponentContributeModal(type) {
    const typeConfig = {
        agents: {
            name: 'Agent',
            icon: '🤖',
            color: '#ff6b6b',
            label: 'AGENT',
            description: 'AI specialist that handles specific development tasks and provides expert guidance in particular domains.',
            example: 'python-testing-specialist',
            structure: `---
name: python-testing-specialist
description: Expert in Python testing frameworks and best practices
color: blue
---

You are a Python testing specialist with deep expertise in:
- pytest, unittest, and testing frameworks
- Test-driven development (TDD)
- Mocking and fixtures
- Coverage analysis and reporting
- Integration and end-to-end testing

When helping with testing tasks, you:
1. Recommend appropriate testing strategies
2. Write comprehensive test cases
3. Suggest testing patterns and best practices
4. Help debug failing tests
5. Optimize test performance and maintainability`
        },
        commands: {
            name: 'Command',
            icon: '⚡',
            color: '#4ecdc4',
            label: 'COMMAND',
            description: 'Custom slash command that provides specific functionality and automation for development workflows.',
            example: 'optimize-bundle',
            structure: `---
name: optimize-bundle
description: Analyze and optimize JavaScript/TypeScript bundle size
---

# Bundle Optimization Command

This command helps you analyze and optimize your application bundle size.

## What it does:
1. Analyzes current bundle composition
2. Identifies large dependencies
3. Suggests optimization strategies
4. Implements tree-shaking improvements
5. Generates optimization report

## Usage:
\`/optimize-bundle\`

## Process:
- Scans package.json and build configuration
- Runs bundle analyzer
- Identifies optimization opportunities
- Provides actionable recommendations`
        },
        mcps: {
            name: 'MCP',
            icon: '🔌',
            color: '#45b7d1',
            label: 'MCP',
            description: 'Model Context Protocol integration that connects Claude Code with external services and data sources.',
            example: 'redis-integration',
            structure: `{
  "mcpServers": {
    "redis": {
      "command": "node",
      "args": ["redis-mcp-server.js"],
      "env": {
        "REDIS_URL": "redis://localhost:6379"
      }
    }
  }
}

// Configuration for Redis MCP integration
// Provides caching, session management, and data persistence
// Supports Redis commands and connection management`
        }
    };
    
    const config = typeConfig[type];
    if (!config) return;
    
    const installCommand = `npx claude-code-templates@latest --${type.slice(0, -1)} "${config.example}"`;
    
    const modalHTML = `
        <div class="modal-overlay" onclick="closeComponentModal()">
            <div class="modal-content component-modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <div class="component-modal-title">
                        <span class="component-icon" style="color: ${config.color}">${config.icon}</span>
                        <h3>Add New ${config.name}</h3>
                        <span class="component-type-badge" style="background: ${config.color}">${config.label}</span>
                    </div>
                    <button class="modal-close" onclick="closeComponentModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="component-details">
                        <div class="component-description">
                            ${config.description}
                        </div>
                        
                        <div class="installation-section">
                            <h4>📦 Installation</h4>
                            <div class="command-line">
                                <code>${installCommand}</code>
                                <button class="copy-btn" onclick="copyToClipboard('${installCommand.replace(/'/g, "\\'")}')">Copy</button>
                            </div>
                        </div>
                        
                        <div class="component-content">
                            <h4>📋 Component Details</h4>
                            <div class="component-preview">
                                <div class="code-editor">
                                    <div class="code-line-numbers">
                                        ${config.structure.split('\n').map((_, i) => `<span>${i + 1}</span>`).join('')}
                                    </div>
                                    <div class="code-content">
                                        <pre><code>${config.structure}</code></pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="modal-actions">
                            <a href="https://github.com/davila7/claude-code-templates/tree/main/cli-tool/components/${type}" target="_blank" class="github-folder-link">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                View on GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listener for ESC key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeComponentModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Global functions for templates functionality
function showInstallationFiles(languageKey, frameworkKey, displayName) {
    alert(`Installation files for ${displayName} would be shown here`);
}

// Close component modal
function closeComponentModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.remove();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.indexManager = new IndexPageManager();
    window.indexManager.init();
});