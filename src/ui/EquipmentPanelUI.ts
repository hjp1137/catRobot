import { IContext, ICanvas2D } from '../engine/IContext';
import { GameManager } from '../core/GameManager';
import { Button, pollButtonTap, drawButton, drawPanel, drawTitle, drawResourceHeader, drawBadge } from './UIWidgets';
import { Theme } from '../render/Theme';
import { fillRoundRect, strokeRoundRect, verticalGradient, text, circle } from '../render/DrawUtils';
import {
  EquipmentSlot, SLOT_NAME, RARITY_COLOR, RARITY_NAME, getEquipmentConfig, EQUIPMENT_SETS
} from '../data/EquipmentConfig';
import { getRuneConfig } from '../data/RuneConfig';
import { getEquippedInSlot, getEquippedRunes, getEquippedItems } from '../data/EquipmentCalc';
import {
  sortEquipmentItems, getEnhanceCost, getDisassembleReward, getMaxEnhanceLevel
} from '../data/EquipmentEnhance';
import { ResourceManager } from '../core/ResourceManager';
import { resolveAssetKey } from '../core/AssetResolver';

const SLOTS: EquipmentSlot[] = ['weapon', 'armor', 'core'];

export class EquipmentPanelUI {
  private backBtn!: Button;
  private slotAreas: { slot: EquipmentSlot; x: number; y: number; w: number; h: number }[] = [];
  /** 背包装备卡片点击区（uid + 区域） */
  private invAreas: { uid: string; x: number; y: number; w: number; h: number; isEquipped: boolean }[] = [];
  private runeAreas: { uid: string; x: number; y: number; w: number; h: number; isEquipped: boolean }[] = [];
  private runeSlotAreas: { index: number; x: number; y: number; w: number; h: number }[] = [];

  private selectedItem: import('../data/EquipmentData').EquipmentInstance | null = null;
  private selectedIsEquipped = false;
  private btnEquip = { x: 0, y: 0, w: 0, h: 0 };
  private btnEnhance = { x: 0, y: 0, w: 0, h: 0 };
  private btnDisassemble = { x: 0, y: 0, w: 0, h: 0 };
  private btnClose = { x: 0, y: 0, w: 0, h: 0 };
  private errMsg = '';
  private errMsgTime = 0;

  // 任务11：筛选、分页和反馈状态
  private slotFilter: 'all' | 'weapon' | 'armor' | 'core' = 'all';
  private rarityFilter: 'all' | 'common' | 'rare' | 'epic' = 'all';
  private currentPage = 0;
  private pageSize = 6;
  private toastMsg = '';
  private toastTime = 0;

  // 详情弹窗新增锁定按钮定义
  private btnToggleLock = { x: 0, y: 0, w: 0, h: 0 };
  // 主面板翻页按钮定义
  private btnPrevPage = { x: 0, y: 0, w: 0, h: 0 };
  private btnNextPage = { x: 0, y: 0, w: 0, h: 0 };
  // 筛选按钮点击区
  private filterSlotAreas: { id: string; x: number; y: number; w: number; h: number }[] = [];
  private filterRarityAreas: { id: string; x: number; y: number; w: number; h: number }[] = [];

  constructor(private ctx: IContext, private game: GameManager) {
    this.layout();
  }

  private layout(): void {
    const w = this.ctx.canvasWidth;
    this.backBtn = { id: 'back', label: '返回车库', x: 16, y: 16, w: 90, h: 44, color: Theme.color.grayDark };
  }

  handleClick(): void {
    this.layout();
    if (pollButtonTap(this.ctx, [this.backBtn])) { this.game.backToMenu(); return; }

    const { tapX, tapY } = this.ctx.input;
    if (tapX === null || tapY === null) return;
    if (this.selectedItem) {
      this.handleDialogClick(tapX, tapY);
    } else {
      this.handlePanelClick(tapX, tapY);
    }
  }

  private handleDialogClick(tapX: number, tapY: number): void {
    this.ctx.input.consumeTap();
    const item = this.selectedItem!;
    const uid = item.uid;
    const isEq = this.selectedIsEquipped;

    // 1. 穿戴/卸下
    if (tapX >= this.btnEquip.x && tapX <= this.btnEquip.x + this.btnEquip.w &&
        tapY >= this.btnEquip.y && tapY <= this.btnEquip.y + this.btnEquip.h) {
      const cfg = getEquipmentConfig(item.configId);
      if (cfg) {
        if (isEq) {
          this.game.doUnequipSlot(cfg.slot);
          this.toastMsg = `已卸下：${cfg.name}`;
        } else {
          const ok = this.game.doEquipItem(uid);
          if (ok) this.toastMsg = `已穿戴：${cfg.name}`;
        }
        this.toastTime = 1.5;
      }
      this.selectedItem = null;
      return;
    }

    // 2. 强化
    if (tapX >= this.btnEnhance.x && tapX <= this.btnEnhance.x + this.btnEnhance.w &&
        tapY >= this.btnEnhance.y && tapY <= this.btnEnhance.y + this.btnEnhance.h) {
      const res = this.game.doEnhanceEquipment(uid);
      if (res.ok) {
        const updated = this.game.player.equipmentInventory.items.find(i => i.uid === uid);
        if (updated) {
          this.selectedItem = updated;
          const cfg = getEquipmentConfig(updated.configId);
          if (cfg) this.toastMsg = `强化成功：${cfg.name} +${updated.level}`;
          this.toastTime = 1.5;
        }
      } else {
        if (res.reason === 'not_enough_gold') this.errMsg = '金币不足';
        else if (res.reason === 'not_enough_material') this.errMsg = '强化石不足';
        else if (res.reason === 'max_level') this.errMsg = '已达最高强化等级';
        else this.errMsg = '强化失败';
        this.errMsgTime = 1.2;
      }
      return;
    }

    // 3. 锁定/解锁 (仅未穿戴可用)
    if (!isEq && tapX >= this.btnToggleLock.x && tapX <= this.btnToggleLock.x + this.btnToggleLock.w &&
        tapY >= this.btnToggleLock.y && tapY <= this.btnToggleLock.y + this.btnToggleLock.h) {
      const res = this.game.doToggleEquipmentLock(uid);
      if (res.ok) {
        const updated = this.game.player.equipmentInventory.items.find(i => i.uid === uid);
        if (updated) {
          this.selectedItem = updated;
          const cfg = getEquipmentConfig(updated.configId);
          if (cfg) {
            this.toastMsg = updated.locked ? `已锁定：${cfg.name}` : `已解锁：${cfg.name}`;
            this.toastTime = 1.5;
          }
        }
      }
      return;
    }

    // 4. 分解
    if (!isEq && tapX >= this.btnDisassemble.x && tapX <= this.btnDisassemble.x + this.btnDisassemble.w &&
        tapY >= this.btnDisassemble.y && tapY <= this.btnDisassemble.y + this.btnDisassemble.h) {
      if (item.locked) {
        this.errMsg = '装备已锁定，无法分解';
        this.errMsgTime = 1.2;
        return;
      }
      const cfg = getEquipmentConfig(item.configId);
      const reward = getDisassembleReward(item);
      const res = this.game.doDisassembleEquipment(uid);
      if (res.ok && cfg) {
        this.selectedItem = null;
        this.toastMsg = `已分解：${cfg.name}，获得强化石 +${reward.enhanceStone}`;
        this.toastTime = 1.5;
        this.autoPageFallback();
      } else {
        this.errMsg = '分解失败';
        this.errMsgTime = 1.2;
      }
      return;
    }

    // 5. 关闭
    if (tapX >= this.btnClose.x && tapX <= this.btnClose.x + this.btnClose.w &&
        tapY >= this.btnClose.y && tapY <= this.btnClose.y + this.btnClose.h) {
      this.selectedItem = null;
    }
  }

  private handlePanelClick(tapX: number, tapY: number): void {
    // 1. 槽位筛选点击
    for (const a of this.filterSlotAreas) {
      if (tapX >= a.x && tapX <= a.x + a.w && tapY >= a.y && tapY <= a.y + a.h) {
        this.ctx.input.consumeTap();
        this.slotFilter = a.id as any;
        this.currentPage = 0;
        this.errMsg = '';
        return;
      }
    }
    // 2. 品质筛选点击
    for (const a of this.filterRarityAreas) {
      if (tapX >= a.x && tapX <= a.x + a.w && tapY >= a.y && tapY <= a.y + a.h) {
        this.ctx.input.consumeTap();
        this.rarityFilter = a.id as any;
        this.currentPage = 0;
        this.errMsg = '';
        return;
      }
    }
    // 3. 上一页
    if (tapX >= this.btnPrevPage.x && tapX <= this.btnPrevPage.x + this.btnPrevPage.w &&
        tapY >= this.btnPrevPage.y && tapY <= this.btnPrevPage.y + this.btnPrevPage.h) {
      this.ctx.input.consumeTap();
      if (this.currentPage > 0) this.currentPage--;
      return;
    }
    // 4. 下一页
    if (tapX >= this.btnNextPage.x && tapX <= this.btnNextPage.x + this.btnNextPage.w &&
        tapY >= this.btnNextPage.y && tapY <= this.btnNextPage.y + this.btnNextPage.h) {
      this.ctx.input.consumeTap();
      const filtered = this.getFilteredItems();
      const totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
      if (this.currentPage < totalPages - 1) this.currentPage++;
      return;
    }
    // 5. 装备槽位：点击打开详情
    for (const a of this.slotAreas) {
      if (tapX >= a.x && tapX <= a.x + a.w && tapY >= a.y && tapY <= a.y + a.h) {
        const equipped = getEquippedInSlot(this.game.player, a.slot);
        if (equipped) {
          this.ctx.input.consumeTap();
          this.selectedItem = equipped;
          this.selectedIsEquipped = true;
          this.errMsg = '';
        }
        return;
      }
    }
    // 6. 背包装备：点击打开详情
    for (const a of this.invAreas) {
      if (tapX >= a.x && tapX <= a.x + a.w && tapY >= a.y && tapY <= a.y + a.h) {
        this.ctx.input.consumeTap();
        const item = this.game.player.equipmentInventory.items.find(i => i.uid === a.uid);
        if (item) {
          this.selectedItem = item;
          this.selectedIsEquipped = a.isEquipped;
          this.errMsg = '';
        }
        return;
      }
    }
    // 7. 符文槽位：点击卸下 (保持不变)
    for (const a of this.runeSlotAreas) {
      if (tapX >= a.x && tapX <= a.x + a.w && tapY >= a.y && tapY <= a.y + a.h) {
        const runes = getEquippedRunes(this.game.player);
        if (runes[a.index]) {
          this.ctx.input.consumeTap();
          this.game.doUnequipRune(runes[a.index].uid);
        }
        return;
      }
    }
    // 8. 符文背包：点击装备 (保持不变)
    for (const a of this.runeAreas) {
      if (tapX >= a.x && tapX <= a.x + a.w && tapY >= a.y && tapY <= a.y + a.h) {
        if (!a.isEquipped) {
          this.ctx.input.consumeTap();
          this.game.doEquipRune(a.uid);
        }
        return;
      }
    }
  }

  private autoPageFallback(): void {
    const filtered = this.getFilteredItems();
    const maxPage = Math.max(0, Math.ceil(filtered.length / this.pageSize) - 1);
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
  }

  private getFilteredItems(): import('../data/EquipmentData').EquipmentInstance[] {
    const inv = this.game.player.equipmentInventory;
    return inv.items.filter(item => {
      const cfg = getEquipmentConfig(item.configId);
      if (!cfg) return false;
      const matchSlot = this.slotFilter === 'all' || cfg.slot === this.slotFilter;
      const matchRarity = this.rarityFilter === 'all' || cfg.rarity === this.rarityFilter;
      return matchSlot && matchRarity;
    });
  }

  render(): void {
    this.layout();
    const c = this.ctx.canvas;
    const w = this.ctx.canvasWidth;
    const h = this.ctx.canvasHeight;
    // 清空点击区（每帧重建）
    this.slotAreas = [];
    this.invAreas = [];
    this.runeAreas = [];
    this.runeSlotAreas = [];
    this.filterSlotAreas = [];
    this.filterRarityAreas = [];

    c.fillStyle = verticalGradient(c, 0, 0, w, h, Theme.color.bgDeep, Theme.color.bgMid);
    c.fillRect(0, 0, w, h);

    drawTitle(c, `装备舱 · 战力 ${this.game.totalPower}`, undefined, { x: w / 2, y: 50, w });

    // 返回按钮
    drawButton(c, this.backBtn);

    // 通用资源条
    drawResourceHeader(c, w, 16, [
      { type: 'coin', amount: this.game.player.gold },
      { type: 'part', amount: this.game.player.parts },
      { type: 'stone', amount: this.game.player.materials?.enhanceStone ?? 0 }
    ]);

    // 装备槽位
    let y = 90;
    const slotH = 56;
    const rm = ResourceManager.getInstance();
    const equipImg = rm.getImage('equip_icon');

    for (const slot of SLOTS) {
      const area = { slot, x: 20, y, w: w - 40, h: slotH };
      this.slotAreas.push(area);
      const equipped = getEquippedInSlot(this.game.player, slot);
      const cfg = equipped ? getEquipmentConfig(equipped.configId) : null;
      const accent = cfg ? RARITY_COLOR[cfg.rarity] : Theme.color.grayDark;
      
      drawPanel(c, area.x, area.y, area.w, area.h, {
        border: accent,
        borderSize: 1.5
      });


      const slotImgKey = cfg ? resolveAssetKey('equip', cfg.id) : 'equip_icon';
      const slotImg = rm.getImage(slotImgKey);
      if (slotImg) {
        c.drawImage(slotImg, area.x + 12, area.y + (slotH - 32) / 2, 32, 32);
      } else {
        c.fillStyle = cfg ? RARITY_COLOR[cfg.rarity] : Theme.color.grayDark;
        c.fillRect(area.x + 12, area.y + (slotH - 32) / 2, 32, 32);
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1;
        c.strokeRect(area.x + 12, area.y + (slotH - 32) / 2, 32, 32);
      }

      // 如果有套装，绘制套装标识
      if (cfg && cfg.setId) {
        const setImg = rm.getImage('ui_set_icon');
        const setX = area.x + area.w - 42;
        const setY = area.y + (slotH - 16) / 2;
        if (setImg) {
          c.drawImage(setImg, setX, setY, 16, 16);
        } else {
          c.fillStyle = Theme.color.gold;
          c.beginPath();
          c.arc(setX + 8, setY + 8, 5, 0, Math.PI * 2);
          c.fill();
        }
      }

      if (cfg && equipped) {
        const lv = equipped.level ?? 0;
        const nameStr = cfg.name + (lv > 0 ? ` +${lv}` : '');
        const factor = 1 + lv * 0.08;
        const curStats: any = {};
        for (const [k, v] of Object.entries(cfg.baseStats)) {
          curStats[k] = (v as number) * factor;
        }
        text(c, nameStr, area.x + 60, area.y + 8, { color: RARITY_COLOR[cfg.rarity], font: Theme.font.bodyBold });
        text(c, this.fmtStats(curStats), area.x + 60, area.y + 30, { color: Theme.color.gray, font: Theme.font.small });
        text(c, '详情', area.x + area.w - 12, area.y + area.h / 2,
          { color: Theme.color.gold, align: 'right', baseline: 'middle', font: Theme.font.small });
      } else {
        text(c, '（空 · 从下方背包点击装备）', area.x + 60, area.y + 22, { color: Theme.color.gray, font: Theme.font.small });
      }
      y += slotH + 6;
    }

    // ---------- 槽位与品质筛选栏 ----------
    y += 4;
    text(c, '筛选部位:', 20, y + 14, { color: Theme.color.gray, font: Theme.font.small });
    const slotFilters = [
      { id: 'all', label: '全部' },
      { id: 'weapon', label: '武器' },
      { id: 'armor', label: '装甲' },
      { id: 'core', label: '核心' }
    ];
    let fx = 80;
    for (const f of slotFilters) {
      const active = this.slotFilter === f.id;
      const btnArea = { id: f.id, x: fx, y, w: 44, h: 44 };
      this.filterSlotAreas.push(btnArea);
      fillRoundRect(c, btnArea.x, btnArea.y, btnArea.w, btnArea.h, Theme.radius.sm,
        active ? Theme.color.cyan : Theme.color.bgPanel);
      strokeRoundRect(c, btnArea.x, btnArea.y, btnArea.w, btnArea.h, Theme.radius.sm,
        active ? Theme.color.white : Theme.color.grayDark, 1);
      text(c, f.label, btnArea.x + btnArea.w / 2, btnArea.y + btnArea.h / 2,
        { color: active ? Theme.color.bgDeep : Theme.color.white, align: 'center', baseline: 'middle', font: Theme.font.small });
      fx += 50;
    }

    y += 50;
    text(c, '筛选品质:', 20, y + 14, { color: Theme.color.gray, font: Theme.font.small });
    const rarityFilters = [
      { id: 'all', label: '全部' },
      { id: 'common', label: '普通' },
      { id: 'rare', label: '优秀' },
      { id: 'epic', label: '史诗' }
    ];
    fx = 80;
    for (const f of rarityFilters) {
      const active = this.rarityFilter === f.id;
      const btnArea = { id: f.id, x: fx, y, w: 44, h: 44 };
      this.filterRarityAreas.push(btnArea);
      fillRoundRect(c, btnArea.x, btnArea.y, btnArea.w, btnArea.h, Theme.radius.sm,
        active ? Theme.color.cyan : Theme.color.bgPanel);
      strokeRoundRect(c, btnArea.x, btnArea.y, btnArea.w, btnArea.h, Theme.radius.sm,
        active ? Theme.color.white : Theme.color.grayDark, 1);
      text(c, f.label, btnArea.x + btnArea.w / 2, btnArea.y + btnArea.h / 2,
        { color: active ? Theme.color.bgDeep : Theme.color.white, align: 'center', baseline: 'middle', font: Theme.font.small });
      fx += 50;
    }
    y += 52;

    // ---------- 背包标题 ----------
    const filtered = this.getFilteredItems();
    const sorted = sortEquipmentItems(filtered);
    const stoneCnt = this.game.player.materials?.enhanceStone ?? 0;
    const stoneImg = rm.getImage('stone');

    const bagCountText = `背包 (${this.game.player.equipmentInventory.items.length}/60)   筛选: ${filtered.length}件`;
    text(c, bagCountText, 20, y, { color: Theme.color.cyan, font: Theme.font.bodyBold });
    if (stoneImg) {
      c.drawImage(stoneImg, w - 100, y - 10, 14, 14);
      text(c, `${stoneCnt}`, w - 82, y - 12, { color: Theme.color.gold, font: Theme.font.bodyBold });
    } else {
      text(c, `强化石: ${stoneCnt}`, w - 20, y, { color: Theme.color.cyan, align: 'right', font: Theme.font.bodyBold });
    }
    y += 18;

    // ---------- 背包列表 ----------
    if (filtered.length === 0) {
      text(c, '暂无符合条件的装备', 20, y + 10, { color: Theme.color.gray, font: Theme.font.small });
      y += 30;
    } else {
      const inv = this.game.player.equipmentInventory;
      const startIdx = this.currentPage * this.pageSize;
      const pageItems = sorted.slice(startIdx, startIdx + this.pageSize);
      
      for (const item of pageItems) {
        const cfg = getEquipmentConfig(item.configId);
        if (!cfg) continue;
        const isEq = Object.values(inv.equipped).includes(item.uid);
        const area = { uid: item.uid, x: 20, y, w: w - 40, h: 44, isEquipped: isEq };
        this.invAreas.push(area);
        const accent = RARITY_COLOR[cfg.rarity];
        fillRoundRect(c, area.x, area.y, area.w, area.h, Theme.radius.sm,
          isEq ? Theme.color.bgPanelLight : Theme.color.bgPanel);
        strokeRoundRect(c, area.x, area.y, area.w, area.h, Theme.radius.sm, accent, 1);
        
        const lv = item.level ?? 0;
        const lockPrefix = item.locked ? '🔒' : '';
        const nameStr = lockPrefix + cfg.name + (lv > 0 ? ` +${lv}` : '');
        const factor = 1 + lv * 0.08;
        const curStats: any = {};
        for (const [k, v] of Object.entries(cfg.baseStats)) {
          curStats[k] = (v as number) * factor;
        }

        const textX = area.x + 40;
        const invImgKey = resolveAssetKey('equip', cfg.id);
        const invImg = rm.getImage(invImgKey);
        if (invImg) {
          c.drawImage(invImg, area.x + 10, area.y + 10, 24, 24);
        } else {
          c.fillStyle = accent;
          c.fillRect(area.x + 10, area.y + 10, 24, 24);
          c.strokeStyle = '#ffffff';
          c.lineWidth = 1;
          c.strokeRect(area.x + 10, area.y + 10, 24, 24);
        }

        // 如果是套装，在装备名字后面画套装标识
        if (cfg.setId) {
          const setImg = rm.getImage('ui_set_icon');
          const setX = textX + c.measureText(nameStr).width + 6;
          const setY = area.y + 8;
          if (setImg) {
            c.drawImage(setImg, setX, setY, 14, 14);
          } else {
            c.fillStyle = Theme.color.gold;
            c.beginPath();
            c.arc(setX + 7, setY + 7, 4, 0, Math.PI * 2);
            c.fill();
          }
        }

        text(c, nameStr, textX, area.y + 6, { color: accent, font: Theme.font.body });
        text(c, `[${RARITY_NAME[cfg.rarity]}] ${SLOT_NAME[cfg.slot]} · ${this.fmtStats(curStats)}`,
          textX, area.y + 26, { color: Theme.color.gray, font: Theme.font.small });
        if (isEq) {
          drawBadge(c, '已穿戴', area.x + area.w - 30, area.y + area.h / 2, Theme.color.green);
        } else {
          text(c, '详情', area.x + area.w - 10, area.y + area.h / 2,
            { color: Theme.color.gold, align: 'right', baseline: 'middle', font: Theme.font.small });
        }
        y += 48;
      }
    }

    // ---------- 分页控制栏 ----------
    const totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    if (this.currentPage >= totalPages) {
      this.currentPage = Math.max(0, totalPages - 1);
    }
    this.btnPrevPage = { x: 20, y, w: 60, h: 44 };
    this.btnNextPage = { x: w - 80, y, w: 60, h: 44 };
    
    const hasPrev = this.currentPage > 0;
    drawButton(c, {
      id: 'prev_page', label: '上一页',
      x: this.btnPrevPage.x, y: this.btnPrevPage.y, w: this.btnPrevPage.w, h: this.btnPrevPage.h,
      color: hasPrev ? Theme.color.cyan : Theme.color.grayDark,
      disabled: !hasPrev
    });

    text(c, `第 ${totalPages === 0 ? 0 : this.currentPage + 1} / ${totalPages} 页`, w / 2, y + 22,
      { color: Theme.color.white, align: 'center', baseline: 'middle', font: Theme.font.small });

    const hasNext = this.currentPage < totalPages - 1;
    drawButton(c, {
      id: 'next_page', label: '下一页',
      x: this.btnNextPage.x, y: this.btnNextPage.y, w: this.btnNextPage.w, h: this.btnNextPage.h,
      color: hasNext ? Theme.color.cyan : Theme.color.grayDark,
      disabled: !hasNext
    });

    y += 54;

    // 符文槽位
    y += 6;
    text(c, `符文槽 (${this.game.player.equippedRunes.length}/2)`, 20, y, { color: Theme.color.cyan, font: Theme.font.bodyBold });
    y += 20;
    const equippedRunes = getEquippedRunes(this.game.player);
    const runeImg = rm.getImage('rune_icon');

    for (let i = 0; i < 2; i++) {
      const area = { index: i, x: 20, y, w: w - 40, h: 44 };
      this.runeSlotAreas.push(area);
      const rune = equippedRunes[i];
      const cfg = rune ? getRuneConfig(rune.configId) : null;
      const accent = cfg ? RARITY_COLOR[cfg.rarity] : Theme.color.grayDark;
      
      drawPanel(c, area.x, area.y, area.w, area.h, {
        border: accent,
        borderSize: 1
      });

      const runeTextX = area.x + 40;
      const slotRuneImgKey = cfg ? resolveAssetKey('rune', cfg.id) : 'rune_icon';
      const slotRuneImg = rm.getImage(slotRuneImgKey);
      if (slotRuneImg) {
        c.drawImage(slotRuneImg, area.x + 10, area.y + 10, 24, 24);
      } else {
        c.fillStyle = cfg ? RARITY_COLOR[cfg.rarity] : Theme.color.grayDark;
        c.beginPath();
        c.arc(area.x + 22, area.y + 22, 12, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1;
        c.stroke();
      }

      if (cfg) {
        text(c, cfg.name, runeTextX, area.y + 6, { color: accent, font: Theme.font.body });
        text(c, cfg.description, runeTextX, area.y + 24, { color: Theme.color.gray, font: Theme.font.small });
        text(c, '点击卸下', area.x + area.w - 10, area.y + area.h / 2,
          { color: Theme.color.red, align: 'right', baseline: 'middle', font: Theme.font.small });
      } else {
        text(c, `符文槽 ${i + 1}（空）`, runeTextX, area.y + 14, { color: Theme.color.gray, font: Theme.font.small });
      }
      y += 48;
    }

    // 符文背包
    y += 4;
    text(c, `符文背包 (${this.game.player.runeInventory.length})`, 20, y, { color: Theme.color.cyan, font: Theme.font.bodyBold });
    y += 20;
    if (this.game.player.runeInventory.length === 0) {
      text(c, '暂无符文', 20, y, { color: Theme.color.gray, font: Theme.font.small });
    } else {
      for (const rune of this.game.player.runeInventory) {
        const cfg = getRuneConfig(rune.configId);
        if (!cfg) continue;
        const isEq = this.game.player.equippedRunes.includes(rune.uid);
        const area = { uid: rune.uid, x: 20, y, w: w - 40, h: 44, isEquipped: isEq };
        this.runeAreas.push(area);
        const accent = RARITY_COLOR[cfg.rarity];
        
        drawPanel(c, area.x, area.y, area.w, area.h, {
          border: accent,
          borderSize: 1
        });

        const runeTextX = area.x + 40;
        const bagRuneImgKey = resolveAssetKey('rune', cfg.id);
        const bagRuneImg = rm.getImage(bagRuneImgKey);
        if (bagRuneImg) {
          c.drawImage(bagRuneImg, area.x + 10, area.y + 10, 24, 24);
        } else {
          c.fillStyle = accent;
          c.beginPath();
          c.arc(area.x + 22, area.y + 22, 12, 0, Math.PI * 2);
          c.fill();
          c.strokeStyle = '#ffffff';
          c.lineWidth = 1;
          c.stroke();
        }

        text(c, cfg.name, runeTextX, area.y + 6, { color: accent, font: Theme.font.body });
        text(c, cfg.description, runeTextX, area.y + 24, { color: Theme.color.gray, font: Theme.font.small });
        if (isEq) {
          drawBadge(c, '已装备', area.x + area.w - 30, area.y + area.h / 2, Theme.color.green);
        } else {
          text(c, '装备', area.x + area.w - 10, area.y + area.h / 2,
            { color: Theme.color.gold, align: 'right', baseline: 'middle', font: Theme.font.small });
        }
        y += 48;
      }
    }


    // 渲染弹窗
    this.renderDialog(c, w, h);

    // 任务11：渲染主面板操作反馈 Toast
    if (this.toastTime > 0) {
      this.toastTime -= 1 / 60;
      const toastY = 70;
      const toastH = 28;
      const toastW = Math.min(260, w - 60);
      const toastX = (w - toastW) / 2;
      fillRoundRect(c, toastX, toastY, toastW, toastH, Theme.radius.sm, 'rgba(0,0,0,0.85)');
      strokeRoundRect(c, toastX, toastY, toastW, toastH, Theme.radius.sm, Theme.color.cyan, 1.2);
      text(c, this.toastMsg, w / 2, toastY + toastH / 2, {
        color: Theme.color.white, align: 'center', baseline: 'middle', font: Theme.font.small
      });
    }
  }

  private renderDialog(c: ICanvas2D, w: number, h: number): void {
    if (!this.selectedItem) return;
    const item = this.selectedItem;
    const cfg = getEquipmentConfig(item.configId);
    if (!cfg) return;
    const rm = ResourceManager.getInstance();

    // 绘制暗色背景遮罩
    c.fillStyle = 'rgba(0,0,0,0.6)';
    c.fillRect(0, 0, w, h);

    const dialogW = Math.min(320, w - 40);
    const dialogH = cfg.setId ? 430 : 350;
    const dialogX = (w - dialogW) / 2;
    const dialogY = (h - dialogH) / 2;

    // 弹窗框
    drawPanel(c, dialogX, dialogY, dialogW, dialogH, {
      border: RARITY_COLOR[cfg.rarity],
      borderSize: 2
    });


    // 装备基本信息
    const lv = item.level ?? 0;
    const nameText = cfg.name + (lv > 0 ? ` +${lv}` : '');
    text(c, nameText, dialogX + 20, dialogY + 30, { color: RARITY_COLOR[cfg.rarity], font: Theme.font.bodyBold });

    // 如果是套装，在详情面板名字右侧画套装标识
    if (cfg.setId) {
      const setImg = rm.getImage('ui_set_icon');
      const setX = dialogX + 20 + c.measureText(nameText).width + 10;
      const setY = dialogY + 14;
      if (setImg) {
        c.drawImage(setImg, setX, setY, 20, 20);
      } else {
        c.fillStyle = Theme.color.gold;
        c.beginPath();
        c.arc(setX + 10, setY + 10, 6, 0, Math.PI * 2);
        c.fill();
      }
    }
    const lockText = item.locked ? '🔒已锁定' : '未锁定';
    text(c, `[${RARITY_NAME[cfg.rarity]}] ${SLOT_NAME[cfg.slot]}   ${lockText}`, dialogX + 20, dialogY + 54, { color: item.locked ? Theme.color.orange : Theme.color.gray, font: Theme.font.small });

    // 当前战力
    const growth = { common: 5, rare: 8, epic: 12 }[cfg.rarity] ?? 0;
    const curPower = cfg.power + lv * growth;
    text(c, `装备战力: ${curPower} (基础 ${cfg.power})`, dialogX + 20, dialogY + 80, { color: Theme.color.gold, font: Theme.font.body });

    // 属性变化
    text(c, '属性成长:', dialogX + 20, dialogY + 110, { color: Theme.color.cyan, font: Theme.font.small });
    const statsStr = this.getLevelStatsStr(cfg, lv);
    text(c, statsStr, dialogX + 20, dialogY + 130, { color: Theme.color.white, font: Theme.font.small });

    let yCursor = dialogY + 155;
    // 描述
    text(c, cfg.description, dialogX + 20, yCursor, { color: Theme.color.gray, font: Theme.font.small });
    yCursor += 22;

    // 套装详情
    if (cfg.setId) {
      const setCfg = EQUIPMENT_SETS[cfg.setId];
      if (setCfg) {
        const equipped = getEquippedItems(this.game.player);
        const count = equipped.filter(i => {
          const itemCfg = getEquipmentConfig(i.configId);
          return itemCfg && itemCfg.setId === cfg.setId;
        }).length;
        
        text(c, `${setCfg.name} (已收集: ${count}/3)`, dialogX + 20, yCursor, { color: Theme.color.cyan, font: Theme.font.small });
        yCursor += 16;
        
        const text2 = `[2件套] ` + this.fmtStats(setCfg.stats2);
        text(c, text2, dialogX + 30, yCursor, { color: count >= 2 ? Theme.color.gold : Theme.color.gray, font: Theme.font.small });
        yCursor += 16;
        
        const text3 = `[3件套] ` + this.fmtStats(setCfg.stats3);
        text(c, text3, dialogX + 30, yCursor, { color: count >= 3 ? Theme.color.gold : Theme.color.gray, font: Theme.font.small });
        yCursor += 22;
      }
    }

    // 强化消耗 / 分解产出提示
    if (lv < 10) {
      const cost = getEnhanceCost(item);
      text(c, `升级消耗: 金币 ${cost.gold}  强化石 ${cost.enhanceStone}`, dialogX + 20, yCursor, { color: Theme.color.cyan, font: Theme.font.small });
    } else {
      text(c, '已强化至满级', dialogX + 20, yCursor, { color: Theme.color.green, font: Theme.font.small });
    }
    yCursor += 25;

    // 错误 / 成功提示
    if (this.errMsgTime > 0) {
      this.errMsgTime -= 1 / 60;
      text(c, this.errMsg, dialogX + 20, yCursor, { color: Theme.color.orange, font: Theme.font.small });
    } else {
      if (!this.selectedIsEquipped) {
        const reward = getDisassembleReward(item);
        text(c, `分解获得强化石: +${reward.enhanceStone}`, dialogX + 20, yCursor, { color: Theme.color.gray, font: Theme.font.small });
      }
    }

    // 按钮布局
    this.renderDialogButtons(c, dialogX, dialogY, dialogW, dialogH, lv);
  }

  private renderDialogButtons(c: ICanvas2D, dialogX: number, dialogY: number, dialogW: number, dialogH: number, lv: number): void {
    if (this.selectedIsEquipped) {
      // 已穿戴：卸下、强化、关闭 (一排三个)
      const btnY = dialogY + dialogH - 60;
      const btnH = 44;
      const gap = 10;
      const btnW = (dialogW - 40 - 2 * gap) / 3;
      let bx = dialogX + 20;

      this.btnEquip = { x: bx, y: btnY, w: btnW, h: btnH };
      this.drawDialogBtn(c, this.btnEquip, '卸下', Theme.color.red);

      bx += btnW + gap;
      this.btnEnhance = { x: bx, y: btnY, w: btnW, h: btnH };
      this.drawDialogBtn(c, this.btnEnhance, '强化', lv < 10 ? Theme.color.orange : Theme.color.grayDark);

      bx += btnW + gap;
      this.btnClose = { x: bx, y: btnY, w: btnW, h: btnH };
      this.drawDialogBtn(c, this.btnClose, '关闭', Theme.color.grayDark);
    } else {
      // 未穿戴：分两排排布
      const btnH = 44;
      const gap = 6;
      let bx = dialogX + 20;

      // 第一排：穿戴、强化、锁定 (y = dialogH - 112)
      const btnW1 = (dialogW - 40 - 2 * gap) / 3;
      const btnY1 = dialogY + dialogH - 112;

      this.btnEquip = { x: bx, y: btnY1, w: btnW1, h: btnH };
      this.drawDialogBtn(c, this.btnEquip, '穿戴', Theme.color.orange);

      bx += btnW1 + gap;
      this.btnEnhance = { x: bx, y: btnY1, w: btnW1, h: btnH };
      this.drawDialogBtn(c, this.btnEnhance, '强化', lv < 10 ? Theme.color.orange : Theme.color.grayDark);

      bx += btnW1 + gap;
      this.btnToggleLock = { x: bx, y: btnY1, w: btnW1, h: btnH };
      const isLocked = !!this.selectedItem!.locked;
      this.drawDialogBtn(c, this.btnToggleLock, isLocked ? '解锁' : '锁定',
        isLocked ? Theme.color.cyan : Theme.color.grayDark);

      // 第二排：分解、关闭 (y = dialogH - 58)
      const btnW2 = (dialogW - 40 - gap) / 2;
      const btnY2 = dialogY + dialogH - 58;
      bx = dialogX + 20;

      this.btnDisassemble = { x: bx, y: btnY2, w: btnW2, h: btnH };
      const itemLocked = !!this.selectedItem!.locked;
      this.drawDialogBtn(c, this.btnDisassemble, itemLocked ? '已锁定' : '分解',
        itemLocked ? Theme.color.grayDark : Theme.color.red);

      bx += btnW2 + gap;
      this.btnClose = { x: bx, y: btnY2, w: btnW2, h: btnH };
      this.drawDialogBtn(c, this.btnClose, '关闭', Theme.color.grayDark);
    }
  }

  private drawDialogBtn(c: ICanvas2D, area: any, label: string, color: string): void {
    drawButton(c, { id: 'dialog_btn', label, x: area.x, y: area.y, w: area.w, h: area.h, color });
  }


  private getLevelStatsStr(cfg: any, level: number): string {
    const parts: string[] = [];
    const factor = 1 + level * 0.08;
    if (cfg.baseStats.hp) parts.push(`生命+${Math.floor(cfg.baseStats.hp * factor)}`);
    if (cfg.baseStats.attack) parts.push(`攻击+${Math.floor(cfg.baseStats.attack * factor)}`);
    if (cfg.baseStats.skillDamageBonus) parts.push(`技能伤害+${Math.round(cfg.baseStats.skillDamageBonus * factor * 100)}%`);
    if (cfg.baseStats.damageReduction) parts.push(`减伤+${Math.round(cfg.baseStats.damageReduction * factor * 100)}%`);
    if (cfg.baseStats.poisonResist) parts.push(`毒抗+${Math.round(cfg.baseStats.poisonResist * factor * 100)}%`);
    if (cfg.baseStats.fireResist) parts.push(`火抗+${Math.round(cfg.baseStats.fireResist * factor * 100)}%`);
    if (cfg.baseStats.cooldownReduction) parts.push(`冷却-${Math.round(cfg.baseStats.cooldownReduction * factor * 100)}%`);
    return parts.join(', ');
  }

  private fmtStats(s: any): string {
    const parts: string[] = [];
    if (s.hp) parts.push(`生命+${Math.floor(s.hp)}`);
    if (s.attack) parts.push(`攻击+${Math.floor(s.attack)}`);
    if (s.skillDamageBonus) parts.push(`技能伤害+${(s.skillDamageBonus * 100).toFixed(1)}%`);
    if (s.damageReduction) parts.push(`减伤+${(s.damageReduction * 100).toFixed(1)}%`);
    if (s.poisonResist) parts.push(`毒抗+${(s.poisonResist * 100).toFixed(1)}%`);
    if (s.cooldownReduction) parts.push(`冷却-${(s.cooldownReduction * 100).toFixed(1)}%`);
    if (s.fireResist) parts.push(`火抗+${(s.fireResist * 100).toFixed(1)}%`);
    return parts.join(' ');
  }
}
