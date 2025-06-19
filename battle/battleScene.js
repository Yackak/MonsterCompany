import { createSkillMenu, updateSkillSelection } from './battleUI.js';
import { useSmash, usePierce } from './battlePlayer.js';
import { startBattleTurn } from './battleLogic.js';
import { generateEnemies, attachRocketEvent } from './battleEnemy.js';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'battle' });
        this.stage = 1;
        this.maxEnemies = 4;
        this.rocketUsed = false;
        this.rocketPending = false;
    }

    preload() {
        this.load.image('background_battle', 'assets/background_battle.png');
        this.load.image('standing_0', 'assets/standing_0.png');
        this.load.image('glacue_1', 'assets/glacue_1.png');
        this.load.image('glacue_2', 'assets/glacue_2.png');
        this.load.image('glacue_boss', 'assets/glacue_boss.png');
        for (let i = 0; i < 3; i++) {
            this.load.image(`skill_${i}_off`, `assets/skill_${i}_off.png`);
            this.load.image(`skill_${i}_on`, `assets/skill_${i}_on.png`);
        }
        this.load.image('smash_0', 'assets/smash_0.png');
        this.load.image('smash_1', 'assets/smash_1.png');
        this.load.image('smash_2', 'assets/smash_2.png');
        this.load.image('pierce_0', 'assets/pierce_0.png');
        this.load.image('pierce_1', 'assets/pierce_1.png');
        this.load.image('pierce_2', 'assets/pierce_2.png');
        this.load.image('pierce_3', 'assets/pierce_3.png');
    }

    create() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const bg = this.add.image(0, 0, 'background_battle').setOrigin(0, 0);
        bg.setDisplaySize(window.innerWidth, window.innerHeight);

        this.player = {
            name: 'Hero',
            hp: 15,
            atk: 1,
            speed: 10,
            sprite: this.add.image(centerX * 0.4, centerY, 'standing_0')
                .setScale(0.3)
                .setFlipX(true),
            originalX: centerX * 0.4,
            originalY: centerY
        };

        this.enemies = generateEnemies(this, this.stage);
        createSkillMenu(this, centerX * 0.4);
    }

    updateSkillSelection() {
        updateSkillSelection(this);
    }

selectSkill(index) {
  const name = ['Smash', 'Pierce', 'Rocket Punch'][index];

  if (name === 'Smash') {
    this.animatePlayer((done) => {
      useSmash(this, done);
    });
  } else if (name === 'Pierce') {
    this.animatePlayer((done) => {
      usePierce(this, done);
    });
  } else if (name === 'Rocket Punch' && !this.rocketUsed) {
    this.rocketPending = true;
    console.log('🚀 로켓 펀치: 대상 선택 대기 중...');
  }
}


    startBattleTurn() {
        startBattleTurn(this);
    }

    attachRocketEvent(sprite, enemy) {
        attachRocketEvent(this, sprite, enemy);
    }

    animatePlayer(callback) {
        const player = this.player.sprite;

        // 중앙으로 이동
        this.tweens.add({
            targets: player,
            x: window.innerWidth / 2,
            duration: 500,
            onComplete: () => {
                // 애니메이션(스킬 실행) 후에 돌아오는 부분을 콜백에서 처리
                callback(() => {
                    this.tweens.add({
                        targets: player,
                        x: this.player.originalX,
                        duration: 500
                    });
                });
            }
        });
    }

generateEnemies() {
  return generateEnemies(this, this.stage);
}

    showAnimation(frames, targetSprite, onComplete) {
        let index = 0;
        const originalFlipX = targetSprite.flipX;  // 현재 방향 저장

        this.time.addEvent({
            delay: 100,
            repeat: frames.length - 1,
            callback: () => {
                targetSprite.setTexture(frames[index]);
                targetSprite.setFlipX(!originalFlipX); // 방향 유지
                index++;
                if (index >= frames.length) {
                    targetSprite.setTexture('standing_0');
                    if (onComplete) onComplete();
                    targetSprite.setFlipX(originalFlipX); // 방향 복구
                }
            }
        });
    }

}
