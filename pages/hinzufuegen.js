import React, { Component } from "react";
import Image from "next/image";
import { convert } from "../pestopng";

class Hinzufuegen extends React.Component {
  constructor(props) {
    super(props);
    this.dataToRoot = this.dataToRoot.bind(this);
    this.initialCanvasFromPes = this.initialCanvasFromPes.bind(this);
    this.turnimage = this.turnimage.bind(this);
    this.dropFile = this.dropFile.bind(this);
    this.state = {
      sortedgroups: [], //ein Array an Gruppen-Objekten. diese Objekte enthalten die Metadaten plus ein Array der eigentlichen Dateien
      unsortedfiles: [], //beninhaltet die Dateien in der linken Spalte, die noch nicht zugeordnet sind
      unsortedfilenames: [],
      gidcount: 0,
      filecount: 0
    };
  }
  //Folgende Funktion wird beim einfügen neuer Dateien ausgeführt
  //ZIEL: Neue Dateien einsortieren in gruppen und unsortiert
  async dataToRoot(data) {
    let tempfilecount = this.state.filecount;
    let newdata = data.map((file) => {
      tempfilecount++;
      let fileendung = file.name.split(".").reverse()[0];
      let temp = file.name.split(".");
      temp.pop();
      let filename = temp.join("");
      return {
        fid: tempfilecount,
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
            imagecanvas: await this.initialCanvasFromPes(tempnewgroupfiles),
          });
        }
        unsortedfilestemp = unsortedfilestemp.filter(
          (file) => !tempnewgroupfiles.includes(file)
        );
      }
    }
    this.setState({
      gidcount: tempgidcount,
      filecount: tempfilecount,
      sortedgroups: this.state.sortedgroups.concat(arrayofnewgroups),
      unsortedfiles: unsortedfilestemp,
    });
  }

  dropFile(pFid, pSrcGid, pDestGid){
    let tempsortedgroups=this.state.sortedgroups;
    let tempunsortedfiles=this.state.unsortedfiles;
    if(pSrcGid==pDestGid) return;
    if(pSrcGid==0){ //Von unsortiert in eine Gruppe
      let tempfile = tempunsortedfiles.filter((file)=> file.fid==pFid)[0];  //Datei-objekt heraussuchen
      tempunsortedfiles= tempunsortedfiles.filter((file)=> file.fid!=pFid); //Datei-objekt aus unsortierten Dateien löschen
      tempsortedgroups.forEach((group)=>{
        if(group.gid==pDestGid){//Passende Zielgruppe finden
          group.files.push(tempfile); //Wenn Zielgruppe gefunden, dann Datei an Files-Array der Gruppe anhängen
        }
      })
    } else if(pDestGid==0){ //von Gruppe nach unsortiert
      let tempfile = tempsortedgroups.filter((group)=>group.gid==pSrcGid)[0].files.filter((file)=>file.fid==pFid)[0]; //Datei-Objekt aus dieser Gruppe extrahieren
      tempsortedgroups.forEach((group)=>{
        if(group.gid==pSrcGid){
          group.files = group.files.filter((pFile)=>pFile.fid!=pFid);//Datei-Objekt aus ursprungsgruppe entnehmen, indem nach allen Dateien ausser eben dieser gefiltert wird
        }
      })
      tempunsortedfiles.push(tempfile);
    }else{ //von gruppe zu anderer Gruppe
      let tempfile = tempsortedgroups.filter((group)=>group.gid==pSrcGid)[0].files.filter((file)=>file.fid==pFid)[0];

      tempsortedgroups.forEach((group)=>{
        if(group.gid==pSrcGid){
          group.files = group.files.filter((pFile)=>pFile.fid!=pFid);//Datei-Objekt aus ursprungsgruppe entnehmen, indem nach allen Dateien ausser eben dieser gefiltert wird
        }
      })
      tempsortedgroups.forEach((group)=>{
        if(group.gid==pDestGid){//Passende Zielgruppe finden
          group.files.push(tempfile); //Wenn Zielgruppe gefunden, dann Datei an Files-Array der Gruppe anhängen
        }
      })
    }

    this.setState({
      sortedgroups: tempsortedgroups,
      unsortedfiles: tempunsortedfiles
    })
  }

  //Nimmt alle Dateien einer neuen Gruppe und wenn ein PES File drin ist, wird ein CANVAS erzeugt. Wenn nicht, gibt sie null zurück.
  async initialCanvasFromPes(pGroupFiles) {
    let pesfile = null;
    pGroupFiles.forEach((file) => {
      if (
        file.ending == "pes" ||
        file.ending == "PES" ||
        file.ending == "Pes"
      ) {
        pesfile = file.file;
      }
    });
    if (pesfile == null) return;
    return await convert(pesfile);
  }

  turnimage(pGid) {
    
    let tempgrouplist = this.state.sortedgroups;
    let index = tempgrouplist.findIndex(group => group.gid==pGid);
    if(index==null) return;
    let ctx = tempgrouplist[index].imagecanvas;
    console.log(ctx.canvas.toDataURL());
    var tempImage = document.createElement("img");
    tempImage.src = ctx.canvas.toDataURL();
    // let tempdata = ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height);
     ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
     ctx.save();
     ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2);
     ctx.rotate(Math.PI / 2);
     ctx.translate(-ctx.canvas.width/2, -ctx.canvas.height/2);
     ctx.drawImage(tempImage,0,0);
     ctx.restore();
     this.setState({sortedgroups: tempgrouplist});
  }

  render() {
    console.log(this.state.sortedgroups);
    return (
      <div className="flex w-full h-full">
        <LinkeSeite
          dropFile={this.dropFile}
          dataToRoot={this.dataToRoot}
          filearray={this.state.unsortedfiles}
        />
        <RechteSeite
          dropFile={this.dropFile}
          turnimage={this.turnimage}
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
        />
        <FileList 
        filearray={this.props.filearray}           
        dropFile={this.props.dropFile}
        />
        <button className="bg-green-500 transition-all hover:bg-green-800 text-white w-full h-20 rounded-xl mt-5 text-4xl">Speichern</button>
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
        
      </>
    );
  }
}

class FileList extends Component {
  render() {
    let tempArray = this.props.filearray.map((file) => (
      <div
        onDragStart={(e)=>{e.dataTransfer.setData("text/plain", "3v_el*aw,"+file.fid+",0" )}}
        key={file.fid}
        className="bg-secondary text-white rounded-xl m-5 px-2 py-4 text-xl cursor-move"
        draggable
      >
        {file.fullname}
      </div>
    ));
    return (
      <div className="bg-quarternary rounded-xl flex-1 mt-5" onDragOver={(e)=>{e.stopPropagation();e.preventDefault()}} onDrop={
        (e)=> {
          e.preventDefault();
          if (!e.dataTransfer.types.includes("text/plain")) return;
          let transferdata = e.dataTransfer.getData("text/plain").split(",");
          if (transferdata[0]!=="3v_el*aw") return;

          console.log("Angekommene Parameter:",transferdata);
          this.props.dropFile(transferdata[1], transferdata[2], "0");
       }
      }>
        {tempArray}
      </div>
    );
  }
}

class RechteSeite extends Component {
  render(props) {
    let dateigruppen = this.props.sortedgroups.map((group) => {
      return (
        <DateiGruppe
          dropFile={this.props.dropFile}
          key={group.name}
          groupobject={group}
          turnimage={this.props.turnimage}
          setCurrentEditingGroup={this.props.setCurrentEditingGroup}
        />
      );
    });
    return (
      <div className="h-full flex-1 p-10 overflow-y-scroll">{dateigruppen}</div>
    );
  }
}

class DateiGruppe extends Component {
  constructor(props) {
    super(props);
    this.imageRef = React.createRef();
  }

  render() {
    let filenames = this.props.groupobject.files.map((file) => (
      <div className="bg-black text-white p-3 w-full rounded-xl my-2 cursor-move" onDragStart={(e)=>{console.log(this.props.groupobject.gid); e.dataTransfer.setData("text/plain", "3v_el*aw,"+file.fid+","+this.props.groupobject.gid )}} draggable>
        {file.fullname}
      </div>
    ));
    return (
      <div className=" h-80 flex-grow bg-gray-400 shadow-lg transition-all duration-200 my-5 hover:shadow-2xl rounded-md p-5 flex justify-between">
        
        <div className="relative h-full w-80 bg-white rounded-xl">
        <button className="absolute rounded-md bg-black m-2"
          onClick={() => this.props.turnimage(this.props.groupobject.gid)}
        >
        <object data="/svg/turn.svg" type="image/svg+xml" className="w-5 h-5 m-2 pointer-events-none cursor-pointer"></object>
        </button>
          <img
            className="object-contain w-full h-full"
            src={
              this.props.groupobject.imagecanvas != null
                ? this.props.groupobject.imagecanvas.canvas.toDataURL()
                : ""
            }
            alt=""
          />
        </div>
        <div className="w-1/3 mx-2 text-white text-2xl flex flex-col justify-between">
          <div className="my-2 flex flex-nowrap">
            <div className="border-4 border-gray-500 rounded-tl-xl rounded-bl-xl w-32">
              Name
            </div>
            <input
              className="border-4 border-l-0 border-gray-500 rounded-tr-xl rounded-br-xl w-full text-gray-400"
              defaultValue={this.props.groupobject.name}
            />
          </div>
          <div className="my-2 flex-1 flex flex-nowrap">
            <div className="border-4 border-gray-500 rounded-tl-xl rounded-bl-xl leading-tight px-2 w-32">
              Tags
            </div>
            <textarea className="border-4 border-l-0 border-gray-500 rounded-tr-xl rounded-br-xl w-full text-gray-400 resize-none" />
          </div>
          <div className="my-2 flex-1 flex flex-nowrap">
            <div className="border-4 border-gray-500 rounded-tl-xl rounded-bl-xl leading-tight px-2 w-32">
              Farben
            </div>
            <textarea className="border-4 border-l-0 border-gray-500 rounded-tr-xl rounded-br-xl w-full text-gray-400 resize-none" />
          </div>
        </div>
        <div className="w-1/3 overflow-y-scroll" onDragOver={(e)=>{e.stopPropagation();e.preventDefault()}} onDrop={
          (e)=> {
            e.preventDefault();
            if (!e.dataTransfer.types.includes("text/plain")) return;
            let transferdata = e.dataTransfer.getData("text/plain").split(",");
            if (transferdata[0]!=="3v_el*aw") return;
            this.props.dropFile(transferdata[1], transferdata[2], this.props.groupobject.gid);
         }
        }>{filenames}</div>
      </div>
    );
  }
}

export default Hinzufuegen;
