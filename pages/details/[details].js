import React, { Component } from "react";
import Image from "next/image";
import path from "path";
import fs from "fs";
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.DB_URL);

export async function getServerSideProps(context) {
  const gid = context.params.details;
  const filedir = path.join(__dirname + "/../../../../public/files/"+gid+"/");
  let filenamearray = [];
  console.log(gid);
  //Name und Tags -> Datenbankabfrage
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.DB_COLLECTION_NAME);
    var document = await collection.findOne( //Da die Daten per JSON mitgegeben werden, können keine Pending-Promises mitgegeben werden. Er muss awaited werden
      { id: gid },
      { projection: { _id: 0, name: 1, tags: 1 } }
    );
  filenamearray = fs.readdirSync(filedir).filter(name=> name!="image.png");
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
    this.state = {filenames: [...this.props.data.filenames]}
  }

  render() {
    console.log(this.props);
    let tagstring = ""; 
    this.props.data.document.tags.forEach(tag=>tagstring+= tag+" ");
    console.log(this.state.filenames)
    let filecomponents = this.state.filenames.map(filename=> <a href={"/files/"+this.props.data.gid+"/"+filename} download><div className="bg-secondary text-white p-3 box-border rounded-xl cursor-pointer mb-2 break-all">{filename}</div></a>)
    return (
      <div className="w-full h-full flex  flex-wrap">
        <div className="h-full w-2/5 flex flex-col justify-between p-5 box-border">
         <div className="relative w-full flex-1">
          <Image
            src={"/files/" + this.props.data.gid + "/image.png"}
           layout="fill"
           objectFit="contain"
            quality="100"
          ></Image>
          </div>
          <div name="Buttons" className="flex-0 h-56">
          <button
          className="bg-green-500 transition-all hover:bg-green-800 text-white w-full h-20 rounded-xl mt-5 text-4xl"
        >
          Speichern
        </button>
           <a href="/">
        <button
          className=" border-gray-500 border-4 transition-all hover:bg-gray-500 hover:text-white text-gray-500 w-full h-20 rounded-xl mt-5 text-4xl"
        >
          Ohne Speichern zurück
        </button>
          </a>
          </div>
        </div>
        <div className="flex-1 h-full w-1/2 flex flex-col p-5">
          <div name="image" className=" bg-gray-200">
            <form> 
              <label>
                Name
                <input defaultValue={this.props.data.document.name}></input>
              </label>
              <br />
              <label>
                <textarea defaultValue={tagstring}></textarea>
              </label>
            </form>
          </div>
          <div className="flex-1 overflow-y-scroll custom-shadow-inner rounded-xl hide-scrollbar p-2">
            {filecomponents}
           </div>
        </div>
      </div>
    );
  }
}



export default Details;
