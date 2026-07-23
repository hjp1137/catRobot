import type { HeroVisualTemplate } from '../models/HeroVisualTemplate';

export const HERO_VISUAL_TEMPLATES = [
  {
    id: 'hero_mecha_cat_default',
    name: '机甲猫默认形态',
    visual: {
      iconArtKey: 'player.mechaCat.idle',
      idleArtKey: 'player.mechaCat.idle',
      moveArtKey: 'player.mechaCat.move',
      attackArtKey: 'player.mechaCat.attack',
      animationClipKeys: { move: 'hero.mechaCat.move.sequence01' },
      displayScale: 1,
      collisionRadius: 24,
      shadowScale: 1,
    },
    skills: {
      shieldIconArtKey: 'ui.skill.shield',
      cannonIconArtKey: 'ui.skill.cannon',
      shieldEffectArtKey: 'effect.shield.aura',
      cannonEffectArtKey: 'effect.cannon.burst',
    },
    enabled: true,
    version: 1,
  },
] as const satisfies HeroVisualTemplate[];
