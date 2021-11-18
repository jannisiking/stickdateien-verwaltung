import React, { Component } from "react";
import Image from "next/image";

class Hinzufuegen extends React.Component {
  constructor(props) {
    super(props);
    this.dataToRoot = this.dataToRoot.bind(this);
    this.getunsortedfilenames = this.getunsortedfilenames.bind(this);
    this.state = {
      sortedgroups: [], //ein Array an Gruppen-Objekten. diese Objekte enthalten die Metadaten plus ein Array der eigentlichen Dateien
      unsortedfiles: [], //beninhaltet die Dateien in der linken Spalte, die noch nicht zugeordnet sind
      unsortedfilenames: []
    };
  }
  //Folgende Funktion wird beim einfügen neuer Dateien ausgeführt
  //ZIEL: Neue Dateien einsortieren in gruppen und unsortiert
  dataToRoot(data) {
    let newdata = data.map((file) => {
      let fileendung = file.name.split(".").reverse()[0];
      let temp = file.name.split(".");
      temp.pop();
      let filename = temp.join("");
      return {
        fullname: file.name,
        name: filename,
        ending: fileendung,
        file: file,
      };
    });
    let einsortiert = [];
    let unsortedfilestemp = this.state.unsortedfiles;
    let sortedgroupstemp = this.state.sortedgroups;
    unsortedfilestemp = unsortedfilestemp.concat(newdata);
    //Dateien in Gruppen einordnen
    unsortedfilestemp.forEach((unsortedfileobject, i) => {
      let hinzugefuegt = false;
      sortedgroupstemp.forEach((group) => {
        let matchedboth = false;
        let matchedname = false;
        if (!hinzugefuegt) {
          group.files.forEach((fileobjectofgroup, i) => {
            if (
              !hinzugefuegt &&
              fileobjectofgroup.name == unsortedfileobject.name
            ) {
              matchedname = true;
              if (unsortedfileobject.ending == fileobjectofgroup.ending) {
                matchedboth = true;
                hinzugefuegt = true;
              }
            }
          });
          if (!hinzugefuegt && matchedname && !matchedboth) {
            group.files.push(unsortedfileobject);
            hinzugefuegt = true;
          }
        }
      });
      if (hinzugefuegt) {
        //einfaches löschen nicht möglich, sonst ist zählen mit for each fehlerhaft
        einsortiert.push(unsortedfileobject);
        //dann aus unsortiertem array löschen
      }
    });

    unsortedfilestemp = unsortedfilestemp.filter(
      (file) => !einsortiert.includes(file)
    );

    let arrayofnewgroups = [];
    for (let x = unsortedfilestemp.length - 1; x >= 0; x--) {
      console.log("x ist: "+x);
      if (typeof unsortedfilestemp[x] != "undefined") {
        //console.log(unsortedfilestemp);
        //console.log("Name und voller Name der zu checkenden Datei:");
        let filename=unsortedfilestemp[x].name;
        let filefullname=unsortedfilestemp[x].fullname;
        console.log(filename, filefullname);
        let tempnewgroupfiles = unsortedfilestemp.filter(function(file){
          let result= false;
          //console.log(file.name);
          //console.log(unsortedfilestemp[x].name);
          //console.log( file.fullname);
          //console.log(unsortedfilestemp[x].fullname);
          if(file.name == filename &&
            file.fullname != filefullname){
              result=true;
              //console.log("Ist gleich");
            }
            return result;
        });
        //console.log(tempnewgroupfiles);
        if (tempnewgroupfiles.length != 0 && tempnewgroupfiles != "undefined") {
            tempnewgroupfiles.push(unsortedfilestemp[x]);
            //console.log("Hier komme ich rein");
          arrayofnewgroups.push({
            name: tempnewgroupfiles[0].name,
            files: tempnewgroupfiles,
          });
        }
        unsortedfilestemp = unsortedfilestemp.filter(
          (file) => !tempnewgroupfiles.includes(file)
        );
        console.log(unsortedfilestemp);
      }
    }
    console.log(arrayofnewgroups);
    console.log(unsortedfilestemp);
    this.setState({
      sortedgroups: this.state.sortedgroups.concat(arrayofnewgroups),
      unsortedfiles: unsortedfilestemp,
    });
  }

  getunsortedfilenames(){
    return this.state.unsortedfiles.map(file => file.fullname);
  }

  componentDidUpdate(prevProps, prevState, snapshot){
    console.log(this.state.unsortedfiles);
    console.log(this.state.sortedgroups);
  }


  render() {
    //console.log("Root", this.state.sortedgroups);
    return (
      <div className="flex w-full h-full">
        <LinkeSeite
          dataToRoot={this.dataToRoot}
          filenamearray={this.getunsortedfilenames()}
        />
        <RechteSeite sortedgroups={this.state.sortedgroups} />
      </div>
    );
  }
}

class LinkeSeite extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="h-full w-2/6 bg-tertiary p-10 flex flex-col">
        <FileInput
          dataToRoot={this.props.dataToRoot}
          filenamearray={this.props.filenamearray}
        />
      </div>
    );
  }
}

class FileInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.file_Handler = this.file_Handler.bind(this);
    this.state = { filenamearray: [] };
  }
  file_Handler(e) {
    e.preventDefault();
    var filearray = Object.values(this.inputRef.current.files);
    this.props.dataToRoot(filearray);
  }

  render() {
    return (
      <>
        <div className="relative h-1/3 w-full flex-none">
          <div className="pointer-events-none h-full w-full bg-tertiary border-dotted border-8 absolute flex items-center justify-center">
            <div className="text-8xl text-white">+</div>
          </div>
          <input
            className="w-full h-full"
            type="file"
            onInput={this.file_Handler}
            onDrop={this.file_Handler}
            ref={this.inputRef}
            multiple
          ></input>
        </div>
        <FileList filenamearray={this.props.filenamearray}></FileList>
      </>
    );
  }
}

class FileList extends Component {
  constructor(props) {
    super(props);
    this.state = { list: [] };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.filenamearray !== this.props.filenamearray) {
      let tempArray = this.props.filenamearray.map((name) => (
        <div
          key={name}
          className="bg-secondary text-white rounded-xl m-5 px-2 py-4 text-xl"
        >
          {name}
        </div>
      ));
      this.setState({ list: tempArray });
    }
  }

  render() {
    return (
      <div className="bg-quarternary rounded-xl flex-1 mt-5">
        {this.state.list}
      </div>
    );
  }
}

class RechteSeite extends Component {
  render(props) {
    //console.log("RechteSeite", this.props.sortedgroups);
    return (
      <div className="h-full flex-1 flex flex-col">
        <ParameterBearbeiten></ParameterBearbeiten>
        <GruppenListe sortedgroups={this.props.sortedgroups}/>
      </div>
    );
  }
}

class ParameterBearbeiten extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className="h-60 flex-none bg-gray-300"></div>;
  }
}

class GruppenListe extends Component {
  constructor(props) {
    super(props);
  }

  render(props) {
    //console.log("Gruppenliste", this.props.sortedgroups);
    let dateigruppen = this.props.sortedgroups.map((group)=> {
        return(<DateiGruppe key={group.name}
          name={group.name}
        ></DateiGruppe>)
    })
    return (
      <div className=" flex-grow p-10 overflow-y-scroll">
        {dateigruppen}
      </div>
    );
  }
}

class DateiGruppe extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className=" h-60 flex-grow bg-gray-400 shadow-lg transition-all duration-200 my-5 hover:shadow-2xl rounded-md p-5">
        <div className="relative h-full w-1/3 ml-3">
          {this.props.name}
        </div>
      </div>
    );
  }
}

export default Hinzufuegen;
