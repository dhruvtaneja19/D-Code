# Vercel Deployment Guide

This guide will help you deploy the D-Code project to Vercel with separate backend and frontend deployments.

## Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. MongoDB Atlas account (or any cloud MongoDB provider)

## Step 1: Push Your Code to GitHub

1. Create a new repository on GitHub
2. Add your code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

## Step 2: Set Up MongoDB (if not already done)

1. Go to MongoDB Atlas (https://cloud.mongodb.com/)
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Whitelist Vercel IP addresses or use 0.0.0.0/0 (not recommended for production)

## Step 3: Deploy Backend to Vercel

1. Go to Vercel dashboard (https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `backend` folder as the root directory
5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `NODE_ENV`: production
6. Deploy the project

## Step 4: Deploy Frontend to Vercel

1. Create another new project in Vercel
2. Import the same GitHub repository
3. Select the `frontend` folder as the root directory
4. Add environment variables (if any):
   - `VITE_API_URL`: Your backend deployment URL from step 3
5. Deploy the project

## Step 5: Update Frontend Configuration

After deploying both services, update your frontend to use the correct backend URL:

1. Create a `.env.production` file in the frontend directory with:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```
2. Update your API calls in the frontend to use `import.meta.env.VITE_API_URL`

## Step 6: Configure CORS in Backend

Update your backend CORS configuration to allow requests from your frontend domain:

```javascript
app.use(
  cors({
    origin: ["https://your-frontend-url.vercel.app", "http://localhost:5173"],
    credentials: true,
  })
);
```

## Important Notes

- Each deployment (backend and frontend) will have its own Vercel URL
- Make sure to update any hardcoded URLs in your code
- Environment variables are set per project in Vercel dashboard
- Vercel automatically redeploys when you push to your GitHub repository

## Troubleshooting

1. Check Vercel deployment logs for errors
2. Ensure all environment variables are set correctly
3. Verify MongoDB connection string and network access
4. Check CORS configuration if getting cross-origin errors
