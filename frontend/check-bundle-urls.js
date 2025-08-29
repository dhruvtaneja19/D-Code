#!/usr/bin/env node

/**
 * URL Pattern Checker
 * This script checks for specific URL patterns in the built JavaScript
 */

import fs from "fs";
import path from "path";

const distPath = "dist/assets";
const jsFiles = fs.readdirSync(distPath).filter((f) => f.endsWith(".js"));

if (jsFiles.length === 0) {
  console.log("No JavaScript files found");
  process.exit(1);
}

const mainJsFile = jsFiles[0];
const jsPath = path.join(distPath, mainJsFile);
const content = fs.readFileSync(jsPath, "utf8");

console.log(`🔍 Analyzing ${mainJsFile} for API URL patterns...\n`);

// Search for specific patterns
const searches = [
  {
    name: "Backend URL with double slash",
    pattern: /d-code-backend\.vercel\.app\/\//g,
    shouldFind: false,
  },
  {
    name: "Backend URL (correct)",
    pattern: /d-code-backend\.vercel\.app/g,
    shouldFind: true,
  },
  {
    name: "API call debug info",
    pattern: /API CALL DEBUG INFO/g,
    shouldFind: true,
  },
  {
    name: "makeApiCall function",
    pattern: /makeApiCall/g,
    shouldFind: true,
  },
  {
    name: "Double slash in URLs",
    pattern: /https:\/\/[^\/]*\/\//g,
    shouldFind: false,
  },
];

let hasIssues = false;

searches.forEach((search) => {
  const matches = content.match(search.pattern);
  const count = matches ? matches.length : 0;

  if (search.shouldFind && count === 0) {
    console.log(`❌ ${search.name}: NOT FOUND (expected to find)`);
    hasIssues = true;
  } else if (!search.shouldFind && count > 0) {
    console.log(`⚠️ ${search.name}: FOUND ${count} matches (should not exist)`);
    if (count <= 3) {
      matches.forEach((match) => console.log(`   "${match}"`));
    } else {
      matches.slice(0, 3).forEach((match) => console.log(`   "${match}"`));
      console.log(`   ... and ${count - 3} more`);
    }
    hasIssues = true;
  } else if (search.shouldFind && count > 0) {
    console.log(`✅ ${search.name}: Found ${count} matches`);
  } else {
    console.log(`✅ ${search.name}: Not found (as expected)`);
  }
});

if (hasIssues) {
  console.log("\n❌ Issues detected in the built JavaScript file.");
  console.log("Possible solutions:");
  console.log("1. Clear build cache: rm -rf dist && npm run build");
  console.log(
    "2. Check if there are old components still importing old helper functions"
  );
  console.log("3. Verify all components are using makeApiCall correctly");
} else {
  console.log("\n✅ JavaScript bundle looks good!");
  console.log("The double-slash issue might be:");
  console.log("1. Browser cache (try hard refresh: Ctrl+Shift+R)");
  console.log("2. Vercel CDN caching old version");
  console.log("3. Service worker caching (check Application tab in dev tools)");
}
