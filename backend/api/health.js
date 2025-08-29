// This file is a standalone health check endpoint for Vercel
// It can be deployed separately from the main app

module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Feedback Collection API is running",
    timestamp: new Date().toISOString(),
    routes: [
      "/api/auth",
      "/api/users",
      "/api/feedback", 
      "/api/admin"
    ]
  });
};
