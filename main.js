let player;
let cursors;
let background_office;
let backgroundWidth;
let backgroundHeight;

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: 692,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 평소엔 중력 없음
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('background_office', 'assets/background_office.png'); // 배경

  for (let i = 0; i <= 16; i++) {
    this.load.image(`standing_${i}`, `assets/standing_${i}.png`);
  }
  for (let i = 0; i <= 7; i++) {
    this.load.image(`running_${i}`, `assets/running_${i}.png`);
  }
}

function create() {
  // 배경 이미지 로드
  background_office = this.add.image(0, 0, 'background_office').setOrigin(0, 0);

  // 배경 리사이즈
  const newHeight = 750;
  const aspectRatio = background_office.width / background_office.height;
  const newWidth = newHeight * aspectRatio;
  background_office.setDisplaySize(newWidth, newHeight);

  // 배경 크기 및 월드 설정
  backgroundWidth = newWidth;
  backgroundHeight = newHeight;
  this.physics.world.setBounds(0, 0, backgroundWidth, newHeight);

  // 플레이어 생성 (오른쪽 끝)
  player = this.physics.add.sprite(backgroundWidth - 500, backgroundHeight - 50, 'standing_0');
  player.setScale(0.3);
  player.setCollideWorldBounds(true);

  // 디버깅용
  console.log('player.x:', player.x, 'player.y:', player.y);

  cursors = this.input.keyboard.createCursorKeys();
  this.sceneTransitioning = false;

  // 걷기 애니메이션
  this.anims.create({
    key: 'walk',
    frames: [
      { key: 'running_0' },
      { key: 'running_1' },
      { key: 'running_2' },
      { key: 'running_3' },
      { key: 'running_4' },
      { key: 'running_5' },
      { key: 'running_6' },
      { key: 'running_7' }
    ],
    frameRate: 12,
    repeat: -1
  });

  // 대기 애니메이션
  this.anims.create({
    key: 'idle',
    frames: [
      { key: 'standing_0' },
      { key: 'standing_0' },
      { key: 'standing_0' },
      { key: 'standing_0' },
      { key: 'standing_1' },
      { key: 'standing_2' },
      { key: 'standing_3' },
      { key: 'standing_4' }
    ],
    frameRate: 5,
    repeat: -1
  });

  console.log('backgroundWidth: ', backgroundWidth, 'windowWidth: ', window.innerWidth)
  // 카메라
  if((this.camera.x < backgroundWidth - (window.innerWidth/2)) && (this.camera.x) > window.innerWidth/2) this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, backgroundWidth - window.innerWidth/2, newHeight);
}

function update() {
  if (this.sceneTransitioning) return;

  if (cursors.left.isDown) {
    player.setVelocityX(-640);
    player.anims.play('walk', true);
    player.setFlipX(false);

    // 왼쪽 끝 도달 시 낙하 + 씬 전환
    if (player.x <= 700) {
      this.sceneTransitioning = true;

      player.setVelocityX(0);
      this.physics.world.gravity.y = 1000; // 중력 활성화
      player.setCollideWorldBounds(false); // 떨어지게 허용

      this.time.delayedCall(1000, () => {
        enterBattleScene();
      });
    }

  } else if (cursors.right.isDown) {
    if(player.x <= backgroundWidth - 100) player.setVelocityX(640);
    player.anims.play('walk', true);
    player.setFlipX(true);
  } else {
    player.setVelocityX(0);
    player.anims.play('idle', true);
  }
}

fu
