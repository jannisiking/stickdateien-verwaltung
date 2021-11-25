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
      unsortedfilenames: [],
      gidcount: 0,
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

    //die einsortierten Dateien aus der unsortierten Liste herausnehmen:

    unsortedfilestemp = unsortedfilestemp.filter(
      (file) => !einsortiert.includes(file)
    );

    //neue Gruppen aus den nicht einsortierbaren Dateien bilden
    let tempgidcount = this.state.gidcount; //Da hier die Gruppen erstellt werden, muss die GID auch hier hochgezählt werden (Gruppen - ID)
    let arrayofnewgroups = [];
    for (let x = unsortedfilestemp.length - 1; x >= 0; x--) {
      if (typeof unsortedfilestemp[x] != "undefined") {
        let filename = unsortedfilestemp[x].name;
        let filefullname = unsortedfilestemp[x].fullname;
        let tempnewgroupfiles = unsortedfilestemp.filter(function (file) {
          let result = false;
          if (file.name == filename && file.fullname != filefullname) {
            result = true;
          }
          return result;
        });
        if (tempnewgroupfiles.length != 0 && tempnewgroupfiles != "undefined") {
          tempnewgroupfiles.push(unsortedfilestemp[x]);
          tempgidcount++;
          arrayofnewgroups.push({
            gid: tempgidcount,
            name: tempnewgroupfiles[0].name,
            files: tempnewgroupfiles,
          });
        }
        unsortedfilestemp = unsortedfilestemp.filter(
          (file) => !tempnewgroupfiles.includes(file)
        );
      }
    }
    this.setState({
      gidcount: tempgidcount,
      sortedgroups: this.state.sortedgroups.concat(arrayofnewgroups),
      unsortedfiles: unsortedfilestemp,
    });
  }

  getunsortedfilenames() {
    return this.state.unsortedfiles.map((file) => file.fullname);
  }

  render() {
    //console.log("Root", this.state.sortedgroups);
    return (
      <div className="flex w-full h-full">
        <LinkeSeite
          dataToRoot={this.dataToRoot}
          filenamearray={this.getunsortedfilenames()}
        />
        <RechteSeite
          sortedgroups={this.state.sortedgroups}
          setCurrentEditingGroup={this.setCurrentEditingGroup}
        />
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
    this.file_Handler_input = this.file_Handler_input.bind(this);
    this.file_Handler_drop = this.file_Handler_drop.bind(this);
    this.state = { filenamearray: [] };
  }
  file_Handler_input(e) {
    console.log("INPUT", e);
    e.preventDefault();
    var filearray = Object.values(this.inputRef.current.files);
    this.props.dataToRoot(filearray);
  }

  file_Handler_drop(e) {
    console.log("DROP", e);
    e.preventDefault();
    var filearray = Object.values(e.dataTransfer.files);
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
            onInput={this.file_Handler_input}
            onDrop={this.file_Handler_drop}
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
        <GruppenListe
          sortedgroups={this.props.sortedgroups}
          setCurrentEditingGroup={this.props.setCurrentEditingGroup}
        />
      </div>
    );
  }
}

class GruppenListe extends Component {
  constructor(props) {
    super(props);
  }

  render(props) {
    //console.log("Gruppenliste", this.props.sortedgroups);
    let dateigruppen = this.props.sortedgroups.map((group) => {
      return (
        <DateiGruppe
          key={group.name}
          groupobject={group}
          setCurrentEditingGroup={this.props.setCurrentEditingGroup}
        ></DateiGruppe>
      );
    });
    return (
      <div className=" flex-grow p-10 overflow-y-scroll">{dateigruppen}</div>
    );
  }
}

class DateiGruppe extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let filenames = this.props.groupobject.files.map((file) => (
      <div className="bg-black text-white p-3 w-full rounded-xl my-2">
        {file.fullname}
      </div>
    ));
    return (
      <div className=" h-80 flex-grow bg-gray-400 shadow-lg transition-all duration-200 my-5 hover:shadow-2xl rounded-md p-5 flex justify-between">
        <div className="relative h-full w-80 bg-white rounded-xl"></div>
        <div className="w-1/3 mx-2 text-white text-2xl flex flex-col justify-between">
          <div className="my-2 flex flex-nowrap">
            <div className="border-4 border-gray-500 rounded-tl-xl rounded-bl-xl w-32">
              Name
            </div>
            <input className="border-4 border-l-0 border-gray-500 rounded-tr-xl rounded-br-xl w-full text-gray-400" defaultValue={this.props.groupobject.name}/>
          </div>
          <div className="my-2 flex-1 flex flex-nowrap">
            <div className="border-4 border-gray-500 rounded-tl-xl rounded-bl-xl leading-tight px-2 w-32">
              Tags
            </div>
            <textarea className="border-4 border-l-0 border-gray-500 rounded-tr-xl rounded-br-xl w-full text-gray-400 resize-none"/>
          </div>
          <div className="my-2 flex-1 flex flex-nowrap">
            <div className="border-4 border-gray-500 rounded-tl-xl rounded-bl-xl leading-tight px-2 w-32">
              Farben
            </div>
            <textarea className="border-4 border-l-0 border-gray-500 rounded-tr-xl rounded-br-xl w-full text-gray-400 resize-none"/>
          </div>
        </div>
        <div className="w-1/3 overflow-y-scroll">{filenames}</div>
      </div>
    );
  }
}

export default Hinzufuegen;

// <form>
//           <label> Name:
//           <input defaultValue={this.props.groupobject.name}/>
//           </label>
//           <label> Name:
//           <input defaultValue={this.props.groupobject.name}/>
//           </label>
//           <label> Name:
//           <input defaultValue={this.props.groupobject.name}/>
//           </label>
//           <label> Name:
//           <input defaultValue={this.props.groupobject.name}/>
//           </label>
//           </form>
