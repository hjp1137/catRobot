// 微信小游戏入口：引导编译后的 TypeScript 产物
// （src/*.ts 由 tsc 编译为 dist/*.js，CommonJS 模块）
// bootstrap 在此触发；main.ts 本身不自动执行，便于单测 import。
const { bootstrap } = require('./dist/main');
bootstrap();
