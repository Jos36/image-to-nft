const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

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
    top: {
      type: Number,
    },
    title: {
      type: String,
    },
    chain: {
      type: String,
    },
    isMinted: {
      type: Boolean,
    },
    nftLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Post) {
  const Post = mongoose.models.Post;
  module.exports = Post;
} else {
  PostSchema.plugin(AutoIncrement, { inc_field: "nft_id" });
  const Post = mongoose.model("Post", PostSchema);
  module.exports = Post;
}
