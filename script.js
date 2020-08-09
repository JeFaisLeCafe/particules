const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

// CONSTANTES
const PARTICULE_NUMBER = 2000;
const MOUSE_RADIUS = 100;
const PARTICULE_BASE_SIZE = 3;
const RETURN_TIME = 10; // "time" (inverted speed) that a particule will take to go back
const DENSITY_FACTOR = 30;
const PARTICULE_SPACING = 18;
const ADJUST_X = 0;
const ADJUST_Y = 0;
const MAX_LINK_RADIUS = 50; // max distance between two connected particules
const BASE_COLOR = new RGBColour(255, 255, 255, 0.9);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particuleArray = [];

function getDistance(ax, ay, bx, by) {
  return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

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

ctx.fillStyle = "red";
ctx.font = "27px Verdana";
ctx.fillText("SOURY", 0, 0);
const textCoordinates = ctx.getImageData(0, 0, 100, 100);

// Particule
class Particule {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = PARTICULE_BASE_SIZE;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = Math.random() * DENSITY_FACTOR + 1;
    this.color = "white";
  }

  draw() {
    // ctx.fillStyle = this.color.getCSSIntegerRGB();
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

    const inMouseRadius = distance < MOUSE_RADIUS;

    //color handling (not working)
    // if (this.x !== this.baseX && this.y !== this.baseY) {
    //   this.color = new RGBColour(
    //     (255 + distance) % 255,
    //     (255 + distance) % 255,
    //     (255 + distance) % 255,
    //     inMouseRadius ? 1 : 0.8
    //   );
    // } else {
    //   this.color = BASE_COLOR;
    // }

    if (inMouseRadius) {
      this.x -= directionX;
      this.y -= directionY;
      this.color = "yellow";
    } else {
      // we are not in range of the mouse radius MOUSE_RADIUS
      this.color = "white";
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
        textCoordinates.data[y * 4 * textCoordinates.width + x * 4 + 3] > 128
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
