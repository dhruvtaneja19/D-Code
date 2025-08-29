#!/usr/bin/env node

/**
 * Backend API Health Check Test
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const isHttps = BASE_URL.startsWith('https');
const client = isHttps ? https : http;

console.log('🔍 Testing Backend API Health...');
console.log('📍 URL:', BASE_URL);

// Test health endpoint
function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/health`;
    console.log('\n📋 Testing /health endpoint...');
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Health endpoint response:', result);
          resolve(result);
        } catch (error) {
          console.log('❌ Health endpoint failed to parse JSON:', data);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.log('❌ Health endpoint error:', error.message);
      reject(error);
    });
  });
}

// Test root endpoint
function testRootEndpoint() {
  return new Promise((resolve, reject) => {
    const url = BASE_URL;
    console.log('\n📋 Testing / (root) endpoint...');
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Root endpoint response:', result);
          resolve(result);
        } catch (error) {
          console.log('❌ Root endpoint failed to parse JSON:', data);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.log('❌ Root endpoint error:', error.message);
      reject(error);
    });
  });
}

// Run all tests
async function runTests() {
  let passedTests = 0;
  let totalTests = 2;
  
  try {
    await testRootEndpoint();
    passedTests++;
  } catch (error) {
    console.log('❌ Root endpoint test failed');
  }
  
  try {
    await testHealthEndpoint();
    passedTests++;
  } catch (error) {
    console.log('❌ Health endpoint test failed');
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Backend is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️ Some tests failed. Check the logs above.');
    process.exit(1);
  }
}

runTests();
