export function spriteSheet(sheet, onLoad){
	const characterSpriteSheet = new Image();
	characterSpriteSheet.src = sheet;
    console.log(" sheet loaded");
    characterSpriteSheet.onload = () => {
    console.log("Sprite sheet loaded");
        if (onLoad) onLoad(characterSpriteSheet);
    };

    characterSpriteSheet.onerror = () => {
        console.error("Failed to load image:", src);
    };
  return characterSpriteSheet;
}