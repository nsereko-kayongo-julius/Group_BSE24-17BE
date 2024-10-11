const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  summary: {
    type: String,
    maxlength: 100,
  },
  body: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "All",
      "Technology",
      "Health",
      "Agriculture",
      "Marketing",
      "Social",
      "Business",
    ],
  },
  tags: {
    type: [String],
    validate: [arrayLimit, "Exceeds the limit of 5 tags"],
  },
  coverImage: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

function arrayLimit(val) {
  return val.length <= 2;
}

module.exports = mongoose.model("Blog", blogSchema);
