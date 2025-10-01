const express = require("express");
const expressLogger = require("express-bunyan-logger");
const cors = require("cors");
const router = require("./routes");

// Import security and performance middlewares
const {
  authRateLimit,
  generalRateLimit,
  strictRateLimit,
  validateInput,
  sanitizeInput,
  securityHeaders,
  corsOptions,
  validationSchemas
} = require("./middlewares/security");



require("./models");

process.on("uncaughtException", (e) => {
  console.log(e);
});

const app = express();

// Security headers
app.use(securityHeaders);

// CORS configuration
app.use(cors(corsOptions));

// Rate limiting
app.use('/api/users', strictRateLimit);
app.use('/api', generalRateLimit);

// Body parsing with limits
app.use(
  express.json({
    inflate: true,
    limit: "10mb",
    strict: true,
  })
);
app.use(
  express.urlencoded({
    inflate: true,
    limit: "10mb",
    extended: true,
  })
);

// Input sanitization
app.use(sanitizeInput);

// Logging
app.use( 
  expressLogger({
    excludes: [
      "headers",
      "req",
      "user-agent",
      "short-body",
      "http-version",
      "req-headers",
      "res-headers",
      "body",
      "res",
    ],
  })
);

// routes
app.use("/api", router);

// catch 404 later
app.use((req, res) => {
  return res.status(404).send("Error 404, Route not found");
});

// error handling
app.use((err, req, res, next) => {
  // for now log the error and return 500; need to handle it differently in future
  if (res.headersSent) {
    return next(err);
  }
  req.log.error(err);
  return res.status(500).send(err.message);
});

module.exports = app;
