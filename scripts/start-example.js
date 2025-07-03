#!/usr/bin/env node

import inquirer from 'inquirer';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json to get available examples
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

// Extract example scripts
const exampleScripts = Object.keys(packageJson.scripts)
  .filter(script => script.startsWith('start:example:'))
  .map(script => ({
    name: script.replace('start:example:', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: script,
    description: `Start the ${script.replace('start:example:', '')} example`
  }));

console.log('🚀 Welcome to Spreadsheet Mapper Examples!\n');

inquirer
  .prompt([
    {
      type: 'list',
      name: 'example',
      message: 'Which example would you like to start?',
      choices: exampleScripts.map(script => ({
        name: `${script.name} - ${script.description}`,
        value: script.value
      })),
      pageSize: 10
    }
  ])
  .then(answers => {
    const selectedScript = answers.example;
    
    console.log(`\n🎯 Starting ${selectedScript.replace('start:example:', '')} example...\n`);
    
    // Run the selected npm script
    const child = spawn('npm', ['run', selectedScript], {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`\n❌ Example exited with code ${code}`);
        process.exit(code);
      }
    });
    
    child.on('error', (error) => {
      console.error(`\n❌ Error starting example: ${error.message}`);
      process.exit(1);
    });
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }); 