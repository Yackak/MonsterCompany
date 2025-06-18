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

    for (let i = 0; i <= 2; i++) {
      this.load.image(`smash_${i}`, `assets/smash_${i}.png`);
    }
    for (let i = 0; i <= 3; i++) {
      this.load.image(`pierce_${i}`, `assets/pierce_${i}.png`);
    }
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
        .setFlipX(true)
    };

    this.enemies = this.generateEnemies(this.stage);
    this.createSkillMenu(centerX * 0.4);
  }

  createSkillMenu(playerX) {
    const skillNames = ['Smash', 'Pierce', 'Rocket Punch'];
    this.skillImages = [];
    this.selectedSkillIndex = 0;

    skillNames.forEach((_, i) => {
      const key = `skill_${i}_off`;
      const img = this.add.image(playerX + 200, 250 + i * 65, key)
        .setInteractive()
        .setScale(0.3);
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
    const name = ['Smash', 'Pierce', 'Rocket Punch'][index];
    if (name === 'Smash') this.useSmash();
    else if (name === 'Pierce') this.usePierce();
    else if (name === 'Rocket Punch' && !this.rocketUsed) {
      this.rocketPending = true;
      console.log('🚀 Rocket Punch: waiting for target selection...');
    }
  }

  useSmash() {
    const target = this.enemies.find(e => e.hp > 0);
    if (target) {
      this.playSmashAnimation(target.sprite.x, target.sprite.y, () => {
        target.hp -= 2;
        console.log(`🥊 Smash! Dealt 2 damage to ${target.spriteKey}. HP left: ${target.hp}`);
        if (target.hp <= 0) target.sprite.setVisible(false);
        this.startBattleTurn();
      });
    } else {
      this.startBattleTurn();
    }
  }

  usePierce() {
    let blocked = false;
    const livingEnemies = this.enemies.filter(e => e.hp > 0);
    if (livingEnemies.length === 0) return this.startBattleTurn();

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    this.playPierceAnimation(centerX * 0.7, centerY, () => {
      for (const enemy of this.enemies) {
        if (enemy.hp <= 0) continue;
        if (enemy.stage === 2) {
          blocked = true;
          console.log('⚠️ Pierce was blocked by glacue_2.');
          enemy.hp -= 1;
          if (enemy.hp <= 0) enemy.sprite.setVisible(false);
          break;
        }
        if (!blocked) {
          enemy.hp -= 1;
          console.log(`🔫 Pierce! Dealt 1 damage to ${enemy.spriteKey}. HP left: ${enemy.hp}`);
          if (enemy.hp <= 0) enemy.sprite.setVisible(false);
        }
      }
      this.startBattleTurn();
    });
  }

  playSmashAnimation(x, y, onComplete) {
    const frames = ['smash_0', 'smash_1', 'smash_2'];
    let index = 0;
    const sprite = this.add.image(x, y, frames[index]).setScale(0.5);

    this.time.addEvent({
      delay: 100,
      repeat: frames.length - 1,
      callback: () => {
        index++;
        sprite.setTexture(frames[index]);
        if (index === frames.length - 1) {
          this.time.delayedCall(100, () => {
            sprite.destroy();
            if (onComplete) onComplete();
          });
        }
      }
    });
  }

  playPierceAnimation(x, y, onComplete) {
    const frames = ['pierce_0', 'pierce_1', 'pierce_2', 'pierce_3'];
    let index = 0;
    const sprite = this.add.image(x, y, frames[index]).setScale(0.5);

    this.time.addEvent({
      delay: 100,
      repeat: frames.length - 1,
      callback: () => {
        index++;
        sprite.setTexture(frames[index]);
        if (index === frames.length - 1) {
          this.time.delayedCall(100, () => {
            sprite.destroy();
            if (onComplete) onComplete();
          });
        }
      }
    });
  }

  update() {}
}
