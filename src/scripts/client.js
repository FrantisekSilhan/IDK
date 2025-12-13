const canvas = document.createElement("canvas");
canvas.id = "snow";
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.zIndex = "-1";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");
let width, height;

const resize = () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
};
window.addEventListener("resize", resize);
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") player.movingLeft = true;
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") player.movingRight = true;
  if (e.key === "Shift") player.running = true;
});
window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") player.movingLeft = false;
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") player.movingRight = false;
  if (e.key === "Shift") player.running = false;
});
resize();

const flakes = Array.from({ length: 200 }, () => ({
  x: Math.random() * width,
  y: Math.random() * height,
  radius: Math.random() * 2 + 2,
  speed: Math.random() * 1 + 0.5,
  color: `hsl(${Math.floor(Math.random() * 360)}, ${Math.random() * 20 + 50}%, ${Math.random() * 20 + 80}%)`,
  phase: Math.random() * Math.PI * 2,
  amplitude: Math.random() * 1.5 + 0.5,
}));

const player = {
  x: width / 2 - 40,
  y: height - 40,
  width: 80,
  height: 10,
  speed: 7,
  movingLeft: false,
  movingRight: false,
  running: false,
  runningSpeed: 12,
};

let score = 0;

const draw = () => {
  ctx.clearRect(0, 0, width, height);

  for (const flake of flakes) {
    ctx.beginPath();
    ctx.fillStyle = flake.color;
    ctx.moveTo(flake.x, flake.y);
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "green";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`Score: ${score}`, 10, 25);
};

const update = () => {
  if (player.movingLeft) player.x -= player.running ? player.runningSpeed : player.speed;
  if (player.movingRight) player.x += player.running ? player.runningSpeed : player.speed;
  player.x = Math.max(0, Math.min(width - player.width, player.x));
  
  const t = Date.now() / 1000;
  for (const flake of flakes) {
    flake.y += flake.speed;
    flake.x += Math.sin(t * 1.5 + flake.phase) * flake.amplitude;

    if (
      flake.y + flake.radius > player.y &&
      flake.x > player.x &&
      flake.x < player.x + player.width
    ) {
      score++;
      flake.y = -flake.radius;
      flake.x = Math.random() * width;
    }

    if (flake.y > height) {
      flake.y = -flake.radius;
      flake.x = Math.random() * width;
    }
    if (flake.x < -flake.radius) flake.x = width + flake.radius;
    if (flake.x > width + flake.radius) flake.x = -flake.radius;
  }
};

(loop = () => {
  update();
  draw();
  requestAnimationFrame(loop);
})();