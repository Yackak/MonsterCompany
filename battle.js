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
    this.load.image('glacue_1', 'assets/glacue_1.png');
    this.load.image('glacue_2', 'assets/glacue_2.png');
    this.load.image('glacue_boss', 'assets/glacue_boss.png');
  }

  create() {
    const bg = this.add.image(0, 0, 'background_battle').setOrigin(0, 0);
    bg.setDisplaySize(window.innerWidth, window.innerHeight);

    this.player = {
      name: 'Hero',
      hp: 100,
      atk: 1,
      speed: 10,
      sprite: this.add.rectangle(100, 300, 50, 50, 0x00ff00),
    };

    this.enemies = this.generateEnemies(this.stage);
    this.createSkillMenu();
  }

  generateEnemies(stage) {
    let config;
    if (stage === 1) config = [1];
    else if (stage === 2) config = [1, 1];
    else if (stage === 3) config = [1, 2, 1];
    else if (stage === 4) config = [3];

    const enemies = config.map((level, idx) => {
      let spriteKey = level === 1 ? 'glacue_1' : level === 2 ? 'glacue_2' : 'glacue_boss';
      let hp = level === 3 ? 12 : level === 2 ? 2 : 3;
      let atk = 1;
      let speed = level === 3 ? 8 : level === 2 ? 12 : 14;
      let canSummon = level === 3;
      let x = 500 + idx * 100;
      let y = 300;
      let sprite = this.add.image(x, y, spriteKey).setScale(0.5).setInteractive();
      sprite.on('pointerdown', () => {
        if (this.rocketPending && !this.rocketUsed && hp > 0) {
          this.rocketUsed = true;
          this.rocketPending = false;
          const enemy = this.enemies[idx];
          enemy.hp -= 1;
          console.log(`🚀 로켓펀치! ${enemy.spriteKey}에게 1 데미지. 남은 HP: ${enemy.hp}`);
          if (enemy.hp <= 0) enemy.sprite.setVisible(false);
        }
      });
      return {
        name: '글라큐',
        stage: level,
        spriteKey,
        hp,
        atk,
        speed,
        canSummon,
        sprite,
      };
    });

    return enemies;
  }

  createSkillMenu() {
    const skillNames = ['강타', '관통샷', '로켓펀치'];
    skillNames.forEach((name, i) => {
      const btn = this.add.text(170, 250 + i * 50, name, {
        fontSize: '20px',
        backgroundColor: '#222',
        color: '#fff',
        padding: { x: 10, y: 5 },
      }).setInteractive();

      btn.on('pointerdown', () => {
        if (name === '강타') this.useSmash();
        else if (name === '관통샷') this.usePierce();
        else if (name === '로켓펀치' && !this.rocketUsed) {
          this.rocketPending = true;
          console.log('로켓펀치 대상 선택 대기 중...');
        }
      });
    });
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
      // 아군은 이미 스킬을 썼음 (스킬 클릭 → startBattleTurn() 호출됨)
    } else {
      if (unit.canSummon && this.enemies.length < this.maxEnemies) {
        console.log('보스 글라큐가 소환을 시도합니다.');
        const x = 500 + this.enemies.length * 100;
        const y = 300;
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
        this.enemies.push(summoned);
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
