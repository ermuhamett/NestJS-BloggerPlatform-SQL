import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { BcryptService } from '../../../base/adapters/auth/bcrypt.service';
import { EmailModule } from '../../../base/adapters/email/mailer.module';
import { JwtService } from '../../../base/adapters/auth/jwt.service';
import { UserModule } from '../../users/api/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../../../common/strategies/jwt.strategy';
import { LoginUserUseCase } from '../application/usecases/login-user-usecase';
import { PasswordRecoveryUseCase } from '../application/usecases/password-recovery-usecase';
import { NewPasswordUseCase } from '../application/usecases/new-password-usecase';
import { ConfirmUserUseCase } from '../application/usecases/confirm-user-usecase';
import { RegisterUserUseCase } from '../application/usecases/register-user-usecase';
import { ResendingEmailUseCase } from '../application/usecases/resending-email-usecase';
import { OptionalAuthGuard } from '../../../common/guards/optional.auth.guard';
import { RefreshTokenUseCase } from '../application/usecases/refresh-token-usecase';
import { LogoutUseCase } from '../application/usecases/logout-user-usecase';
import { RefreshTokenGuard } from '../../../common/guards/refresh.token.guard';
import { SecurityModule } from '../../security/api/security.module';

const useCases = [
  LoginUserUseCase,
  PasswordRecoveryUseCase,
  NewPasswordUseCase,
  ConfirmUserUseCase,
  RegisterUserUseCase,
  ResendingEmailUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
];
@Module({
  imports: [
    //Сюда импортируются только модули
    EmailModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
        console.log('JWT_ACCESS_TOKEN_SECRET:', secret); // Временный вывод для проверки
        return {
          secret,
          signOptions: { expiresIn: '10m' },
        };
      },
      inject: [ConfigService],
    }),
    SecurityModule,
  ],
  providers: [
    JwtStrategy,
    BcryptService,
    JwtService,
    ...useCases,
    OptionalAuthGuard,
    RefreshTokenGuard,
  ], //А сюда все остальное что через Injectable.Если они внутри module то импортировать только Module
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
