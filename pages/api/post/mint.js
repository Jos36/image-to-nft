import { getToken } from "next-auth/jwt";
import Post from "../../../models/Post";
import connectMongodb from "../../../utils/connectMongodb";

export default async function handler(req, res) {
  const postId = req.query.postId;
  const nftLink = req.query.nftLink;
  const address = req.query.address;
  const token = await getToken({ req });

  console.log(postId, nftLink);

  console.log("Connecting db ...");
  if (token.sub === address) {
    await connectMongodb();

    await Post.findOneAndUpdate(
      { _id: postId },
      { nftLink: nftLink, isMinted: true },
      { new: true }
    ).then((postWithImage) => {
      res.status(200).json({ post: postWithImage });
      console.log("Minted!");
    });
  } else {
    res.status(401).json({ message: "unauth" });
  }
}
