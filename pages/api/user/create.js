import connectMongodb from "../../../utils/connectMongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  console.log("Connecting db ...");
  console.log(req.body);
  await connectMongodb();

  const user = await User.create({ name: "usf", role: "USER" });

  res.status(200).json({ user });
}
