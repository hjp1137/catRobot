import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.contentAdminUser.findUnique({ where: { username: dto.username } });
    if (!user || !user.enabled) throw new UnauthorizedException('用户名或密码错误');
    if (!(await compare(dto.password, user.password_hash))) throw new UnauthorizedException('用户名或密码错误');
    await this.prisma.contentAdminUser.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });
    const profile = { id: user.id, username: user.username, role: user.role };
    return {
      accessToken: await this.jwt.signAsync(profile, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '2h',
      }),
      profile,
    };
  }
}
