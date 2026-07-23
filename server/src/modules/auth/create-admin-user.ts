import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

async function main() {
  const [, , username, password, role = 'admin'] = process.argv;
  if (!username || !password || password.length < 8) {
    throw new Error('用法：npm run content:admin:create-user -- <username> <password> [admin|editor|viewer]');
  }
  const prisma = new PrismaClient();
  await prisma.contentAdminUser.upsert({
    where: { username },
    create: { username, role: role as any, password_hash: await hash(password, 12) },
    update: { role: role as any, password_hash: await hash(password, 12), enabled: true },
  });
  await prisma.$disconnect();
  console.log(`管理员 ${username} 已创建或更新，密码未输出。`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
