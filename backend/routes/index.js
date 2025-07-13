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
  res.render("index", { title: "Express" });
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
