#!/usr/bin/env node

/**
 * Frontend API Call Debug Script
 * This script helps identify where double-slash URLs are coming from
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔍 Frontend API Call Debug Script");
console.log("==================================\n");

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), "package.json");
if (!fs.existsSync(packageJsonPath)) {
  console.error(
    "❌ package.json not found. Please run this from the frontend directory."
  );
  process.exit(1);
}

// Check the current build
const distPath = path.join(process.cwd(), "dist");
if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not found. Please run "npm run build" first.');
  process.exit(1);
}

// Check the built JavaScript file
const assetsPath = path.join(distPath, "assets");
const jsFiles = fs.readdirSync(assetsPath).filter((f) => f.endsWith(".js"));

if (jsFiles.length === 0) {
  console.error("❌ No JavaScript files found in dist/assets.");
  process.exit(1);
}

console.log("📋 Built JavaScript files:");
jsFiles.forEach((file) => {
  console.log(`   📄 ${file}`);
});

// Check for double slashes in the built JavaScript
const mainJsFile = jsFiles.find((f) => f.startsWith("index-")) || jsFiles[0];
const jsContent = fs.readFileSync(path.join(assetsPath, mainJsFile), "utf8");

console.log(`\n🔍 Checking ${mainJsFile} for double-slash patterns...`);

// Look for potential double-slash patterns
const patterns = [
  /https:\/\/d-code-backend\.vercel\.app\/\//g,
  /\/\/\w+/g,
  /api_base_url.*\/\//g,
  /d-code-backend\.vercel\.app.*\/\//g,
];

let foundIssues = false;

patterns.forEach((pattern, index) => {
  const matches = jsContent.match(pattern);
  if (matches) {
    console.log(`⚠️ Pattern ${index + 1} found ${matches.length} matches:`);
    matches.slice(0, 5).forEach((match) => {
      console.log(`   "${match}"`);
    });
    if (matches.length > 5) {
      console.log(`   ... and ${matches.length - 5} more`);
    }
    foundIssues = true;
  }
});

if (!foundIssues) {
  console.log("✅ No obvious double-slash patterns found in built JavaScript.");
}

// Check the helper.js source
const helperPath = path.join(process.cwd(), "src", "helper.js");
if (fs.existsSync(helperPath)) {
  console.log("\n📋 Checking helper.js source...");
  const helperContent = fs.readFileSync(helperPath, "utf8");

  // Check if the API base URL is correct
  if (helperContent.includes("https://d-code-backend.vercel.app")) {
    console.log("✅ Correct production API URL found in helper.js");
  } else {
    console.log("❌ Production API URL not found in helper.js");
  }

  // Check if the makeApiCall function exists
  if (helperContent.includes("makeApiCall")) {
    console.log("✅ makeApiCall function found in helper.js");
  } else {
    console.log("❌ makeApiCall function not found in helper.js");
  }

  // Check for debugging logs
  if (helperContent.includes("API CALL DEBUG INFO")) {
    console.log("✅ Debug logging is enabled in helper.js");
  } else {
    console.log("⚠️ Debug logging not found in helper.js");
  }
}

// Check component files for API usage
console.log("\n📋 Checking component files for API usage...");
const srcPath = path.join(process.cwd(), "src");
const componentPaths = [
  "pages/Home.jsx",
  "pages/Editor.jsx",
  "pages/Login.jsx",
  "pages/SignUp.jsx",
];

componentPaths.forEach((componentPath) => {
  const fullPath = path.join(srcPath, componentPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf8");

    // Check if component imports makeApiCall
    if (content.includes("makeApiCall")) {
      console.log(`✅ ${componentPath} imports makeApiCall`);
    } else {
      console.log(`❌ ${componentPath} does NOT import makeApiCall`);
    }

    // Check for direct fetch calls
    const fetchMatches = content.match(/fetch\s*\(/g);
    if (fetchMatches) {
      const externalFetch = content.match(/fetch\s*\(\s*["']https:\/\//g);
      const internalFetch =
        fetchMatches.length - (externalFetch ? externalFetch.length : 0);

      if (internalFetch > 0) {
        console.log(
          `⚠️ ${componentPath} has ${internalFetch} internal fetch call(s) - should use makeApiCall`
        );
      }
    }
  } else {
    console.log(`❌ ${componentPath} not found`);
  }
});

// Environment check
console.log("\n🔧 Environment Configuration:");
const envFiles = [".env.production", ".env.development", ".env"];
envFiles.forEach((envFile) => {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    console.log(`✅ ${envFile} exists`);
    const envContent = fs.readFileSync(envPath, "utf8");
    const apiUrl = envContent.match(/VITE_API_URL=(.+)/);
    if (apiUrl) {
      console.log(`   VITE_API_URL=${apiUrl[1]}`);
    }
  } else {
    console.log(`❌ ${envFile} not found`);
  }
});

// Vite config check
const viteConfigPath = path.join(process.cwd(), "vite.config.js");
if (fs.existsSync(viteConfigPath)) {
  console.log("\n📋 Checking vite.config.js...");
  const viteContent = fs.readFileSync(viteConfigPath, "utf8");

  if (viteContent.includes("proxy")) {
    console.log(
      "⚠️ Proxy configuration found in vite.config.js - might interfere with production"
    );
  } else {
    console.log("✅ No proxy configuration in vite.config.js");
  }
}

console.log("\n💡 Recommendations:");
console.log(
  '1. Check browser dev tools console for "API CALL DEBUG INFO" logs'
);
console.log("2. Clear browser cache and hard refresh (Ctrl+Shift+R)");
console.log("3. Check Vercel deployment logs for any caching issues");
console.log(
  "4. If double slashes persist, the issue might be in Vercel's caching/CDN"
);

console.log("\n🔍 To debug further:");
console.log("1. Run: npm run build && npm run preview");
console.log(
  "2. Open browser dev tools and check console logs when making API calls"
);
console.log("3. Check Network tab for actual URLs being requested");
