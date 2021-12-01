var color_def = [
  [0, 0, 0],
  [14, 31, 124],
  [10, 85, 163],
  [48, 135, 119],
  [75, 107, 175],
  [237, 23, 31],
  [209, 92, 0],
  [145, 54, 151],
  [228, 154, 203],
  [145, 95, 172],
  [157, 214, 125],
  [232, 169, 0],
  [254, 186, 53],
  [255, 255, 0],
  [112, 188, 31],
  [192, 148, 0],
  [168, 168, 168],
  [123, 111, 0],
  [255, 255, 179],
  [79, 85, 86],
  [0, 0, 0],
  [11, 61, 145],
  [119, 1, 118],
  [41, 49, 51],
  [42, 19, 1],
  [246, 74, 138],
  [178, 118, 36],
  [252, 187, 196],
  [254, 55, 15],
  [240, 240, 240],
  [106, 28, 138],
  [168, 221, 196],
  [37, 132, 187],
  [254, 179, 67],
  [255, 240, 141],
  [208, 166, 96],
  [209, 84, 0],
  [102, 186, 73],
  [19, 74, 70],
  [135, 135, 135],
  [216, 202, 198],
  [67, 86, 7],
  [254, 227, 197],
  [249, 147, 188],
  [0, 56, 34],
  [178, 175, 212],
  [104, 106, 176],
  [239, 227, 185],
  [247, 56, 102],
  [181, 76, 100],
  [19, 43, 26],
  [199, 1, 85],
  [254, 158, 50],
  [168, 222, 235],
  [0, 103, 26],
  [78, 41, 144],
  [47, 126, 32],
  [253, 217, 222],
  [255, 217, 17],
  [9, 91, 166],
  [240, 249, 112],
  [227, 243, 91],
  [255, 200, 100],
  [255, 200, 150],
  [255, 200, 200]
]



export async function convert(datablob) {
  var my_colors = [];
  var pes = {
    min_x: 65535,
    max_x: -65535,
    min_y: 65535,
    max_y: -65535,
  }
  try {
    var ab = await datablob.arrayBuffer();
    var data=new Uint8Array(ab);
    console.log(data);
    //parse PES
    var pesdata=parsePes(data, pes, my_colors);
    return await printpng(pesdata, my_colors);
  } catch (e) {
    console.log(e);
  }
}

function parsePes(data, pes, my_colors) {
  var status = true;
  var size = data.length;
  if (size < 48) {
    status = false;
  }
  // if (Buffer.from('#PES').compare(data.slice(0, 4)) != 0) {
  //   status = false;
  // }
  const dataview = new DataView(data.buffer);
  console.log(data.buffer);
  const pec = dataview.getUint32(8, true);
  if (pec > size) {
    status = false;
  }
  if (pec + 532 >= size) {
    status = false;
  }
  if (!parse_pes_colors(data, pec, my_colors)) {
    status = false;
  }
  return parse_pes_stitches(data, pec, pes, my_colors);
}

function parse_pes_colors(data, pec, my_colors) {
  var nr_colors = data[pec + 48] + 1;
  for (var i = 0; i < nr_colors; i++) {
    let color = data[pec + 49 + i];
    my_colors.push(color_def[color]);
  }
  console.log(my_colors);
}

function parse_pes_stitches(data, pec, pes, my_colors) {
  var p = pec + 532;
  var end = data.length;
  var oldx = 0;
  var oldy = 0;
  var minx = 0;
  var maxx = 0;
  var miny = 0;
  var maxy = 0;
  var blockchain = [[]];
  var color_counter= 0;
  var stitchtype;

  while (p <= end) {
    stitchtype = 0;
    //0->normaler Stich
    //1->jumpstich
    var val1 = data[p];
    var val2 = data[p + 1];
    p += 2;
    if (val1 == 255 && val2 == 0){
      end=p;
    }
    else {
      if (val1 == 254 && val2 == 176) {
        color_counter++;
        blockchain.push([]);
          p++;
      }
      else{
        if (val1 & 128) { //Das heißt der höchste Bit muss ne 1 sein-> führt zu 12 Bit Offset
          val1 = ((val1 & 15) << 8) + val2;
          if (val1 & 2048) {//das ist das fünfte Bit
            val1 -= 4096;
          }
          stitchtype = 1;
          val2 = data[p];
          p++;
        } else if (val1 & 64) {
          val1 -= 128;
        }
        if (val2 & 128) { //Das heißt der höchste Bit muss ne 1 sein-> führt zu 12 Bit Offset
          val2 = ((val2 & 15) << 8) + data[p];
          p++;
          if (val2 & 2048) {
            val2 -= 4096;
          }
          stitchtype = 1;
        } else if (val2 & 64) {
          val2 -= 128;
        }
        val1 += oldx;
    		val2 += oldy;

    		oldx = val1;
    		oldy = val2;

        if (val1 < minx){minx = val1};
      	if (val1 > maxx){maxx = val1};
      	if (val2 < miny){miny = val2};
      	if (val2 > maxy){maxy = val2};

        if(true){
          blockchain[color_counter].push({
            x: val1,
            y: val2,
            stitchtype: stitchtype
          });
        }
      }
    }


  }
  console.log("Anzahl Stiche: " + blockchain.length);
  console.log(`minx: ${minx}, maxx: ${maxx}, miny: ${miny}, maxy: ${maxy}`);
  return {minx: minx, maxx: maxx, miny: miny, maxy: maxy, blockchain: blockchain};
}
//Gibt den Canvas zurück, auf dem das Bild erstellt wurde
async function printpng(pesdata, my_colors){
  let max = 800; //Größe der längeren Bildseite in Pixel
  let canvas = document.createElement('canvas');
  let x=pesdata.maxx-pesdata.minx;
  let y=pesdata.maxy-pesdata.miny;
  let context=canvas.getContext('2d');
  //Canvas an Parent-Größe anpassen
  context.canvas.width=max;
  context.canvas.height=max;
  let scale = (x>y) ? max/x : max/y;
  
  console.log("Stickdatei Height", y);
  console.log("Stickdatei Width", x);
  console.log("Canvas Width", context.canvas.width);
  console.log("Canvas Height", context.canvas.height);
  console.log("Scale", scale);


  context.lineWidth=3;
  context.lineJoin="round";
  var blockchain = pesdata.blockchain;
  for (var z = 0; z < blockchain.length; z++) {
    var colorchain=blockchain[z];
    context.beginPath();
    context.strokeStyle=`rgb(${my_colors[z][0]},${my_colors[z][1]},${my_colors[z][2]})`;
    context.moveTo((colorchain[0].x-pesdata.minx)*scale, (colorchain[0].y-pesdata.miny)*scale);
    for (var i = 1; i < colorchain.length-1; i++) {
      var to = colorchain[i];
      if (to.stitchtype==0) {
        context.lineTo((to.x-pesdata.minx)*scale, (to.y-pesdata.miny)*scale);
      }else{
        context.moveTo((to.x-pesdata.minx)*scale, (to.y-pesdata.miny)*scale);
      }

    }
    context.stroke();
  }

  return context;
}

