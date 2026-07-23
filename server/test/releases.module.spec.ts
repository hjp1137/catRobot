import { MODULE_METADATA } from '@nestjs/common/constants';
import { AuthModule } from '../src/modules/auth/auth.module';
import { ReleasesModule } from '../src/modules/releases/releases.module';

describe('ReleasesModule dependencies', () => {
  it('imports AuthModule so the protected release endpoints can resolve JwtAuthGuard', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, ReleasesModule) ?? [];
    expect(imports).toContain(AuthModule);
  });
});
