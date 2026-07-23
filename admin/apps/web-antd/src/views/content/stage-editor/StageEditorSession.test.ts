import { describe, expect, it } from 'vitest';
import { StageEditorSession, keyboardDelta, logicalPoint, logicalRectFromPoints, transformLogicalRect } from './StageEditorSession';

describe('StageEditorSession', () => {
  it('tracks dirty state and undo/redo without losing the saved baseline', () => {
    const session = new StageEditorSession({ rowVersion: 3, spawnPoints: [{ id: 'p', x: 10, y: 20 }] });
    session.commit({ rowVersion: 3, spawnPoints: [{ id: 'p', x: 30, y: 40 }] });
    expect(session.dirty).toBe(true);
    expect(session.undo().spawnPoints[0].x).toBe(10);
    expect(session.redo().spawnPoints[0].x).toBe(30);
    session.markSaved({ rowVersion: 4, spawnPoints: [{ id: 'p', x: 30, y: 40 }] });
    expect(session.dirty).toBe(false);
  });

  it('maps, snaps and clamps pointer coordinates to logical canvas bounds', () => {
    expect(logicalPoint({ x: 505, y: -20 }, { left: 5, top: 10, width: 500, height: 1000 }, 750, 1334, 10))
      .toEqual({ x: 750, y: 0 });
  });

  it('turns a reverse drag into a snapped collision rectangle inside the real map bounds', () => {
    expect(logicalRectFromPoints({ x: 1785, y: 2762 }, { x: 705, y: 533 }, 1800, 2800, 10))
      .toEqual({ x: 710, y: 530, width: 1080, height: 2230 });
  });

  it('moves a collision rectangle without changing its size or leaving the canvas', () => {
    expect(transformLogicalRect({ x: 500, y: 2200, width: 760, height: 250 }, { x: 600, y: 2300 }, { x: 1200, y: 2700 }, 1800, 2800, 'move'))
      .toEqual({ x: 1040, y: 2550, width: 760, height: 250 });
  });

  it('resizes from a corner while retaining the opposite corner as the anchor', () => {
    expect(transformLogicalRect({ x: 500, y: 2200, width: 760, height: 250 }, { x: 500, y: 2200 }, { x: 430, y: 2140 }, 1800, 2800, 'nw'))
      .toEqual({ x: 430, y: 2140, width: 830, height: 310 });
  });

  it('supports one-unit and shift keyboard nudges but ignores form inputs', () => {
    expect(keyboardDelta('ArrowLeft', false, 'DIV')).toEqual({ x: -1, y: 0 });
    expect(keyboardDelta('ArrowDown', true, 'DIV')).toEqual({ x: 0, y: 10 });
    expect(keyboardDelta('ArrowRight', false, 'INPUT')).toBeNull();
  });
});
