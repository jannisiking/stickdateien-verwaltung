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
    var document = await collection.findOne(
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
          <div name="Buttons" className="flex-0 h-56 bg-gray-300">
            <button>Speichern</button>
            <br></br>
            <button>Ohne speichern zurück</button>
          </div>
        </div>
        <div className="flex-1 h-full w-1/2 flex flex-col">
          <div name="image" className=" bg-gray-200">
            <form>
              <label>
                Name
                <input value="Name"></input>
              </label>
              <br />
              <label>
                <textarea></textarea>
              </label>
            </form>
          </div>
          <div
            name="image"
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
