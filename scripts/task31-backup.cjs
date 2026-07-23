'use strict';
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../server/node_modules/@prisma/client');
require('../server/node_modules/dotenv').config({ path: path.resolve(__dirname, '../server/.env') });

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'content-store', 'backups', `20260720_task31_pre_release_${Date.now()}.json`);
const excluded = new Set(['content_admin_user']);

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRawUnsafe("SHOW TABLES LIKE 'content\\_%'");
    const tables = rows.map(Object.values).flat().filter(name => /^content_[a-z0-9_]+$/i.test(name) && !excluded.has(name)).sort();
    const data = {};
    for (const table of tables) data[table] = await prisma.$queryRawUnsafe(`SELECT * FROM \`${table}\``);
    const state = await prisma.contentSystemState.findUnique({ where: { id: 'singleton' } });
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, JSON.stringify({ createdAt: new Date().toISOString(), scope: 'content tables only; credentials excluded', state, tables, data }, null, 2));
    console.log(JSON.stringify({ output: path.relative(root, output), tableCount: tables.length, currentReleaseId: state?.current_release_id }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
