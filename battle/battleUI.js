Phaser.Scene.prototype.toggleSkillMenu = function () {
  this.skillMenuVisible = !this.skillMenuVisible;
  if (this.hpUIElements) {
    this.hpUIElements.forEach(el => el.setVisible(!this.skillMenuVisible)); // 반대로!
  }
  this.skillMenuElements.forEach(el => el.setVisible(this.skillMenuVisible));

  // 스킬창 ON/OFF 상태와 무관하게 설명창은 항상 꺼지게 설정
  this.skillDescBox.setVisible(false);
  this.skillDescText.setVisible(false);
};


export function createSkillMenu(scene, x = 200, y = 200) {
  const skillNames = ['강타', '관통샷', '로켓 펀치'];
  const skillDescriptions = [
    '가장 앞에 있는 적에게 2 데미지를 줍니다.',
    '모든 적을 관통하여 1 데미지를 줍니다.',
    '적 하나를 선택하여 1 데미지를 주고 즉시 행동합니다.'
  ];

  scene.skillMenuGraphics = scene.add.graphics();
  scene.skillTextList = [];
  scene.selectedSkillIndex = 0;

  const boxWidth = 220;
  const boxHeight = skillNames.length * 35 + 20;

  // 메뉴 배경
  scene.skillMenuGraphics.fillStyle(0x000000, 0.7);
  scene.skillMenuGraphics.fillRoundedRect(x, y, boxWidth, boxHeight, 15);
  scene.skillMenuGraphics.lineStyle(2, 0xffffff);
  scene.skillMenuGraphics.strokeRoundedRect(x, y, boxWidth, boxHeight, 15);

  // 스킬 텍스트
  skillNames.forEach((name, i) => {
    const txt = scene.add.text(x + 20, y + 15 + i * 35, name, {
      font: '18px Arial',
      fill: '#ffffff'
    });
    scene.skillTextList.push(txt);
  });

  // 선택 강조 바 (투명도 0.5)
  scene.skillHighlight = scene.add.rectangle(
    x + 10, y + 12 + 0 * 35,
    boxWidth - 20, 30,
    0x114477, 0.5  // ✅ 투명도 적용
  ).setOrigin(0, 0);
  scene.skillHighlight.setStrokeStyle(2, 0xffff00);
  scene.skillHighlight.setDepth(1);

  // 설명창
  scene.skillDescBox = scene.add.graphics();
  scene.skillDescBox.fillStyle(0x000000, 0.85);
  scene.skillDescBox.fillRoundedRect(x + boxWidth + 30, y + 20, 220, 70, 10);
  scene.skillDescBox.lineStyle(2, 0xffffff);
  scene.skillDescBox.strokeRoundedRect(x + boxWidth + 30, y + 20, 220, 70, 10);

  scene.skillDescText = scene.add.text(x + boxWidth + 40, y + 30, '', {
    font: '14px Arial',
    fill: '#ffffff',
    wordWrap: { width: 200 }
  });

  scene.skillDescBox.setVisible(false);
  scene.skillDescText.setVisible(false);

  // 키보드 입력
  scene.input.keyboard.on('keydown-UP', () => {
    scene.selectedSkillIndex = (scene.selectedSkillIndex + skillNames.length - 1) % skillNames.length;
    updateSkillSelection(scene, skillDescriptions);
  });

  scene.input.keyboard.on('keydown-DOWN', () => {
    scene.selectedSkillIndex = (scene.selectedSkillIndex + 1) % skillNames.length;
    updateSkillSelection(scene, skillDescriptions);
  });

  scene.input.keyboard.on('keydown-Z', () => {
    if (!scene.skillMenuVisible) {
      scene.toggleSkillMenu();  // 꺼져 있으면 켜기
    } else {
      scene.selectSkill(scene.selectedSkillIndex);  // 스킬 실행
    }
  });

  scene.input.keyboard.on('keydown-SHIFT', () => {
    scene.skillDescBox.setVisible(true);
    scene.skillDescText.setVisible(true);
  });

  scene.input.keyboard.on('keyup-SHIFT', () => {
    scene.skillDescBox.setVisible(false);
    scene.skillDescText.setVisible(false);
  });

  scene.input.keyboard.on('keydown-X', () => {
    if (!scene.skillMenuVisible) {
      scene.toggleSkillMenu();  // 꺼져 있으면 켜기
    } else {
      scene.toggleSkillMenu();  // 켜져 있으면 끄기
    }
  });


  updateSkillSelection(scene, skillDescriptions);

  scene.skillMenuVisible = true;
  scene.skillMenuElements = [
    scene.skillMenuGraphics,
    scene.skillHighlight,
    ...scene.skillTextList,
    scene.skillDescBox,
    scene.skillDescText
  ];

}



export function updateSkillSelection(scene, descriptions) {
  const i = scene.selectedSkillIndex;
  scene.skillHighlight.y = scene.skillTextList[i].y - 3;
  scene.skillDescText.setText(descriptions[i]);
}

export function createHpBar(scene, unit) {
  const barWidth = 60;
  const barHeight = 8;
  const x = unit.sprite.x - barWidth / 2;
  const y = unit.sprite.y - unit.sprite.displayHeight / 2 - 20;

  const bg = scene.add.rectangle(x, y, barWidth, barHeight, 0x000000).setOrigin(0, 0.5).setVisible(false);
  const hpBar = scene.add.rectangle(x + 1, y, barWidth - 2, barHeight - 2, 0xff0000).setOrigin(0, 0.5).setVisible(false);
  const hpText = scene.add.text(x, y - 12, `hp ${unit.hp}`, {
    font: '12px Arial',
    fill: '#ffffff'
  }).setVisible(false);

  unit.hpUI = { bg, hpBar, hpText, width: barWidth - 2 };

  // ✅ 전체 HP UI를 배열에 저장 (전역 관리용)
  if (!scene.hpUIElements) scene.hpUIElements = [];
  scene.hpUIElements.push(bg, hpBar, hpText);

  scene.events.on('update', () => {
    const px = unit.sprite.x - barWidth / 2;
    const py = unit.sprite.y - unit.sprite.displayHeight / 2 - 20;
    bg.setPosition(px, py);
    hpBar.setPosition(px + 1, py);
    hpText.setPosition(px, py - 12);
  });

  updateHpBar(unit);
}


export function updateHpBar(unit) {
  if (!unit.hpUI) return;
  const { hpBar, hpText, width } = unit.hpUI;
  const maxHp = unit.maxHp || unit.hp;
  const ratio = Math.max(0, unit.hp / maxHp);

  hpBar.width = width * ratio;
  hpText.setText(`hp ${unit.hp}`);
}
