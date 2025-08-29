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

// CRITICAL: CORS MIDDLEWARE MUST BE FIRST - Place this BEFORE any other middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://d-code-eight.vercel.app",
  ];

  const origin = req.get("origin");
  console.log(`🌐 [CORS] Request from origin: ${origin || "no origin"}`);

  // Allow requests from allowed origins or no origin (for testing)
  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Max-Age", "86400"); // 24 hours
    console.log(`✅ [CORS] Headers set for origin: ${origin || "no origin"}`);
  } else {
    console.log(`❌ [CORS] Blocked origin: ${origin}`);
  }

  // Handle preflight requests immediately - CRITICAL
  if (req.method === "OPTIONS") {
    console.log(`🔄 [CORS] Handling OPTIONS preflight request`);
    return res.status(204).end();
  }

  next();
});

// URL cleanup middleware - Handle double slashes in URLs (but not for OPTIONS requests)
app.use((req, res, next) => {
  // NEVER redirect OPTIONS requests as they are CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`🔒 [CORS] OPTIONS request detected - skipping URL cleanup`);
    return next();
  }

  // Clean URL path if it contains double slashes for non-OPTIONS requests
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
