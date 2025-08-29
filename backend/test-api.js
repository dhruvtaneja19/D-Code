#!/usr/bin/env node

/**
 * Backend API Integration Test
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const isHttps = BASE_URL.startsWith('https');

console.log('🧪 Testing Backend API Integration...');
console.log('📍 URL:', BASE_URL);

// Helper function to make requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const client = isHttps ? https : http;
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = responseData ? JSON.parse(responseData) : {};
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test cases
const tests = [
  {
    name: 'Root Endpoint',
    path: '/',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Health Check',
    path: '/health',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Invalid Endpoint',
    path: '/nonexistent',
    method: 'GET',
    expectedStatus: 404
  }
];

async function runTests() {
  let passedTests = 0;
  let totalTests = tests.length;
  
  console.log(`\n🔍 Running ${totalTests} tests...\n`);
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`📋 Test ${i + 1}: ${test.name}`);
    console.log(`   → ${test.method} ${BASE_URL}${test.path}`);
    
    try {
      const result = await makeRequest(test.path, test.method);
      
      if (result.status === test.expectedStatus) {
        console.log(`   ✅ Status: ${result.status} (Expected: ${test.expectedStatus})`);
        if (result.data && typeof result.data === 'object') {
          console.log(`   📄 Response:`, JSON.stringify(result.data, null, 2));
        }
        passedTests++;
      } else {
        console.log(`   ❌ Status: ${result.status} (Expected: ${test.expectedStatus})`);
        console.log(`   📄 Response:`, result.data);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Backend API is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️ Some tests failed. Check the logs above.');
    process.exit(1);
  }
}

runTests();
