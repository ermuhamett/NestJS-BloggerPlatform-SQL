import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SecurityRepository } from '../infrastructure/security.repository';
import { JwtService } from '@nestjs/jwt';
import { Session } from '../domain/security.entity';

@Injectable()
export class SecurityService {
  constructor(
    private readonly jwtService: JwtService,
    //private readonly configService:ConfigService,
    private readonly securityRepository: SecurityRepository,
  ) {}

  async createAuthSession(
    refreshToken: string,
    userId: string,
    deviceName: string,
    ip: string,
  ) {
    const tokenData = await this.jwtService.decode(refreshToken);
    const dto: Session = {
      userId,
      deviceId: tokenData.deviceId,
      deviceName,
      ip,
      createdAt: tokenData.iat,
      expirationDate: tokenData.exp,
    };
    console.log('DTO Session:', dto); // Добавьте логирование
    const newSession = new Session(dto);
    console.log('Session in db:', newSession);
    await this.securityRepository.createSession(newSession);
  }
  async checkAuthSessionByRefreshToken(refreshToken: string) {
    const tokenData = await this.jwtService.decode(refreshToken);
    /*if(!tokenData){
            throw new UnauthorizedException('Invalid refresh token')
        }*/
    console.log('TokenData in checkAuthSessionByRefresh: ', tokenData);
    const authSession = await this.securityRepository.findSession(
      tokenData.payload.sub,
      tokenData.deviceId,
      tokenData.iat,
    );
    /*if (!authSession) {
            throw new UnauthorizedException('Invalid session');
        }*/
    return authSession;
  }

  async updateAuthSession(
    userId: string,
    deviceId: string,
    lastActiveData: number,
    oldTokenIat: number, //Используем время создания старого токена чтобы найти точную сессию
  ) {
    const session = await this.securityRepository.findSession(
      userId,
      deviceId,
      oldTokenIat,
    );
    console.log('Session in updateAuthSession method: ', session);
    if (!session) {
      throw new UnauthorizedException('Session not found'); //Fixed
    }
    session.createdAt = lastActiveData;
    console.log('Updated session: ', session);
    await session.save();
  }

  async revokeAuthSession(userId: string, deviceId: string, createdAt: number) {
    const session = await this.securityRepository.findSession(
      userId,
      deviceId,
      createdAt,
    );
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }
    await session.deleteOne(); // Удаляем сессию
  }

  async terminateAllOtherSessions(currentDeviceId: string, userId: string) {
    //const tokenData = await this.jwtService.decode(refreshToken);
    try {
      await this.securityRepository.terminateAllOtherSessions(
        userId,
        currentDeviceId,
      );
    } catch (error) {
      console.error('Error deleting other sessions:', error);
      throw new InternalServerErrorException('Error deleting other sessions');
    }
  }

  async terminateSessionById(deviceId: string) {
    return this.securityRepository.terminateSessionById(deviceId);
  }
}
