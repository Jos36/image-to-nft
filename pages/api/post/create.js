import connectMongodb from "../../../utils/connectMongodb";
import Post from "../../../models/Post";
import nextConnect from "next-connect";
import multer from "multer";
import { getToken } from "next-auth/jwt";

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

  const token = await getToken({ req });

  if (token) {
    if (token.sub) {
      console.log("Connecting db ...");
      await connectMongodb();

      // const post = await Post.create({
      //   image: req.body.image,
      //   description: req.body.description,
      //   user: req.body.user,
      //   top:0
      // });

      res.status(200).json({ post: "post" });
    }
  } else {
    res.status(401).json({ success: false });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
