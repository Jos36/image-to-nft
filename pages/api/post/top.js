import Post from "../../../models/Post";
import connectMongodb from "../../../utils/connectMongodb";

export default async function handler(req, res) {
  console.log("Connecting db ...");
  await connectMongodb();

  const posts = await Post.find({ top: { $gt: 0 } }).sort("top");
  console.log(posts);

  res.status(200).json({ posts });
}
