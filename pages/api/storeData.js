import fs from "fs";
import path from "path";
const formidable = require("formidable");

export default async function handler(req, res) {
  const id = Math.round(Math.random() * 1000);
  const dir = path.join(__dirname, `../../../../filestorage/${id}`);
  fs.mkdirSync(dir);
  const form = formidable({
    multiples: true,
    uploadDir: dir,
    keepExtensions: true,
    filename: (name, ext) => {
      if (name == "image") {
        return `image${ext}`;
      } else {
        return `${id}${ext}`;
      }
    },
  });
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.log(err);
      res.status(500).send();
    } else {
      res.status(200).send();
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
