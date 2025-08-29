var express = require("express");
const {
  signUp,
  login,
  createProj,
  saveProject,
  getProjects,
  getProject,
  deleteProject,
  editProject,
  askAI,
} = require("../controllers/userController");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    message: "D-Code Backend API is running!",
    status: "success",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

/* Health check route */
router.get("/health", function (req, res, next) {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/* Test route for getProjects (GET method for browser testing) */
router.get("/getProjects", function (req, res, next) {
  res.json({
    message: "getProjects endpoint is available",
    note: "This endpoint requires POST method with authentication token",
    status: "endpoint_exists",
    timestamp: new Date().toISOString(),
  });
});

/* Test route for createProj (GET method for browser testing) */
router.get("/createProj", function (req, res, next) {
  res.json({
    message: "createProj endpoint is available",
    note: "This endpoint requires POST method with authentication token",
    status: "endpoint_exists",
    timestamp: new Date().toISOString(),
  });
});

router.post("/signUp", signUp); // signUp is the controller function
router.post("/login", login);
router.post("/createProj", createProj);
router.post("/saveProject", saveProject);
router.post("/getProjects", getProjects);
router.post("/getProject", getProject);
router.post("/deleteProject", deleteProject);
router.post("/editProject", editProject);
router.post("/askAI", askAI); // New AI endpoint

module.exports = router;
