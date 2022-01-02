import React, { Component } from "react";
import Image from "next/image";
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.DB_URL);

export async function getServerSideProps(context) {
  const gid = context.params.details;
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
    console.log(document);
  } catch (error) {
    console.log(error);
  } finally {
    //client.close();  //Erst beenden wennPromise fullfilled ist!!
  }
  return {
    props: {
      data: {
        gid: gid,
        document: document,
        filenames: [],
      },
    }, // will be passed to the page component as props
  };
  //Dateinamen aus Verzeichnis
}

class Details extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props);
    let tagstring = ""; 
    this.props.data.document.tags.forEach(tag=>tagstring+=tag);
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
           
        <button
          className=" border-gray-500 border-4 transition-all hover:bg-gray-500 hover:text-white text-gray-500 w-full h-20 rounded-xl mt-5 text-4xl"
        >
          Ohne Speichern zurück
        </button>
          </div>
        </div>
        <div className="flex-1 h-full w-1/2 flex flex-col">
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
          <div
            name="Filelist"
            className="flex-1 overflow-y-scroll p-5 bg-gray-100"
          >
            <Filelist />
          </div>
        </div>
      </div>
    );
  }
}


class Filelist extends React.Component {
  render() {
    return (
      <div className="w-full overflow-y-scroll custom-shadow-inner rounded-xl hide-scrollbar p-2"></div>
    );
  }
}

export default Details;
