import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FrameSequencePlayer } from '../dist/animation/FrameSequencePlayer.js';
import { getAnimationManifestSnapshot, listAnimationClips, resolvePublishedAnimationClips } from '../dist/animation/AnimationManifestRepository.js';
import { ResourceManager } from '../dist/core/ResourceManager.js';
import { MockContext } from '../dist/engine/MockContext.js';

test('任务25：FrameSequencePlayer 支持循环、暂停、切换与大时间步', () => {
  const player = new FrameSequencePlayer({ maxFrameAdvance: 8 });
  player.setClip({
    key: 'enemy.scrapMouse.idle.test',
    targetType: 'enemy',
    state: 'idle',
    defaultFrameDurationMs: 100,
    playMode: 'loop',
    loop: true,
    frames: [
      { order: 0, artKey: 'enemy.scrapMouse.normal' },
      { order: 1, artKey: 'enemy.scrapBug.normal' },
      { order: 2, artKey: 'enemy.droneEye.normal' },
    ],
  });
  assert.equal(player.currentFrame()?.artKey, 'enemy.scrapMouse.normal');
  player.update(0.11);
  assert.equal(player.currentFrame()?.artKey, 'enemy.scrapBug.normal');
  player.pause();
  player.update(0.5);
  assert.equal(player.currentFrame()?.artKey, 'enemy.scrapBug.normal');
  player.resume();
  player.update(5);
  assert.ok(player.advanceCount <= 8);
  player.setAction('attack', {
    key: 'enemy.scrapMouse.attack.test',
    targetType: 'enemy',
    state: 'attack',
    defaultFrameDurationMs: 80,
    playMode: 'hold-last-frame',
    loop: false,
    frames: [
      { order: 0, artKey: 'enemy.scrapMouse.normal' },
      { order: 1, artKey: 'enemy.scrapGuard.elite' },
    ],
  });
  assert.equal(player.currentFrame()?.artKey, 'enemy.scrapMouse.normal');
  player.update(1);
  assert.equal(player.currentFrame()?.artKey, 'enemy.scrapGuard.elite');
});

test('任务25.1：FrameSequencePlayer 区分 once、hold-last-frame 和单帧控制', () => {
  const once = new FrameSequencePlayer();
  once.setClip({
    key: 'once.test',
    targetType: 'enemy',
    state: 'hit',
    defaultFrameDurationMs: 100,
    playMode: 'once',
    loop: false,
    frames: [
      { order: 0, artKey: 'enemy.scrapMouse.normal' },
      { order: 1, artKey: 'enemy.scrapBug.normal' },
    ],
  });
  once.update(0.21);
  assert.equal(once.currentFrameIndex(), 0);
  assert.equal(once.isCompleted(), true);

  const hold = new FrameSequencePlayer();
  hold.setClip({
    key: 'hold.test',
    targetType: 'enemy',
    state: 'hit',
    defaultFrameDurationMs: 100,
    playMode: 'hold-last-frame',
    loop: false,
    frames: [
      { order: 0, artKey: 'enemy.scrapMouse.normal' },
      { order: 1, artKey: 'enemy.scrapBug.normal' },
    ],
  });
  hold.stepForward();
  hold.stepForward();
  assert.equal(hold.currentFrameIndex(), 1);
  assert.equal(hold.isCompleted(), true);
  hold.stepBackward();
  assert.equal(hold.currentFrameIndex(), 0);
  assert.equal(hold.isCompleted(), false);
});

test('任务25.1：FrameSequencePlayer 支持预览速度和时长信息', () => {
  const player = new FrameSequencePlayer();
  player.setClip({
    key: 'speed.test',
    targetType: 'hero',
    state: 'move',
    defaultFrameDurationMs: 100,
    playMode: 'loop',
    loop: true,
    frames: [
      { order: 0, artKey: 'player.mechaCat.idle' },
      { order: 1, artKey: 'player.mechaCat.move', durationMs: 200 },
    ],
  });
  player.setPlaybackSpeed(2);
  player.update(0.05);
  assert.equal(player.currentFrameIndex(), 1);
  assert.equal(player.totalDurationMs(), 300);
  assert.equal(player.currentTimeMs(), 100);
});

test('任务25.1：未声明 Animation Manifest 时不启用动画', () => {
  assert.deepEqual(resolvePublishedAnimationClips(getAnimationManifestSnapshot(), {}), []);
});

test('任务25.1：只有被内容快照声明的Animation Snapshot才启用', () => {
  const snapshot = getAnimationManifestSnapshot();
  const content = {
    animationManifestReleaseId: snapshot.releaseId,
    animationManifestChecksum: snapshot.checksum,
  };

  const clips = resolvePublishedAnimationClips(snapshot, content);

  assert.ok(clips.some(clip => clip.targetType === 'enemy' && clip.frames.length >= 2));
  assert.ok(clips.some(clip => clip.targetType === 'hero' && clip.frames.length >= 2));
  assert.deepEqual(resolvePublishedAnimationClips({ ...snapshot, checksum: 'bad' }, content), []);
});

test('任务25：Clip帧 Art Key 加载按资源键去重', async () => {
  class CountingContext extends MockContext {
    created = 0;
    createImage() {
      this.created++;
      return super.createImage();
    }
  }
  const ctx = new CountingContext();
  const rm = ResourceManager.getInstance();
  rm.resetForTest();
  await Promise.all([
    rm.loadArtKey('player.mechaCat.idle', ctx),
    rm.loadArtKey('player.mechaCat.idle', ctx),
  ]);
  assert.equal(ctx.created, 1);
  assert.ok(rm.getImageByArtKey('player.mechaCat.idle'));
});
