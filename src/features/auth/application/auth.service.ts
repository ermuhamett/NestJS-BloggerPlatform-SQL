/*import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../../users/infrastructure/user.repository';
import { LoginInputDto } from '../api/models/input/create-auth.input.model';
import { BcryptService } from '../../../base/adapters/auth/bcrypt.service';
import { JwtService } from '../../../base/adapters/auth/jwt.service';
import { UserCreateDto } from '../../users/api/models/input/create-user.input.model';
import { UsersService } from '../../users/application/users.service';
import { EmailService } from '../../../base/adapters/email/email.service';*/

/*@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userService: UsersService,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  /*async loginUser(dto: LoginInputDto) {
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
    //Создаем токены
    const { accessToken, refreshToken } = await this.jwtService.createPairToken(
      user._id.toString(),
    );
    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('Token not created');
    }
    return { accessToken, refreshToken };
  }

  async registerUser(dto: UserCreateDto) {
    try {
      const userId = await this.userService.create(dto);
      const createdUser = await this.userRepository.find(userId);
      await this.emailService.sendRegistrationEmail(
        createdUser.email,
        createdUser.emailConfirmation.confirmationCode,
      );
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async confirmUser(code: string) {
    const user = await this.userRepository.findUserByConfirmationCode(code);
    if (!user) {
      throw new BadRequestException({
        message: 'Invalid Code',
        field: 'code',
      });
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException({
        message: 'Email is already confirmed',
        field: 'code',
      });
    }
    if (user.emailConfirmation.confirmationCode !== code) {
      throw new BadRequestException({
        message: 'Incorrect confirmation code',
        field: 'code',
      });
    }
    const now = new Date();
    if (user.emailConfirmation.confirmationCodeExpirationDate < now) {
      throw new BadRequestException({
        message: 'Confirmation code has expired',
        field: 'code',
      });
    }
    user.updateConfirmationStatus();
    await user.save();
  }
  async passwordRecovery(email: string) {
    const user = await this.userRepository.findByLoginOrEmail(email);
    if (!user) {
      throw new HttpException('Email accepted', HttpStatus.OK);
    }
    user.updateEmailRecoveryData();
    await user.save();
    try {
      await this.emailService.sendPasswordRecoveryEmail(
        email,
        user.emailConfirmation.passwordRecoveryCode,
      );
    } catch (error) {
      console.error('Error sending recovery code:', error);
    }
  }
  async newUserPassword(newPassword: string, recoveryCode: string) {
    const user = await this.userRepository.findUserByRecoveryCode(recoveryCode);
    if (!user || user.emailConfirmation.passwordRecoveryCode !== recoveryCode) {
      throw new BadRequestException({
        message: 'Incorrect verification code',
        field: 'code',
      });
    }
    if (user.emailConfirmation.isPasswordRecoveryConfirmed) {
      throw new BadRequestException({
        message: 'Recovery password is already confirmed',
        field: 'code',
      });
    }
    if (
      user.emailConfirmation.passwordRecoveryCodeExpirationDate &&
      user.emailConfirmation.passwordRecoveryCodeExpirationDate < new Date()
    ) {
      throw new BadRequestException({
        message: 'Confirmed code expired',
        field: 'code',
      });
    }
    const newPasswordHash = await this.bcryptService.generateHash(newPassword);
    user.updatePasswordRecoveryInfo(newPasswordHash);
    await user.save();
  }

  async resendingEmail(email: string) {
    const user = await this.userRepository.findByLoginOrEmail(email);
    if (!user) {
      throw new BadRequestException({
        message: 'User not found',
        field: 'email',
      });
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException({
        message: 'User already confirmed',
        field: 'email',
      });
    }
    user.updateEmailConfirmationInfo();
    await user.save();
    try {
      await this.emailService.sendRegistrationEmail(
        email,
        user.emailConfirmation.confirmationCode,
      );
    } catch (error) {
      console.error('Error sending recovery code:', error);
    }
  }
}*/
