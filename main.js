import { Engine } from "./gameComponent/engine.js";
import { Entity } from "./gameComponent/entity.js";
import { keys, initInput } from "./gameComponent/input.js";
import { isColliding } from "./gameComponent/physics.js";

const canvas = document.getElementById("gameCanvas");

const player = new Entity(100, 100, 30, "lime");
const items = [];

for (let i = 0; i < 5; i++) {
        placeItemNoOverlap();
    }

player.update = () => {
    const speed = 3;

    if (keys["a"]) player.x -= speed;
    if (keys["d"]) player.x += speed;
    if (keys["w"]) player.y -= speed;
    if (keys["s"]) player.y += speed;

  items.forEach(item => {
  if (isColliding(player, item)) {
    item.color = "gray";
  }
});
};

initInput();

const engine = new Engine(canvas, () => {
  player.update();
}, (ctx) => {
  player.draw(ctx);
  items.forEach(item => item.draw(ctx));
});

engine.start();


function rndNum(min, max = null) {
  if (max === null) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeItemNoOverlap() {
  let x, y;
  do {
    x = rndNum(0, canvas.width - 20);
    y = rndNum(0, canvas.height - 20);
    var newItem = new Entity(x, y, 20, "gold");
  } while (items.some(item => isColliding(item, newItem)));
    items.push(newItem);
}