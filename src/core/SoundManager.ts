export type SoundType = 'click' | 'attack' | 'alert' | 'victory' | 'defeat';

export class SoundManager {
  private static instance: SoundManager | null = null;
  private audios = new Map<SoundType, any>();
  private lastPlayTimes = new Map<SoundType, number>();
  private activeAudios = new Set<any>();

  private constructor() {
    const wx = (globalThis as any).wx;
    if (wx && wx.createInnerAudioContext) {
      const types: SoundType[] = ['click', 'attack', 'alert', 'victory', 'defeat'];
      for (const type of types) {
        try {
          const audio = wx.createInnerAudioContext();
          audio.src = `assets/audio/${type}.wav`;
          if (type === 'alert') {
            audio.loop = true;
          }
          this.audios.set(type, audio);
        } catch (e) {
          // 安全降级
        }
      }
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public play(type: SoundType): void {
    const now = Date.now();
    const lastTime = this.lastPlayTimes.get(type) || 0;
    if (now - lastTime < 50) {
      return;
    }
    this.lastPlayTimes.set(type, now);

    const audio = this.audios.get(type);
    if (audio) {
      try {
        audio.stop();
        audio.play();
        this.activeAudios.add(audio);
      } catch (e) {
        // 安全降级
      }
    }
  }

  public stop(type: SoundType): void {
    const audio = this.audios.get(type);
    if (audio) {
      try {
        audio.stop();
        this.activeAudios.delete(audio);
      } catch (e) {
        // 安全降级
      }
    }
  }

  public stopAll(): void {
    this.activeAudios.forEach((audio) => {
      try {
        audio.stop();
      } catch (e) {
        // ignore
      }
    });
    this.activeAudios.clear();
    this.audios.forEach((audio) => {
      try {
        audio.stop();
      } catch (e) {
        // ignore
      }
    });
  }

  public destroy(): void {
    this.stopAll();
    this.audios.forEach((audio) => {
      try {
        audio.destroy();
      } catch (e) {
        // ignore
      }
    });
    this.audios.clear();
    SoundManager.instance = null;
  }
}
