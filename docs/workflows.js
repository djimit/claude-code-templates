// Workflow Builder JavaScript

// Global state
let workflowState = {
    steps: [],
    properties: {
        name: '',
        description: '',
        tags: []
    },
    components: {
        agents: [],
        commands: [],
        mcps: []
    }
};

// GitHub API configuration
const GITHUB_CONFIG = {
    owner: 'davila7',
    repo: 'claude-code-templates',
    baseUrl: 'https://api.github.com/repos/davila7/claude-code-templates/contents/cli-tool/components'
};

// Initialize the workflow builder
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing Workflow Builder...');
    
    // Show loading spinner
    showLoadingSpinner();
    
    try {
        // Load all components
        await loadAllComponents();
        
        // Initialize drag and drop
        initializeDragAndDrop();
        
        // Initialize event listeners
        initializeEventListeners();
        
        // Initialize sortable workflow steps
        initializeSortableSteps();
        
        console.log('Workflow Builder initialized successfully');
    } catch (error) {
        console.error('Error initializing Workflow Builder:', error);
        showError('Failed to load components. Please refresh the page.');
    } finally {
        // Hide loading spinner
        hideLoadingSpinner();
    }
});

// Load all components from GitHub
async function loadAllComponents() {
    console.log('Loading components from GitHub...');
    
    try {
        // Load agents, commands, and MCPs in parallel
        const [agents, commands, mcps] = await Promise.all([
            loadComponentType('agents'),
            loadComponentType('commands'),
            loadComponentType('mcps')
        ]);
        
        workflowState.components = { agents, commands, mcps };
        
        // Render components in the UI
        renderComponentsList('agents', agents);
        renderComponentsList('commands', commands);
        renderComponentsList('mcps', mcps);
        
        console.log(`Loaded ${agents.length} agents, ${commands.length} commands, ${mcps.length} MCPs`);
    } catch (error) {
        console.error('Error loading components:', error);
        throw error;
    }
}

// Load specific component type from GitHub
async function loadComponentType(type) {
    const components = [];
    
    try {
        const response = await fetch(`${GITHUB_CONFIG.baseUrl}/${type}`);
        if (!response.ok) {
            // If API rate limit or 403, return empty array instead of failing
            console.warn(`Could not load ${type}: ${response.status} ${response.statusText}`);
            return [];
        }
        
        const contents = await response.json();
        
        for (const item of contents) {
            if (item.type === 'file' && (item.name.endsWith('.md') || item.name.endsWith('.json'))) {
                // Direct component file
                const componentName = item.name.replace(/\.(md|json)$/, '');
                components.push({
                    name: componentName,
                    path: componentName,
                    category: 'root',
                    type: type.slice(0, -1), // Remove 's' from type
                    icon: getComponentIcon(type.slice(0, -1))
                });
            } else if (item.type === 'dir') {
                // Category directory, fetch its contents
                try {
                    const categoryResponse = await fetch(`${GITHUB_CONFIG.baseUrl}/${type}/${item.name}`);
                    if (categoryResponse.ok) {
                        const categoryContents = await categoryResponse.json();
                        for (const categoryItem of categoryContents) {
                            if (categoryItem.type === 'file' && (categoryItem.name.endsWith('.md') || categoryItem.name.endsWith('.json'))) {
                                const componentName = categoryItem.name.replace(/\.(md|json)$/, '');
                                components.push({
                                    name: componentName,
                                    path: `${item.name}/${componentName}`,
                                    category: item.name,
                                    type: type.slice(0, -1),
                                    icon: getComponentIcon(type.slice(0, -1))
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`Warning: Could not fetch category ${item.name}:`, error.message);
                }
            }
        }
    } catch (error) {
        console.error(`Error loading ${type}:`, error);
        // Return empty array on error to prevent breaking the entire load process
        return [];
    }
    
    return components.sort((a, b) => a.name.localeCompare(b.name));
}

// Get icon for component type
function getComponentIcon(type) {
    const icons = {
        'agent': '🤖',
        'command': '⚡',
        'mcp': '🔌'
    };
    return icons[type] || '📦';
}

// Render components list in the UI as tree
function renderComponentsList(type, components) {
    const container = document.getElementById(`${type}-tree`);
    const countElement = document.getElementById(`${type}-count`);
    
    if (!container) return;
    
    // Update count
    if (countElement) {
        countElement.textContent = components.length;
    }
    
    container.innerHTML = '';
    
    // Group components by category
    const groupedComponents = components.reduce((acc, component) => {
        const category = component.category === 'root' ? 'general' : component.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(component);
        return acc;
    }, {});
    
    // Render each category as a tree folder
    Object.entries(groupedComponents).forEach(([category, categoryComponents]) => {
        const folderElement = createTreeFolder(category, categoryComponents, type);
        container.appendChild(folderElement);
    });
}

// Create tree folder element
function createTreeFolder(category, components, type) {
    const folderElement = document.createElement('div');
    folderElement.className = 'tree-node';
    
    const folderId = `${type}-${category.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    
    folderElement.innerHTML = `
        <div class="tree-node-header" data-folder="${folderId}">
            <span class="tree-icon folder-icon">📁</span>
            <span class="tree-label">${category}</span>
            <span class="tree-count">${components.length}</span>
            <span class="tree-arrow">▶</span>
        </div>
        <div class="tree-children" id="${folderId}">
        </div>
    `;
    
    // Add components to this folder
    const childrenContainer = folderElement.querySelector('.tree-children');
    components.forEach(component => {
        const fileElement = createTreeFile(component);
        childrenContainer.appendChild(fileElement);
    });
    
    return folderElement;
}

// Create tree file element
function createTreeFile(component) {
    const element = document.createElement('div');
    element.className = 'tree-file';
    element.draggable = true;
    element.dataset.componentType = component.type;
    element.dataset.componentName = component.name;
    element.dataset.componentPath = component.path;
    element.dataset.componentCategory = component.category;
    element.dataset.type = component.type;
    
    const fileExtension = component.type === 'mcp' ? 'json' : 'md';
    const fileName = `${component.name}.${fileExtension}`;
    
    element.innerHTML = `
        <div class="tree-file-header">
            <span class="tree-icon file-icon">${getFileIcon(component.type)}</span>
            <span class="tree-file-name">${fileName}</span>
            <div class="tree-file-actions">
                <button class="tree-action-btn" title="View Details" onclick="showComponentDetails('${component.type}', '${component.name}', '${component.path}', '${component.category}')">
                    ℹ️
                </button>
            </div>
        </div>
    `;
    
    return element;
}

// Get file icon based on type
function getFileIcon(type) {
    const icons = {
        'agent': '📄',
        'command': '⚡',
        'mcp': '⚙️'
    };
    return icons[type] || '📄';
}

// Initialize drag and drop functionality
function initializeDragAndDrop() {
    const workflowSteps = document.getElementById('workflowSteps');
    
    // Add drag event listeners to tree files
    document.addEventListener('dragstart', function(event) {
        if (event.target.closest('.tree-file')) {
            handleDragStart(event);
            event.target.closest('.tree-file').classList.add('dragging');
        }
    });
    
    document.addEventListener('dragend', function(event) {
        if (event.target.closest('.tree-file')) {
            event.target.closest('.tree-file').classList.remove('dragging');
        }
    });
    
    // Add drop event listeners to workflow canvas
    workflowSteps.addEventListener('dragover', handleDragOver);
    workflowSteps.addEventListener('drop', handleDrop);
    workflowSteps.addEventListener('dragenter', handleDragEnter);
    workflowSteps.addEventListener('dragleave', handleDragLeave);
}

// Handle drag start
function handleDragStart(event) {
    const treeFile = event.target.closest('.tree-file');
    if (!treeFile) return;
    
    const componentData = {
        type: treeFile.dataset.componentType,
        name: treeFile.dataset.componentName,
        path: treeFile.dataset.componentPath,
        category: treeFile.dataset.componentCategory
    };
    
    event.dataTransfer.setData('application/json', JSON.stringify(componentData));
    event.dataTransfer.effectAllowed = 'copy';
}

// Handle drag over
function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

// Handle drag enter
function handleDragEnter(event) {
    event.preventDefault();
    const dropZone = document.querySelector('.drop-zone');
    if (dropZone) {
        dropZone.classList.add('drag-over');
    }
}

// Handle drag leave
function handleDragLeave(event) {
    event.preventDefault();
    // Only remove drag-over if we're leaving the drop zone entirely
    if (!event.currentTarget.contains(event.relatedTarget)) {
        const dropZone = document.querySelector('.drop-zone');
        if (dropZone) {
            dropZone.classList.remove('drag-over');
        }
    }
}

// Handle drop
function handleDrop(event) {
    event.preventDefault();
    
    const dropZone = document.querySelector('.drop-zone');
    if (dropZone) {
        dropZone.classList.remove('drag-over');
    }
    
    try {
        const componentData = JSON.parse(event.dataTransfer.getData('application/json'));
        addWorkflowStep(componentData);
    } catch (error) {
        console.error('Error handling drop:', error);
        showError('Failed to add component to workflow');
    }
}

// Add workflow step
function addWorkflowStep(componentData) {
    const step = {
        id: generateStepId(),
        type: componentData.type,
        name: componentData.name,
        path: componentData.path,
        category: componentData.category,
        description: generateStepDescription(componentData),
        icon: getComponentIcon(componentData.type)
    };
    
    workflowState.steps.push(step);
    renderWorkflowSteps();
    updateWorkflowStats();
    
    console.log('Added workflow step:', step);
}

// Generate step ID
function generateStepId() {
    return 'step_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Generate step description
function generateStepDescription(componentData) {
    const descriptions = {
        'agent': `Execute ${componentData.name} agent`,
        'command': `Run ${componentData.name} command`,
        'mcp': `Initialize ${componentData.name} MCP server`
    };
    return descriptions[componentData.type] || `Execute ${componentData.name}`;
}

// Render workflow steps
function renderWorkflowSteps() {
    const container = document.getElementById('workflowSteps');
    
    if (workflowState.steps.length === 0) {
        container.innerHTML = `
            <div class="drop-zone">
                <div class="drop-zone-content">
                    <div class="drop-icon">📋</div>
                    <p>Drag components here to build your workflow</p>
                    <span class="drop-hint">Start by adding agents, commands, or MCPs</span>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = workflowState.steps.map((step, index) => `
        <div class="workflow-step" data-step-id="${step.id}">
            <div class="step-number">${index + 1}</div>
            <div class="step-icon">${step.icon}</div>
            <div class="step-content">
                <div class="step-name">${step.name}</div>
                <div class="step-type">${step.type}</div>
                <div class="step-description">${step.description}</div>
            </div>
            <div class="step-actions">
                <button class="step-action edit" onclick="editStep('${step.id}')" title="Edit step">
                    ✏️
                </button>
                <button class="step-action remove" onclick="removeStep('${step.id}')" title="Remove step">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
    
    // Re-initialize sortable after rendering
    initializeSortableSteps();
}

// Initialize sortable workflow steps
function initializeSortableSteps() {
    const workflowSteps = document.getElementById('workflowSteps');
    
    if (workflowState.steps.length > 0) {
        new Sortable(workflowSteps, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: function(evt) {
                // Update the workflow state based on new order
                const movedStep = workflowState.steps.splice(evt.oldIndex, 1)[0];
                workflowState.steps.splice(evt.newIndex, 0, movedStep);
                
                // Re-render to update step numbers
                renderWorkflowSteps();
                updateWorkflowStats();
            }
        });
    }
}

// Remove workflow step
function removeStep(stepId) {
    workflowState.steps = workflowState.steps.filter(step => step.id !== stepId);
    renderWorkflowSteps();
    updateWorkflowStats();
}

// Edit workflow step
function editStep(stepId) {
    const step = workflowState.steps.find(s => s.id === stepId);
    if (step) {
        const newDescription = prompt('Enter step description:', step.description);
        if (newDescription !== null) {
            step.description = newDescription;
            renderWorkflowSteps();
        }
    }
}

// Update workflow stats
function updateWorkflowStats() {
    const stats = {
        agents: workflowState.steps.filter(s => s.type === 'agent').length,
        commands: workflowState.steps.filter(s => s.type === 'command').length,
        mcps: workflowState.steps.filter(s => s.type === 'mcp').length,
        total: workflowState.steps.length
    };
    
    document.getElementById('agentCount').textContent = stats.agents;
    document.getElementById('commandCount').textContent = stats.commands;
    document.getElementById('mcpCount').textContent = stats.mcps;
    document.getElementById('totalSteps').textContent = stats.total;
}

// Initialize event listeners
function initializeEventListeners() {
    // Tree view event listeners
    initializeTreeView();
    
    // Component search
    const searchInput = document.getElementById('componentSearch');
    searchInput.addEventListener('input', handleComponentSearch);
    
    // Workflow properties
    const workflowName = document.getElementById('workflowName');
    const workflowDescription = document.getElementById('workflowDescription');
    const workflowTags = document.getElementById('workflowTags');
    
    workflowName.addEventListener('input', (e) => {
        workflowState.properties.name = e.target.value;
    });
    
    workflowDescription.addEventListener('input', (e) => {
        workflowState.properties.description = e.target.value;
    });
    
    workflowTags.addEventListener('input', (e) => {
        workflowState.properties.tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    });
    
    // Canvas actions
    document.getElementById('clearCanvas').addEventListener('click', clearWorkflow);
    document.getElementById('generateWorkflow').addEventListener('click', generateWorkflow);
    
    // Modal actions
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('copyCommand').addEventListener('click', copyWorkflowCommand);
    document.getElementById('copyYaml').addEventListener('click', copyYamlContent);
    document.getElementById('downloadYaml').addEventListener('click', downloadYamlFile);
    document.getElementById('shareWorkflow').addEventListener('click', shareWorkflow);
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('generateModal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Handle component search
function handleComponentSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const treeFiles = document.querySelectorAll('.tree-file');
    const treeFolders = document.querySelectorAll('.tree-node');
    
    // Show/hide files based on search
    treeFiles.forEach(file => {
        const componentName = file.dataset.componentName.toLowerCase();
        const componentCategory = file.dataset.componentCategory.toLowerCase();
        
        if (componentName.includes(searchTerm) || componentCategory.includes(searchTerm)) {
            file.style.display = 'block';
            // Expand parent folders
            expandParentFolders(file);
        } else {
            file.style.display = searchTerm ? 'none' : 'block';
        }
    });
    
    // Hide empty folders if searching
    if (searchTerm) {
        treeFolders.forEach(folder => {
            const visibleFiles = folder.querySelectorAll('.tree-file[style="display: block"], .tree-file:not([style*="display: none"])');
            const folderHeader = folder.querySelector('.tree-node-header[data-folder]');
            if (folderHeader && visibleFiles.length === 0) {
                folder.style.display = 'none';
            } else {
                folder.style.display = 'block';
            }
        });
    } else {
        // Show all folders when not searching
        treeFolders.forEach(folder => {
            folder.style.display = 'block';
        });
    }
}

// Expand parent folders for visible search results
function expandParentFolders(file) {
    let parent = file.closest('.tree-children');
    while (parent) {
        parent.classList.add('expanded');
        const header = parent.previousElementSibling;
        if (header && header.classList.contains('tree-node-header')) {
            header.classList.add('expanded');
        }
        parent = parent.parentElement.closest('.tree-children');
    }
}

// Clear workflow
function clearWorkflow() {
    if (workflowState.steps.length > 0) {
        if (confirm('Are you sure you want to clear the entire workflow?')) {
            workflowState.steps = [];
            renderWorkflowSteps();
            updateWorkflowStats();
        }
    }
}

// Generate workflow
async function generateWorkflow() {
    if (workflowState.steps.length === 0) {
        showError('Please add at least one component to your workflow before generating.');
        return;
    }
    
    if (!workflowState.properties.name) {
        showError('Please enter a workflow name before generating.');
        return;
    }
    
    try {
        showLoadingSpinner();
        
        // Generate workflow hash
        const workflowHash = await generateWorkflowHash();
        
        // Generate YAML content
        const yamlContent = generateWorkflowYAML();
        
        // Show generate modal
        showGenerateModal(workflowHash, yamlContent);
        
    } catch (error) {
        console.error('Error generating workflow:', error);
        showError('Failed to generate workflow. Please try again.');
    } finally {
        hideLoadingSpinner();
    }
}

// Generate workflow hash
async function generateWorkflowHash() {
    const workflowData = {
        name: workflowState.properties.name,
        description: workflowState.properties.description,
        tags: workflowState.properties.tags,
        steps: workflowState.steps.map(step => ({
            type: step.type,
            name: step.name,
            path: step.path,
            category: step.category,
            description: step.description
        })),
        version: '1.0.0',
        generated: new Date().toISOString()
    };
    
    // Create hash from workflow data
    const dataString = JSON.stringify(workflowData);
    const hash = CryptoJS.SHA256(dataString).toString(CryptoJS.enc.Hex).substring(0, 12);
    
    // Store workflow data in localStorage with hash as key
    localStorage.setItem(`workflow_${hash}`, dataString);
    
    return hash;
}

// Generate workflow YAML
function generateWorkflowYAML() {
    const yaml = `# Workflow: ${workflowState.properties.name}
# Description: ${workflowState.properties.description}
# Generated: ${new Date().toISOString()}

name: "${workflowState.properties.name}"
description: "${workflowState.properties.description}"
tags: [${workflowState.properties.tags.map(tag => `"${tag}"`).join(', ')}]

steps:
${workflowState.steps.map((step, index) => `  - step: ${index + 1}
    type: ${step.type}
    name: "${step.name}"
    path: "${step.path}"
    category: "${step.category}"
    description: "${step.description}"
    action: |
      # ${step.description}
      # Execute ${step.type}: ${step.name}
      echo "Executing step ${index + 1}: ${step.name}"
`).join('\n')}

execution:
  mode: "sequential"
  on_error: "stop"
  timeout: 300

components:
  agents: [${workflowState.steps.filter(s => s.type === 'agent').map(s => `"${s.path}"`).join(', ')}]
  commands: [${workflowState.steps.filter(s => s.type === 'command').map(s => `"${s.path}"`).join(', ')}]
  mcps: [${workflowState.steps.filter(s => s.type === 'mcp').map(s => `"${s.path}"`).join(', ')}]
`;
    
    return yaml;
}

// Show generate modal
function showGenerateModal(workflowHash, yamlContent) {
    const modal = document.getElementById('generateModal');
    const commandElement = document.getElementById('workflowCommand');
    const yamlElement = document.getElementById('yamlContent');
    const summaryElement = document.getElementById('workflowSummary');
    
    // Set command
    const command = `npx claude-code-templates@latest --workflow:#${workflowHash}`;
    commandElement.textContent = command;
    
    // Set YAML content
    yamlElement.textContent = yamlContent;
    
    // Set workflow summary
    const summary = `
        <div class="workflow-summary-item">
            <strong>Name:</strong> ${workflowState.properties.name}
        </div>
        <div class="workflow-summary-item">
            <strong>Description:</strong> ${workflowState.properties.description || 'No description provided'}
        </div>
        <div class="workflow-summary-item">
            <strong>Tags:</strong> ${workflowState.properties.tags.join(', ') || 'No tags'}
        </div>
        <div class="workflow-summary-item">
            <strong>Total Steps:</strong> ${workflowState.steps.length}
        </div>
        <div class="workflow-summary-item">
            <strong>Components:</strong> 
            ${workflowState.steps.filter(s => s.type === 'agent').length} agents, 
            ${workflowState.steps.filter(s => s.type === 'command').length} commands, 
            ${workflowState.steps.filter(s => s.type === 'mcp').length} MCPs
        </div>
    `;
    summaryElement.innerHTML = summary;
    
    // Show modal
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('generateModal');
    modal.style.display = 'none';
}

// Copy workflow command
function copyWorkflowCommand() {
    const command = document.getElementById('workflowCommand').textContent;
    navigator.clipboard.writeText(command).then(() => {
        showSuccess('Command copied to clipboard!');
    }).catch(() => {
        showError('Failed to copy command to clipboard');
    });
}

// Copy YAML content
function copyYamlContent() {
    const yaml = document.getElementById('yamlContent').textContent;
    navigator.clipboard.writeText(yaml).then(() => {
        showSuccess('YAML copied to clipboard!');
    }).catch(() => {
        showError('Failed to copy YAML to clipboard');
    });
}

// Download YAML file
function downloadYamlFile() {
    const yaml = document.getElementById('yamlContent').textContent;
    const filename = `${workflowState.properties.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_workflow.yaml`;
    
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('YAML file downloaded!');
}

// Share workflow
function shareWorkflow() {
    const command = document.getElementById('workflowCommand').textContent;
    const shareText = `Check out my Claude Code workflow: ${workflowState.properties.name}\n\nInstall with: ${command}`;
    
    if (navigator.share) {
        navigator.share({
            title: `Claude Code Workflow: ${workflowState.properties.name}`,
            text: shareText
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showSuccess('Workflow details copied to clipboard!');
        }).catch(() => {
            showError('Failed to copy workflow details');
        });
    }
}

// Utility functions
function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'flex';
}

function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function showError(message) {
    alert('Error: ' + message); // Simple alert for now, could be enhanced with toast notifications
}

function showSuccess(message) {
    alert('Success: ' + message); // Simple alert for now, could be enhanced with toast notifications
}

// Initialize tree functionality
function initializeTreeView() {
    // Tree node click handling
    document.addEventListener('click', function(event) {
        // Main tree root headers
        if (event.target.closest('.tree-root .tree-node-header')) {
            const header = event.target.closest('.tree-node-header');
            const category = header.closest('.tree-root').dataset.category;
            const content = document.getElementById(`${category}-tree`);
            const arrow = header.querySelector('.tree-arrow');
            
            if (content) {
                const isExpanded = header.classList.contains('expanded');
                
                if (isExpanded) {
                    header.classList.remove('expanded');
                    content.classList.remove('expanded');
                } else {
                    header.classList.add('expanded');
                    content.classList.add('expanded');
                }
            }
            return;
        }
        
        // Folder headers within tree
        if (event.target.closest('.tree-node-header[data-folder]')) {
            const header = event.target.closest('.tree-node-header');
            const folderId = header.dataset.folder;
            const content = document.getElementById(folderId);
            
            if (content) {
                const isExpanded = header.classList.contains('expanded');
                
                if (isExpanded) {
                    header.classList.remove('expanded');
                    content.classList.remove('expanded');
                } else {
                    header.classList.add('expanded');
                    content.classList.add('expanded');
                }
            }
            return;
        }
    });
}

// Show component details modal
async function showComponentDetails(type, name, path, category) {
    const modal = document.getElementById('componentModal');
    const title = document.getElementById('componentModalTitle');
    const typeElement = document.getElementById('componentModalType');
    const categoryElement = document.getElementById('componentModalCategory');
    const pathElement = document.getElementById('componentModalPath');
    const descriptionElement = document.getElementById('componentModalDescription');
    const usageElement = document.getElementById('componentModalUsage');
    
    // Set basic info
    title.textContent = name;
    typeElement.textContent = type;
    categoryElement.textContent = category === 'root' ? 'General' : category;
    pathElement.textContent = path;
    usageElement.textContent = `cct --${type} "${path}"`;
    
    // Set description loading state
    descriptionElement.innerHTML = '<div class="loading">Loading description...</div>';
    
    // Show modal
    modal.style.display = 'block';
    
    // Try to fetch description from GitHub
    try {
        const fileExtension = type === 'mcp' ? 'json' : 'md';
        const githubUrl = `https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/${type}s/${path}.${fileExtension}`;
        
        const response = await fetch(githubUrl);
        if (response.ok) {
            const content = await response.text();
            
            if (type === 'mcp') {
                // For MCP files, show JSON structure
                try {
                    const jsonData = JSON.parse(content);
                    descriptionElement.innerHTML = `<pre>${JSON.stringify(jsonData, null, 2)}</pre>`;
                } catch (e) {
                    descriptionElement.textContent = 'MCP configuration file';
                }
            } else {
                // For markdown files, extract description from frontmatter or content
                const lines = content.split('\n');
                let description = 'No description available';
                
                // Try to extract description from frontmatter
                if (lines[0] === '---') {
                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i] === '---') break;
                        if (lines[i].startsWith('description:')) {
                            description = lines[i].replace('description:', '').trim();
                            break;
                        }
                    }
                }
                
                // If no frontmatter description, use first few lines of content
                if (description === 'No description available') {
                    const contentLines = lines.filter(line => 
                        !line.startsWith('---') && 
                        !line.startsWith('name:') && 
                        !line.startsWith('description:') &&
                        !line.startsWith('model:') &&
                        line.trim().length > 0
                    ).slice(0, 3);
                    
                    description = contentLines.join(' ').substring(0, 200) + '...';
                }
                
                descriptionElement.textContent = description;
            }
        } else {
            descriptionElement.textContent = 'Could not load description from GitHub';
        }
    } catch (error) {
        descriptionElement.textContent = 'Error loading description';
        console.warn('Error loading component description:', error);
    }
    
    // Store current component for potential addition to workflow
    modal.dataset.currentComponent = JSON.stringify({ type, name, path, category });
}

// Close component modal
function closeComponentModal() {
    const modal = document.getElementById('componentModal');
    modal.style.display = 'none';
}

// Add component to workflow from modal
function addComponentFromModal() {
    const modal = document.getElementById('componentModal');
    const componentData = JSON.parse(modal.dataset.currentComponent || '{}');
    
    if (componentData.type) {
        addWorkflowStep(componentData);
        closeComponentModal();
    }
}

// Copy usage command
function copyUsageCommand() {
    const usageElement = document.getElementById('componentModalUsage');
    const text = usageElement.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        showSuccess('Usage command copied to clipboard!');
    }).catch(() => {
        showError('Failed to copy usage command');
    });
}

// Export functions for global access
window.removeStep = removeStep;
window.editStep = editStep;
window.showComponentDetails = showComponentDetails;

// Initialize modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Component modal event listeners
    document.getElementById('closeComponentModal').addEventListener('click', closeComponentModal);
    document.getElementById('closeComponentModalBtn').addEventListener('click', closeComponentModal);
    document.getElementById('addComponentToWorkflow').addEventListener('click', addComponentFromModal);
    document.getElementById('copyUsageCommand').addEventListener('click', copyUsageCommand);
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const componentModal = document.getElementById('componentModal');
        if (event.target === componentModal) {
            closeComponentModal();
        }
    });
});