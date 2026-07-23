import { describe, expect, it } from 'vitest';
import { menuItems } from './menu';

describe('content routes', () => {
  it('contains content menu entries through task26', () => {
    expect(menuItems.map(item => item.path)).toEqual([
      '/content/dashboard',
      '/content/enemies',
      '/content/backgrounds',
      '/content/heroes',
      '/content/stages',
      '/content/stages/stage_battle_1_1/editor',
      '/content/campaigns',
      '/content/tutorials',
      '/content/animations',
      '/content/image-library',
      '/content/resources',
      '/content/publish',
    ]);
  });
});
