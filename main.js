import { Engine } from "./gameComponent/engine.js";
import { Entity } from "./gameComponent/entity.js";
import { keys, initInput } from "./gameComponent/input.js";
import { isColliding } from "./gameComponent/physics.js";

const canvas = document.getElementById("gameCanvas");

const player = new Entity(100, 100, 30, "lime");
const items = [];
let speed = 3;
let dashTrig = false;
let dashReady = true;
let dashStartTime = 0;
let dashCooldown = 5000;
let score = 0;
let totalTime = 20;
let startTime = totalTime;
let gameEnded = false;

for (let i = 0; i < 5; i++) {
        placeItemNoOverlap();
    }

player.update = () => {

    //Key Input
    if (keys["a"]) player.x -= speed;
    if (keys["d"]) player.x += speed;
    if (keys["w"]) player.y -= speed;
    if (keys["s"]) player.y += speed;
    
    if (keys["shift"] && dashReady) {
        if (!dashTrig) {
            speed = 15;
            dashTrig = true;
            dashReady = false;
            dashStartTime = performance.now();

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
            items.splice(i, 1);
            score++;
            placeItemNoOverlap();
        }
    }
};

initInput();

//Game loop
const engine = new Engine(canvas, (dt) => {
  if (!gameEnded) {
    startTime -= dt;
    if (startTime <= 0) {
      startTime = 0;
      gameEnded = true;
    }

    player.update(dt);
  }
}, (ctx) => {
    player.draw(ctx);
    items.forEach(item => item.draw(ctx));

    // Draw score and timer
    const timeLeft = Math.ceil(startTime);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
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
  do {
    x = rndNum(0, canvas.width - 20);
    y = rndNum(0, canvas.height - 20);
    var newItem = new Entity(x, y, 20, "gold");
  } while (items.some(item => isColliding(item, newItem)));
    items.push(newItem);
}

// Check wall collision
function clampToCanvas(object) {

  // Clamp X (horizontal)
  if (object.x < 0) {
    object.x = 0;
  } else if (object.x + object.size > canvas.width) {
    object.x = canvas.width - object.size;
  }

  // Clamp Y (vertical)
  if (object.y < 0) {
    object.y = 0;
  } else if (object.y + object.size > canvas.height) {
    object.y = canvas.height - object.size;
  }
}