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

// CORS configuration - Allow both local and deployed frontend origins with credentials
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from these origins
    const allowedOrigins = [
      "http://localhost:5173",
      "https://d-code-eight.vercel.app"
    ];
    
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
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
  maxAge: 86400 // Pre-flight requests can be cached for 24 hours
};

app.use(cors(corsOptions));

// Dedicated middleware to handle preflight OPTIONS requests
app.use((req, res, next) => {
  // Special handling for OPTIONS requests - critical for CORS preflight
  if (req.method === 'OPTIONS') {
    const allowedOrigins = ["http://localhost:5173", "https://d-code-eight.vercel.app"];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, Accept"
      );
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Max-Age", "86400"); // Cache preflight for 24 hours
      return res.status(204).end();
    } else {
      console.log("Blocked OPTIONS by CORS:", origin);
      return res.status(403).json({ error: "Not allowed by CORS" });
    }
  }
  next();
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
