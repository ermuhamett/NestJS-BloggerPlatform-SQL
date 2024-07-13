import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ConfirmationCodeDto,
  LoginInputDto,
  NewPasswordDto,
  PasswordRecoveryDto,
  RegistrationEmailResendingDto,
} from './models/input/create-auth.input.model';
import { Response } from 'express';
import { UserCreateDto } from '../../users/api/models/input/create-user.input.model';
import { AuthGuard } from '@nestjs/passport';
import { UserQueryRepository } from '../../users/infrastructure/user.query.repository';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand } from '../application/usecases/login-user-usecase';
import { PasswordRecoveryCommand } from '../application/usecases/password-recovery-usecase';
import { NewPasswordCommand } from '../application/usecases/new-password-usecase';
import { ConfirmUserCommand } from '../application/usecases/confirm-user-usecase';
import { RegisterCommand } from '../application/usecases/register-user-usecase';
import { ResendingEmailCommand } from '../application/usecases/resending-email-usecase';
import { RefreshTokenGuard } from '../../../common/guards/refresh.token.guard';
import { RefreshTokenCommand } from '../application/usecases/refresh-token-usecase';
import { LogoutCommand } from '../application/usecases/logout-user-usecase';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard) // Применение на уровне контроллера
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginUser(
    @Req() req,
    @Ip() reqIp,
    @Body() loginDto: LoginInputDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceName = req.headers['user-agent'] ?? 'Your device';
    const ip = reqIp ?? 'no_ip';
    const tokens = await this.commandBus.execute(
      new LoginCommand(loginDto, deviceName, ip),
    );
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokens.accessToken }; //done,tested
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() passwordRecoveryDto: PasswordRecoveryDto) {
    return await this.commandBus.execute(
      new PasswordRecoveryCommand(passwordRecoveryDto.email),
    );
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {
    return await this.commandBus.execute(
      new NewPasswordCommand(
        newPasswordDto.newPassword,
        newPasswordDto.recoveryCode,
      ),
    );
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() confirmationDto: ConfirmationCodeDto) {
    return await this.commandBus.execute(
      new ConfirmUserCommand(confirmationDto.code),
    );
    //return await this.authService.confirmUser(confirmationDto.code); //done, not tested
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() userCreateDto: UserCreateDto) {
    return await this.commandBus.execute(new RegisterCommand(userCreateDto));
    //return await this.authService.registerUser(userCreateDto); //done, worked
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body() resendingDto: RegistrationEmailResendingDto,
  ) {
    return await this.commandBus.execute(
      new ResendingEmailCommand(resendingDto.email),
    );
    //return await this.authService.resendingEmail(resendingDto.email);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req, @Res({ passthrough: true }) res: Response) {
    //const oldRefreshToken = req.cookies.refreshToken;
    /*const userId = req.user.id; // Здесь мы получаем userId, который добавил Guard
    const deviceId = req.deviceId;*/
    console.log('Token data in request: ', req.tokenData);
    const { userId, deviceId, createdAt } = req.tokenData;
    //console.log('UserId: ', userId);
    //console.log('DeviceId: ', deviceId);
    const tokens = await this.commandBus.execute(
      new RefreshTokenCommand(userId, deviceId, createdAt),
    );
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokens.accessToken }; //done,not tested
  }

  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    /*const userId = req.user.id;
    const deviceId = req.deviceId;*/
    const { userId, deviceId, createdAt } = req.tokenData;
    await this.commandBus.execute(
      new LogoutCommand(userId, deviceId, createdAt),
    );
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    });
  } // done not tested

  @SkipThrottle()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async currentUser(@Req() req) {
    const user = await this.userQueryRepository.getUserById(req.user.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      email: user.email,
      login: user.login,
      userId: user.id.toString(),
    }; //done worked
  }
}
