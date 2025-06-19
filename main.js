import BattleScene from './battle/battleScene.js'; // 상대경로 확인 필요

let player;
let cursors;
let background_office;
let backgroundWidth;
let backgroundHeight;

// 🔄 기존 단일 scene 등록 → 여러 개 등록으로 변경
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'main' });
  }

  preload() {
    this.load.image('background_office', 'assets/background_office.png');

    for (let i = 0; i <= 16; i++) {
      this.load.image(`standing_${i}`, `assets/standing_${i}.png`);
    }
    for (let i = 0; i <= 7; i++) {
      this.load.image(`running_${i}`, `assets/running_${i}.png`);
    }
  }

  create() {
    //디버깅
    console.log('22:31');
    
    background_office = this.add.image(0, 0, 'background_office').setOrigin(0, 0);

    const newHeight = 750;
    const aspectRatio = background_office.width / background_office.height;
    const newWidth = newHeight * aspectRatio;
    background_office.setDisplaySize(newWidth, newHeight);

    backgroundWidth = newWidth;
    backgroundHeight = newHeight;
    this.physics.world.setBounds(0, 0, backgroundWidth, newHeight);

    player = this.physics.add.sprite(backgroundWidth - 1000, backgroundHeight - 50, 'standing_0');
    player.setScale(0.3);
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();
    this.sceneTransitioning = false;

    this.anims.create({
      key: 'walk',
      frames: [
        { key: 'running_0' }, { key: 'running_1' },
        { key: 'running_2' }, { key: 'running_3' },
        { key: 'running_4' }, { key: 'running_5' },
        { key: 'running_6' }, { key: 'running_7' }
      ],
      frameRate: 12,
      repeat: -1
    });

    this.anims.create({
      key: 'idle',
      frames: [
        { key: 'standing_0' }, { key: 'standing_0' },
        { key: 'standing_0' }, { key: 'standing_0' },
        { key: 'standing_1' }, { key: 'standing_2' },
        { key: 'standing_3' }, { key: 'standing_4' }
      ],
      frameRate: 5,
      repeat: -1
    });

    this.cameras.main.setBounds(0, 0, backgroundWidth - window.innerWidth / 2, newHeight);
    this.cameras.main.startFollow(player);
  }

  update() {
    this.scene.start('battle');
    if (this.sceneTransitioning) return;

    if (cursors.left.isDown) {
      player.setVelocityX(-640);
      player.anims.play('walk', true);
      player.setFlipX(false);

      if (player.x <= 250) {
        this.sceneTransitioning = true;

        player.setVelocityX(0);
        this.physics.world.gravity.y = 1000;
        player.setCollideWorldBounds(false);

        this.time.delayedCall(1000, () => {
          this.scene.start('battle');
        });
      }

    } else if (cursors.right.isDown) {
      if (player.x <= backgroundWidth - 200) {
        player.setVelocityX(640);
      }
      player.anims.play('walk', true);
      player.setFlipX(true);
    } else {
      player.setVelocityX(0);
      player.anims.play('idle', true);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: 692,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MainScene, BattleScene] // ✅ 여러 씬 등록
};

const game = new Phaser.Game(config);
