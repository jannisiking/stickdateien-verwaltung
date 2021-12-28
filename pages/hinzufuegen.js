import React, { Component } from "react";

class Hinzufuegen extends React.Component {
  constructor(props) {
    super(props);
    this.dataToRoot = this.dataToRoot.bind(this);
    this.setImageURL = this.setImageURL.bind(this);
    this.turnimage = this.turnimage.bind(this);
    this.dropFile = this.dropFile.bind(this);
    this.store = this.store.bind(this);
    this.saveTextInput = this.saveTextInput.bind(this);
    
    this.state = {
      sortedgroups: [], //ein Array an Gruppen-Objekten. diese Objekte enthalten die Metadaten plus ein Array der eigentlichen Dateien
      unsortedfiles: [], //beninhaltet die Dateien in der linken Spalte, die noch nicht zugeordnet sind
      unsortedfilenames: [],
      gidcount: 0,
      filecount: 0,
      pesworker: null,
      pngworker: null
    };
  }

  componentDidMount() {
    const temppngworker = new Worker("js/pngtourl.js", {type: "module"});
    temppngworker.onmessage = (e) => {
      this.setState((state, props) => {
        return {
          sortedgroups: state.sortedgroups.map((group) => {
            if (group.gid == e.data[1]) {
              group.imageurl = e.data[0];
            }
            return group;
          }),
        };
      });
    };
    const temppesworker = new Worker("js/pestopng.js");
    temppesworker.onmessage = (e) => {
      console.log("Pesworker onmessage: ", e.data)
      this.setState((state, props) => {
        return {
          sortedgroups: state.sortedgroups.map((group) => {
            if (group.gid == e.data[1]) {

              group.imageurl = e.data[0];
            }
            return group;
          }),
        };
      });
    };
    this.setState({pesworker: temppesworker,
                    pngworker: temppngworker});
  }

  componentWillUnmount(){
    this.state.pesworker.terminate();
    this.state.pngworker.terminate();
    this.setState({pesworker: null, pngworker: null});
  }

  //Folgende Funktion wird beim einfügen neuer Dateien ausgeführt
  //ZIEL: Neue Dateien einsortieren in gruppen und unsortiert
  async dataToRoot(data) {
    let tempfilecount = this.state.filecount;
    console.log("Start erstellen der File-Objekte: ", Date.now());
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
    console.log("Ende erstellen der File-Objekte: ", Date.now());
    let einsortiert = [];
    let unsortedfilestemp = this.state.unsortedfiles;
    let sortedgroupstemp = this.state.sortedgroups;
    unsortedfilestemp = unsortedfilestemp.concat(newdata);

    //Dateien in Gruppen einordnen
    console.log("Start Dateien in Gruppen einsortieren: ", Date.now());

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
    console.log("Ende Dateien in Gruppen einsortieren: ", Date.now());

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
        //Alle Dateien für die neue Gruppe finden, die den gleichen Namenstamm haben
        let tempnewgroupfiles = unsortedfilestemp.filter(function (file) {
          let result = false;
          if (file.name == filename && file.fullname != filefullname) {
            result = true;
          }
          return result;
        });
        //Neue Gruppe erstellen
        if (tempnewgroupfiles.length != 0 && tempnewgroupfiles != "undefined") {
          //Die Datei des Index noch zur Gruppe hinzufügen
          tempnewgroupfiles.push(unsortedfilestemp[x]);
          tempgidcount++;
          arrayofnewgroups.push({
            gid: tempgidcount,
            name: tempnewgroupfiles[0].name,
            files: tempnewgroupfiles,
            imageurl: "",
            angle: 0,
            tags: [],
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
    }, ()=>{
      arrayofnewgroups.forEach(group => this.setImageURL(group.files, group.gid))
    });
  }

  dropFile(pFid, pSrcGid, pDestGid) {
    let tempsortedgroups = this.state.sortedgroups;
    let tempunsortedfiles = this.state.unsortedfiles;
    if (pSrcGid == pDestGid) return;
    if (pSrcGid == 0) {
      //Von unsortiert in eine Gruppe
      let tempfile = tempunsortedfiles.filter((file) => file.fid == pFid)[0]; //Datei-objekt heraussuchen
      tempunsortedfiles = tempunsortedfiles.filter((file) => file.fid != pFid); //Datei-objekt aus unsortierten Dateien löschen
      tempsortedgroups.forEach((group) => {
        if (group.gid == pDestGid) {
          //Passende Zielgruppe finden
          group.files.push(tempfile); //Wenn Zielgruppe gefunden, dann Datei an Files-Array der Gruppe anhängen
        }
      });
    } else if (pDestGid == 0) {
      //von Gruppe nach unsortiert
      let tempfile = tempsortedgroups
        .filter((group) => group.gid == pSrcGid)[0]
        .files.filter((file) => file.fid == pFid)[0]; //Datei-Objekt aus dieser Gruppe extrahieren
      tempsortedgroups.forEach((group) => {
        if (group.gid == pSrcGid) {
          group.files = group.files.filter((pFile) => pFile.fid != pFid); //Datei-Objekt aus ursprungsgruppe entnehmen, indem nach allen Dateien ausser eben dieser gefiltert wird
        }
      });
      tempunsortedfiles.push(tempfile);
    } else {
      //von gruppe zu anderer Gruppe
      let tempfile = tempsortedgroups
        .filter((group) => group.gid == pSrcGid)[0]
        .files.filter((file) => file.fid == pFid)[0];

      tempsortedgroups.forEach((group) => {
        if (group.gid == pSrcGid) {
          group.files = group.files.filter((pFile) => pFile.fid != pFid); //Datei-Objekt aus ursprungsgruppe entnehmen, indem nach allen Dateien ausser eben dieser gefiltert wird
        }
      });
      tempsortedgroups.forEach((group) => {
        if (group.gid == pDestGid) {
          //Passende Zielgruppe finden
          group.files.push(tempfile); //Wenn Zielgruppe gefunden, dann Datei an Files-Array der Gruppe anhängen
        }
      });
    }

    this.setState({
      sortedgroups: tempsortedgroups,
      unsortedfiles: tempunsortedfiles,
    });
  }

  //Nimmt alle Dateien einer neuen Gruppe und wenn ein PES File drin ist, wird ein URL-String erzeugt. Wenn nicht, gibt sie null zurück.
  //Rückgabe erfolgt als PROMISE!!
  async setImageURL(pGroupFiles, gid) {
    //console.log(pGroupFiles[0].name);
    let pngfile = pGroupFiles.find((file) => {
      if (
        file.ending == "jpg" ||
        file.ending == "JPG" ||
        file.ending == "Jpg" ||
        file.ending == "PNG" ||
        file.ending == "png" ||
        file.ending == "Png"
      ) {
        return true;
      }
    });
    if (pngfile != undefined) {
      //bild zu URL umwandeln
      this.state.pngworker.postMessage([pngfile.file, gid]);
    } else {
      let pesfile = pGroupFiles.find((file) => {
        if (
          file.ending == "pes" ||
          file.ending == "PES" ||
          file.ending == "Pes"
        ) {
          return true;
        }
      });
      if (pesfile != null) {
        this.state.pesworker.postMessage([pesfile.file, gid]);
      }
    }
  }

  async turnimage(pGid) {
    let tempgrouplist = this.state.sortedgroups;
    let index = tempgrouplist.findIndex((group) => group.gid == pGid);
    if (index == null) return;

    tempgrouplist[index].angle = (tempgrouplist[index].angle + 90) % 360;
    this.setState({ sortedgroups: tempgrouplist });
  }

  saveTextInput(pGid, pName, pTagstring) {
    console.log(pGid, pName, pTagstring);
    let tempgrouplist = this.state.sortedgroups;
    let index = tempgrouplist.findIndex((group) => group.gid == pGid);
    if (index == null) return;
    tempgrouplist[index].name = pName;
    tempgrouplist[index].tags = pTagstring.split(" ");
    this.setState({ sortedgroups: tempgrouplist });
  }

  //Funktion zum Senden der Gruppen an den Server
  async store() {
    let groups = this.state.sortedgroups;

    groups.forEach((group) => {
      let formData = new FormData();
      //ERZEUGUNG BILD START
      var imagepromise = new Promise((resolve, reject) => {
        try {
          let ctx = group.imageurl;
          let tempImage = document.createElement("img");
          tempImage.src = ctx.canvas.toDataURL();
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          ctx.save();
          ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
          let rotationFactor = (group["angle"] / 90) * 0.5;
          ctx.rotate(Math.PI * rotationFactor);
          ctx.translate(-ctx.canvas.width / 2, -ctx.canvas.height / 2);
          ctx.drawImage(tempImage, 0, 0);
          ctx.restore();
          ctx.canvas.toBlob((pBlob) => {
            if (pBlob == null) {
              throw new Error("Blob konnte nicht erstellt werden");
            } else {
              resolve(new File([pBlob], "image.png"));
            }
          });
        } catch (error) {
          console.log(error);
          reject(null);
        }
      });
      //ERZEUGUNG BILD ENDE

      //RESTLICHE WERTE START

      formData.append("name", group.name);
      formData.append("tags", group.tags);
      group.files.forEach((file) => {
        formData.append("files", file.file);
      });

      //RESTLICHE WERTE ENDE

      imagepromise
        .then((ergebnis) => {
          formData.append("files", ergebnis);
          fetch("/api/storeData", {
            method: "POST",
            body: formData,
          });
        })
        .catch(() => {
          fetch("/api/storeData", {
            method: "POST",
            body: formData,
          });
        });
    });
  }

  render() {
    console.log(this.state.sortedgroups);
    return (
      <div className="flex w-full h-full">
        <LinkeSeite
          dropFile={this.dropFile}
          dataToRoot={this.dataToRoot}
          filearray={this.state.unsortedfiles}
          store={this.store}
        />
        <RechteSeite
          dropFile={this.dropFile}
          turnimage={this.turnimage}
          sortedgroups={this.state.sortedgroups}
          saveTextInput={this.saveTextInput}
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
      <div className="h-full w-2/6 bg-white bg-opacity-50 p-10 flex flex-col shadow-lg max-w-[400px]">
        <FileInput dataToRoot={this.props.dataToRoot} />
        <FileList
          filearray={this.props.filearray}
          dropFile={this.props.dropFile}
        />
        <button
          className="bg-green-500 transition-all hover:bg-green-800 text-white w-full h-20 rounded-xl mt-5 text-4xl"
          onClick={this.props.store}
        >
          Speichern
        </button>
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
    e.preventDefault();
    var filearray = Object.values(this.inputRef.current.files);
    console.log(Date.now());
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
          <div className="pointer-events-none h-full w-full bg-gray-200 rounded-xl absolute flex items-center justify-center">
            <div className="text-8xl text-white">+</div>
          </div>
          <input
            className="w-full h-full cursor-pointer p-5"
            type="file"
            onInput={this.file_Handler_input}
            onDrop={this.file_Handler_drop}
            ref={this.inputRef}
            webkitdirectory="true"
            directory="true"
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
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", "3v_el*aw," + file.fid + ",0");
        }}
        key={file.fid}
        className="bg-secondary text-white rounded-xl m-5 px-2 py-4 text-xl cursor-move"
        draggable
      >
        {file.fullname}
      </div>
    ));
    return (
      <div
        className="rounded-xl flex-1 mt-5 custom-shadow-inner overflow-y-scroll hide-scrollbar"
        onDragOver={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (!e.dataTransfer.types.includes("text/plain")) return;
          let transferdata = e.dataTransfer.getData("text/plain").split(",");
          if (transferdata[0] !== "3v_el*aw") return;

          console.log("Angekommene Parameter:", transferdata);
          this.props.dropFile(transferdata[1], transferdata[2], "0");
        }}
      >
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
          saveTextInput={this.props.saveTextInput}
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
    this.state = { url: "" };
    this.referance = React.createRef();
    this.nameReferance = React.createRef();
    this.tagsReferance = React.createRef();
    this.turn = this.turn.bind(this);
    this.saveInput = this.saveInput.bind(this);
  }

  turn() {
    this.props.turnimage(this.props.groupobject.gid);
  }

  componentDidUpdate() {
    this.referance.current.style.transform = `rotate(${this.props.groupobject.angle}deg)`;
  }

  saveInput(e) {
    this.props.saveTextInput(
      this.props.groupobject.gid,
      this.nameReferance.current.value,
      this.tagsReferance.current.value
    );
  }



  render() {
    let filenames = this.props.groupobject.files.map((file) => (
      <div
        className="bg-secondary text-white p-3 w-full box-border rounded-xl cursor-move mb-2 break-all"
        onDragStart={(e) => {
          console.log(this.props.groupobject.gid);
          e.dataTransfer.setData(
            "text/plain",
            "3v_el*aw," + file.fid + "," + this.props.groupobject.gid
          );
        }}
        draggable
      >
        {file.fullname}
      </div>
    ));
    return (
      <div className=" h-80 flex-grow bg-white bg-opacity-50 shadow-lg transition-all duration-200 my-5 hover:shadow-2xl rounded-md p-5 flex justify-between">
        <div className="relative h-full w-72 bg-white rounded-xl">
          <button
            className="absolute rounded-md bg-black m-2 z-10"
            onClick={this.turn}
          >
            <object
              data="/svg/turn.svg"
              type="image/svg+xml"
              className="w-5 h-5 m-2 pointer-events-none cursor-pointer"
            ></object>
          </button>
          <img
            className="object-contain w-full h-full"
            src={this.props.groupobject.imageurl}
            alt=""
            ref={this.referance}
          />
        </div>
        <div className="w-1/3 mx-2 text-gray-500 text-2xl flex flex-col justify-between">
          <div className="my-2 flex flex-nowrap">
            <div className="border-4 border-gray-500 rounded-tl-xl rounded-bl-xl w-32">
              Name
            </div>
            <input
              className="border-4 border-l-0 border-gray-500 rounded-tr-xl rounded-br-xl w-full text-gray-400"
              defaultValue={this.props.groupobject.name}
              onBlur={this.saveInput}
              ref={this.nameReferance}
            />
          </div>
          <div className="my-2 flex-1 flex flex-nowrap">
            <div className="border-4 border-gray-500 rounded-tl-xl rounded-bl-xl leading-tight px-2 w-32">
              Tags
            </div>
            <textarea
              className="border-4 border-l-0 border-gray-500 rounded-tr-xl rounded-br-xl w-full text-gray-400 resize-none"
              onBlur={this.saveInput}
              ref={this.tagsReferance}
            />
          </div>
        </div>
        <div
          className="w-1/3 overflow-y-scroll custom-shadow-inner rounded-xl hide-scrollbar p-2"
          onDragOver={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (!e.dataTransfer.types.includes("text/plain")) return;
            let transferdata = e.dataTransfer.getData("text/plain").split(",");
            if (transferdata[0] !== "3v_el*aw") return;
            this.props.dropFile(
              transferdata[1],
              transferdata[2],
              this.props.groupobject.gid
            );
          }}
        >
          {filenames}
        </div>
      </div>
    );
  }
}

export default Hinzufuegen;
