import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SecurityService } from '../application/security.service';
import { SecurityQueryRepository } from '../infrastructure/security.query.repository';
import { SecurityGuard } from '../../../common/guards/security.guard';
import { SecurityRepository } from '../infrastructure/security.repository';
@ApiTags('Security')
@Controller('security')
export class SecurityController {
  constructor(
    private readonly securityService: SecurityService,
    private readonly securityRepository: SecurityRepository,
    private readonly securityQueryRepository: SecurityQueryRepository,
  ) {}

  @UseGuards(SecurityGuard)
  @Get('devices')
  @HttpCode(HttpStatus.OK)
  async getDevices(@Req() req) {
    return await this.securityQueryRepository.getDevices(
      req.authSession.userId,
    );
  }

  @UseGuards(SecurityGuard)
  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateAllSessions(@Req() req) {
    //const refreshToken = req.cookies.refreshToken;
    const userId = req.authSession.userId;
    const currentDeviceId = req.authSession.deviceId;
    await this.securityService.terminateAllOtherSessions(
      currentDeviceId,
      userId,
    );
  }

  @UseGuards(SecurityGuard)
  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateSessionById(@Req() req, @Param('deviceId') deviceId: string) {
    const deletedAuthSession =
      await this.securityRepository.findSessionByDeviceId(deviceId);
    if (!deletedAuthSession) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    if (deletedAuthSession.userId !== req.authSession.userId) {
      throw new HttpException(
        'Try to delete other session',
        HttpStatus.FORBIDDEN,
      );
    }
    await deletedAuthSession.deleteOne();
  }
}
