# Environment Setup Guide

## Quick Start

1. Copy `.env.example` to `.env`
2. Fill in your actual values as described below

## Required Environment Variables

### Basic Configuration

```bash
NODE_ENV=development
PORT=3000
```

### Database Configuration

```bash
# For local development
MONGODB_URI=mongodb://localhost:27017/codeIDE

# For production (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codeIDE
```

### AI API Configuration

```bash
# Get from https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

### Optional Production Settings

```bash
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

## Getting API Keys

### Anthropic Claude API

1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy and paste into your `.env` file

### MongoDB Atlas (for production)

1. Visit https://www.mongodb.com/atlas
2. Create a cluster
3. Get connection string
4. Replace username and password with your credentials
