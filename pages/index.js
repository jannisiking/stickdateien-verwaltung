import Image from "next/image";
const { MongoClient } = require('mongodb');


// Connection URL
const url = 'mongodb://homeserver:32785';
const client = new MongoClient(url);

// Database Name
const dbName = 'stickdateien_verwaltung';

export async function getServerSideProps(context) {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('stickdateien');

  const findResult = await collection.find({}).toArray();
  const result = findResult.map((entry)=>{
return {
      sid: entry._id.toString(),
      name: entry.name,
      autor: entry.autor,
      url: entry.url
  }
  })
  console.log('Found documents =>', result);
  return {
    props: {
      data: result
    } // will be passed to the page component as props
  };
}

function Startseite(props) {
  //console.log(props.data);

  return (
    <div className="flex grid-cols-2 w-full h-full">
      <Sidebar />
      <Grid data={props.data}/>
    </div>
  );
}

function Grid(props) {
  var listitems = props.data.map((zeile) => (
    
    <Kachel sid={zeile.sid}></Kachel>
  ));
  return (
    <div className="overflow-y-scroll flex flex-wrap justify-around">
      {listitems}
    </div>
  );
}

function Kachel(props) {
  return (
    <a href="https://google.com">
      <div className="flex-none m-10 w-80 h-80 shadow-lg transition-all duration-200 hover:shadow-2xl rounded-md">
      <Image src={"/images/" + props.sid + ".jpg"} layout="responsive" width="200" height="200"   objectFit="contain"/>
      </div>
    </a>
  );
}

function Sidebar(props) {
  return (
    <div className="flex-none h-full w-80 p-5 bg-gradient-to-r from-blue-300 bg-sky-50">
      <form className="my-5">
        <input type="text" className="rounded-md text-xl" />
        <button
          type="submit"
          class="bg-sky-300 p-1 text-white rounded-md transition hover:bg-sky-400"
        >
          Suche
        </button>

        <div className="bg-gray-200 py-3 my-5 rounded-xl px-5">
          <Farbfeld tailwindfarbe="bg-blue-500" />
          <Farbfeld tailwindfarbe="bg-yellow-300" />
          <Farbfeld tailwindfarbe="bg-red-500" />
          <Farbfeld tailwindfarbe="bg-green-400" />
          <Farbfeld tailwindfarbe="bg-pink-300" />
          <Farbfeld tailwindfarbe="bg-purple-400" />
        </div>
      </form>
    </div>
  );
}

function Farbfeld(props) {
  return <div className={props.tailwindfarbe + " h-10 my-1 rounded-xl"}></div>;
}

export default Startseite;
