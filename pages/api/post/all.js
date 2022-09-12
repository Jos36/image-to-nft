import Post from "../../../models/Post";
import connectMongodb from "../../../utils/connectMongodb";

export default async function handler(req, res) {
  console.log("Connecting db ...");
  await connectMongodb();

  if (req.query.page) {
    const posts = await Post.find({ isMinted: true })
      .sort("-createdAt")
      .skip(req.query.page * 7 - 7)
      .limit(7);
    const count = await Post.countDocuments({});
    console.log(count);
    res.status(200).json({ posts, count: count });
  } else {
    const posts = await Post.find({}).sort("-createdAt");
    const count = await Post.countDocuments({});
    console.log(count);
    res.status(200).json({ posts, count: count });
  }
}
