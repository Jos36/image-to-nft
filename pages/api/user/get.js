import User from "../../../models/User";
import connectMongodb from "../../../utils/connectMongodb";

export default async function handler(req, res) {
  console.log("Connecting db ...");
  await connectMongodb();

  const address = req.query.address;
  const user = await User.find({ address });

  res.status(200).json({ user });
}
