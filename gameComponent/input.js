export const keys = {};

export function initInput() {
  window.addEventListener("keydown",keyDown);
  window.addEventListener("keyup", keyUp);
}

function keyDown(event) {
  keys[event.key.toLowerCase()] = true;
}

function keyUp(event) {
  keys[event.key.toLowerCase()] = false;
}