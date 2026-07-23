/**
 * 主题常量 —— 颜色/字体/尺寸集中定义
 * ------------------------------------------------------------------
 * 换皮只需改这里；所有 render 模块只通过 Theme 取色，不硬编码十六进制。
 * 风格：深蓝黑底 + 橙金主角 + 青蓝 HUD + 灰蓝机械鼠 + 红色警戒。
 */
export const Theme = {
  color: {
    bgDeep: '#0a0e1a',      // 战斗深底
    bgMid: '#10162a',       // 渐变中段
    bgPanel: '#161b2e',     // 面板
    bgPanelLight: '#1e2540',// 面板高光
    orange: '#ff8c1a',      // 主角橙
    orangeDark: '#d96a00',  // 主角阴影
    gold: '#ffd28a',        // 金色高光/奖励
    cyan: '#4fd1e0',        // 青蓝 HUD
    cyanDark: '#2a8a96',
    green: '#5fe068',       // 血条/安全
    red: '#e0565a',         // 危险/敌人血
    redBright: '#ff6b6b',   // 受击闪烁
    grayBlue: '#6b7a99',    // 机械鼠主体
    grayDark: '#3d4760',    // 机械鼠阴影
    white: '#f5f7fa',
    gray: '#8893a8',
    grid: 'rgba(79,209,224,0.06)', // 网格线
  },
  font: {
    title: 'bold 24px sans-serif',
    titleSmall: 'bold 18px sans-serif',
    subtitle: '12px sans-serif',
    body: '14px sans-serif',
    bodyBold: 'bold 14px sans-serif',
    small: '11px sans-serif',
    big: 'bold 30px sans-serif',
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
  },
} as const;
