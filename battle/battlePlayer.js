
export function useSmash(scene, done) {
  const target = scene.enemies.find(e => e.hp > 0);
  if (!target) {
    done();
    scene.startBattleTurn();
    return;
  }

  scene.showAnimation(['smash_0', 'smash_1', 'smash_2'], scene.player.sprite, () => {
    target.hp -= 2;
    console.log(`🥊 강타! ${target.spriteKey}에게 2 데미지. 남은 HP: ${target.hp}`);
    if (target.hp <= 0) target.sprite.setVisible(false);

    done(); // 애니메이션 끝난 후 제자리로 복귀
    scene.time.delayedCall(300, () => {
      scene.startBattleTurn();
    });
  });
}

export function usePierce(scene, done) {
  scene.showAnimation(['pierce_0', 'pierce_1', 'pierce_2', 'pierce_3'], scene.player.sprite, () => {
    let blocked = false;
    for (const enemy of scene.enemies) {
      if (enemy.hp <= 0) continue;
      if (enemy.stage === 2) {
        blocked = true;
        console.log('⚠️ 관통샷이 글라큐(2단계)에게 막혔습니다.');
        enemy.hp -= 1;
        if (enemy.hp <= 0) enemy.sprite.setVisible(false);
        break;
      }
      if (!blocked) {
        enemy.hp -= 1;
        console.log(`🔫 관통샷! ${enemy.spriteKey}에게 1 데미지. 남은 HP: ${enemy.hp}`);
        if (enemy.hp <= 0) enemy.sprite.setVisible(false);
      }
    }

    done(); // 애니메이션 끝난 후 제자리로 복귀
    scene.time.delayedCall(300, () => {
      scene.startBattleTurn();
    });
  });
}
