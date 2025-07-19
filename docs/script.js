// GitHub repository configuration
const GITHUB_CONFIG = {
    owner: 'davila7',
    repo: 'claude-code-templates',
    branch: 'main',
    templatesPath: 'cli-tool/src/templates.js'
};

// Framework logos using Devicon CDN (https://devicon.dev/)
const FRAMEWORK_ICONS = {
    // Languages
    'common': 'devicon-gear-plain', // Generic gear icon
    'javascript-typescript': 'devicon-javascript-plain',
    'python': 'devicon-python-plain',
    'ruby': 'devicon-ruby-plain',
    'rust': 'devicon-rust-plain',
    'go': 'devicon-go-plain',
    
    // JavaScript/TypeScript frameworks
    'react': 'devicon-react-original',
    'vue': 'devicon-vuejs-plain',
    'angular': 'devicon-angularjs-plain',
    'node': 'devicon-nodejs-plain',
    
    // Python frameworks
    'django': 'devicon-django-plain',
    'flask': 'devicon-flask-original',
    'fastapi': 'devicon-fastapi-plain',
    
    // Ruby frameworks
    'rails': 'devicon-rails-plain',
    'sinatra': 'devicon-ruby-plain', // Use Ruby icon for Sinatra
    
    // Default fallback
    'default': 'devicon-devicon-plain'
};

let templatesData = null;

// Fetch templates configuration from GitHub
async function fetchTemplatesConfig() {
    const grid = document.getElementById('templatesGrid');
    grid.innerHTML = '<div class="loading">Loading templates from GitHub...</div>';
    
    try {
        const url = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.templatesPath}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const templateFileContent = await response.text();
        
        // Parse the JavaScript file to extract TEMPLATES_CONFIG
        templatesData = parseTemplatesConfig(templateFileContent);
        
        if (templatesData) {
            generateTemplateCards();
        } else {
            throw new Error('Failed to parse templates configuration');
        }
        
    } catch (error) {
        console.error('Error fetching templates:', error);
        grid.innerHTML = `
            <div class="error-message">
                <h3>Error loading templates</h3>
                <p>Could not fetch templates from GitHub. Please try again later.</p>
                <button onclick="fetchTemplatesConfig()" class="retry-btn">Retry</button>
            </div>
        `;
    }
}

// Parse the templates.js file content to extract TEMPLATES_CONFIG
function parseTemplatesConfig(fileContent) {
    try {
        // Extract TEMPLATES_CONFIG object from the file
        const configMatch = fileContent.match(/const TEMPLATES_CONFIG = ({[\s\S]*?});/);
        if (!configMatch) {
            throw new Error('TEMPLATES_CONFIG not found in file');
        }
        
        // Clean up the extracted object string and make it valid JSON
        let configString = configMatch[1];
        
        // Replace single quotes with double quotes
        configString = configString.replace(/'/g, '"');
        
        // Handle object property names without quotes
        configString = configString.replace(/(\w+):/g, '"$1":');
        
        // Remove trailing commas
        configString = configString.replace(/,(\s*[}\]])/g, '$1');
        
        // Parse the JSON
        const config = JSON.parse(configString);
        
        return config;
    } catch (error) {
        console.error('Error parsing templates config:', error);
        return null;
    }
}

// Generate template cards from fetched data
function generateTemplateCards() {
    const grid = document.getElementById('templatesGrid');
    grid.innerHTML = '';
    
    if (!templatesData) {
        grid.innerHTML = '<div class="error-message">No templates data available</div>';
        return;
    }
    
    Object.entries(templatesData).forEach(([languageKey, languageData]) => {
        // Create base language card (no framework)
        const baseCard = createTemplateCard(languageKey, languageData, 'none', {
            name: languageData.name,
            icon: getFrameworkIcon(languageKey),
            command: `claude-code-templates --yes --language=${languageKey}`
        });
        grid.appendChild(baseCard);
        
        // Create framework-specific cards
        if (languageData.frameworks) {
            Object.entries(languageData.frameworks).forEach(([frameworkKey, frameworkData]) => {
                const frameworkCard = createTemplateCard(languageKey, languageData, frameworkKey, {
                    name: frameworkData.name,
                    icon: getFrameworkIcon(frameworkKey),
                    command: `claude-code-templates --yes --language=${languageKey} --framework=${frameworkKey}`
                });
                grid.appendChild(frameworkCard);
            });
        }
    });
}

function createTemplateCard(languageKey, languageData, frameworkKey, frameworkData) {
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
                <p class="template-description">${languageData.description || ''}</p>
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

// Get framework icon from mapping
function getFrameworkIcon(framework) {
    return FRAMEWORK_ICONS[framework] || FRAMEWORK_ICONS['default'];
}

// Get installation files for a specific template
function getInstallationFiles(languageKey, frameworkKey) {
    if (!templatesData || !templatesData[languageKey]) {
        return [];
    }
    
    const languageData = templatesData[languageKey];
    let files = [...(languageData.files || [])];
    
    // Add framework-specific files if applicable
    if (frameworkKey !== 'none' && languageData.frameworks && languageData.frameworks[frameworkKey]) {
        const frameworkData = languageData.frameworks[frameworkKey];
        if (frameworkData.additionalFiles) {
            files = files.concat(frameworkData.additionalFiles);
        }
    }
    
    return files;
}

// Show installation files popup
function showInstallationFiles(languageKey, frameworkKey, displayName) {
    const files = getInstallationFiles(languageKey, frameworkKey);
    
    if (files.length === 0) {
        showCopyFeedback('No files to display');
        return;
    }
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>📁 Installation Files - ${displayName}</h3>
                    <button class="modal-close" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <p class="modal-description">The following files will be installed in your project:</p>
                    <div class="files-table">
                        <div class="table-header">
                            <div class="column-header">File</div>
                            <div class="column-header">Destination</div>
                            <div class="column-header">Type</div>
                        </div>
                        ${files.map(file => `
                            <div class="table-row">
                                <div class="file-source">${file.source}</div>
                                <div class="file-destination">${file.destination}</div>
                                <div class="file-type">${getFileType(file.destination)}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="modal-footer">
                        <p class="file-count">Total: ${files.length} file${files.length > 1 ? 's' : ''}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    const modal = document.createElement('div');
    modal.innerHTML = modalHTML;
    modal.className = 'modal';
    document.body.appendChild(modal);
    
    // Add event listener for ESC key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Get file type based on extension/name
function getFileType(filename) {
    if (filename.endsWith('.md')) return 'Documentation';
    if (filename.endsWith('.json')) return 'Configuration';
    if (filename.includes('.claude')) return 'Commands';
    if (filename.includes('commands')) return 'Commands';
    return 'Configuration';
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback();
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showCopyFeedback();
        } catch (err) {
            console.error('Fallback copy failed: ', err);
        }
        document.body.removeChild(textArea);
    });
}

function showCopyFeedback() {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.textContent = 'Copied to clipboard!';
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #48bb78;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(feedback);
    
    // Remove feedback after 2 seconds
    setTimeout(() => {
        feedback.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 300);
    }, 2000);
}

// Add CSS animations for feedback and error states
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .error-message {
        grid-column: 1 / -1;
        text-align: center;
        color: white;
        background: rgba(220, 53, 69, 0.2);
        border: 1px solid rgba(220, 53, 69, 0.3);
        border-radius: 12px;
        padding: 2rem;
    }
    
    .error-message h3 {
        margin-bottom: 1rem;
        font-size: 1.2rem;
    }
    
    .retry-btn {
        background: #dc3545;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 1rem;
        font-size: 0.9rem;
        transition: background 0.2s ease;
    }
    
    .retry-btn:hover {
        background: #c82333;
    }
`;
document.head.appendChild(style);

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchTemplatesConfig();
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close all flipped cards
        document.querySelectorAll('.template-card.flipped').forEach(card => {
            card.classList.remove('flipped');
        });
    }
});

// Auto-refresh templates every 5 minutes to pick up changes
setInterval(fetchTemplatesConfig, 5 * 60 * 1000);