const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

// CONSTANTES
const RETURN_TIME = 10; // "time" (inverted speed) that a particule will take to go back
const LIGHTNESS_FACTOR = 30; //
const PARTICULE_SPACING = 15;
const ADJUST_X = 5;
const ADJUST_Y = -5;
const MAX_LINK_RADIUS = PARTICULE_SPACING * 3; // max distance between two connected particules

let textCoordinates;

// handling user input
// opacity scanning
let opacityScanningInput = document.getElementById("opacityScanning");
let MIN_OPACITY_SCANNING = opacityScanningInput.value;

function onOpacityScanningChange(val) {
  console.log(val);
  MIN_OPACITY_SCANNING = val;
  console.log(MIN_OPACITY_SCANNING);
  init();
}

// particule Size
let particuleSizeInput = document.getElementById("particuleSize");
let PARTICULE_BASE_SIZE = particuleSize.value;
function onParticuleSizeChange(val) {
  PARTICULE_BASE_SIZE = val;
  init();
}

// mouse radius
let mouseRadiusInput = document.getElementById("mouseRadius");
let MOUSE_RADIUS = mouseRadiusInput.value;

function onMouseRadiusChange(val) {
  MOUSE_RADIUS = val;
  mouse.radius = MOUSE_RADIUS;
  init();
}

// colors
let baseColorInput = document.getElementById("baseColor");
let BASE_COLOR = baseColorInput.value;

function onBaseColorChange(val) {
  BASE_COLOR = val;
  init();
}

let alternativeColorInput = document.getElementById("alternativeColor");
let ALTERNATIVE_COLOR = alternativeColorInput.value;

function onAlternativeColorChange(val) {
  ALTERNATIVE_COLOR = val;
  init();
}

// text change
let textInput = document.getElementById("text");
let TEXT = textInput.value;

function onTextChange(val) {
  console.log("VAL", val);
  TEXT = val;
  console.log(TEXT);
  initAndScanText();
  init();
}

//////

function initAndScanText() {
  ctx.fillStyle = "white";
  ctx.font = "27px Cousine";
  ctx.fillText(TEXT, 0, 30);
  textCoordinates = ctx.getImageData(0, 0, 300, 300);
}
initAndScanText();

// handle mouse
const mouse = {
  x: null,
  y: null,
  radius: MOUSE_RADIUS,
};

window.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight / 2;

let particuleArray = [];

function getDistance(ax, ay, bx, by) {
  return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

// Particule
class Particule {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = PARTICULE_BASE_SIZE;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = Math.random() * LIGHTNESS_FACTOR + 1;
    this.color = BASE_COLOR;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  update() {
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dy ** 2 + dx ** 2);

    // mouvement
    let forceDirectionX = dx / distance;
    let forceDirectionY = dy / distance;
    let maxDistance = mouse.radius;
    let force = (maxDistance - distance) / maxDistance; // this is acceleration
    let directionX = forceDirectionX * force * this.density; // density is actually the opposite: the higher the number, the faster it moves
    let directionY = forceDirectionY * force * this.density; // density is actually the opposite: the higher the number, the faster it moves

    const inMouseRadius = distance <= MOUSE_RADIUS;

    if (inMouseRadius) {
      this.x -= directionX;
      this.y -= directionY;
      this.color = ALTERNATIVE_COLOR;
    } else {
      // we are not in range of the mouse radius MOUSE_RADIUS
      this.color = BASE_COLOR;
      if (this.x !== this.baseX) {
        dx = this.x - this.baseX;
        this.x -= dx / RETURN_TIME;
      }
      if (this.y !== this.baseY) {
        dy = this.y - this.baseY;
        this.y -= dy / RETURN_TIME;
      }
    }
  }
}

function init() {
  particuleArray = [];
  // we want to use the scanning we did of the text, and transform it into an array of particules
  for (let y = 0, y2 = textCoordinates.height; y < y2; y++) {
    for (let x = 0, x2 = textCoordinates.width; x < x2; x++) {
      if (
        textCoordinates.data[y * 4 * textCoordinates.width + x * 4 + 3] >
        (255 * (10 - MIN_OPACITY_SCANNING)) / 10
      ) {
        // this is a check of opacity; every pixel is represented as 4 values between 0 & 255 in the textCoordinates array (R, G, B and Alpha); if 128 it mean 50% opacity
        let positionX = (x + ADJUST_X) * PARTICULE_SPACING;
        let positionY = (y + ADJUST_Y) * PARTICULE_SPACING;
        particuleArray.push(new Particule(positionX, positionY));
      }
    }
  }
  // for (let i = 0; i < 1000; i++) {
  //   particuleArray.push(
  //     new Particule(Math.random() * canvas.width, Math.random() * canvas.height)
  //   );
  // }
}
init();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particuleArray.length; i++) {
    particuleArray[i].draw();
    particuleArray[i].update();
  }
  connect();
  requestAnimationFrame(animate);
}

animate();

function connect() {
  let opacityValue = 1;
  for (let a = 0; a < particuleArray.length; a++) {
    for (let b = a; b < particuleArray.length; b++) {
      // b = a for optim, because previous link should have already been rendered
      let dx = particuleArray[a].x - particuleArray[b].x;
      let dy = particuleArray[a].y - particuleArray[b].y;
      let distance = Math.sqrt(dx ** 2 + dy ** 2);
      if (distance < MAX_LINK_RADIUS) {
        opacityValue = 1 - distance / MAX_LINK_RADIUS;
        ctx.strokeStyle = "rgba(255,255,255," + opacityValue + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(particuleArray[a].x, particuleArray[a].y);
        ctx.lineTo(particuleArray[b].x, particuleArray[b].y);
        ctx.stroke();
      }
    }
  }
}
