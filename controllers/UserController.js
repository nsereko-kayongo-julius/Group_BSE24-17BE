const User = require("../models/users");
const multer = require("multer");
const path = require("path");

// Reuse multer storage configuration for uploading new profile picture
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/user_images/"); // Directory for user images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Ensure unique filenames
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max file size: 2MB
  fileFilter: function (req, file, cb) {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only jpg and png images are allowed"));
    }
  },
}).single("profilePicture");

// Update user profile
exports.updateUserProfile = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res
        .status(400)
        .json({ message: "Error uploading file", error: err.message });
    }

    const { username, email } = req.body;
    const profilePicture = req.file ? req.file.path : "";

    try {
      // Find the logged-in user by their ID (assuming user is logged in and req.user contains their info)
      const user = await User.findById(req.user._id); // Use async/await here instead of callback
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update fields
      user.username = username || user.username;
      user.email = email || user.email;
      if (profilePicture) {
        user.profilePicture = profilePicture; // Update only if new image is uploaded
      }

      // Save updated user profile
      const updatedUser = await user.save(); // Save the user and return the updated data
      res
        .status(200)
        .json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating profile", error: error.message });
    }
  });
};
