const express = require("express");
const UserControllers = require("../controllers/UserController");
const router = express.Router();

router.post("/update", UserControllers.updateUserProfile);

module.exports = router;
