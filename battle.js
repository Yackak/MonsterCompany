export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'battle' });
  }

  preload() {
    this.load.image('background_battle', 'assets/background_battle.png');
  }

  create() {
    console.log("22:39");

    // 배경을 윈도우 크기에 맞춰 리사이즈
    const bg = this.add.image(0, 0, 'background_battle').setOrigin(0, 0);
    bg.setDisplaySize(window.innerWidth, window.innerHeight);

    // 텍스트도 중앙에 위치
    this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'BATTLE START!', {
      fontSize: '48px',
      color: '#ff0000'
    }).setOrigin(0.5);
  }

  update() {
    // 전투 진행 로직
  }
}
