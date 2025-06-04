import { Engine } from "./gameComponent/engine.js";
import { Entity, Item, RoundItem, AnimatedEntity, getFrames } from "./gameComponent/entity.js";
import { keys, initInput } from "./gameComponent/input.js";
import { isColliding } from "./gameComponent/physics.js";
import { spriteSheet } from "./gameComponent/render.js";

window.addEventListener('DOMContentLoaded', loadSound);

const canvas = document.getElementById("gameCanvas");

let player = new Entity(100, 100, 64, "lime");    //player hitbox
const items = [];
let speed = 3;
let dashTrig = false;
let dashReady = true;
let dashStartTime = 0;
let dashCooldown = 5000;

let score = 0;
let highScore = Number(localStorage.getItem("highScore")) || 0;
let time = [120, 180, 60];
let t = 0;
let totalTime = 60;
let startTime = totalTime;
let gameStarted = false;
let gameEnded = false;


let pickupAudio;
let powerupAudio;
let dashAudio;
let bgAudio;
let menuAudio;


// Item
let itemSprite;
spriteSheet("./assets/duck.png", (img) => {
  itemSprite = img;
});
for (let i = 0; i <= 5; i++) {
  placeItemNoOverlap();
}

// Background tile
let tileImage;

// Credit: Ivan Voirol on opengameart.org.
// https://opengameart.org/content/basic-map-32x32-by-ivan-voirol
spriteSheet("./assets/tileSheet.png", (img) => {
  tileImage = img;

});
const waterAnimFrames = [
  [3 * 32, 21 * 32], // frame 1
  [13 * 32, 21 * 32]  // frame 2
];
let currentWaterFrame = 0;
let waterFrameTimer = 0;
const waterFrameSpeed = 300;

// Player sprite
let spriteImage;
let frameSpeed = 0.3;
let frameSize = [24, 24];
const frameMap = {
  left: getFrames(4, 1),
  down: getFrames(4, 3),
  right: getFrames(4, 5),
  up: getFrames(4, 7),
  topLeft: getFrames(4, 0),
  botLeft: getFrames(4, 2),
  botRight: getFrames(4, 4),
  topRight: getFrames(4, 6),
  idle: getFrames(1, 3, 3, 16)
};

  // Credit: Chasersgaming on opengameart.org.
  // https://opengameart.org/content/swimmer
  spriteSheet("./assets/playerSprite.png", (img) => {
  spriteImage = img;
  player = new AnimatedEntity(100, 100, 48, spriteImage, frameMap, frameSize, frameSpeed);    //sprite size

  const originalUpdate = player.update.bind(player);
  player.update = (dt) => {
    let moved = false;

    let dx = 0;
    let dy = 0;

    if (keys["a"]) dx -= 1;
    if (keys["d"]) dx += 1;
    if (keys["w"]) dy -= 1;
    if (keys["s"]) dy += 1;

    const length = Math.hypot(dx, dy);

    if (length > 0) {
      dx /= length;
      dy /= length;

      player.x += dx * speed;
      player.y += dy * speed;
      player.frameSize = [24, 24];
      moved = true;
    }
    if (dx === 0 && dy < 0) {
      player.setDirection("up");
    }
    else if (dx === 0 && dy > 0) {
      player.setDirection("down");
    }
    else if (dx < 0 && dy === 0) {
      player.setDirection("left");
    }
    else if (dx > 0 && dy === 0) {
      player.setDirection("right");
    }
    else if (dx < 0 && dy < 0) {
      player.setDirection("topLeft");
    }
    else if (dx > 0 && dy < 0) {
      player.setDirection("topRight");
    }
    else if (dx < 0 && dy > 0) {
      player.setDirection("botLeft");
    }
    else if (dx > 0 && dy > 0) {
      player.setDirection("botRight");
    }
    if (dx === 0 && dy === 0) {
      player.frameSize = [16, 24];
      player.setDirection("idle");
    }

    if (!moved && player.setDirection("idle")) {
      player.frameIndex = 0;
    }
    
    if (keys["shift"] && dashReady) {
        if (!dashTrig) {
            speed = 15;
            dashTrig = true;
            dashReady = false;
            dashStartTime = performance.now();
            dashAudio.play();

            // To Restore speed back to 3
            setTimeout(() => {
                speed = 3;
                dashTrig = false;
            }, 100);

            //Dash Cooldown
            setTimeout(() => {
            dashReady = true;
            }, dashCooldown);
        } 
    }
    //_______________________________//

    clampToCanvas(player);
    originalUpdate(dt);
    
    //Collision

let powerTimer = 0;
    for (let i = items.length - 1; i >= 0; i--) {
  const item = items[i];
  if (isColliding(player, item)) {

    if (item instanceof RoundItem) {
      powerupAudio.play();
      speed = 6;

      if (powerTimer) clearTimeout(powerTimer);

      powerTimer = setTimeout(() => {
        speed = 3;
        powerTimer = 0;
      }, 2000);
    }

    pickupAudio.play();
    items.splice(i, 1);
    score++;
    placeItemNoOverlap();
  }
}
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      item.update(dt);

      if (item.state === "hidden") {
          items.splice(i, 1);
          placeItemNoOverlap();
      }
    }
  };
  });

  initInput();

  //Game loop
  const engine = new Engine(canvas, (dt) => {

    waterFrameTimer += dt * 1000;

    if (waterFrameTimer >= waterFrameSpeed) {
      waterFrameTimer = 0;
      currentWaterFrame = (currentWaterFrame + 1) % waterAnimFrames.length;
    }

    if (!gameStarted || gameEnded) return;    
    startTime -= dt;
    if (startTime <= 0) {
      startTime = 0;
      gameEnded = true;
    }
    if (gameEnded){
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
      }
      bgAudio.stop();
    }

    player.update(dt);

  }, (ctx) => {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawWaterBackground(ctx); 
  if (!gameStarted) {
  if (menuAudio.sound.paused) {
    menuAudio.play();
  }

  // Start Menu
  ctx.fillStyle = "#00000066";
  ctx.fillRect( 0, 0, canvas.width, canvas.height, 60);

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Press R to Start", canvas.width / 2, canvas.height / 2 - 30);
  ctx.fillText("Press T to Change Timer: " + totalTime, canvas.width / 2, canvas.height / 2 + 30);
  ctx.fillText("Use WASD to Move", canvas.width / 2, canvas.height / 2);
  ctx.fillText("Press Shift to Dash", canvas.width / 2, canvas.height / 2 + 60);
  return;
  }

  player.draw(ctx);
  items.forEach(item => item.draw(ctx));

  // Draw score and timer
  const timeLeft = Math.ceil(startTime);

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "start";
  ctx.fillText(`Score: ${score}`, 10, 25);
  ctx.fillText(`Time: ${timeLeft}s`, 10, 50); 

  // Cooldown bar at top-right
  const barWidth = 100;
  const barHeight = 10;
  const barX = canvas.width - barWidth - 10;
  const barY = 10;

  ctx.fillStyle = "gray";
  ctx.fillRect(barX, barY, barWidth, barHeight);

  if (!dashReady) {
    const elapsed = performance.now() - dashStartTime;
    const ratio = Math.min(elapsed / dashCooldown, 1);
    ctx.fillStyle = "cyan";
    ctx.fillRect(barX, barY, barWidth * ratio, barHeight);
  } 
  else {
    ctx.fillStyle = "lime";
    ctx.fillRect(barX, barY, barWidth, barHeight);
  }

  // End Menu
  if (gameEnded) {
    ctx.fillStyle = "#00000066";
    ctx.fillRect( 0, 0, canvas.width, canvas.height, 60);

    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Game Over`, canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText(`Your Score: ${score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillText("Press R to Return to Start", canvas.width / 2, canvas.height / 2 + 60);
    return;
  }

});

    engine.start();
    document.addEventListener("keydown", (e) => {
  if (!gameStarted && e.code === "KeyR") {
    menuAudio.stop();
    bgAudio.play();
    gameStarted = true;
  }
  if (!gameStarted && e.code === "KeyT") {
    totalTime = time[t];
    t++
    if (t >= time.length){
      t = 0;
    }
    startTime = totalTime;
  }
  });

  window.addEventListener("keydown", (e) => {
  if (gameEnded && e.code === "KeyR") {
    restartGame();
  }
  });


// Random number generator
function rndNum(min, max = null) {
  if (max === null) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Create new object at no overlap location
function placeItemNoOverlap() {
  let x, y;
  let newItem;

  const spawnPower = rndNum(100) <= 20;

  do {
    let rnd = rndNum(0, 2);
    x = rndNum(0, canvas.width - 20);
    y = rndNum(0, canvas.height - 20);
    newItem = spawnPower ? new RoundItem(x, y) : new Item(x, y, 32, null, itemSprite, [rnd * 16,0], [16, 16]);
  } while (items.some(item => isColliding(item, newItem)));

  items.push(newItem);
}

// Check wall collision
function clampToCanvas(object) {
  // Horizontal
  if (object.x < 0) {
    object.x = 0;
  } else if (object.x + object.size > canvas.width) {
    object.x = canvas.width - object.size;
  }

  // Vertical
  if (object.y < 0) {
    object.y = 0;
  } else if (object.y + object.size > canvas.height) {
    object.y = canvas.height - object.size;
  }
}

// Audio
function loadSound() {
    pickupAudio = new Sound("./assets/audio/pickup.wav");
    dashAudio = new Sound("./assets/audio/dash.wav");
    powerupAudio = new Sound("./assets/audio/powerup.wav");
    
    // Credit: Zane Little Music on opengameart.org.
    // https://opengameart.org/content/apple-cider
    bgAudio = new Sound("./assets/audio/bg.wav");
    bgAudio.sound.volume = 0.3;
    menuAudio = new Sound("./assets/audio/menu.mp3");
    menuAudio.sound.volume = 0.1;
}

function Sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.crossOrigin = "anonymous";
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.setAttribute("looping", "true");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);

    this.play = function () {
        if (!this.sound.paused || !this.sound.currentTime) {
            this.sound.load();
        }
        this.sound.play();
    }
    this.stop = function () {
        this.sound.pause();
    }
}

function restartGame() {
  // Reset game state
  score = 0;
  startTime = totalTime;
  gameEnded = false;
  gameStarted = false;

  // Reset player position
  player.x = 100;
  player.y = 100;

  // Reset dash
  dashReady = true;
  dashTrig = false;
  speed = 3;

  // Reset items
  items.length = 0;
  for (let i = 0; i < 5; i++) {
    placeItemNoOverlap();
  }

  // Reset animation
  player.frameIndex = 0;
  player.setDirection("idle");
}

function drawWaterBackground(ctx) {
  if (!tileImage) return;
  const [sx, sy] = waterAnimFrames[currentWaterFrame];

  for (let y = 0; y < canvas.height; y += 32) {
    for (let x = 0; x < canvas.width; x += 32) {
      ctx.drawImage(tileImage, sx, sy, 32, 32, x, y, 64, 64);
    }
  }
}
