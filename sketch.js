let data;
let dt;
let t_max;
let data_loaded = false;

let t;
const SCALE = 100;
const DIAMETER = 10 / SCALE;
let saving_gif = false;


function updateData(obj) {
  let file = obj.files[0];
  read = new FileReader();

  read.readAsBinaryString(file);

  read.onloadend = function() {
      let fileData = read.result.trim();
      fileData = fileData.split("\n");
      fileData.forEach((row, i) => {
        fileData[i] = row.trim().replaceAll("{", "").replaceAll("}", "").replaceAll(" ", "").split(",");
      });

      data = []
      for (let i = 0; i < fileData.length; i++) {
        let row = [];
        for (let j = 0; j < fileData[i].length; j++) {
          row.push(parseFloat(fileData[i][j]));
        }
        data.push(row);
      }

      dt = data[1][0] - data[0][0];
      t_max = data[data.length - 1][0];
      data_loaded = true;
      t = 0;
  }

}

function setup() {
  createCanvas(600, 600);
  // frameRate(30);
  textAlign(LEFT, TOP);
  fill(0);
}

function keyPressed() {
  if (key == 's') {
    saving_gif = true;
    t = 0;
    saveGif("output.gif", int(t_max / dt), { units: "frames" });
  }
}


function draw() {
  background(255, 255);
  // console.log(frameRate());
  if (!data_loaded) return;
  
  let frameRateString = "\nFPS = " + frameRate().toFixed(1);
  text("t = " + t.toFixed(2) + (saving_gif ? "" : frameRateString), 10, 10);

  push();
  strokeWeight(2/SCALE);
  translate(width/2, height/2);
  scale(SCALE);
  let idx = Math.floor(t / t_max * data.length);
  let interp = t / t_max * data.length - idx;
  
  // Linearly interpolate between datapoints
  let d1 = data[idx];
  let d2 = data[Math.min(idx+1, data.length - 1)];
  let x1 =  lerp(d1[1], d2[1], interp);
  let y1 = -lerp(d1[2], d2[2], interp);
  let x2 =  lerp(d1[3], d2[3], interp);
  let y2 = -lerp(d1[4], d2[4], interp);
  let x3 =  lerp(d1[5], d2[5], interp);
  let y3 = -lerp(d1[6], d2[6], interp);
  let x4 =  lerp(d1[7], d2[7], interp);
  let y4 = -lerp(d1[8], d2[8], interp);
  line(0, 0, x1, y1);
  line(x1, y1, x2, y2);
  line(x3, y3, x4, y4);

  circle(0, 0, DIAMETER);
  circle(x1, y1, DIAMETER);
  circle(x2, y2, DIAMETER);
  circle(x3, y3, DIAMETER);
  circle(x4, y4, DIAMETER);
  
  t += saving_gif ? dt : deltaTime / 1000;
  t %= t_max;
  pop();
}
