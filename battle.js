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
      target.hp -= 2;
      console.log(`🥊 Smash! Dealt 2 damage to ${target.spriteKey}. HP left: ${target.hp}`);
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
  }

  startBattleTurn() {
    const allUnits = [this.player, ...this.enemies];
    allUnits.sort((a, b) => b.speed - a.speed);
    this.executeActions([...allUnits]);
  }

  executeActions(queue) {
    if (queue.length === 0) {
      this.checkBattleEnd();
      return;
    }

    const unit = queue.shift();
    if (unit.hp <= 0) {
      this.executeActions(queue);
      return;
    }

    if (unit === this.player) {
      // Player already acted
    } else {
      if (unit.canSummon && this.enemies.length < this.maxEnemies) {
        console.log('Boss is summoning a new glacue.');
        const boss = this.enemies.find(e => e.stage === 3);
        const bossIndex = this.enemies.indexOf(boss);
        const summonOffset = this.enemies.length - bossIndex - 1;
        const x = boss.sprite.x - 120 - summonOffset * 100;
        const y = boss.sprite.y;

        const sprite = this.add.image(x, y, 'glacue_1').setScale(1.5).setInteractive();
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

        this.attachRocketEvent(sprite, summoned);
        this.enemies.splice(bossIndex, 0, summoned);
        console.log('A new glacue has been summoned!');
      } else {
        if (this.player.hp > 0) {
          this.player.hp -= unit.atk;
          console.log(`glacue attacks Hero for ${unit.atk} damage. Remaining HP: ${this.player.hp}`);
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

  generateEnemies(stage) {
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

      const sprite = this.add.image(x, y, spriteKey).setScale(1.5).setInteractive();
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

      this.attachRocketEvent(sprite, enemy);
      enemies.push(enemy);
    });

    if (bossExists) {
      const x = baseX + normalEnemies.length * gap;
      const y = centerY;
      const sprite = this.add.image(x, y, 'glacue_boss').setScale(1.5).setInteractive();

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

      this.attachRocketEvent(sprite, boss);
      enemies.push(boss);
    }

    return enemies;
  }

  attachRocketEvent(sprite, enemy) {
    sprite.on('pointerdown', () => {
      if (this.rocketPending && !this.rocketUsed && enemy.hp > 0) {
        this.rocketUsed = true;
        this.rocketPending = false;
        enemy.hp -= 1;
        console.log(`🚀 Rocket Punch! Dealt 1 damage to ${enemy.spriteKey}. HP left: ${enemy.hp}`);
        if (enemy.hp <= 0) enemy.sprite.setVisible(false);
      }
    });
  }

  update() {
    // Real-time updates if needed
  }
}
