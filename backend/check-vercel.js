#!/usr/bin/env node

/**
 * Vercel Deployment Status Checker
 * This script checks if a Vercel deployment is working correctly
 */

const https = require("https");
const http = require("http");

// Get the URL from command line arguments or default
const vercelUrl = process.argv[2] || "https://d-code-backend.vercel.app";
console.log(`\n🚀 Checking Vercel deployment: ${vercelUrl}`);

// Try alternative paths that might work if main routes are not working
const pathsToTry = [
  "/",
  "/health",
  "/api",
  "/api/health",
  "/api/status",
  "/status",
];

// Function to make a GET request to a specific URL
function checkEndpoint(url, path) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing endpoint: ${url}${path}`);

    const client = url.startsWith("https") ? https : http;
    const fullUrl = new URL(path, url);

    const req = client.get(fullUrl.toString(), (res) => {
      console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`   Headers:`, JSON.stringify(res.headers, null, 2));

      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          // Try to parse as JSON
          const jsonData = JSON.parse(data);
          console.log(`   Response (JSON):`, JSON.stringify(jsonData, null, 2));
        } catch (e) {
          // If not JSON, show as text (limited length)
          console.log(`   Response (${data.length} bytes):`);
          if (data.length > 500) {
            console.log(data.substring(0, 500) + "...");
          } else {
            console.log(data);
          }
        }

        resolve({
          path,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300,
        });
      });
    });

    req.on("error", (error) => {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(
        `   (This could indicate the deployment is not running or has an error)`
      );
      resolve({
        path,
        status: 0,
        success: false,
        error: error.message,
      });
    });

    // Set a timeout
    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`   ⏱️ Request timed out after 10 seconds`);
      resolve({
        path,
        status: 0,
        success: false,
        error: "Timeout",
      });
    });
  });
}

// Trace request (shows DNS resolution, connection, TLS handshake, etc.)
function traceRequest(url) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Performing connection trace to: ${url}`);

    const startTime = Date.now();
    const client = url.startsWith("https") ? https : http;
    const parsedUrl = new URL(url);

    console.log(`   DNS lookup: ${parsedUrl.hostname}...`);

    const req = client.get(url, (res) => {
      const connectTime = Date.now() - startTime;
      console.log(`   Connected in ${connectTime}ms`);
      console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`   Server: ${res.headers["server"] || "Unknown"}`);
      console.log(
        `   Content-Type: ${res.headers["content-type"] || "Not specified"}`
      );

      res.destroy(); // No need to read the body
      resolve({
        success: true,
        connectTime,
        status: res.statusCode,
      });
    });

    req.on("socket", (socket) => {
      socket.on("lookup", () => {
        console.log(`   DNS resolved in ${Date.now() - startTime}ms`);
      });

      socket.on("connect", () => {
        console.log(`   TCP connected in ${Date.now() - startTime}ms`);
      });

      socket.on("secureConnect", () => {
        console.log(
          `   TLS handshake completed in ${Date.now() - startTime}ms`
        );
      });
    });

    req.on("error", (error) => {
      console.log(`   ❌ Connection failed: ${error.message}`);
      resolve({
        success: false,
        error: error.message,
      });
    });
  });
}

// Check for common Vercel deployment issues
async function checkCommonIssues(url) {
  console.log("\n🔍 Checking for common Vercel deployment issues:");

  // Check if the URL is a Vercel URL
  if (!url.includes("vercel.app")) {
    console.log(
      `   ⚠️ URL doesn't appear to be a Vercel deployment (missing vercel.app)`
    );
  }

  // Check connection
  try {
    await traceRequest(url);
  } catch (error) {
    console.log(`   ❌ Connection error: ${error.message}`);
  }

  // Check for redirects
  try {
    console.log("\n   Checking for redirects...");
    const res = await new Promise((resolve) => {
      const client = url.startsWith("https") ? https : http;
      const req = client.get(
        url,
        {
          headers: { "User-Agent": "D-Code-Health-Check/1.0" },
        },
        (res) => {
          resolve(res);
        }
      );

      req.on("error", (error) => {
        console.log(`   ❌ Request failed: ${error.message}`);
        resolve(null);
      });
    });

    if (res) {
      if (res.statusCode >= 300 && res.statusCode < 400) {
        console.log(
          `   ⚠️ Redirect detected (${res.statusCode}): ${res.headers.location}`
        );
        console.log(
          "   This may indicate an issue with your Vercel configuration"
        );
      } else {
        console.log(`   ✅ No redirects detected`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error checking redirects: ${error.message}`);
  }

  // Recommend checking vercel.json
  console.log("\n   Recommendations:");
  console.log("   1. Check your vercel.json configuration for correct routes");
  console.log(
    '   2. Ensure your "builds" section points to the correct entry file'
  );
  console.log("   3. Check your Vercel dashboard for deployment logs");
  console.log("   4. Try to redeploy the project");
}

// Main function
async function main() {
  try {
    // Check connection trace
    await traceRequest(vercelUrl);

    // Check endpoints
    const results = [];
    for (const path of pathsToTry) {
      const result = await checkEndpoint(vercelUrl, path);
      results.push(result);
    }

    // Check common issues
    await checkCommonIssues(vercelUrl);

    // Summary
    console.log("\n📊 Summary:");
    const successful = results.filter((r) => r.success).length;
    console.log(`   ✅ Successful endpoints: ${successful}/${results.length}`);
    console.log(
      `   ❌ Failed endpoints: ${results.length - successful}/${results.length}`
    );

    if (successful === 0) {
      console.log(
        "\n⚠️ All endpoints failed! Your Vercel deployment may have issues."
      );
      console.log("   Possible solutions:");
      console.log("   1. Check your Vercel dashboard for deployment errors");
      console.log("   2. Verify your vercel.json configuration");
      console.log("   3. Check that your Express app is properly configured");
      console.log("   4. Try redeploying your application");
    } else if (successful < results.length) {
      console.log("\n⚠️ Some endpoints are working, but not all.");
      console.log("   Check your routes configuration in your Express app.");
    } else {
      console.log("\n✅ All tested endpoints are working!");
    }

    // Test for a potential API endpoint
    console.log("\n🧪 Testing API specific endpoint:");
    await checkEndpoint(vercelUrl, "/signUp");
  } catch (error) {
    console.error("❌ Error running the check:", error);
  }
}

main().catch(console.error);
