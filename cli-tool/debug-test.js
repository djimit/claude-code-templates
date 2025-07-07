// Debug test for command selection issue
const { getCommandsForLanguageAndFramework } = require('./src/command-scanner.js');

function testGetStepConfig() {
  const stepName = 'commands';
  const currentAnswers = {
    language: 'javascript-typescript',
    framework: 'react'
  };
  const options = {};
  
  console.log('=== Testing getStepConfig for commands ===');
  console.log('Step name:', stepName);
  console.log('Current answers:', currentAnswers);
  
  // Reproduce the logic from getStepConfig
  const commandLanguage = currentAnswers.language || options.language;
  const commandFramework = currentAnswers.framework || options.framework;
  
  console.log('Command language:', commandLanguage);
  console.log('Command framework:', commandFramework);
  
  if (!commandLanguage || commandLanguage === 'common') {
    console.log('❌ Would use basic commands (common case)');
    return;
  }
  
  const availableCommands = getCommandsForLanguageAndFramework(commandLanguage, commandFramework);
  console.log('Available commands:', availableCommands.length);
  
  if (availableCommands.length === 0) {
    console.log('❌ ERROR: No commands available - this would cause empty selection!');
    return;
  }
  
  console.log('✅ Should show', availableCommands.length, 'commands');
  console.log('Commands:', availableCommands.map(cmd => cmd.name).join(', '));
  
  // Test the actual choices array
  const choices = availableCommands.map(cmd => ({
    value: cmd.name,
    name: `${cmd.displayName} - ${cmd.description}`,
    checked: cmd.checked
  }));
  
  console.log('\nChoices array:', choices.length, 'items');
  console.log('First few choices:');
  choices.slice(0, 3).forEach(choice => {
    console.log(`  - ${choice.name} (${choice.checked ? 'checked' : 'unchecked'})`);
  });
}

testGetStepConfig();