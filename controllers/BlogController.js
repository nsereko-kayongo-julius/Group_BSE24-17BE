const Blog = require("../models/blog");
const multer = require("multer");
const path = require("path");

// Setup for Multer to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);
    if (extname && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Images only! (jpeg, jpg, png)"));
    }
  },
}).single("coverImage");

// CREATE: Create a new blog post
exports.createBlog = (req, res) => {
  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Please log in to create a blog" });
  }

  upload(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "Error uploading image", error: err.message });
    }

    const { title, summary, body, category, tags } = req.body;
    const coverImage = req.file ? req.file.path : "";

    const blog = new Blog({
      title,
      summary,
      body,
      category,
      tags: tags ? tags.split(",") : [],
      coverImage,
      author: req.user._id, // Author is the authenticated user
    });

    blog
      .save()
      .then(() =>
        res.status(201).json({ message: "Blog created successfully" })
      )
      .catch((error) =>
        res.status(400).json({ message: "Error creating blog", error })
      );
  });
};

// READ: Get all blog posts
exports.getAllBlogs = (req, res) => {
  Blog.find()
    .populate("author", "username email profilePicture")
    .sort({ createdAt: -1 })
    .then((blogs) => res.status(200).json(blogs))
    .catch((error) =>
      res.status(400).json({ message: "Error fetching blogs", error })
    );
};
//
exports.getBlogById = (req, res) => {
  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Please log in to update the blog" });
  }

  const blogId = req.params.id;
  Blog.findById(blogId)
    .populate("author", "username email profilePicture ")
    .then((blog) => {
      if (!blog) return res.status(404).json({ message: "Blog not found" });
      res.status(200).json(blog);
    })
    .catch((error) =>
      res.status(400).json({ message: "Error fetching blog", error })
    );
};

// UPDATE: Update a blog post by ID
exports.updateBlog = (req, res) => {
  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Please log in to update the blog" });
  }

  const blogId = req.params.id;

  Blog.findById(blogId)
    .then((blog) => {
      if (!blog) return res.status(404).json({ message: "Blog not found" });

      // Check if the authenticated user is the author
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "Forbidden: You are not allowed to edit this blog",
        });
      }

      // Proceed with the update
      upload(req, res, (err) => {
        if (err) {
          return res
            .status(400)
            .json({ message: "Error uploading image", error: err.message });
        }

        const { title, summary, body, category, tags } = req.body;
        const coverImage = req.file ? req.file.path : "";

        blog.title = title || blog.title;
        blog.summary = summary || blog.summary;
        blog.body = body || blog.body;
        blog.category = category || blog.category;
        blog.tags = tags ? tags.split(",") : blog.tags;
        if (coverImage) blog.coverImage = coverImage;

        return blog.save();
      })
        .then(() =>
          res.status(200).json({ message: "Blog updated successfully" })
        )
        .catch((error) =>
          res.status(400).json({ message: "Error updating blog", error })
        );
    })
    .catch((error) =>
      res.status(400).json({ message: "Error updating blog", error })
    );
};

// DELETE: Delete a blog post by ID
exports.deleteBlog = (req, res) => {
  const blogId = req.params.id;

  Blog.findByIdAndDelete(blogId)
    .then((blog) => {
      if (!blog) return res.status(404).json({ message: "Blog not found" });
      res.status(200).json({ message: "Blog deleted successfully" });
    })
    .catch((error) =>
      res.status(400).json({ message: "Error deleting blog", error })
    );
};

// READ: Get all blog posts for the logged-in user
exports.getMyBlogs = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  Blog.find({ author: req.user._id })
    .populate("author", "username email profilePicture")
    .sort({ createdAt: -1 })
    .then((blogs) => res.status(200).json(blogs))
    .catch((error) =>
      res.status(400).json({ message: "Error fetching user's blogs", error })
    );
};
