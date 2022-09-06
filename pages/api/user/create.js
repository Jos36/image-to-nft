import connectMongodb from "../../../utils/connectMongodb";
import User from "../../../models/User";
import nextConnect from "next-connect";
import multer from "multer";

const apiRoute = nextConnect({
  onError(error, req, res) {
    res
      .status(501)
      .json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method "${req.method}" Not Allowed` });
  },
});

apiRoute.use(multer().any());

apiRoute.post(async (req, res) => {
  console.log(req.files); // Your files here
  console.log(req.body); // Your form data here

  console.log("Connecting db ...");
  await connectMongodb();

  const user = await User.create({
    address: req.body.address,
    name: req.body.name,
    bio: req.body.bio,
    image: req.body.image,
    role: "USER",
  });

  res.status(200).json({ user });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
