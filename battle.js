const battleConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: 692,
  parent: 'game-container',
  scene: {
    preload: preloadBattle,
    create: createBattle,
    update: updateBattle
  }
};

const battleGame = new Phaser.Game(battleConfig);

function preloadBattle() {
  this.load.image('battle_bg', 'assets/battle_background.png');
  this.load.image('player', 'assets/player.png');
  this.load.image('enemy', 'assets/enemy.png');
}

function createBattle() {
  this.add.image(0, 0, 'battle_bg').setOrigin(0, 0).setDisplaySize(window.innerWidth, 692);

  this.player = this.add.sprite(200, 500, 'player');
  this.enemy = this.add.sprite(800, 500, 'enemy');

  // 예시 텍스트
  this.add.text(50, 30, '전투 시작!', { fontSize: '32px', fill: '#fff' });
}

function updateBattle() {
  // 전투 업데이트 로직
}
