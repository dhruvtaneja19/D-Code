#!/usr/bin/env node

/**
 * Frontend API Connection Test
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const http = require("http");
const https = require("https");

// Read environment variables
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const API_URL = process.env.VITE_API_URL || "http://localhost:3000";

console.log("🧪 Testing Frontend API Connection...");
console.log("🌐 Frontend URL:", FRONTEND_URL);
console.log("🔗 API URL:", API_URL);

// Helper function to make requests
function makeRequest(url, method = "GET") {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https");
    const client = isHttps ? https : http;

    client
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

// Test API connection
async function testAPIConnection() {
  console.log("\n📋 Testing API Connection...");

  try {
    const response = await makeRequest(API_URL);

    if (response.status === 200) {
      console.log("✅ API is reachable");
      try {
        const data = JSON.parse(response.data);
        console.log("✅ API response:", data);
        return true;
      } catch (e) {
        console.log(
          "⚠️ API response is not valid JSON:",
          response.data.substring(0, 100)
        );
        return false;
      }
    } else {
      console.log(`❌ API returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API connection failed: ${error.message}`);
    return false;
  }
}

// Test API health endpoint
async function testAPIHealth() {
  console.log("\n📋 Testing API Health Endpoint...");

  try {
    const response = await makeRequest(API_URL + "/health");

    if (response.status === 200) {
      console.log("✅ API health endpoint is working");
      try {
        const data = JSON.parse(response.data);
        console.log("✅ Health data:", data);
        return true;
      } catch (e) {
        console.log("⚠️ Health response is not valid JSON");
        return false;
      }
    } else {
      console.log(`❌ Health endpoint returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Health endpoint failed: ${error.message}`);
    return false;
  }
}

// Test CORS by checking headers
async function testCORS() {
  console.log("\n📋 Testing CORS Configuration...");

  try {
    const response = await makeRequest(API_URL);
    const corsHeaders = {
      "access-control-allow-origin":
        response.headers["access-control-allow-origin"],
      "access-control-allow-credentials":
        response.headers["access-control-allow-credentials"],
      "access-control-allow-methods":
        response.headers["access-control-allow-methods"],
    };

    console.log("🔍 CORS Headers:", corsHeaders);

    if (corsHeaders["access-control-allow-origin"]) {
      console.log("✅ CORS is configured");
      return true;
    } else {
      console.log("⚠️ CORS headers not found - may cause issues");
      return false;
    }
  } catch (error) {
    console.log(`❌ CORS test failed: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  let passedTests = 0;
  let totalTests = 3;

  const tests = [
    { name: "API Connection", test: testAPIConnection },
    { name: "API Health", test: testAPIHealth },
    { name: "CORS Configuration", test: testCORS },
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

  console.log("\n📊 Test Results:");
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! Frontend can connect to backend.");
    process.exit(0);
  } else {
    console.log("⚠️ Some tests failed. Check the configuration.");
    process.exit(1);
  }
}

runTests();
