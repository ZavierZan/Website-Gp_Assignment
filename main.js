import { Engine } from "./gameComponent/engine.js";
import { Entity, Item, AnimatedEntity, getFrames } from "./gameComponent/entity.js";
import { keys, initInput } from "./gameComponent/input.js";
import { isColliding } from "./gameComponent/physics.js";
import { spriteSheet } from "./gameComponent/render.js";

window.addEventListener('DOMContentLoaded', loadSound);

const canvas = document.getElementById("gameCanvas");

let player = new Entity(100, 100, 64, "lime");
const items = [];
let speed = 3;
let dashTrig = false;
let dashReady = true;
let dashStartTime = 0;
let dashCooldown = 5000;
let score = 0;
let totalTime = 58;
let startTime = totalTime;
let gameStarted = false;
let gameEnded = false;
let spriteImage;
const frameMap = {
  down: getFrames(4, 4),
  left: getFrames(4, 2),
  right: getFrames(4, 6),
  up: getFrames(4, 8),
  topLeft: getFrames(4, 1),
  botLeft: getFrames(4, 3),
  botRight: getFrames(4, 5),
  topRight: getFrames(4, 7),
};


let pickupAudio;
let dashAudio;
let bgAudio;



for (let i = 0; i < 5; i++) {
        placeItemNoOverlap();
    }

spriteSheet("./assets/playerSprite.png", (img) => {
  spriteImage = img;
  player = new AnimatedEntity(100, 100, 58, spriteImage, frameMap, [24 , 24], 0.1);

  player.update = (dt) => {
    let moved = false;

    if (keys["a"]) {
      player.x -= speed;
      player.setDirection("left");
      moved = true;
    }
    if (keys["d"]) {
      player.x += speed;
      player.setDirection("right");
      moved = true;
    }
    if (keys["w"]) {
      player.y -= speed;
      player.setDirection("up");
      moved = true;
    }
    if (keys["s"]) {
      player.y += speed;
      player.setDirection("down");
      moved = true;
    }
    if (keys["w"] && keys["a"]) {
      player.setDirection("topLeft");
      moved = true;
    }
    if (keys["s"] && keys["a"]) {
      player.setDirection("botLeft");
      moved = true;
    }
    if (keys["s"] && keys["d"]) {
      player.setDirection("botRight");
      moved = true;
    }
    if (keys["w"] && keys["d"]) {
      player.setDirection("topRight");
      moved = true;
    }

    if (!moved) player.frameIndex = 0;
    
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
    
    //Collision

    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (isColliding(player, item)) {
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

  player.updateBase = player.update.bind(player);
  player.updateBase(dt);
});

initInput();

//Game loop
const engine = new Engine(canvas, (dt) => {
  if (!gameStarted || gameEnded) return;
    startTime -= dt;
    if (startTime <= 0) {
      startTime = 0;
      gameEnded = true;
    }
    if (gameEnded){
      bgAudio.stop();
    }

    player.update(dt);
  
}, (ctx) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameStarted) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Click to Start", canvas.width / 2, canvas.height / 2);
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
    } else {
    ctx.fillStyle = "lime";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    }
});

    engine.start();
document.addEventListener("click", () => {
  if (!gameStarted) {
    bgAudio.play();
    gameStarted = true;
  }
}, { once: true });


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
  do {
    x = rndNum(0, canvas.width - 20);
    y = rndNum(0, canvas.height - 20);
    newItem = new Item(x, y);
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
    
    // Credit: Zane Little Music on opengameart.org.
    // https://https://opengameart.org/content/apple-cider
    bgAudio = new Sound("./assets/audio/bg.wav");
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

    this.sound.volume = 0.3 // lower volume
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