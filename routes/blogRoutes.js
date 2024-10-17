const express = require("express");
const router = express.Router();
const blogController = require("../controllers/BlogController");

// Create blog (protected)
router.post("/create", blogController.createBlog);

// get my blogs
router.get("/my-blogs", blogController.getMyBlogs);

// Read all blogs (public)
router.get("/", blogController.getAllBlogs);

// Read single blog (public)
router.get("/:id", blogController.getBlogById);

// Update blog (protected)
router.put("/:id", blogController.updateBlog);

// Delete blog (protected)
router.delete("/delete/:id", blogController.deleteBlog);

module.exports = router;
