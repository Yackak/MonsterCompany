export function startBattleTurn(scene) {
  const allUnits = [scene.player, ...scene.enemies];
  allUnits.sort((a, b) => b.speed - a.speed);
  executeActions(scene, [...allUnits]);
}

function executeActions(scene, queue) {
  if (queue.length === 0) {
    checkBattleEnd(scene);
    return;
  }

  const unit = queue.shift();
  if (unit.hp <= 0) {
    executeActions(scene, queue);
    return;
  }

  if (unit === scene.player) {
    // 이미 플레이어는 턴 시작 시 행동 완료됨
  } else {
    if (unit.canSummon && scene.enemies.length < scene.maxEnemies) {
      console.log('보스가 새로운 글라큐를 소환합니다.');
      const boss = scene.enemies.find(e => e.stage === 3);
      const bossIndex = scene.enemies.indexOf(boss);
      const summonOffset = scene.enemies.length - bossIndex - 1;
      const x = boss.sprite.x - 120 - summonOffset * 100;
      const y = boss.sprite.y;

      const sprite = scene.add.image(x, y, 'glacue_1').setScale(1.5).setInteractive();
      const summoned = {
        name: 'glacue',
        stage: 0,
        spriteKey: 'glacue_1',
        hp: 1,
        atk: 1,
        speed: 15,
        canSummon: false,
        sprite
      };

      scene.attachRocketEvent(sprite, summoned);
      scene.enemies.splice(bossIndex, 0, summoned);
      console.log('새로운 글라큐가 소환되었습니다!');
    } else {
      if (scene.player.hp > 0) {
        scene.player.hp -= unit.atk;
        console.log(`공격당함: 글라큐가 Hero에게 ${unit.atk} 데미지. 남은 HP: ${scene.player.hp}`);
      }
    }
  }

  scene.time.delayedCall(500, () => executeActions(scene, queue));
}

function checkBattleEnd(scene) {
  const playerDead = scene.player.hp <= 0;
  const enemiesDead = scene.enemies.every(e => e.hp <= 0);

  if (playerDead) {
    console.log('%c게임 오버...', 'color: red; font-size: 24px');
  } else if (enemiesDead) {
    console.log('%c스테이지 클리어!', 'color: green; font-size: 24px');
    scene.stage++;
    scene.rocketUsed = false;
    if (scene.stage <= 4) {
      scene.enemies.forEach(e => e.sprite.destroy());
      scene.enemies = scene.generateEnemies(scene.stage);
    } else {
      console.log('%c모든 스테이지 클리어!', 'color: gold; font-size: 24px');
    }
  }

  if (!playerDead && !enemiesDead) {
    // ✅ 전투가 계속될 경우 → 스킬창 다시 표시
    scene.toggleSkillMenu?.();  // optional chaining으로 안전하게 호출
  }

}
