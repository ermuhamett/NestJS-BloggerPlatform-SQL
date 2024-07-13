import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginInputDto } from '../../api/models/input/create-auth.input.model';
import { UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../../users/infrastructure/user.repository';
import { BcryptService } from '../../../../base/adapters/auth/bcrypt.service';
import { JwtService } from '../../../../base/adapters/auth/jwt.service';
import { v4 as uuidv4 } from 'uuid';
import { SecurityService } from '../../../security/application/security.service';
export class LoginCommand {
  constructor(
    public readonly dto: LoginInputDto,
    public readonly deviceName: string,
    public readonly ip: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUserUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly securityService: SecurityService,
  ) {}

  async execute(command: LoginCommand) {
    const { dto, deviceName, ip } = command;
    const user = await this.userRepository.findByLoginOrEmail(dto.loginOrEmail);
    if (!user) {
      throw new UnauthorizedException('Incorrect login or email');
    }
    const isCorrectPassword = await this.bcryptService.checkPassword(
      dto.password,
      user.passwordHash,
    );
    if (!isCorrectPassword) {
      throw new UnauthorizedException('Incorrect password');
    }
    const deviceId = uuidv4();
    //Создаем токены
    const { accessToken, refreshToken } = await this.jwtService.createPairToken(
      user._id.toString(),
      deviceId,
    );
    //TODO Надо создать таблицу сессии, думаю можно сделать через не создав отдельный репу, короче надо думать
    await this.securityService.createAuthSession(
      refreshToken,
      user._id.toString(),
      deviceName,
      ip,
    );
    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('Token not created');
    }
    return { accessToken, refreshToken };
  }
}
