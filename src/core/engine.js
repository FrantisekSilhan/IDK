export class Game {
  constructor(canvasOrConfig = {}, config = {}) {
    if (canvasOrConfig instanceof HTMLCanvasElement) {
      this.config = config;
      this.canvas = canvasOrConfig;
    } else {
      this.config = canvasOrConfig;
      this.canvas = this.createCanvas(
        this.config.id ?? "game-canvas",
        this.config.appendTo ?? document.body,
      );
    }

    this.render = {
      ctx: this.canvas.getContext("2d"),
      aspectRatio: this.config.aspectRatio ?? null,
      showFPS: this.config.showFPS ?? true,
    };

    this.state = {
      running: true,
      paused: false,
    };

    this.input = {
      keysDown: new Set(),
      isDown: (key) => this.input.keysDown.has(key.toLowerCase()),
      isAny: (...keys) => keys.some((key) => this.input.keysDown.has(key.toLowerCase())),
      isAll: (...keys) => keys.every((key) => this.input.keysDown.has(key.toLowerCase())),
    };

    this.vsync = {
      step: this.config.vsyncStep ?? 1,
      savedStep: this.config.vsyncStep ?? 1,
      counter: 0,
      refreshEstimate: 0,
      targets: {
        focused: this.config.targetFPSFocused ?? 0,
        unfocused: this.config.targetFPSUnfocused ?? 10,
      },
      fps: 0,
      frameCount: 0,
      timer: 0,
      last: performance.now(),
    };

    this.entities = [];
    this.hooks = { update: [], draw: [], resize: [] };

    this.loop = this.loop.bind(this);
    this.resize = this.resize.bind(this);
    window.addEventListener("resize", this.resize);
    this.resize();
    requestAnimationFrame(this.loop);

    this.registerInputListeners();
    this.registerFocusListeners();
  }

  createCanvas(id, container) {
    const canvas = document.createElement("canvas");
    canvas.id = id;
    Object.assign(canvas.style, {
      zIndex: this.config.zIndex ?? "0",
      display: "block",
    });
    container.appendChild(canvas);
    return canvas;
  }

  registerInputListeners() {
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      this.input.keysDown.add(k);

      if (k === "escape") this.togglePause();

      if (k === "1") this.setVsyncStep(1);
      if (k === "2") this.setVsyncStep(2);
      if (k === "3") this.setVsyncStep(3);
    });

    window.addEventListener("keyup", (e) => this.input.keysDown.delete(e.key.toLowerCase()));
  }
  registerFocusListeners() {
    window.addEventListener("blur", () => { this.adjustVsyncStep(this.vsync.targets.unfocused); });
    window.addEventListener("focus", () => { this.adjustVsyncStep(this.vsync.targets.focused); });
    window.addEventListener("visibilitychange", () => { this.adjustVsyncStep(document.hidden ? this.vsync.targets.unfocused : this.vsync.targets.focused); });
  }

  togglePause() {
    this.state.paused = !this.state.paused;
    this.adjustVsyncStep(this.state.paused ? this.vsync.targets.unfocused : this.vsync.targets.focused);
  }
  setVsyncStep(step) {
    this.vsync.step = step;
    this.vsync.savedStep = step;
  }
  adjustVsyncStep(targetFps = 0) {
    if (targetFps <= 0) {
      this.vsync.step = this.vsync.savedStep;
      return;
    }
    const refresh = this.vsync.refreshEstimate || 60;
    this.vsync.step = Math.max(1, Math.round(refresh / targetFps));
  }

  add(ent) { this.entities.push(ent); }
  addUpdateHook(fn) { this.hooks.update.push(fn); }
  addDrawHook(fn) { this.hooks.draw.push(fn); }
  addResizeHook(fn) { this.hooks.resize.push(fn); }

  resize() {
    const { innerWidth: w, innerHeight: h } = window;

    if (this.render.aspectRatio) {
      const targetRatio = this.render.aspectRatio;
      let newWidth = w;
      let newHeight = h;
      if (w / h > targetRatio) {
        newWidth = h * targetRatio;
      } else {
        newHeight = w / targetRatio;
      }
      this.canvas.width = newWidth;
      this.canvas.height = newHeight;
    } else {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    for (const fn of this.hooks.resize) fn(this);
  }

  update(dt) {
    for (const e of this.entities) e.update?.(dt, this);
    for (const fn of this.hooks.update) fn(dt, this);
  }

  draw() {
    const { ctx } = this.render;
    const { width: w, height: h } = this.canvas;

    ctx.clearRect(0, 0, w, h);

    for (const e of this.entities) e.draw?.(ctx, this);

    if (this.config.showFPS) {
      ctx.fillStyle = "white";
      ctx.font = "16px monospace";
      ctx.fillText(`FPS: ${this.vsync.fps}`, 10, 20);
    }
    
    for (const fn of this.hooks.draw) fn(ctx, this);

    if (this.state.paused) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "24px monospace";
      ctx.fillText("PAUSED", this.canvas.width / 2 - 50, this.canvas.height / 2);
    }
  }

  loop(time) {
    if (!this.state.running) return;

    const vs = this.vsync;
    const dt = (time - vs.last) / 1000;
    vs.last = time;

    if (dt > 0 && dt < 0.1) vs.monitorHzEstimate = 1 / dt;

    vs.frameCounter++;
    if (vs.frameCounter < vs.step) return requestAnimationFrame(this.loop);
    vs.frameCounter = 0;

    vs.frameCount++;
    vs.timer += dt * vs.step;
    if (vs.timer >= 0.5) {
      vs.fps = Math.round(vs.frameCount / vs.timer);
      vs.frameCount = 0;
      vs.timer = 0;
    }

    if (!this.state.paused) this.update(dt * vs.step);
    this.draw();

    requestAnimationFrame(this.loop);
  }
}