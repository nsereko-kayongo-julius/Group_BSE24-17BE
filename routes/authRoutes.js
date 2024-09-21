const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");

router.get("/", (req, res) => {
  res.send("Auth route");
});

// Register route
router.post("/register", authController.registerUser);

// Login route
router.post("/login", authController.loginUser);

// Logout route
router.get("/logout", authController.logoutUser);

module.exports = router;
