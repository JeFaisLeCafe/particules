const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

// CONSTANTES
const PARTICULE_NUMBER = 1000;
const MOUSE_RADIUS = 100;
const PARTICULE_BASE_SIZE = 3;
const PARTICULE_MAX_SIZE = 30;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particuleArray = [];

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

ctx.fillStyle = "white";
ctx.font = "30px Verdana";
ctx.fillText("Test", 40, 40);

const data = ctx.getImageData(0, 0, 100, 100);

// Particule
class Particule {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = PARTICULE_BASE_SIZE;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = Math.random() * 30 + 1;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
  update() {
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dy ** 2 + dx ** 2);
    if (distance < MOUSE_RADIUS) {
      this.size = PARTICULE_MAX_SIZE;
    } else {
      this.size = PARTICULE_BASE_SIZE;
    }
  }
}

function init() {
  particuleArray = [];
  for (let i = 0; i < PARTICULE_NUMBER; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    particuleArray.push(new Particule(x, y));
  }
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
