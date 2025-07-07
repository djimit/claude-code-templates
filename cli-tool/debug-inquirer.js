// Debug inquirer checkbox issue
const inquirer = require('inquirer');
const { getCommandsForLanguageAndFramework } = require('./src/command-scanner.js');

async function testInquirer() {
  console.log('=== Testing Inquirer Checkbox ===');
  
  const availableCommands = getCommandsForLanguageAndFramework('javascript-typescript', 'react');
  console.log('Available commands:', availableCommands.length);
  
  const choices = availableCommands.map(cmd => ({
    value: cmd.name,
    name: `${cmd.displayName} - ${cmd.description}`,
    checked: cmd.checked
  }));
  
  console.log('Choices array length:', choices.length);
  
  if (choices.length === 0) {
    console.log('❌ ERROR: Choices array is empty!');
    return;
  }
  
  console.log('First 3 choices:');
  choices.slice(0, 3).forEach((choice, i) => {
    console.log(`  ${i}: ${choice.name} (${choice.checked})`);
  });
  
  try {
    console.log('\nTesting inquirer checkbox prompt...');
    
    const prompt = {
      type: 'checkbox',
      name: 'commands',
      message: 'Select commands to include (use space to select):',
      choices: choices,
      pageSize: 10
    };
    
    console.log('Prompt config:', JSON.stringify(prompt, null, 2));
    
    // Test with a timeout to avoid hanging
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 2000);
    });
    
    const inquirerPromise = inquirer.prompt([prompt]);
    
    Promise.race([inquirerPromise, timeoutPromise])
      .then(answers => {
        console.log('✅ Inquirer prompt worked!');
        console.log('Selected:', answers.commands);
      })
      .catch(error => {
        if (error.message === 'Timeout') {
          console.log('✅ Inquirer prompt started (timed out waiting for input - this is expected)');
        } else {
          console.log('❌ Inquirer error:', error.message);
        }
      });
      
  } catch (error) {
    console.log('❌ Error setting up inquirer:', error.message);
  }
}

testInquirer();