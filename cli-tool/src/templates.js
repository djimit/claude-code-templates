const path = require('path');
const { getCommandsForLanguageAndFramework } = require('./command-scanner');

const TEMPLATES_CONFIG = {
  'common': {
    name: 'Common (Language-agnostic)',
    description: 'Universal configuration for any project',
    files: [
      { source: 'common/CLAUDE.md', destination: 'CLAUDE.md' },
      { source: 'common/.claude', destination: '.claude' }
    ]
  },
  'javascript-typescript': {
    name: 'JavaScript/TypeScript',
    description: 'Optimized for modern JS/TS development',
    files: [
      { source: 'javascript-typescript/CLAUDE.md', destination: 'CLAUDE.md' },
      { source: 'javascript-typescript/.claude', destination: '.claude' },
      { source: 'javascript-typescript/.mcp.json', destination: '.mcp.json' }
    ],
    frameworks: {
      'react': {
        name: 'React',
        additionalFiles: [
          { source: 'javascript-typescript/examples/react-app/.claude/commands', destination: '.claude/commands' }
        ]
      },
      'vue': {
        name: 'Vue.js',
        additionalFiles: [
          { source: 'javascript-typescript/examples/vue-app/.claude/commands', destination: '.claude/commands' }
        ]
      },
      'angular': {
        name: 'Angular',
        additionalFiles: [
          { source: 'javascript-typescript/examples/angular-app/.claude/commands', destination: '.claude/commands' }
        ]
      },
      'node': {
        name: 'Node.js',
        additionalFiles: [
          { source: 'javascript-typescript/examples/node-api/.claude/commands', destination: '.claude/commands' }
        ]
      }
    }
  },
  'python': {
    name: 'Python',
    description: 'Optimized for Python development',
    files: [
      { source: 'python/CLAUDE.md', destination: 'CLAUDE.md' },
      { source: 'python/.claude', destination: '.claude' }
    ]
  },
  'rust': {
    name: 'Rust',
    description: 'Optimized for Rust development',
    files: [
      { source: 'rust/CLAUDE.md', destination: 'CLAUDE.md' },
      { source: 'rust/.claude', destination: '.claude' }
    ]
  },
  'go': {
    name: 'Go',
    description: 'Optimized for Go development',
    files: [
      { source: 'go/CLAUDE.md', destination: 'CLAUDE.md' },
      { source: 'go/.claude', destination: '.claude' }
    ]
  }
};

function getAvailableLanguages() {
  return Object.keys(TEMPLATES_CONFIG).map(key => ({
    value: key,
    name: TEMPLATES_CONFIG[key].name,
    description: TEMPLATES_CONFIG[key].description,
    disabled: TEMPLATES_CONFIG[key].comingSoon ? 'Coming Soon' : false
  }));
}

function getFrameworksForLanguage(language) {
  const config = TEMPLATES_CONFIG[language];
  if (!config || !config.frameworks) return [];
  
  return Object.keys(config.frameworks).map(key => ({
    value: key,
    name: config.frameworks[key].name
  }));
}

function getTemplateConfig(selections) {
  const { language, framework, commands = [] } = selections;
  const baseConfig = TEMPLATES_CONFIG[language];
  
  if (!baseConfig) {
    throw new Error(`Unknown language template: ${language}`);
  }
  
  let files = [...baseConfig.files];
  
  // Add framework-specific files
  if (framework && framework !== 'none' && baseConfig.frameworks && baseConfig.frameworks[framework]) {
    const frameworkConfig = baseConfig.frameworks[framework];
    if (frameworkConfig.additionalFiles) {
      files = files.concat(frameworkConfig.additionalFiles);
    }
  }
  
  // Handle command selection
  let selectedCommands = [];
  if (commands && commands.length > 0) {
    const availableCommands = getCommandsForLanguageAndFramework(language, framework);
    selectedCommands = availableCommands.filter(cmd => commands.includes(cmd.name));
  }
  
  return {
    language,
    framework,
    files,
    selectedCommands,
    config: baseConfig
  };
}

module.exports = {
  TEMPLATES_CONFIG,
  getAvailableLanguages,
  getFrameworksForLanguage,
  getTemplateConfig
};