const path = require('path');
const { validateCampaignAssets } = require('./check-campaign-assets-lib.cjs');

try {
  console.log('[CheckCampaign] 开始主线战役正式快照校验...');
  const result = validateCampaignAssets(path.resolve(__dirname, '..'));
  console.log(`[CheckCampaign] 通过。${result.message}`);
} catch (error) {
  console.error('[CheckCampaign] 失败：', error.message);
  process.exit(1);
}
