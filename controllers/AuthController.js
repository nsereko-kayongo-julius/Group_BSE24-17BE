const passport = require("passport");
const User = require("../models/users");
const multer = require("multer");
const path = require("path");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/users");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append original file extension
  },
});

// File type validation and size limit
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images of type jpeg, jpg, png, and gif are allowed"));
    }
  },
}).single("profilePicture");

exports.registerUser = (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res
        .status(400)
        .json({ message: "File upload error", error: err.message });
    } else if (err) {
      // An unknown error occurred when uploading
      return res
        .status(400)
        .json({ message: "Invalid file type or size", error: err.message });
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
