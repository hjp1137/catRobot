/** 任务9：符文实例生成辅助 */
import { RuneInstance, generateRuneUid } from './RuneConfig';

export function generateRuneInstance(configId: string, obtainedAt: number): RuneInstance {
  return { uid: generateRuneUid(), configId, obtainedAt };
}

export { generateRuneUid };
