#!/usr/bin/env node

/**
 * Frontend Build and Environment Test
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Frontend Configuration...');

// Test environment variables
function testEnvironmentVariables() {
  console.log('\n📋 Checking Environment Variables...');
  
  const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
  let foundEnvFiles = [];
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      foundEnvFiles.push(file);
      console.log(`✅ Found: ${file}`);
    }
  });
  
  if (foundEnvFiles.length === 0) {
    console.log('⚠️ No environment files found');
    return false;
  }
  
  // Check if VITE_API_URL is configured
  foundEnvFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('VITE_API_URL')) {
        console.log(`✅ VITE_API_URL found in ${file}`);
        const match = content.match(/VITE_API_URL=(.+)/);
        if (match) {
          console.log(`   → Value: ${match[1]}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error reading ${file}:`, error.message);
    }
  });
  
  return true;
}

// Test build artifacts
function testBuildArtifacts() {
  console.log('\n📋 Checking Build Configuration...');
  
  // Check if vite.config.js exists
  if (fs.existsSync('vite.config.js')) {
    console.log('✅ vite.config.js found');
    try {
      const content = fs.readFileSync('vite.config.js', 'utf8');
      if (content.includes('proxy')) {
        console.log('✅ Proxy configuration detected');
      }
      if (content.includes('react')) {
        console.log('✅ React plugin configured');
      }
    } catch (error) {
      console.log('❌ Error reading vite.config.js:', error.message);
    }
  } else {
    console.log('❌ vite.config.js not found');
    return false;
  }
  
  // Check if vercel.json exists
  if (fs.existsSync('vercel.json')) {
    console.log('✅ vercel.json found');
    try {
      const content = fs.readFileSync('vercel.json', 'utf8');
      const config = JSON.parse(content);
      if (config.routes) {
        console.log('✅ Vercel routes configured');
        config.routes.forEach(route => {
          console.log(`   → ${route.src} → ${route.dest}`);
        });
      }
    } catch (error) {
      console.log('❌ Error reading vercel.json:', error.message);
    }
  }
  
  return true;
}

// Test helper functions
function testHelperFunctions() {
  console.log('\n📋 Checking Helper Functions...');
  
  const helperPath = path.join('src', 'helper.js');
  if (fs.existsSync(helperPath)) {
    console.log('✅ helper.js found');
    try {
      const content = fs.readFileSync(helperPath, 'utf8');
      if (content.includes('api_base_url')) {
        console.log('✅ api_base_url variable found');
      }
      if (content.includes('makeApiCall')) {
        console.log('✅ makeApiCall function found');
      }
      if (content.includes('import.meta.env.VITE_API_URL')) {
        console.log('✅ Environment variable usage detected');
      }
    } catch (error) {
      console.log('❌ Error reading helper.js:', error.message);
      return false;
    }
  } else {
    console.log('❌ helper.js not found');
    return false;
  }
  
  return true;
}

// Test package.json
function testPackageJson() {
  console.log('\n📋 Checking package.json...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    console.log(`✅ Project: ${packageJson.name} v${packageJson.version}`);
    
    // Check scripts
    const requiredScripts = ['dev', 'build', 'preview'];
    const availableScripts = Object.keys(packageJson.scripts || {});
    
    requiredScripts.forEach(script => {
      if (availableScripts.includes(script)) {
        console.log(`✅ Script '${script}' found`);
      } else {
        console.log(`❌ Script '${script}' missing`);
      }
    });
    
    // Check important dependencies
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const importantDeps = ['react', 'vite', 'react-router-dom'];
    
    importantDeps.forEach(dep => {
      if (deps[dep]) {
        console.log(`✅ Dependency '${dep}' found (${deps[dep]})`);
      } else {
        console.log(`⚠️ Dependency '${dep}' not found`);
      }
    });
    
    return true;
  } catch (error) {
    console.log('❌ Error reading package.json:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  let passedTests = 0;
  let totalTests = 4;
  
  const tests = [
    { name: 'Environment Variables', test: testEnvironmentVariables },
    { name: 'Build Configuration', test: testBuildArtifacts },
    { name: 'Helper Functions', test: testHelperFunctions },
    { name: 'Package Configuration', test: testPackageJson }
  ];
  
  for (const { name, test } of tests) {
    console.log(`\n🧪 Running ${name} test...`);
    try {
      const passed = await test();
      if (passed) passedTests++;
    } catch (error) {
      console.log(`❌ ${name} test failed:`, error.message);
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Frontend is configured correctly.');
    process.exit(0);
  } else {
    console.log('⚠️ Some tests failed. Check the configuration.');
    process.exit(1);
  }
}

runTests();
