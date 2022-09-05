import connectMongodb from "../../../utils/connectMongodb";
import Post from "../../../models/Post";

export default async function handler(req, res) {
  console.log("Connecting db ...");
  await connectMongodb();

  res.status(200).json({ name: "John Doe" });
}
