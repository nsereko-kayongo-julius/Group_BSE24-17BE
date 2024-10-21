require("dotenv").config(); // Load env variables
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const promClient = require("prom-client"); // Prometheus client for metrics
const winston = require("winston"); // For logging
const morgan = require("morgan"); // For HTTP request logging

const blogRoutes = require("./routes/blogRoutes"); // Blog routes
const authRoutes = require("./routes/authRoutes"); // Auth routes
const userRoutes = require("./routes/userRoutes"); // User routes
const passportConfig = require("./config/passportConfig"); // Passport configuration

const app = express();

// Set up Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metric for HTTP request duration
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 5, 15, 50, 100, 500],
});
register.registerMetric(httpRequestDurationMicroseconds);

// Middleware to track request duration for Prometheus
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on("finish", () => {
    end({
      method: req.method,
      route: req.route?.path || req.url,
      code: res.statusCode,
    });
  });
  next();
});

// Expose the /metrics endpoint for Prometheus to scrape
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Setup logging with Winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: "combined.log" }), // Log to a file
    new winston.transports.File({ filename: "error.log", level: "error" }), // Log errors to a separate file
  ],
});

// Use Morgan with Winston for HTTP request logging
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Update the CORS configuration to include your frontend URL
const allowedOrigins = [
  "http://localhost:5173",
  "https://master--bse17blogapp.netlify.app/",
  "https://bse17blogapp.netlify.app",
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Allow credentials (cookies, session, etc.)
  })
);

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // use a strong secret key
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create a session until something stored
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true, // Prevent client-side JS from accessing the cookie
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week expiration
    },
  })
);

// Trust proxy in production for secure cookies
if (app.get("env") === "production") {
  app.set("trust proxy", 1);
}

// Passport config
passportConfig(app);

// Serve static files for uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/", authRoutes);
app.use("/blog", blogRoutes);
app.use("/profile", userRoutes);

// Error logging middleware (Winston)
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ message: "An internal error occurred" });
});

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    logger.info("MongoDB connected successfully");
    console.log("MongoDB connected...");
  })
  .catch((err) => {
    logger.error("MongoDB connection error", { message: err.message });
    console.error("MongoDB connection error:", err);
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});
