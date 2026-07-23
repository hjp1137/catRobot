import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { ReleasesController } from '../src/modules/releases/releases.controller';

describe('ReleasesController authorization', () => {
  it('requires JWT authentication for formal publish and records the caller id', async () => {
    const releases = { publish: jest.fn().mockResolvedValue({ releaseVersion: 'R000008' }) };
    const controller = new ReleasesController(releases as any);
    const guards = Reflect.getMetadata(GUARDS_METADATA, ReleasesController.prototype.publish) ?? [];

    expect(guards).toContain(JwtAuthGuard);
    await expect(controller.publish({ user: { id: 'admin-1' } })).resolves.toEqual({ releaseVersion: 'R000008' });
    expect(releases.publish).toHaveBeenCalledWith('admin-1');
  });
});
