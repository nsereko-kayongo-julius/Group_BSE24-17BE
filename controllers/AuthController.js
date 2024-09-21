const passport = require("passport");
const User = require("../models/users");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }).single("profilePicture");

exports.registerUser = (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error uploading file", error: err });
    }
    const { username, email, password } = req.body;
    const profilePicture = req.file ? req.file.path : "";

    User.register(
      new User({ username, email, profilePicture }),
      password,
      (err, user) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error registering user", error: err });
        }
        passport.authenticate("local")(req, res, () => {
          res
            .status(200)
            .json({ message: "User registered successfully", user });
        });
      }
    );
  });
};

// Handle login
exports.loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ message: "Login successful", user });
    });
  })(req, res, next);
};

// Logout user
exports.logoutUser = (req, res) => {
  req.logout((err) => {
    if (err)
      return res.status(500).json({ message: "Logout failed", error: err });
    res.status(200).json({ message: "Logout successful" });
  });
};
