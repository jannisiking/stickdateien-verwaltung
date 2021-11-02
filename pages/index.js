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
  

function Startseite(props){
    //console.log(props.data);
    var listitems = props.data.map(zeile => <li>{zeile.url}</li>)
console.log(listitems);
    return (
        <ul>{listitems}</ul>
    )
}

function ListItem(){
    return (
        <li>
            Name, Größe, Download
        </li>
    );
}

export default Startseite;