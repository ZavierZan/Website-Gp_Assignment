export class Entity {
  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
  }

  update() {}

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size); 
  }
}

export class Item extends Entity {
    constructor(x, y, size = 20, color = "gold") {
        let rnd = Math.random() * (200 - 50) + 50;

        const dropStartY = y - rnd;
        super(x, dropStartY, size, color); 
        this.targetY = y;
        this.dropInitial = dropStartY;
        this.state = "dropping";
        this.spawnTime = performance.now();
        this.dropTime = 3;   
        this.stayTime = 3;
        this.fadeTime = 2;
        this.alpha = 1;

        this.dropDelta = 0;
        this.stayDelta = 0;
        this.fadeDelta = 0;
    }

    update(dt) {
        const now = performance.now();

        switch (this.state) {
            case "dropping":
                this.dropDelta += dt;
                let dropProgress = this.dropDelta / this.dropTime;
                let easedDrop = easeOut(dropProgress);
                this.y = lerp(this.dropInitial, this.targetY, easedDrop);

                if (dropProgress >= 1) {
                    this.state = "stay";
                }
                break;

            case "stay":
                this.stayDelta += dt;
                if (this.stayDelta > this.stayTime) {
                    this.state = "fade";
                }
                break;

            case "fade":
                this.fadeDelta += dt;
                let fadeProgress = this.fadeDelta / this.fadeTime;
                this.alpha = 1 - fadeProgress;
                if (fadeProgress >= 1) {
                    this.state = "hidden";
                }
                break;
        }
    }

    draw(ctx) {
        if (this.state === "hidden") return;

        ctx.globalAlpha = this.alpha;
        super.draw(ctx);
        ctx.globalAlpha = 1;
    }
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

export class AnimatedEntity extends Entity {
  constructor(x, y, size, sprite, frameMap, frameSize = [24, 24], frameSpeed = 0.1) {
    super(x, y, size, "transparent");
    this.sprite = sprite;
    this.frameMap = frameMap;
    this.direction = "down";
    this.frameSize = frameSize;
    this.frameIndex = 0;
    this.frameSpeed = frameSpeed;
    this.frameTimer = 0;
  }

  setDirection(dir) {
    if (this.direction !== dir) {
      this.direction = dir;
    }
  }

  update(dt) {
    this.frameTimer += dt;
    if (this.frameTimer >= this.frameSpeed) {
      this.frameTimer = 0;
      const frames = this.frameMap[this.direction];  
      this.frameIndex = (this.frameIndex + 1) % frames.length;
    }
  }

  draw(ctx) {
      const frames = this.frameMap[this.direction];
      if (!this.sprite || !frames || !frames[this.frameIndex]) return;

      const [sx, sy] = frames[this.frameIndex];
      const [sw, sh] = this.frameSize;

    ctx.drawImage(this.sprite, sx, sy, sw, sh, this.x, this.y, this.size, this.size);
  }
}


export function getFrames(row, col, frameCount = 4, frameW = 24, frameH = 24, skipPx = 24) {
  const frames = [];
  const offsetCol = col * frameW + skipPx;
  for (let i = 0; i < frameCount; i++) {
    const y = (row + i) * frameH;
    frames.push([offsetCol, y]);
  }
  return frames;
}