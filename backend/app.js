require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const connectDB = require("./config/db");

connectDB();

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));

// Comprehensive request logging middleware
app.use((req, res, next) => {
  console.log(`\n🔍 [REQUEST DEBUG] ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`Original URL: ${req.url}`);
  console.log(`Path: ${req.path}`);
  console.log(`Query: ${JSON.stringify(req.query)}`);
  console.log(
    `Headers:`,
    JSON.stringify(
      {
        origin: req.headers.origin,
        "content-type": req.headers["content-type"],
        "user-agent": req.headers["user-agent"]?.substring(0, 50) + "...",
      },
      null,
      2
    )
  );
  console.log(
    `Body preview:`,
    typeof req.body === "object"
      ? JSON.stringify(req.body).substring(0, 100) + "..."
      : "Not parsed yet"
  );
  next();
});

// URL cleanup middleware - Handle double slashes in URLs
app.use((req, res, next) => {
  // Clean URL path if it contains double slashes
  if (req.url.includes("//")) {
    console.log(`🚨 [URL Cleanup] DOUBLE SLASH DETECTED!`);
    console.log(`[URL Cleanup] Original URL: ${req.url}`);
    // Normalize multiple slashes to single slashes (except for protocol://)
    const cleanUrl = req.url.replace(/([^:])\/+/g, "$1/");
    console.log(`[URL Cleanup] Redirecting to: ${cleanUrl}`);
    return res.redirect(301, cleanUrl);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// CORS configuration - Allow specific origin with credentials
const corsOptions = {
  origin: "http://localhost:5173", // Specific frontend origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests manually for all routes
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(204).send();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
