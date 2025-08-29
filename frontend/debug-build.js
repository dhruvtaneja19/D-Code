#!/usr/bin/env node

/**
 * Debug Frontend Build
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Frontend Build Issues...');

// Check if dist folder exists
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  console.log('✅ dist folder exists');
  
  // List files in dist
  const files = fs.readdirSync(distPath);
  console.log('📁 Files in dist:');
  files.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    console.log(`   ${stats.isDirectory() ? '📁' : '📄'} ${file}`);
  });
  
  // Check if index.html exists
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html exists');
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // Check for script references
    const scriptMatches = content.match(/<script[^>]*src="([^"]*)"[^>]*>/g);
    if (scriptMatches) {
      console.log('📋 Script tags found:');
      scriptMatches.forEach(match => {
        console.log(`   ${match}`);
      });
    }
    
    // Check for asset references
    const assetMatches = content.match(/\/assets\/[^"']*/g);
    if (assetMatches) {
      console.log('📋 Asset references found:');
      assetMatches.forEach(match => {
        console.log(`   ${match}`);
      });
    }
  } else {
    console.log('❌ index.html not found in dist');
  }
  
  // Check assets folder
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    console.log('✅ assets folder exists');
    const assetFiles = fs.readdirSync(assetsPath);
    console.log('📁 Files in assets:');
    assetFiles.forEach(file => {
      console.log(`   📄 ${file}`);
    });
  } else {
    console.log('❌ assets folder not found');
  }
  
} else {
  console.log('❌ dist folder does not exist - run npm run build first');
}

// Check environment variables
console.log('\n🔧 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

// Read .env files
const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
envFiles.forEach(envFile => {
  if (fs.existsSync(envFile)) {
    console.log(`✅ ${envFile} exists`);
    const content = fs.readFileSync(envFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    lines.forEach(line => {
      const [key] = line.split('=');
      console.log(`   ${key}=***`);
    });
  }
});

console.log('\n💡 Recommendations:');
console.log('1. Make sure you run "npm run build" before deploying');
console.log('2. Check that all asset files are properly generated');
console.log('3. Verify environment variables are set correctly');
console.log('4. Test the build locally with "npm run preview"');
