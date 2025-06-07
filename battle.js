class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'battle' }); // ← 이 key가 중요! 'battle'이어야 함
  }

  preload() {
    // 배틀에 필요한 이미지나 리소스 로드
    this.load.image('battle_bg', 'assets/battle_bg.png');
    // 캐릭터, 이펙트 등도 여기서 로드
  }

  create() {
    // 배경 띄우기
    this.add.image(0, 0, 'background_battle').setOrigin(0, 0);

    // 예시: 텍스트로 배틀 씬 표시
    this.add.text(400, 300, 'BATTLE START!', {
      fontSize: '48px',
      color: '#ff0000'
    }).setOrigin(0.5);
  }

  update() {
    // 전투 진행 로직
  }
}

export default BattleScene;
