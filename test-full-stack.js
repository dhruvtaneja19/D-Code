#!/usr/bin/env node

/**
 * Full Stack Test Suite
 * Tests both backend and frontend components
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 D-Code Full Stack Test Suite');
console.log('================================\n');

// Helper function to run command in a directory
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`📁 Running in ${cwd}: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Command succeeded in ${cwd}\n`);
        resolve(code);
      } else {
        console.log(`❌ Command failed in ${cwd} with code ${code}\n`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      console.log(`❌ Failed to run command in ${cwd}:`, error.message);
      reject(error);
    });
  });
}

// Test configurations
const tests = [
  {
    name: 'Backend Health Check',
    cwd: 'backend',
    command: 'npm',
    args: ['run', 'test:health'],
    env: { API_URL: process.env.BACKEND_URL || 'http://localhost:3000' }
  },
  {
    name: 'Backend API Test',
    cwd: 'backend',
    command: 'npm',
    args: ['run', 'test'],
    env: { API_URL: process.env.BACKEND_URL || 'http://localhost:3000' }
  },
  {
    name: 'Backend Database Connection',
    cwd: 'backend',
    command: 'npm',
    args: ['run', 'test:db']
  },
  {
    name: 'Frontend Configuration Test',
    cwd: 'frontend',
    command: 'npm',
    args: ['run', 'test']
  },
  {
    name: 'Frontend API Connection Test',
    cwd: 'frontend',
    command: 'npm',
    args: ['run', 'test:api'],
    env: { 
      VITE_API_URL: process.env.BACKEND_URL || 'http://localhost:3000',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
    }
  }
];

async function runAllTests() {
  let passedTests = 0;
  let totalTests = tests.length;
  let failedTests = [];
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`🧪 Test ${i + 1}/${totalTests}: ${test.name}`);
    console.log('─'.repeat(50));
    
    try {
      // Set environment variables if specified
      if (test.env) {
        Object.keys(test.env).forEach(key => {
          process.env[key] = test.env[key];
          console.log(`🔧 Setting ${key}=${test.env[key]}`);
        });
      }
      
      await runCommand(test.command, test.args, test.cwd);
      passedTests++;
      console.log(`✅ ${test.name} PASSED\n`);
      
    } catch (error) {
      failedTests.push(test.name);
      console.log(`❌ ${test.name} FAILED: ${error.message}\n`);
    }
  }
  
  // Final results
  console.log('🏁 FINAL TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:');
    failedTests.forEach(test => console.log(`   • ${test}`));
  }
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Your D-Code application is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed. Please check the logs above and fix the issues.');
    process.exit(1);
  }
}

// Usage instructions
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node test-full-stack.js [options]');
  console.log('\nOptions:');
  console.log('  --help, -h     Show this help message');
  console.log('\nEnvironment Variables:');
  console.log('  BACKEND_URL    Backend API URL (default: http://localhost:3000)');
  console.log('  FRONTEND_URL   Frontend URL (default: http://localhost:5173)');
  console.log('\nExamples:');
  console.log('  # Test local development');
  console.log('  node test-full-stack.js');
  console.log('');
  console.log('  # Test production deployment');
  console.log('  BACKEND_URL=https://your-backend.vercel.app FRONTEND_URL=https://your-frontend.vercel.app node test-full-stack.js');
  process.exit(0);
}

console.log('🔍 Environment:');
console.log(`   Backend URL: ${process.env.BACKEND_URL || 'http://localhost:3000 (default)'}`);
console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173 (default)'}`);
console.log('');

runAllTests();
