import fs from 'node:fs';
import path from 'node:path';

describe('Campaign node schema', () => {
  it('allows copied nodes to reuse a Stage inside one chapter', () => {
    const schema = fs.readFileSync(path.resolve(__dirname, '../prisma/schema.prisma'), 'utf8');
    const block = schema.slice(schema.indexOf('model ContentCampaignStageNode'), schema.indexOf('model ContentCampaignNodeConnection'));
    expect(block).not.toContain('@@unique([chapter_id, stage_id])');
    expect(block).toContain('@@index([chapter_id, stage_id])');
  });
});
