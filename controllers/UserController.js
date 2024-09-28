const User = require("../models/users");
const multer = require("multer");

// Configure multer for file uploads
const upload = multer({ dest: "uploads/users/" }).single("profilePicture");

// Update user profile
exports.updateUserProfile = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Please log in to update your profile" });
  }

  upload(req, res, async function (err) {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error uploading file", error: err });
    }

    const { username, email } = req.body;
    const profilePicture = req.file ? req.file.path : req.user.profilePicture;

    try {
      // Find the authenticated user by ID and update their information
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user details
      user.username = username || user.username;
      user.email = email || user.email;
      user.profilePicture = profilePicture || user.profilePicture;

      // Save the updated user profile
      await user.save();
      return res
        .status(200)
        .json({ message: "Profile updated successfully", user });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Error updating profile", error: err });
    }
  });
};

// Change password
exports.changePassword = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Please log in to change password" });
  }

  const { oldPassword, newPassword } = req.body;

  try {
    // Find the authenticated user by ID
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use Passport's setPassword method to update the password
    user.changePassword(oldPassword, newPassword, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error changing password", error: err });
      }

      return res.status(200).json({ message: "Password changed successfully" });
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error changing password", error: err });
  }
};
