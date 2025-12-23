import { Game } from "../core/engine";

class Player {
  constructor(width, height) {
    this.width = 80;
    this.height = 10;
    this.x = width / 2 - this.width / 2;
    this.y = height - 40;
    this.speed = 7 * 60;
    this.runningSpeed = 12 * 60;
  }

  update(dt, game) {
    const movingRight = game.input.isAny("arrowright", "d");
    const movingLeft = game.input.isAny("arrowleft", "a");
    const running = game.input.isDown("shift");
    const s = movingRight || movingLeft ? (running ? this.runningSpeed : this.speed) : 0;

    if (movingLeft) this.x -= s * dt;
    if (movingRight) this.x += s * dt;

    const { canvas } = game;
    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
  }

  draw(ctx) {
    ctx.fillStyle = "green";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Flake {
  constructor(width, height) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.radius = Math.random() * 2 + 2;
    this.speed = (Math.random() * 1 + 0.5) * 60;
    this.color = `hsl(${Math.floor(Math.random() * 360)}, ${
      Math.random() * 20 + 50
    }%, ${Math.random() * 20 + 80}%)`;
    this.phase = Math.random() * Math.PI * 2;
    this.amplitude = (Math.random() * 1.5 + 0.5) * 60;
  }

  update(dt, game) {
    const { canvas, player } = game;
    const t = performance.now() / 1000;

    this.y += this.speed * dt;
    this.x += Math.sin(t * 1.5 + this.phase) * this.amplitude * dt;

    if (
      this.y + this.radius > player.y &&
      this.x > player.x &&
      this.x < player.x + player.width
    ) {
      game.score++;
      this.y = -this.radius;
      this.x = Math.random() * canvas.width;
    }

    if (this.y > canvas.height) {
      this.y = -this.radius;
      this.x = Math.random() * canvas.width;
    }
    if (this.x < -this.radius) this.x = canvas.width + this.radius;
    if (this.x > canvas.width + this.radius) this.x = -this.radius;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

const game = new Game({
  id: "snow",
  zIndex: -1,
  showFPS: true,
  vsyncStep: 1,
});
game.score = 0;

const player = new Player(game.canvas.width, game.canvas.height);
game.player = player;
game.add(player);

for (let i = 0; i < 200; i++) {
  game.add(new Flake(game.canvas.width, game.canvas.height));
}

game.addDrawHook((ctx, g) => {
  ctx.fillStyle = "white";
  ctx.font = "16px monospace";
  ctx.fillText(`Score: ${g.score ?? 0}`, 10, 40);
});

game.addUpdateHook((dt, g) => {
  if (g.debug) console.log("Frame Δt:", dt.toFixed(3));
});

game.addResizeHook((g) => {
  player.y = g.canvas.height - 40;
});