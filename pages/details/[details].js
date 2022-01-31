import React, { Component } from "react";
import Image from "next/image";
import Link from "next/link";
import path from "path";
import fs from "fs";
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.DB_URL);

export async function getServerSideProps(context) {
  const gid = context.params.details;
  const filedir = path.join(
    __dirname + "/../../../../public/files/" + gid + "/"
  );
  let filenamearray = [];
  console.log(gid);
  //Name und Tags -> Datenbankabfrage
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.DB_COLLECTION_NAME);
    var document = await collection.findOne(
      //Da die Daten per JSON mitgegeben werden, können keine Pending-Promises mitgegeben werden. Er muss awaited werden
      { id: gid },
      { projection: { _id: 0, name: 1, tags: 1 } }
    );
    filenamearray = fs
      .readdirSync(filedir)
      .filter((name) => name != "image.png");
  } catch (error) {
    console.log(error);
  } finally {
    // client.close();  //Erst beenden wennPromise fullfilled ist!!
  }
  return {
    props: {
      data: {
        gid: gid,
        document: document,
        filenames: filenamearray,
      },
    }, // will be passed to the page component as props
  };
  //Dateinamen aus Verzeichnis
}

class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = { filenames: [...this.props.data.filenames] };
  }

  render() {
    console.log(this.props);
    let tagstring = "";
    this.props.data.document.tags.forEach((tag) => (tagstring += tag + " "));
    console.log(this.state.filenames);
    let filecomponents = this.state.filenames.map((filename) => (
      <a href={"/files/" + this.props.data.gid + "/" + filename} key={filename} download>
        <div className="bg-secondary text-white p-3 box-border rounded-xl cursor-pointer mb-2 break-all">
          {filename}
        </div>
      </a>
    ));
    return (
      <div className="w-full h-full flex  flex-wrap">
        <div className="h-full w-2/5 flex flex-col justify-between p-5 box-border">
          <EditImage src={"/files/" + this.props.data.gid + "/image.png"} />
          <div name="Buttons" className="flex-0 h-56">
            <button className="bg-green-500 transition-all hover:bg-green-800 text-white w-full h-20 rounded-xl mt-5 text-4xl">
              Speichern
            </button>
            <Link href="/">
              <button className=" border-gray-500 border-4 transition-all hover:bg-gray-500 hover:text-white text-gray-500 w-full h-20 rounded-xl mt-5 text-4xl">
                Ohne Speichern zurück
              </button>
            </Link>
          </div>
        </div>
        <div className="flex-1 h-full w-1/2 flex flex-col p-5">
          <div name="Form">
            <div className="my-2 flex flex-nowrap">
              <div className="border-4 border-gray-500 rounded-tl-xl rounded-bl-xl w-32">
                Name
              </div>
              <input
                className="border-4 border-l-0 border-gray-500 rounded-tr-xl rounded-br-xl w-full text-gray-400"
                defaultValue={this.props.data.document.name}
              />
            </div>
            <div className="my-2 flex-1 flex flex-nowrap">
              <div className="border-4 border-gray-500 rounded-tl-xl rounded-bl-xl leading-tight px-2 w-32">
                Tags
              </div>
              <textarea
                className="border-4 border-l-0 border-gray-500 rounded-tr-xl rounded-br-xl w-full text-gray-400 resize-none"
                defaultValue={tagstring}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-scroll custom-shadow-inner rounded-xl hide-scrollbar p-2">
            {filecomponents}
          </div>
        </div>
      </div>
    );
  }
}

//extra Component, da er beim Hinzufügen eins zu eins die gleiche Funktion hat
class EditImage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="group relative w-full h-full  transition-all">
        <div className="h-full w-full pointer-events-none group-hover:blur-sm absolute bg-fuchsia-100  ">
          <Image
            src={this.props.src}
            layout="fill"
            objectFit="contain"
            quality="100"
          ></Image>
        </div>
        <div className="flex justify-center align-middle absolute h-full w-full pointer-events-none">
          <div className="invisible group-hover:visible  h-32 w-32 z-10">
            <object data="/svg/upload.svg" type="image/svg+xml"></object>
          </div>
        </div>
        <input
          className="w-full h-full bg-inherit cursor-pointer"
          type="file"
        ></input>
      </div>
    );
  }
}

export default Details;
