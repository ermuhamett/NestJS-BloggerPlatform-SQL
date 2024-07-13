import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from '../../../../base/adapters/email/email.service';
import { UserRepository } from '../../../users/infrastructure/user.repository';
import { HttpException, HttpStatus } from '@nestjs/common';

export class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: PasswordRecoveryCommand) {
    const { email } = command;
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
      throw new HttpException(
        'Error sending recovery code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
