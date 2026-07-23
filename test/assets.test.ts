import assert from 'assert';
import { test } from 'node:test';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const ASSETS_DIR = path.resolve('assets');
const EXPECTED_ASSETS = {
  main_bg: { file: 'main_bg.png', width: 800, height: 1200, colorTypes: [3, 6, 2], maxKB: 700, requireTransparentPixel: false },
  player_mecha: { file: 'player_mecha.png', width: 128, height: 128, colorTypes: [6], maxKB: 250, requireTransparentPixel: true },
  enemy_rat: { file: 'enemy_rat.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  coin: { file: 'coin.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  part: { file: 'part.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  stone: { file: 'stone.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  equip_icon: { file: 'equip_icon.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  rune_icon: { file: 'rune_icon.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  skill_cannon: { file: 'skill_cannon.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  skill_shield: { file: 'skill_shield.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true }
};

const NEW_EXPECTED_ASSETS = {
  factory_bg: { file: 'factory_bg.png', width: 800, height: 1200, colorTypes: [3, 6, 2], maxKB: 700, requireTransparentPixel: false },
  enemy_fire_beetle: { file: 'enemy_fire_beetle.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  enemy_blaze_hound: { file: 'enemy_blaze_hound.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  enemy_magma_golem: { file: 'enemy_magma_golem.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  status_burn: { file: 'status_burn.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  chapter3_icon: { file: 'chapter3_icon.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  enemy_furnace_guard: { file: 'enemy_furnace_guard.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  skill_roar: { file: 'skill_roar.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  skill_fissure: { file: 'skill_fissure.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true }
};

const TASK15_EXPECTED_ASSETS = {
  equip_lava_cannon: { file: 'equip_lava_cannon.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  equip_lava_armor: { file: 'equip_lava_armor.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  equip_lava_core: { file: 'equip_lava_core.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  rune_fire_guard: { file: 'rune_fire_guard.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  ui_set_icon: { file: 'ui_set_icon.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true }
};

const TASK16_EXPECTED_ASSETS = {
  sewer_bg: { file: 'sewer_bg.png', width: 800, height: 1200, colorTypes: [3, 6, 2], maxKB: 700, requireTransparentPixel: false },
  enemy_beetle: { file: 'enemy_beetle.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  enemy_toxic: { file: 'enemy_toxic.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  enemy_elite_toxic: { file: 'enemy_elite_toxic.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  enemy_pollution_queen: { file: 'enemy_pollution_queen.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  enemy_elite_mouse: { file: 'enemy_elite_mouse.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  enemy_rat_king: { file: 'enemy_rat_king.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  equip_rusty_claw: { file: 'equip_rusty_claw.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  equip_neon_blaster: { file: 'equip_neon_blaster.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  equip_starcore_cannon: { file: 'equip_starcore_cannon.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  equip_patched_armor: { file: 'equip_patched_armor.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  equip_alloy_armor: { file: 'equip_alloy_armor.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  equip_sewer_guard: { file: 'equip_sewer_guard.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  equip_small_core: { file: 'equip_small_core.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  equip_neon_core: { file: 'equip_neon_core.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  equip_starcore_fragment: { file: 'equip_starcore_fragment.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  rune_cannon_rune: { file: 'rune_cannon_rune.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  rune_shield_rune: { file: 'rune_shield_rune.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  rune_poison_guard: { file: 'rune_poison_guard.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  status_poison: { file: 'status_poison.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true }
};

const TASK17_EXPECTED_ASSETS = {
  ui_tutorial_arrow: { file: 'ui_tutorial_arrow.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  ui_tutorial_move: { file: 'ui_tutorial_move.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  ui_tutorial_skill: { file: 'ui_tutorial_skill.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true },
  ui_tutorial_equip: { file: 'ui_tutorial_equip.png', width: 64, height: 64, colorTypes: [6], maxKB: 100, requireTransparentPixel: true }
};


interface PngInfo {
  width: number;
  height: number;
  colorType: number;
}

function parsePngHeader(filePath: string): PngInfo {
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(29);
  fs.readSync(fd, buffer, 0, 29, 0);
  fs.closeSync(fd);

  // 验证 PNG 签名
  const pngSig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  for (let i = 0; i < 8; i++) {
    if (buffer[i] !== pngSig[i]) {
      throw new Error(`Invalid PNG signature in ${path.basename(filePath)}`);
    }
  }

  // 验证 IHDR chunk type
  const ihdrType = buffer.toString('ascii', 12, 16);
  if (ihdrType !== 'IHDR') {
    throw new Error(`Missing IHDR chunk in ${path.basename(filePath)}`);
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const colorType = buffer[25];

  return { width, height, colorType };
}

function hasTransparentPixel(filePath: string): boolean {
  const buf = fs.readFileSync(filePath);
  
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idatBuffers: Buffer[] = [];
  
  while (offset < buf.length) {
    if (offset + 8 > buf.length) break;
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    
    if (offset + 8 + length > buf.length) break;
    const data = buf.subarray(offset + 8, offset + 8 + length);
    
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatBuffers.push(data);
    } else if (type === 'IEND') {
      break;
    }
    
    offset += 12 + length;
  }
  
  if (colorType !== 6) {
    return false;
  }
  
  const idatBuf = Buffer.concat(idatBuffers);
  const decompressed = zlib.inflateSync(idatBuf);
  
  const bytesPerPixel = 4; // RGBA
  const stride = 1 + width * bytesPerPixel;
  
  if (decompressed.length !== height * stride) {
    throw new Error(`Decompressed size mismatch in ${path.basename(filePath)}`);
  }
  
  let priorRecon = Buffer.alloc(width * bytesPerPixel);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    const filterType = decompressed[rowOffset];
    const recon = Buffer.alloc(width * bytesPerPixel);
    
    for (let x = 0; x < width * bytesPerPixel; x++) {
      const val = decompressed[rowOffset + 1 + x];
      let reconVal = 0;
      
      if (filterType === 0) {
        reconVal = val;
      } else if (filterType === 1) {
        const left = x >= bytesPerPixel ? recon[x - bytesPerPixel] : 0;
        reconVal = (val + left) & 0xFF;
      } else if (filterType === 2) {
        const up = priorRecon[x];
        reconVal = (val + up) & 0xFF;
      } else if (filterType === 3) {
        const left = x >= bytesPerPixel ? recon[x - bytesPerPixel] : 0;
        const up = priorRecon[x];
        reconVal = (val + Math.floor((left + up) / 2)) & 0xFF;
      } else if (filterType === 4) {
        const left = x >= bytesPerPixel ? recon[x - bytesPerPixel] : 0;
        const up = priorRecon[x];
        const leftUp = x >= bytesPerPixel ? priorRecon[x - bytesPerPixel] : 0;
        
        const p = left + up - leftUp;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - leftUp);
        
        let pr = 0;
        if (pa <= pb && pa <= pc) {
          pr = left;
        } else if (pb <= pc) {
          pr = up;
        } else {
          pr = leftUp;
        }
        reconVal = (val + pr) & 0xFF;
      } else {
        throw new Error(`Unknown filter type: ${filterType}`);
      }
      
      recon[x] = reconVal;
    }
    
    for (let col = 0; col < width; col++) {
      const alphaVal = recon[col * bytesPerPixel + 3];
      if (alphaVal < 255) {
        return true;
      }
    }
    
    priorRecon = recon;
  }
  
  return false;
}

test('真实资产规格与透明通道校验测试', async (t) => {
  let totalBytes = 0;
  let newTotalBytes = 0;
  let task15TotalBytes = 0;

  for (const [key, conf] of Object.entries(EXPECTED_ASSETS)) {
    await t.test(`校验资源 [${key}] - ${conf.file}`, () => {
      const filePath = path.join(ASSETS_DIR, conf.file);
      
      // 1. 存在性校验
      assert.ok(fs.existsSync(filePath), `文件 ${conf.file} 不存在`);
      
      // 2. 体积校验
      const stats = fs.statSync(filePath);
      totalBytes += stats.size;
      const sizeKB = stats.size / 1024;
      assert.ok(sizeKB <= conf.maxKB, `文件大小为 ${sizeKB.toFixed(1)}KB, 超过单文件阈值 ${conf.maxKB}KB`);

      // 3. PNG头校验
      const info = parsePngHeader(filePath);
      assert.strictEqual(info.width, conf.width, `宽度不符: 期望 ${conf.width}, 实际 ${info.width}`);
      assert.strictEqual(info.height, conf.height, `高度不符: 期望 ${conf.height}, 实际 ${info.height}`);
      
      // 4. 透明通道与颜色类型校验
      assert.ok(conf.colorTypes.includes(info.colorType), `颜色类型不符: 实际 ${info.colorType}`);
      
      // 5. 真实透明像素深度校验
      if (conf.requireTransparentPixel) {
        const hasTransparent = hasTransparentPixel(filePath);
        assert.ok(hasTransparent, `文件 ${conf.file} 没有检测到任何真实的透明像素 (Alpha < 255)`);
      }
    });
  }

  for (const [key, conf] of Object.entries(NEW_EXPECTED_ASSETS)) {
    await t.test(`校验第三章新增资源 [${key}] - ${conf.file}`, () => {
      const filePath = path.join(ASSETS_DIR, conf.file);
      
      // 1. 存在性校验
      assert.ok(fs.existsSync(filePath), `文件 ${conf.file} 不存在`);
      
      // 2. 体积校验
      const stats = fs.statSync(filePath);
      newTotalBytes += stats.size;
      const sizeKB = stats.size / 1024;
      assert.ok(sizeKB <= conf.maxKB, `文件大小为 ${sizeKB.toFixed(1)}KB, 超过单文件阈值 ${conf.maxKB}KB`);

      // 3. PNG头校验
      const info = parsePngHeader(filePath);
      assert.strictEqual(info.width, conf.width, `宽度不符: 期望 ${conf.width}, 实际 ${info.width}`);
      assert.strictEqual(info.height, conf.height, `高度不符: 期望 ${conf.height}, 实际 ${info.height}`);
      
      // 4. 透明通道与颜色类型校验
      assert.ok(conf.colorTypes.includes(info.colorType), `颜色类型不符: 实际 ${info.colorType}`);
      
      // 5. 真实透明像素深度校验
      if (conf.requireTransparentPixel) {
        const hasTransparent = hasTransparentPixel(filePath);
        assert.ok(hasTransparent, `文件 ${conf.file} 没有检测到任何真实的透明像素 (Alpha < 255)`);
      }
    });
  }

  for (const [key, conf] of Object.entries(TASK15_EXPECTED_ASSETS)) {
    await t.test(`校验任务15新增资源 [${key}] - ${conf.file}`, () => {
      const filePath = path.join(ASSETS_DIR, conf.file);
      
      // 1. 存在性校验
      assert.ok(fs.existsSync(filePath), `文件 ${conf.file} 不存在`);
      
      // 2. 体积校验
      const stats = fs.statSync(filePath);
      task15TotalBytes += stats.size;
      const sizeKB = stats.size / 1024;
      assert.ok(sizeKB <= conf.maxKB, `文件大小为 ${sizeKB.toFixed(1)}KB, 超过单文件阈值 ${conf.maxKB}KB`);

      // 3. PNG头校验
      const info = parsePngHeader(filePath);
      assert.strictEqual(info.width, conf.width, `宽度不符: 期望 ${conf.width}, 实际 ${info.width}`);
      assert.strictEqual(info.height, conf.height, `高度不符: 期望 ${conf.height}, 实际 ${info.height}`);
      
      // 4. 透明通道与颜色类型校验
      assert.ok(conf.colorTypes.includes(info.colorType), `颜色类型不符: 实际 ${info.colorType}`);
      
      // 5. 真实透明像素深度校验
      if (conf.requireTransparentPixel) {
        const hasTransparent = hasTransparentPixel(filePath);
        assert.ok(hasTransparent, `文件 ${conf.file} 没有检测到任何真实的透明像素 (Alpha < 255)`);
      }
    });
  }

  let task16TotalBytes = 0;
  for (const [key, conf] of Object.entries(TASK16_EXPECTED_ASSETS)) {
    await t.test(`校验任务16新增资源 [${key}] - ${conf.file}`, () => {
      const filePath = path.join(ASSETS_DIR, conf.file);
      
      // 1. 存在性校验
      assert.ok(fs.existsSync(filePath), `文件 ${conf.file} 不存在`);
      
      // 2. 体积校验
      const stats = fs.statSync(filePath);
      task16TotalBytes += stats.size;
      const sizeKB = stats.size / 1024;
      assert.ok(sizeKB <= conf.maxKB, `文件大小为 ${sizeKB.toFixed(1)}KB, 超过单文件阈值 ${conf.maxKB}KB`);

      // 3. PNG头校验
      const info = parsePngHeader(filePath);
      assert.strictEqual(info.width, conf.width, `宽度不符: 期望 ${conf.width}, 实际 ${info.width}`);
      assert.strictEqual(info.height, conf.height, `高度不符: 期望 ${conf.height}, 实际 ${info.height}`);
      
      // 4. 透明通道与颜色类型校验
      assert.ok(conf.colorTypes.includes(info.colorType), `颜色类型不符: 实际 ${info.colorType}`);
      
      // 5. 真实透明像素深度校验
      if (conf.requireTransparentPixel) {
        const hasTransparent = hasTransparentPixel(filePath);
        assert.ok(hasTransparent, `文件 ${conf.file} 没有检测到任何真实的透明像素 (Alpha < 255)`);
      }
    });
  }

  let task17TotalBytes = 0;
  for (const [key, conf] of Object.entries(TASK17_EXPECTED_ASSETS)) {
    await t.test(`校验任务17新增资源 [${key}] - ${conf.file}`, () => {
      const filePath = path.join(ASSETS_DIR, conf.file);
      
      // 1. 存在性校验
      assert.ok(fs.existsSync(filePath), `文件 ${conf.file} 不存在`);
      
      // 2. 体积校验
      const stats = fs.statSync(filePath);
      task17TotalBytes += stats.size;
      const sizeKB = stats.size / 1024;
      assert.ok(sizeKB <= conf.maxKB, `文件大小为 ${sizeKB.toFixed(1)}KB, 超过单文件阈值 ${conf.maxKB}KB`);

      // 3. PNG头校验
      const info = parsePngHeader(filePath);
      assert.strictEqual(info.width, conf.width, `宽度不符: 期望 ${conf.width}, 实际 ${info.width}`);
      assert.strictEqual(info.height, conf.height, `高度不符: 期望 ${conf.height}, 实际 ${info.height}`);
      
      // 4. 透明通道与颜色类型校验
      assert.ok(conf.colorTypes.includes(info.colorType), `颜色类型不符: 实际 ${info.colorType}`);
      
      // 5. 真实透明像素深度校验
      if (conf.requireTransparentPixel) {
        const hasTransparent = hasTransparentPixel(filePath);
        assert.ok(hasTransparent, `文件 ${conf.file} 没有检测到任何真实的透明像素 (Alpha < 255)`);
      }
    });
  }

  await t.test('校验总文件大小是否在2MB限制内', () => {
    const grandTotal = totalBytes + newTotalBytes + task15TotalBytes + task16TotalBytes + task17TotalBytes;
    const totalMB = grandTotal / (1024 * 1024);
    assert.ok(totalMB <= 2.0, `总大小为 ${totalMB.toFixed(2)}MB, 超过 2MB`);
  });

  await t.test('断言资产清单各项合计与文件数量严格一致', () => {
    // 1. 基础资产 (10张)
    assert.strictEqual(totalBytes, 748218, `基础资产总字节数不符: 实际 ${totalBytes}, 期望 748218`);
    
    // 2. 新增资产 (9张)
    assert.strictEqual(newTotalBytes, 7055, `新增资产总字节数不符: 实际 ${newTotalBytes}, 期望 7055`);

    // 3. 任务15新增资产 (5张)
    assert.strictEqual(task15TotalBytes, 2219, `任务15新增资产总字节数不符: 实际 ${task15TotalBytes}, 期望 2219`);

    // 4. 任务16新增资产 (20张)
    assert.strictEqual(task16TotalBytes, 9730, `任务16新增资产总字节数不符: 实际 ${task16TotalBytes}, 期望 9730`);
    
    // 5. 任务17新增资产 (4张)
    assert.strictEqual(task17TotalBytes, 976, `任务17新增资产总字节数不符: 实际 ${task17TotalBytes}, 期望 976`);

    // 6. 全部资产 (48张)
    const grandTotal = totalBytes + newTotalBytes + task15TotalBytes + task16TotalBytes + task17TotalBytes;
    assert.strictEqual(grandTotal, 768198, `全部资产总字节数不符: 实际 ${grandTotal}, 期望 768198`);

    // 7. 文件数量为 48
    const expectedCount = Object.keys(EXPECTED_ASSETS).length + Object.keys(NEW_EXPECTED_ASSETS).length + Object.keys(TASK15_EXPECTED_ASSETS).length + Object.keys(TASK16_EXPECTED_ASSETS).length + Object.keys(TASK17_EXPECTED_ASSETS).length;
    assert.strictEqual(expectedCount, 48, `期望的文件数量不符: 实际 ${expectedCount}, 期望 48`);
  });
});
