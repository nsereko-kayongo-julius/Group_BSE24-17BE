const express = require("express");
const UserControllers = require("../controllers/UserController");
const router = express.Router();

router.put("/update", UserControllers.updateUserProfile);

// Route to change password (requires authentication)
router.put("/change-password", UserControllers.changePassword);
module.exports = router;
