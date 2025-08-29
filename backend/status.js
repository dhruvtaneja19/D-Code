#!/usr/bin/env node

/**
 * D-Code Backend Status Page
 * This script adds a status page to verify the backend is working
 */

const express = require('express');
const app = require('./app'); // Import the main Express app

// Add a status route that shows more detailed information
app.get('/api/status', (req, res) => {
  const routes = [];
  
  // Get all registered routes
  app._router.stack.forEach((middleware) => {
    if (middleware.route) { 
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods).join(', ')
      });
    } else if (middleware.name === 'router') { 
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = handler.route.path;
          const methods = Object.keys(handler.route.methods).join(', ');
          routes.push({ path, methods });
        }
      });
    }
  });

  // Return the status information
  res.json({
    success: true,
    message: "Feedback Collection API is running",
    timestamp: new Date().toISOString(),
    routes: routes.map(r => `${r.methods.toUpperCase()} ${r.path}`),
    environment: {
      node: process.version,
      env: process.env.NODE_ENV || 'development'
    }
  });
});

// If this script is run directly, start a server
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Status page available at http://localhost:${port}/api/status`);
  });
}
