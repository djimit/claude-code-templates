// Debug the actual CLI flow
const { interactivePrompts } = require('./src/prompts.js');

async function testFlow() {
  console.log('=== Testing Interactive Prompts Flow ===');
  
  const projectInfo = {
    detectedLanguage: 'javascript-typescript',
    detectedFramework: 'react'
  };
  
  const options = {};
  
  console.log('Project info:', projectInfo);
  console.log('Options:', options);
  
  try {
    // Simulate the interactive flow but interrupt it
    console.log('\nStarting interactive prompts...');
    
    // This will hang waiting for input, so we need to mock it
    // Let's just test the step building logic
    
    const state = {
      currentStep: 0,
      answers: {},
      steps: []
    };

    // Build steps array based on options (copy from prompts.js)
    if (!options.language) state.steps.push('language');
    if (!options.framework) state.steps.push('framework');
    state.steps.push('commands', 'hooks', 'mcps', 'confirm');
    
    console.log('Steps to execute:', state.steps);
    console.log('Total steps:', state.steps.length);
    
    // Check if commands step is included
    if (state.steps.includes('commands')) {
      console.log('✅ Commands step is included');
    } else {
      console.log('❌ Commands step is missing!');
    }
    
  } catch (error) {
    console.log('❌ Error in flow:', error.message);
  }
}

testFlow();