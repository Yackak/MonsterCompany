export function generateEnemies(scene, stage) {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  let config;
  if (stage === 1) config = [1];
  else if (stage === 2) config = [1, 1];
  else if (stage === 3) config = [1, 2, 1];
  else if (stage === 4) config = [3];

  const normalEnemies = config.filter(l => l !== 3);
  const bossExists = config.includes(3);

  const baseX = centerX * 1.2;
  const gap = 200;
  const enemies = [];

  normalEnemies.forEach((level, idx) => {
    const spriteKey = level === 2 ? 'glacue_2' : 'glacue_1';
    const hp = level === 2 ? 2 : 3;
    const speed = level === 2 ? 12 : 14;
    const x = baseX + idx * gap;
    const y = centerY;

    const sprite = scene.add.image(x, y, spriteKey).setScale(1.5).setInteractive();
    const enemy = {
      name: 'glacue',
      stage: level,
      spriteKey,
      hp,
      atk: 1,
      speed,
      canSummon: false,
      sprite
    };

    attachRocketEvent(scene, sprite, enemy);
    enemies.push(enemy);
  });

  if (bossExists) {
    const x = baseX + normalEnemies.length * gap;
    const y = centerY;
    const sprite = scene.add.image(x, y, 'glacue_boss').setScale(1.5).setInteractive();

    const boss = {
      name: 'glacue_boss',
      stage: 3,
      spriteKey: 'glacue_boss',
      hp: 12,
      atk: 1,
      speed: 8,
      canSummon: true,
      sprite
    };

    attachRocketEvent(scene, sprite, boss);
    enemies.push(boss);
  }

  return enemies;
}

export function attachRocketEvent(scene, sprite, enemy) {
  sprite.on('pointerdown', () => {
    if (scene.rocketPending && !scene.rocketUsed && enemy.hp > 0) {
      scene.rocketUsed = true;
      scene.rocketPending = false;
      enemy.hp -= 1;
      console.log(`🚀 로켓 펀치! ${enemy.spriteKey}에게 1 데미지. 남은 HP: ${enemy.hp}`);
      if (enemy.hp <= 0) enemy.sprite.setVisible(false);
    }
  });
}
