const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

// CONSTANTES
const PARTICULE_NUMBER = 1000;
const MOUSE_RADIUS = 200;
const PARTICULE_BASE_SIZE = 3;
const RETURN_TIME = 10; // "time" (inverted speed) that a particule will take to go back
const DENSITY_FACTOR = 30;
const PARTICULE_SPACING = 10;
const ADJUST_X = 30;
const ADJUST_Y = 30;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particuleArray = [];

// handle mouse
const mouse = {
  x: null,
  y: null,
  radius: MOUSE_RADIUS
};

window.addEventListener("mousemove", e => {
  mouse.x = e.x;
  mouse.y = e.y;
});

ctx.fillStyle = "white";
ctx.font = "30px Verdana";
ctx.fillText("BITE", 0, 30);
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
  }

  draw() {
    ctx.fillStyle = "white";
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

    if (distance < MOUSE_RADIUS) {
      this.x -= directionX;
      this.y -= directionY;
    } else {
      // we are not in range of the mouse radius MOUSE_RADIUS
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
  requestAnimationFrame(animate);
}
animate();
