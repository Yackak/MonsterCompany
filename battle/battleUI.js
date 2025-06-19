export function createSkillMenu(scene, playerX) {
  const skillNames = ['Smash', 'Pierce', 'Rocket Punch'];
  scene.skillImages = [];
  scene.selectedSkillIndex = 0;

  skillNames.forEach((_, i) => {
    const key = `skill_${i}_off`;
    const img = scene.add.image(playerX + 200, 250 + i * 65, key)
      .setInteractive()
      .setScale(0.3);
    img.on('pointerdown', () => scene.selectSkill(i));
    scene.skillImages.push(img);
  });

  scene.input.keyboard.on('keydown-UP', () => {
    scene.selectedSkillIndex = (scene.selectedSkillIndex + skillNames.length - 1) % skillNames.length;
    updateSkillSelection(scene);
  });

  scene.input.keyboard.on('keydown-DOWN', () => {
    scene.selectedSkillIndex = (scene.selectedSkillIndex + 1) % skillNames.length;
    updateSkillSelection(scene);
  });

  scene.input.keyboard.on('keydown-Z', () => {
    scene.selectSkill(scene.selectedSkillIndex);
  });

  updateSkillSelection(scene);
}

export function updateSkillSelection(scene) {
  scene.skillImages.forEach((img, i) => {
    const key = i === scene.selectedSkillIndex ? `skill_${i}_on` : `skill_${i}_off`;
    img.setTexture(key);
  });
}
