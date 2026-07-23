const fs = require('fs');
const path = require('path');

const repoPath = path.join(__dirname, '..', 'dist', 'content', 'repositories', 'LocalContentRepository.js');
const validatorPath = path.join(__dirname, '..', 'dist', 'content', 'validation', 'ContentValidator.js');

if (!fs.existsSync(repoPath) || !fs.existsSync(validatorPath)) {
  console.error('未找到内容配置编译产物，请先运行 npm run build。');
  process.exit(1);
}

const { LocalContentRepository } = require(repoPath);
const { validateContentData } = require(validatorPath);

async function main() {
  console.log('[CheckContent] 开始内容模板配置校验...');
  const repo = new LocalContentRepository();
  const data = {
    enemies: await repo.loadEnemies(),
    backgrounds: await repo.loadBackgrounds(),
    heroes: await repo.loadHeroVisuals(),
    stages: await repo.loadStages(),
  };
  const result = validateContentData(data);
  if (!result.valid) {
    for (const error of result.errors) {
      console.error(`[ContentError] ${error.file} ${error.objectId}.${error.field}: ${error.reason}`);
    }
    console.error(`[CheckContent] 失败，共 ${result.errors.length} 个错误。`);
    process.exit(1);
  }
  console.log(`[CheckContent] 通过。EnemyTemplate ${data.enemies.length}，BackgroundTheme ${data.backgrounds.length}，HeroVisualTemplate ${data.heroes.length}，StageDefinition ${data.stages.length}。`);
}

main().catch(error => {
  console.error('[CheckContent] 运行失败：', error);
  process.exit(1);
});
