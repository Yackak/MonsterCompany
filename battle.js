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
  }

  create() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const bg = this.add.image(0, 0, 'background_battle').setOrigin(0, 0);
    bg.setDisplaySize(window.innerWidth, window.innerHeight);

    this.player = {
      name: 'Hero',
      hp: 10,
      atk: 1,
      speed: 10,
      sprite: this.add.image(centerX * 0.4, centerY, 'standing_0').setScale(0.3)
    };

    this.enemies = this.generateEnemies(this.stage);
    this.createSkillMenu(centerX * 0.4);
  }

  createSkillMenu(playerX) {
    const skillNames = ['강타', '관통샷', '로켓펀치'];
    this.skillImages = [];
    this.selectedSkillIndex = 0;

    skillNames.forEach((_, i) => {
      const key = `skill_${i}_off`;
      const img = this.add.image(playerX - 60, 250 + i * 60, key).setInteractive().setScale(0.5);
      img.on('pointerdown', () => this.selectSkill(i));
      this.skillImages.push(img);
    });

    this.input.keyboard.on('keydown-UP', () => {
      this.selectedSkillIndex = (this.selectedSkillIndex + skillNames.length - 1) % skillNames.length;
      this.updateSkillSelection();
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.selectedSkillIndex = (this.selectedSkillIndex + 1) % skillNames.length;
      this.updateSkillSelection();
    });

    this.input.keyboard.on('keydown-Z', () => {
      this.selectSkill(this.selectedSkillIndex);
    });

    this.updateSkillSelection();
  }

  updateSkillSelection() {
    this.skillImages.forEach((img, i) => {
      const key = i === this.selectedSkillIndex ? `skill_${i}_on` : `skill_${i}_off`;
      img.setTexture(key);
    });
  }

  selectSkill(index) {
    const name = ['강타', '관통샷', '로켓펀치'][index];
    if (name === '강타') this.useSmash();
    else if (name === '관통샷') this.usePierce();
    else if (name === '로켓펀치' && !this.rocketUsed) {
      this.rocketPending = true;
      console.log('로켓펀치 대상 선택 대기 중...');
    }
  }

  useSmash() {
    const target = this.enemies.find(e => e.hp > 0);
    if (target) {
      target.hp -= 2;
      console.log(`🥊 강타! ${target.spriteKey}에게 2 데미지. 남은 HP: ${target.hp}`);
      if (target.hp <= 0) target.sprite.setVisible(false);
    }
    this.startBattleTurn();
  }

  usePierce() {
    let blocked = false;
    for (const enemy of this.enemies) {
      if (enemy.hp <= 0) continue;
      if (enemy.stage === 2) {
        blocked = true;
        console.log('⚠️ 관통샷이 글라큐(2단계)에 막혔습니다.');
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
    this.startBattleTurn();
  }

  startBattleTurn() {
    const allUnits = [this.player, ...this.enemies];
    allUnits.sort((a, b) => b.speed - a.speed);

    const actionQueue = [...allUnits];
    this.executeActions(actionQueue);
  }

  executeActions(queue) {
    if (queue.length === 0) {
      this.checkBattleEnd();
      return;
    }

    const unit = queue.shift();
    if (unit === this.player) {
      // 아군은 이미 스킬을 썼음
    } else {
      if (unit.canSummon && this.enemies.length < this.maxEnemies) {
        console.log('보스 글라큐가 소환을 시도합니다.');
        const x = window.innerWidth / 2 * 1.1 + this.enemies.length * 100;
        const y = window.innerHeight / 2;
        const sprite = this.add.image(x, y, 'glacue_1').setScale(0.5).setInteractive();
        const summoned = {
          name: '글라큐',
          stage: 0,
          spriteKey: 'glacue_1',
          hp: 1,
          atk: 1,
          speed: 15,
          canSummon: false,
          sprite
        };
        sprite.on('pointerdown', () => {
          if (this.rocketPending && !this.rocketUsed && summoned.hp > 0) {
            this.rocketUsed = true;
            this.rocketPending = false;
            summoned.hp -= 1;
            console.log(`🚀 로켓펀치! 소환된 글라큐에게 1 데미지. 남은 HP: ${summoned.hp}`);
            if (summoned.hp <= 0) summoned.sprite.setVisible(false);
          }
        });
        this.enemies.unshift(summoned);
        console.log('새로운 글라큐가 소환되었습니다!');
      } else {
        if (this.player.hp > 0) {
          this.player.hp -= unit.atk;
          console.log(`글라큐가 Hero를 공격합니다: ${unit.atk} damage. 남은 HP: ${this.player.hp}`);
        }
      }
    }

    this.time.delayedCall(500, () => this.executeActions(queue));
  }

  checkBattleEnd() {
    const playerDead = this.player.hp <= 0;
    const enemiesDead = this.enemies.every(e => e.hp <= 0);

    if (playerDead) {
      console.log('%cGAME OVER...', 'color: red; font-size: 24px');
    } else if (enemiesDead) {
      console.log('%cSTAGE CLEAR!', 'color: green; font-size: 24px');
      this.stage++;
      this.rocketUsed = false;
      if (this.stage <= 4) {
        this.enemies.forEach(e => e.sprite.destroy());
        this.enemies = this.generateEnemies(this.stage);
      } else {
        console.log('%cALL STAGES CLEARED!', 'color: gold; font-size: 24px');
      }
    }
  }

  update() {
    // 전투 중 실시간 처리가 필요하면 여기에 작성
  }
}
