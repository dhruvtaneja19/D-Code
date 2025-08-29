# D-Code Testing Guide

This guide explains how to test your D-Code application to ensure everything is working correctly.

## Quick Start

### Test Everything at Once
```bash
# Test local development
node test-full-stack.js

# Test production deployment
BACKEND_URL=https://d-code-backend.vercel.app FRONTEND_URL=https://d-code-eight.vercel.app node test-full-stack.js
```

## Individual Tests

### Backend Tests

```bash
cd backend

# Test API health and basic functionality
npm run test:health

# Test all API endpoints
npm test

# Test database connection
npm run test:db
```

### Frontend Tests

```bash
cd frontend

# Test frontend configuration
npm test

# Test API connection from frontend
npm run test:api

# Test build process
npm run test:build
```

## What Each Test Does

### Backend Tests

1. **Health Check (`npm run test:health`)**
   - Tests root endpoint (/)
   - Tests health endpoint (/health)
   - Verifies API is responding with JSON

2. **API Integration Test (`npm test`)**
   - Tests all major endpoints
   - Verifies correct status codes
   - Tests error handling

3. **Database Test (`npm run test:db`)**
   - Tests MongoDB connection
   - Verifies database is accessible

### Frontend Tests

1. **Configuration Test (`npm test`)**
   - Checks environment variables
   - Verifies build configuration
   - Tests helper functions
   - Validates package.json

2. **API Connection Test (`npm run test:api`)**
   - Tests connection to backend
   - Verifies CORS configuration
   - Tests proxy settings

3. **Build Test (`npm run test:build`)**
   - Runs build process
   - Starts preview server
   - Verifies build artifacts

## Testing Different Environments

### Local Development
```bash
# Start backend (in one terminal)
cd backend && npm run dev

# Start frontend (in another terminal) 
cd frontend && npm run dev

# Run tests (in third terminal)
node test-full-stack.js
```

### Production Deployment
```bash
# Test your deployed applications
BACKEND_URL=https://your-backend.vercel.app FRONTEND_URL=https://your-frontend.vercel.app node test-full-stack.js
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check backend CORS configuration
   - Verify frontend URL is allowed in backend
   - Run: `cd frontend && npm run test:api`

2. **Database Connection Fails**
   - Check MongoDB URI in environment variables
   - Verify network access to MongoDB
   - Run: `cd backend && npm run test:db`

3. **API Not Responding**
   - Check if backend is running
   - Verify port configuration
   - Run: `cd backend && npm run test:health`

4. **Build Errors**
   - Check for missing dependencies
   - Verify environment variables
   - Run: `cd frontend && npm run test:build`

### Test Output Explanation

- ✅ **Green checkmarks**: Test passed successfully
- ❌ **Red X marks**: Test failed - check error message
- ⚠️ **Yellow warnings**: Test passed but with warnings
- 📋 **Blue info**: Test information and details

## Environment Variables Required

### Backend (.env)
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ANTHROPIC_API_KEY=your_api_key
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend.vercel.app
```

## Continuous Testing

Add these commands to your deployment pipeline:

```bash
# In your CI/CD pipeline
npm install
npm run test
```

This ensures your application is tested before deployment.
