import connectMongodb from "../../../../utils/connectMongodb";
import Post from "../../../../models/Post";
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
  try {
    console.log(req.files); // Your files here
    console.log(req.body); // Your form data here
    console.log(req.body.address); // Your form data here

    const token = await getToken({ req });

    if (token) {
      const admins = process.env.ADMIN_ADDRESSES.split(",");
      if (
        token.sub &&
        admins.includes(token.sub) &&
        req.body.address == token.sub
      ) {
        console.log("Connecting db ...");
        await connectMongodb();

        Post.find({ top: req.body.top }).then(async (resp) => {
          if (resp.length === 0) {
            await Post.findOneAndUpdate(
              { _id: req.body._id },
              { top: Number(req.body.top) },
              { new: true }
            ).then((postWithTop) => {
              res.status(200).json({ post: postWithTop });
              console.log("Updated!");
            });
          } else {
            await Post.findOneAndUpdate(
              { top: req.body.top },
              { top: 0 },
              { new: true }
            )
              .then((postWithTop) => {
                console.log("Updated!");
              })
              .then(async () => {
                await Post.findOneAndUpdate(
                  { _id: req.body._id },
                  { top: Number(req.body.top) },
                  { new: true }
                ).then((postWithTop) => {
                  res.status(200).json({ post: postWithTop });
                  console.log("Updated!");
                });
              });
          }
        });
      } else {
        res.status(401).json({ success: false });
      }
    } else {
      res.status(401).json({ success: false });
    }
  } catch (e) {
    console.log(e);
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
