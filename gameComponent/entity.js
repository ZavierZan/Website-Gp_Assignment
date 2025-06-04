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
    constructor(x, y, size = 20, color = "gold", sprite = null, spriteSrc = null, spriteSize = [32, 32]) {
        let rnd = rndNum(50, 200);

        const dropStartY = y - rnd;
        super(x, dropStartY, size, color); 

        this.sprite = sprite;
        this.spriteSrc = spriteSrc;
        this.spriteSize = spriteSize;
        this.alpha = 1;
        this.state = "visible";

        this.targetY = y;
        this.dropInitial = dropStartY;
        this.state = "dropping";
        this.spawnTime = performance.now();
        this.dropTime = 3;   
        this.stayTime = 3;
        this.fadeTime = 2;
        this.alpha = 1;
        this.currentSize = size;


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
                fadeProgress = Math.min(fadeProgress, 1);
                this.alpha = 1 - fadeProgress;
                
                this.currentSize = this.size * (1 - 0.5 * fadeProgress);
                if (fadeProgress >= 1) {
                    this.state = "hidden";
                }
                break;
        }
    }

    draw(ctx) {
        if (this.sprite && this.spriteSrc) {
      const [sx, sy] = this.spriteSrc;
      const [sw, sh] = this.spriteSize;
      const drawSize = this.state === "fade" ? this.currentSize : this.size;
      const drawX = this.x + (this.size - drawSize) / 2;
      const drawY = this.y + (this.size - drawSize) / 2;

      ctx.drawImage(this.sprite, sx, sy, sw, sh, drawX, drawY, drawSize, drawSize);

    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
      ctx.fill()
    }
    }
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

export class RoundItem extends Item {
  constructor(x, y, size = 20) {
    super(x, y, size, "red");
    this.hue = Math.random() * 360; 
  }

  draw(ctx) {
  if (this.state === "hidden") return;

  // Animate hue shift continuously
  this.hue = (this.hue + 1) % 360;

  const x = this.x + this.size / 2;
  const y = this.y + this.size / 2;
  const radius = this.size / 2;

  // Gradient color shift
  const gradient = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
  gradient.addColorStop(0, `hsl(${this.hue}, 100%, 70%)`);
  gradient.addColorStop(1, `hsl(${(this.hue + 60) % 360}, 100%, 40%)`);

  ctx.save();
  ctx.globalAlpha = this.alpha;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

  
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

function rndNum(min, max = null) {
  if (max === null) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}