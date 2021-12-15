import fs from "fs";
import path from "path";
const formidable = require("formidable");
const form = formidable({ multiples: true });

export default async function handler(req, res) {
  form.parse(req, (err, fields, files) => {
    console.log(files.files)
    //fs.writeFile("./", files.files[0]);
    // let resultobject={
    //   name: fields.name,
    //   tags: fields.tags,
    //   image: files.image,
    //   filearray: files.files
    // }
  });
  res.status(200).send();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
