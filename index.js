require("dotenv").config(); // Load env variables
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const blogRoutes = require("./routes/blogRoutes"); // Blog routes
const authRoutes = require("./routes/authRoutes"); // Auth routes
const userRoutes = require("./routes/userRoutes"); // User routes
const passportConfig = require("./config/passportConfig"); // Passport configuration
const cors = require("cors");

const app = express();

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // use a strong secret key
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create a session until something stored
  })
);

// Passport config
passportConfig(app);

// Serve static files for uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/", authRoutes);
app.use("/blog", blogRoutes);
app.use("/user", userRoutes);

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
