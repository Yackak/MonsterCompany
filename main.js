let player;
let cursors;
let background;
let backgroundWidth;
let backgroundHeight;
let maxX;

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
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('background', 'assets/background.png');  // 첫 번째 배경

  for (let i = 0; i <= 16; i++) {
    this.load.image(`standing_${i}`, `assets/standing_${i}.png`);
  }
  for (let i = 0; i <= 7; i++) {
    this.load.image(`running_${i}`, `assets/running_${i}.png`);
  }
}

function create() {
  // 첫 번째 배경 이미지 로드
  background = this.add.image(0, 0, 'background').setOrigin(0, 0);

  // 배경 크기 계산
  backgroundWidth = background.displayWidth;
  backgroundHeight = background.displayHeight;

  // 배경 비율 계산
  const aspectRatio = backgroundWidth / backgroundHeight;
  const newHeight = 692;
  const newWidth = newHeight * aspectRatio;

  background.setDisplaySize(newWidth, newHeight);

  // 배경의 최대 X 위치 설정
  maxX = newWidth * 2;

  // 월드 크기 설정
  this.physics.world.setBounds(0, 0, maxX, newHeight);

  // 플레이어 생성
  player = this.physics.add.sprite(100, 600, 'standing_0');
  player.setScale(0.2);
  player.setCollideWorldBounds(true);

  // 플레이어를 맵 가장 아래에 위치시키기
  player.y = background.displayHeight - player.displayHeight / 2;

  cursors = this.input.keyboard.createCursorKeys();

  // 달리기 애니메이션
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

  // 정지 애니메이션
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

  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, newWidth, newHeight);  // 카메라 범위 설정

  // 리사이즈 대응
  window.addEventListener('resize', () => {
    const newHeight = 692;
    const newWidth = newHeight * aspectRatio;
    game.scale.resize(window.innerWidth, 692);
    background.setDisplaySize(newWidth, newHeight);
    this.physics.world.setBounds(0, 0, maxX, newHeight);
  });
}

function update() {
  // 캐릭터 이동
  if (cursors.left.isDown) {
    player.setVelocityX(-640);
    player.anims.play('walk', true);
    player.setFlipX(false);
  } else if (cursors.right.isDown) {
    player.setVelocityX(640);
    player.anims.play('walk', true);
    player.setFlipX(true);

    // 배경 전환 처리
    if (player.x >= background.displayWidth - 100) {  // 캐릭터가 오른쪽 끝에 도달했을 때

      //전투 장면 전환 필요
      
    }
  } else {
    player.setVelocityX(0);
    player.anims.play('idle', true);
  }
}
