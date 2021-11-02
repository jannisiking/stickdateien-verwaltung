const mysql = require('mysql2/promise');
var connection = mysql.createPool({
  host     : "85.214.52.49",
  user     : "desktop",
  password : "ergeh34563khL!",
  database : "website_mama_test"
});

export async function getServerSideProps(context) {
    const result = await connection.query("SELECT * FROM stickdatei;");
    var ausgabe = result[0];
    //console.log(ausgabe);
    return {
      props: {
          data: ausgabe
        }, // will be passed to the page component as props
    }
  }
  

function Stickdateienverwaltung(props){
    //console.log(props.data);
    var listitems = props.data.map(zeile => <Kachel sid={zeile.sid} autorurl={zeile.url} name={zeile.name}></Kachel>)
    return (
        <div className="row justify-content-md-center">{listitems}</div>
    )
}

function Kachel(props){
    return (
        <div className="col col-lg-3">
	    <div className="card">
	    	<img className="card-img-top" src="images/{props.sid}.png">
	    	<div className="card-body">
	    		<div className="card-title">
           			{props.name}
	    		</div>
	    	</div>
	    </div>
        </div>
    );
}



export default Stickdateienverwaltung;
