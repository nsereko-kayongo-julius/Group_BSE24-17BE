require("dotenv").config(); // Load env variables
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

const authRoutes = require("./routes/authRoutes"); // Auth routes
const passportConfig = require("./config/passportConfig"); // Passport configuration


const app = express();

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));

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

// Routes
app.use("/", authRoutes);

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.error("MongoDB connection error:", err));


// Start the server
const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

