import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../users/infrastructure/user.repository';
import { BcryptService } from '../../../../base/adapters/auth/bcrypt.service';
import { BadRequestException } from '@nestjs/common';

export class NewPasswordCommand {
  constructor(
    public readonly newPassword: string,
    public readonly recoveryCode: string,
  ) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(command: NewPasswordCommand) {
    const { newPassword, recoveryCode } = command;
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
}
