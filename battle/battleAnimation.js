export function showAnimation(scene, frames, targetSprite, onComplete) {
  let index = 0;
  const originalFlipX = targetSprite.flipX; // 현재 방향 저장

  scene.time.addEvent({
    delay: 100,
    repeat: frames.length - 1,
    callback: () => {
      if (index < frames.length) {
        targetSprite.setTexture(frames[index]);
        targetSprite.setFlipX(!originalFlipX); // 프레임 바꿔도 방향 유지
        index++;
      } else {
        targetSprite.setTexture('standing_0');
        if (onComplete) onComplete();
      }
    }
  });   
}
