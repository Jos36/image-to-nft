import mongoose from "mongoose";

const connectMongodb = async () => {
  if (mongoose.connections[0].readyState) {
    console.log("already connected");
  } else {
    mongoose.connect(process.env.MONGO_URI, () => {
      console.log("Connected to db");
    });
  }
};

export default connectMongodb;
