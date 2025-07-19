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
        
        // Debug: Log the parsed config
        console.log('Parsed templates config:', config);
        
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
    
    // Add the "Add New Template" card first
    const addTemplateCard = createAddTemplateCard();
    grid.appendChild(addTemplateCard);
    
    Object.entries(templatesData).forEach(([languageKey, languageData]) => {
        // Skip the 'common' template as we're replacing it with the Add Template card
        if (languageKey === 'common') {
            return;
        }
        
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

function createAddTemplateCard() {
    const card = document.createElement('div');
    card.className = 'template-card add-template-card';
    
    card.innerHTML = `
        <div class="card-inner">
            <div class="card-front">
                <div class="framework-logo add-template-logo">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                    </svg>
                </div>
                <h3 class="template-title">Add New Template</h3>
                <p class="template-description">Contribute a new language or framework to the community</p>
            </div>
            <div class="card-back">
                <div class="command-display">
                    <h3>🚀 Contribute</h3>
                    <div class="add-template-info">
                        <p>Help expand Claude Code Templates by adding:</p>
                        <ul>
                            <li>New programming languages</li>
                            <li>Popular frameworks</li>
                            <li>Development tools</li>
                        </ul>
                    </div>
                    <div class="action-buttons">
                        <button class="view-files-btn contribute-btn">
                            📝 Start Contributing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add click handler to open contribution modal directly (no flip)
    card.addEventListener('click', (e) => {
        showContributeModal();
    });
    
    return card;
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
    
    // Debug: Log the files to see what we're getting
    console.log('Base files for', languageKey, ':', files);
    
    // Add framework-specific files if applicable
    if (frameworkKey !== 'none' && languageData.frameworks && languageData.frameworks[frameworkKey]) {
        const frameworkData = languageData.frameworks[frameworkKey];
        if (frameworkData.additionalFiles) {
            files = files.concat(frameworkData.additionalFiles);
            console.log('Added framework files for', frameworkKey, ':', frameworkData.additionalFiles);
        }
    }
    
    console.log('Final files list:', files);
    return files;
}

// Show installation files popup
function showInstallationFiles(languageKey, frameworkKey, displayName) {
    const files = getInstallationFiles(languageKey, frameworkKey);
    
    if (files.length === 0) {
        showCopyFeedback('No files to display');
        return;
    }
    
    // Generate GitHub folder URL
    const githubFolderUrl = getGithubFolderUrl(languageKey, frameworkKey);
    
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
                                <div class="file-source">
                                    <a href="${getGithubFileUrl(languageKey, frameworkKey, file.source)}" target="_blank" class="file-link">
                                        ${file.source}
                                    </a>
                                </div>
                                <div class="file-destination">${file.destination}</div>
                                <div class="file-type">${getFileType(file.destination)}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="modal-footer">
                        <p class="file-count">Total: ${files.length} file${files.length > 1 ? 's' : ''}</p>
                        <div class="modal-actions">
                            <a href="${githubFolderUrl}" target="_blank" class="github-folder-link">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                View all files on GitHub
                            </a>
                        </div>
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

// Show contribute modal
function showContributeModal() {
    const modalHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content contribute-modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>🚀 Contribute a New Template</h3>
                    <button class="modal-close" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="contribute-intro">
                        <p>Help expand Claude Code Templates by contributing new languages or frameworks! Follow these steps to submit your contribution:</p>
                    </div>
                    
                    <div class="contribute-steps">
                        <div class="contribute-step">
                            <div class="step-number-contrib">1</div>
                            <div class="step-content-contrib">
                                <h4>Fork the Repository</h4>
                                <p>Go to the <a href="https://github.com/davila7/claude-code-templates" target="_blank">main repository</a> and click "Fork" to create your own copy.</p>
                                <div class="step-command">
                                    <code>git clone https://github.com/YOUR_USERNAME/claude-code-templates.git</code>
                                    <button class="copy-btn" onclick="copyToClipboard('git clone https://github.com/YOUR_USERNAME/claude-code-templates.git')">Copy</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="contribute-step">
                            <div class="step-number-contrib">2</div>
                            <div class="step-content-contrib">
                                <h4>Choose Your Contribution Type</h4>
                                <div class="contribution-types">
                                    <div class="contrib-type">
                                        <strong>New Language:</strong> Add to <code>cli-tool/templates/</code>
                                        <br><small>Example: <code>cli-tool/templates/kotlin/</code></small>
                                    </div>
                                    <div class="contrib-type">
                                        <strong>New Framework:</strong> Add to <code>cli-tool/templates/{language}/examples/</code>
                                        <br><small>Example: <code>cli-tool/templates/python/examples/fastapi-app/</code></small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="contribute-step">
                            <div class="step-number-contrib">3</div>
                            <div class="step-content-contrib">
                                <h4>Use Claude Code to Generate the Template</h4>
                                <p>Copy this prompt and use it with Claude Code to automatically generate the template structure:</p>
                                <div class="claude-prompt">
                                    <h5>📋 Claude Code Prompt:</h5>
                                    <div class="prompt-text">
                                        <pre>I want to contribute a new template to the claude-code-templates repository. 

Please help me create:
- A new [LANGUAGE/FRAMEWORK] template
- All necessary configuration files (CLAUDE.md, .claude/, .mcp.json)
- Update cli-tool/src/templates.js with the new configuration
- Include appropriate hooks and commands for this technology

The template should follow the existing patterns in the repository and include:
1. CLAUDE.md with language/framework-specific guidelines
2. .claude/commands/ with relevant development commands
3. .mcp.json with appropriate MCP configurations
4. Update templates.js with the new template definition

Target: [SPECIFY: New language (e.g., "Kotlin") OR new framework (e.g., "FastAPI for Python")]

Please analyze the existing templates in the repository first to understand the structure and patterns, then create the new template following the same conventions.</pre>
                                    </div>
                                    <button class="copy-btn copy-prompt-btn" onclick="copyToClipboard(document.querySelector('.prompt-text pre').textContent)">Copy Prompt</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="contribute-step">
                            <div class="step-number-contrib">4</div>
                            <div class="step-content-contrib">
                                <h4>Test Your Template</h4>
                                <p>Before submitting, test your template locally:</p>
                                <div class="step-command">
                                    <code>cd cli-tool && npm test</code>
                                    <button class="copy-btn" onclick="copyToClipboard('cd cli-tool && npm test')">Copy</button>
                                </div>
                                <div class="step-command">
                                    <code>node src/index.js --language=YOUR_LANGUAGE</code>
                                    <button class="copy-btn" onclick="copyToClipboard('node src/index.js --language=YOUR_LANGUAGE')">Copy</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="contribute-step">
                            <div class="step-number-contrib">5</div>
                            <div class="step-content-contrib">
                                <h4>Submit Pull Request</h4>
                                <p>Create a pull request with your changes:</p>
                                <div class="step-command">
                                    <code>git add . && git commit -m "feat: Add [LANGUAGE/FRAMEWORK] template"</code>
                                    <button class="copy-btn" onclick="copyToClipboard('git add . && git commit -m \"feat: Add [LANGUAGE/FRAMEWORK] template\"')">Copy</button>
                                </div>
                                <div class="step-command">
                                    <code>git push origin main</code>
                                    <button class="copy-btn" onclick="copyToClipboard('git push origin main')">Copy</button>
                                </div>
                                <p>Then go to GitHub and create a Pull Request with:</p>
                                <ul>
                                    <li>Clear title: "feat: Add [Language/Framework] template"</li>
                                    <li>Description of the template and its use cases</li>
                                    <li>Screenshots or examples if applicable</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="contribute-footer">
                        <div class="help-section">
                            <h4>Need Help?</h4>
                            <p>Check out <a href="https://github.com/davila7/claude-code-templates/blob/main/CONTRIBUTING.md" target="_blank">CONTRIBUTING.md</a> or open an issue on GitHub.</p>
                        </div>
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

// Get file type based on extension/name
function getFileType(filename) {
    if (filename.endsWith('.md')) return 'Documentation';
    if (filename.endsWith('.json')) return 'Configuration';
    if (filename.includes('.claude')) return 'Commands';
    if (filename.includes('commands')) return 'Commands';
    return 'Configuration';
}

// Generate GitHub folder URL for templates
function getGithubFolderUrl(languageKey, frameworkKey) {
    const baseUrl = 'https://github.com/davila7/claude-code-templates/tree/main/cli-tool/templates';
    
    if (frameworkKey === 'none' || !frameworkKey) {
        // Base language template
        return `${baseUrl}/${languageKey}`;
    } else {
        // Framework-specific template
        return `${baseUrl}/${languageKey}/examples/${frameworkKey}-app`;
    }
}

// Generate GitHub file URL for individual files
function getGithubFileUrl(languageKey, frameworkKey, filePath) {
    const baseUrl = 'https://github.com/davila7/claude-code-templates/blob/main/cli-tool/templates';
    return `${baseUrl}/${filePath}`;
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