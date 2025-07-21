new p5();

let shape;
let rays;
let exposure;
let do_rotate;
let row_index;
let image_row_index;
let taking_sinogram;
let saved_sinogram;
let recon_framebuff;

const ROTATION_SPEED = 1; // rads per second
const RECONSTRUCT_SPEED = 50;
const FRAMERATE = 100;     // frames per second
const SCAN_ANGLE = Math.PI;
const NFRAMES_ROT = Math.round(SCAN_ANGLE * FRAMERATE / ROTATION_SPEED);
const DTHETA_DFRAME = ROTATION_SPEED/FRAMERATE;
const SINOGRAM_PORTION = 1/5;

function setup() {
  createCanvas(innerWidth, innerHeight-30);
  background(0);
  textFont('Courier New');

  shape = new Shape();
  do_rotate = false;
  row_index = (1-SINOGRAM_PORTION) * height;
  taking_sinogram = false;
  image_row_index = 0;
  
  modeSelect = createSelect();
  modeSelect.position(0,height);
  modeSelect.option(Rays.Mode.SINGLE);
  modeSelect.option(Rays.Mode.ARRAY);
  modeSelect.option(Rays.Mode.SCAN);
  modeSelect.option(Rays.Mode.RECONSTRUCT);
  modeSelect.selected(Rays.Mode.SCAN);
  modeSelect.changed(changeMode);

  rays = new Rays(modeSelect.selected(), 0);

  expSelect = createSelect();
  expSelect.position(width-50, height);
  expSelect.option(50);
  expSelect.option(75);
  expSelect.option(100);
  expSelect.option(125);
  expSelect.option(150);
  expSelect.option(175);
  expSelect.option(200);
  expSelect.option(225);
  expSelect.option(250);
  expSelect.selected(200);
  expSelect.changed(() => {
    rays.set_exposure(parseInt(expSelect.selected()));
  });


  frameRate(FRAMERATE);
  strokeWeight(1);
}

function changeMode() {
  background(0);
  rays = new Rays(this.selected(), parseInt(expSelect.selected()));

  if (this.selected() === Rays.Mode.RECONSTRUCT) {
    frameRate(RECONSTRUCT_SPEED);
    blendMode(ADD);
  }
  else {
    frameRate(FRAMERATE);
    blendMode(BLEND);
  }
}

function draw() {
  if (rays.mode === Rays.Mode.RECONSTRUCT) {
    rays.draw(shape, saved_sinogram, DTHETA_DFRAME);
    return;
  }

  fill(palette.background);
  rect(0, 0, width, (1-SINOGRAM_PORTION)*height);
  fill(255);
  // text(frameRate().toFixed(0), 0, 10)

  let pivot = createVector(width/2, (1-SINOGRAM_PORTION)*height/2);
  if (shape.closed && do_rotate)
    shape.rotate(pivot, ROTATION_SPEED/FRAMERATE);
  
  shape.draw();
  exposure = rays.draw(shape);
  if (exposure !== undefined && exposure !== null) {
    plot_exposure(exposure);
  }

  // Record symbol
  if (taking_sinogram) {
    fill(255,0,0);
    noStroke();
    circle(width-20, 20, 10);
  }

  fill(palette.stroke);
  noStroke();
  circle(pivot.x, pivot.y, 5);
}

// on release
function mouseClicked() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
  if (!shape.closed) {
    shape.add_point(mouseX, mouseY);
  }
}

// on press
function mousePressed() {
  if (shape.closed) {
    rays.set_origin(mouseX, mouseY);
  }
}

// while pressing and moving
function mouseDragged() {
  if (shape.closed) {
    rays.set_endpoint(mouseX, mouseY);
  }
}

// key pressed
function keyPressed() {
  if (keyCode === ENTER) {
    shape.close();
  }
  if (keyCode === BACKSPACE) {
    shape.reset();
  }
  if (key === 'r' && shape.closed) {
    do_rotate = !do_rotate;
  }
  if (key === 'i' && shape.closed && rays.mode === Rays.Mode.SCAN && do_rotate) {

    taking_sinogram = true;
    saved_sinogram = [];
  }
}

function plot_exposure(vals) {
  if (rays.mode === Rays.Mode.SINGLE) return;

  let plot_height = height / 10;
  let max = Math.max(...vals);
  let step = width / (2 * rays.half_num + 1);
  noFill();
  stroke(palette.stroke);

  beginShape();
  for (let i = -rays.half_num; i <= rays.half_num; i++) {
    let n = i + rays.half_num;

    let y = vals[n] / max * plot_height;
    if (y === null) y = 0;
    y = height - SINOGRAM_PORTION * height - y;
    let x = width / 2 + i * step;
    vertex(x, y);
  }
  endShape();

  strokeWeight(width/vals.length);
  
  beginShape(POINTS);
  for (let i = -rays.half_num; i <= rays.half_num; i++) {
    let n = i + rays.half_num;
    let t = vals[n] / height;
    let x = width / 2 + i * step;  
    stroke(255 * t / (1 + t));
    vertex(x, row_index);
  }
  endShape();
  strokeWeight(1);

  row_index++;
  if (row_index > height) row_index = height * (1-SINOGRAM_PORTION);

  if (taking_sinogram) {
    saved_sinogram.push(vals.slice());
    image_row_index++;
    if (image_row_index > NFRAMES_ROT) {

      taking_sinogram = false;
      image_row_index = 0;
    }
  }

}