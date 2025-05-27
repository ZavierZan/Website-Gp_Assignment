export class Engine {
  constructor(canvas, update, draw) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.update = update;
    this.draw = draw;
  }

  start() {
    const loop = () => {
      this.update();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.draw(this.ctx);
      requestAnimationFrame(loop);
    };
    loop();
  }
}
