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
        if (!component.content && !component.description) {
            return `A ${component.type} component for Claude Code.`;
        }
        
        if (component.description) {
            return component.description;
        }
        
        // Try to extract description from frontmatter
        const descMatch = component.content.match(/description:\s*(.+?)(?:\n|$)/);
        if (descMatch) {
            return descMatch[1].trim().replace(/^["']|["']$/g, '');
        }
        
        // Use first paragraph if no frontmatter description
        const lines = component.content.split('\n');
        const firstParagraph = lines.find(line => line.trim() && !line.startsWith('---') && !line.startsWith('#'));
        if (firstParagraph) {
            return firstParagraph.trim();
        }
        
        return `A ${component.type} component for Claude Code.`;
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
        component = window.dataLoader.findComponent(name, type);
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
        console.warn('Component not found:', type, name);
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.indexManager = new IndexPageManager();
    window.indexManager.init();
});