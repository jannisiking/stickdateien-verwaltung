import fs from "fs";
import path from "path";
const { MongoClient } = require("mongodb");
const formidable = require("formidable");

// Connection URL
const url = "mongodb://homeserver:32785";
const client = new MongoClient(url);

// Database Name
const dbName = "stickdateien_verwaltung";

export default async function handler(req, res) {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("stickdateien");
//   const temp = await collection.find().sort({_id:-1}).limit(1).toArray();
// const maxid = temp[0]._id.toHexString();
//   console.log(maxid);
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
      collection.insertOne({_id: {
                              $oid:"000000000000000000000001"
                            },
                          name: "Schalke"});
      res.status(200).send();
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
