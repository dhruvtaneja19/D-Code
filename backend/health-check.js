#!/usr/bin/env node

/**
 * Backend Health Check & Debug Script
 * Tests backend functionality both locally and in production
 */

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

// Configuration
const LOCAL_URL = "http://localhost:3000";
const PROD_URL =
  process.argv[2] ||
  process.env.VERCEL_URL ||
  process.env.API_URL ||
  "https://d-code-backend.vercel.app";

// Display info about URLs
console.log("\n📊 Testing URLs:");
console.log("   Local URL:", LOCAL_URL);
console.log("   Production URL:", PROD_URL);
console.log(
  "   (You can override production URL by passing it as an argument: node health-check.js https://your-url.com)\n"
);

console.log("🏥 Backend Health Check & Debug Script");
console.log("=".repeat(50));

async function checkEnvironment() {
  console.log("\n🔧 Environment Check:");

  // Check if .env file exists
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    console.log("✅ .env file exists");

    // Read and display (masked) environment variables
    const envContent = fs.readFileSync(envPath, "utf8");
    const envLines = envContent
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"));

    envLines.forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value) {
        // Mask sensitive values
        const maskedValue =
          key.includes("SECRET") || key.includes("KEY") || key.includes("URI")
            ? "***"
            : value.length > 20
            ? value.substring(0, 10) + "..."
            : value;
        console.log(`   ${key}=${maskedValue}`);
      }
    });
  } else {
    console.log("❌ .env file not found");
  }

  // Check package.json
  const packagePath = path.join(__dirname, "package.json");
  if (fs.existsSync(packagePath)) {
    console.log("✅ package.json exists");
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    console.log(`   Name: ${pkg.name}`);
    console.log(`   Version: ${pkg.version}`);
    console.log(`   Node: ${process.version}`);
  }

  // Check key files
  const keyFiles = [
    "app.js",
    "bin/www",
    "vercel.json",
    "config/db.js",
    "routes/index.js",
    "routes/users.js",
  ];

  console.log("\n📁 File Check:");
  keyFiles.forEach((file) => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`   ${exists ? "✅" : "❌"} ${file}`);
  });
}

// Helper function to make HTTP/HTTPS requests
function makeRequest(url, path = "/", method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    try {
      const fullUrl = new URL(path, url);
      const isHttps = fullUrl.protocol === "https:";

      const options = {
        hostname: fullUrl.hostname,
        port: fullUrl.port,
        path: fullUrl.pathname + fullUrl.search,
        method: method,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "D-Code-Health-Check/1.0",
        },
        timeout: 10000,
      };

      const client = isHttps ? https : http;
      const req = client.request(options, (res) => {
        let responseData = "";

        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          try {
            const result = responseData ? JSON.parse(responseData) : {};
            resolve({
              status: res.statusCode,
              data: result,
              headers: res.headers,
              raw: responseData,
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              data: responseData,
              headers: res.headers,
              raw: responseData,
            });
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function testEndpoint(url, endpoint, description) {
  console.log(`\n📋 ${description}`);
  console.log(`   → ${endpoint.method || "GET"} ${url}${endpoint.path}`);

  try {
    const result = await makeRequest(
      url,
      endpoint.path,
      endpoint.method,
      endpoint.data
    );

    if (result.status >= 200 && result.status < 300) {
      console.log(`   ✅ Status: ${result.status}`);
      if (result.data && typeof result.data === "object") {
        console.log(
          `   📄 Response:`,
          JSON.stringify(result.data, null, 2).slice(0, 200) + "..."
        );
      } else {
        console.log(
          `   📄 Response:`,
          String(result.raw).slice(0, 100) + "..."
        );
      }
      return true;
    } else {
      console.log(`   ⚠️ Status: ${result.status}`);
      console.log(`   📄 Response:`, String(result.raw).slice(0, 200));
      return false;
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    if (err.code === "ECONNREFUSED") {
      console.log(
        `   💡 Connection refused. Make sure server is running at ${url}`
      );
    } else if (err.code === "ENOTFOUND") {
      console.log(`   💡 Host not found. Check URL: ${url}`);
    } else if (err.code === "ETIMEDOUT") {
      console.log(
        `   💡 Connection timed out. Server might be slow or unreachable`
      );
    }
    return false;
  }
}

async function runHealthCheck(url, label) {
  console.log(`\n\n🏥 Testing ${label}: ${url}`);
  console.log("─".repeat(60));

  if (!url || url === "") {
    console.log("❌ URL not provided, skipping...");
    return { passed: 0, failed: 1, total: 1 };
  }

  // D-Code specific endpoints based on the routes in your routes/index.js
  const endpoints = [
    { path: "/", description: "Root Endpoint" },
    { path: "/health", description: "Health Check" },

    // Test with sample data for POST endpoints
    {
      path: "/signUp",
      method: "POST",
      data: {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      },
      description: "SignUp API (will fail if email already exists)",
    },
    {
      path: "/login",
      method: "POST",
      data: { email: "test@example.com", password: "password123" },
      description: "Login API",
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    const success = await testEndpoint(url, endpoint, endpoint.description);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  return { passed, failed, total: endpoints.length };
}

async function testDatabaseConnection() {
  console.log("\n\n💾 Database Connection Test");
  console.log("─".repeat(60));

  try {
    // Try to require the database config
    const dbConfig = require("./config/db");
    console.log("✅ Database config loaded");

    // If there's a test connection method, use it
    if (fs.existsSync(path.join(__dirname, "test-db-connection.js"))) {
      console.log("🔍 Running database connection test...");
      const { exec } = require("child_process");

      return new Promise((resolve) => {
        exec(
          "node test-db-connection.js",
          { cwd: __dirname },
          (error, stdout, stderr) => {
            if (error) {
              console.log("❌ Database connection failed:", error.message);
              resolve(false);
            } else {
              console.log("✅ Database connection test completed");
              console.log(stdout);
              resolve(true);
            }
          }
        );
      });
    } else {
      console.log("⚠️ No database connection test found");
      return null;
    }
  } catch (error) {
    console.log("❌ Database config error:", error.message);
    return false;
  }
}

async function main() {
  console.log(`Started at: ${new Date().toISOString()}`);

  // Environment check
  await checkEnvironment();

  // Local server test
  const localResults = await runHealthCheck(LOCAL_URL, "Local Server");

  // Production server test (if URL provided)
  let prodResults = null;
  if (PROD_URL) {
    prodResults = await runHealthCheck(PROD_URL, "Production Server");
  }

  // Database test
  const dbResult = await testDatabaseConnection();

  // Summary
  console.log("\n\n📊 Health Check Summary");
  console.log("═".repeat(60));

  console.log(`🏠 Local Server (${LOCAL_URL}):`);
  console.log(`   ✅ Passed: ${localResults.passed}/${localResults.total}`);
  console.log(`   ❌ Failed: ${localResults.failed}/${localResults.total}`);

  if (prodResults) {
    console.log(`\n🌐 Production Server (${PROD_URL}):`);
    console.log(`   ✅ Passed: ${prodResults.passed}/${prodResults.total}`);
    console.log(`   ❌ Failed: ${prodResults.failed}/${prodResults.total}`);
  } else {
    console.log(`\n🌐 Production Server: Not configured`);
    console.log(
      `   💡 Set VERCEL_URL or API_URL environment variable to test production`
    );
  }

  console.log(
    `\n💾 Database Connection: ${
      dbResult === true
        ? "✅ Working"
        : dbResult === false
        ? "❌ Failed"
        : "⚠️ Not tested"
    }`
  );

  // Recommendations
  console.log("\n💡 Recommendations:");
  if (localResults.failed > 0) {
    console.log("1. Start your local server with: npm run dev or node bin/www");
  }
  if (prodResults && prodResults.failed > 0) {
    console.log("2. Check your production deployment on Vercel");
    console.log("3. Verify environment variables are set in production");
  }
  if (dbResult === false) {
    console.log("4. Check your MongoDB connection string and database access");
  }
  console.log("5. Review logs above for specific error details");

  // Exit code based on results
  const hasFailures =
    localResults.failed > 0 ||
    (prodResults && prodResults.failed > 0) ||
    dbResult === false;
  process.exit(hasFailures ? 1 : 0);
}

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run the health check
main().catch((error) => {
  console.error("❌ Health check failed:", error);
  process.exit(1);
});
