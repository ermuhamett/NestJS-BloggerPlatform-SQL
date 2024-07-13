import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../users/infrastructure/user.repository';
import { EmailService } from '../../../../base/adapters/email/email.service';
import { BadRequestException } from '@nestjs/common';

export class ResendingEmailCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendingEmailCommand)
export class ResendingEmailUseCase
  implements ICommandHandler<ResendingEmailCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: ResendingEmailCommand) {
    const { email } = command;
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
}
