export class Engine {
  constructor(canvas, update, draw) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.update = update;
    this.draw = draw;
    this.lastTime = performance.now();
  }

  start() {
    const loop = (now) => {
      const deltaTime = (now - this.lastTime) / 1000;
      this.lastTime = now;

      this.update(deltaTime);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.draw(this.ctx);

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
