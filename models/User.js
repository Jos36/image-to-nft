const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "{PATH} is required!",
    },
    bio: {
      type: String,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      required: "{PATH} is required!",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User
  ? mongoose.models.User
  : mongoose.model("User", UserSchema);

module.exports = User;
