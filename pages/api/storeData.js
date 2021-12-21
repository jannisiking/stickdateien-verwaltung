import fs from "fs";
import path from "path";
const { MongoClient } = require("mongodb");
const formidable = require("formidable");
const sanitizer = require("sanitizer");
// Connection URL
const url = "mongodb://homeserver:32785";
const client = new MongoClient(url);

// Database Name
const dbName = "stickdateien_verwaltung";

export default async function handler(req, res) {
  //Connect to the Database
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("stickdateien");
  const storedir = path.join(__dirname + "/../../../../public/files/");
  //Ordnernamen (Nummern) auslesen und höchste Nummer finden
  let foldernamearray = fs.readdirSync(storedir);
  foldernamearray = foldernamearray.map((name)=>{
    if(parseInt(name)!=NaN){
      return parseInt(name);
    }
  })
  let newid = Math.max(...foldernamearray) +1;
  //Pfad und zugehörigen Ordner erstellen
  const newfolderpath = path.join(storedir+`/${newid}`);
  fs.mkdirSync(newfolderpath);
  //Formidable Optionen einstellen
  const form = formidable({
    multiples: true,
    uploadDir: newfolderpath,
    keepExtensions: true,
    filename: (name, ext) => {
      if (name == "image") {
        return `image${ext}`;
      } else {
        return `${newid}${ext}`;
      }
    }
  });
  form.parse(req, (err, fields, files) => {
    if(err){
      console.log(err);
      return;
    }
    try {
      collection.insertOne({id: `${newid}`,
      name: sanitizer.sanitize(fields.name),
      tags: sanitizer.sanitize(fields.tags).split(" ")})
      res.status(200).send();
    } catch (error) {
      res.status(500).send();
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
