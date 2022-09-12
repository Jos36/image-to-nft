import connectMongodb from "../../../utils/connectMongodb";
import Post from "../../../models/Post";
import nextConnect from "next-connect";
import multer from "multer";
import { getToken } from "next-auth/jwt";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadString,
  uploadBytes,
} from "firebase/storage";

import { app } from "../../../utils/firebase";

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
  console.log(req.files[0]); // Your files here
  console.log(req.body); // Your form data here

  const token = await getToken({ req });

  if (token) {
    if (token.sub) {
      try {
        console.log("Connecting db ...");
        await connectMongodb();

        const post = await Post.create({
          image: "null",
          description: req.body.description,
          user: req.body.user,
          top: 0,
          title: req.body.title,
          chain: req.body.chain,
          isMinted: req.body.isMinted ? req.body.isMinted : false,
          nftLink: req.body.nftLink && req.body.nftLink,
        });

        const storage = getStorage();
        const ImageType = req.files[0].mimetype;
        const type = ImageType.split("/");
        const imageRef = ref(storage, `posts/${post._id}/image.${type[1]}`);
        await uploadBytes(imageRef, req.files[0].buffer).then(
          async (snapshot) => {
            const downloadURL = await getDownloadURL(imageRef);
            await Post.findOneAndUpdate(
              { _id: post._id },
              { image: downloadURL },
              { new: true }
            ).then((postWithImage) => {
              res.status(200).json({ post: postWithImage });
              console.log("Posted!");
            });
          }
        );
      } catch (e) {
        console.log(e);
      }
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
