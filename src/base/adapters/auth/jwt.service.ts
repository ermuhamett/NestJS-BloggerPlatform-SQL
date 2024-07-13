import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  private readonly secretKey: string;
  private readonly jwtExpiry: string;
  private readonly refreshTokenExpiry: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: NestJwtService,
  ) {
    this.secretKey = this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
    this.jwtExpiry = this.configService.get<string>('JWT_EXPIRY');
    this.refreshTokenExpiry = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRY',
    );
  }
  async createPairToken(userId: string, deviceId: string) {
    const payload = { sub: userId };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtExpiry, // Срок действия access token
    });
    const refreshToken = this.jwtService.sign(
      { payload, deviceId },
      {
        expiresIn: this.refreshTokenExpiry, // Срок действия refresh token
      },
    );
    return { accessToken, refreshToken };
  }

  async decodeToken(token: string) {
    try {
      return this.jwtService.decode(token);
    } catch (e) {
      console.error({ decodeToken: 'Cant decode token', e });
      return null;
    }
  }
  async verifyToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.secretKey,
      });
    } catch (e) {
      console.error('Token verify error:', e);
      return null;
    }
  }
}
