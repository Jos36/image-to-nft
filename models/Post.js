const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: "{PATH} is required!",
    },
    description: {
      type: String,
    },
    user: {
      type: String,
      required: "{PATH} is required!",
    },
  },
  {
    timestamps: true,
  }
);
const Post = mongoose.models.Post
  ? mongoose.models.Post
  : mongoose.model("Post", PostSchema);

module.exports = Post;
