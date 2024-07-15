import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../users/infrastructure/user.repository';
import { BadRequestException } from '@nestjs/common';

export class ConfirmUserCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmUserCommand)
export class ConfirmUserUseCase implements ICommandHandler<ConfirmUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: ConfirmUserCommand) {
    const { code } = command;
    console.log('Confirmation code:', code);
    const user = await this.userRepository.findUserByConfirmationCode(code);
    console.log('User in emailConfirmation usecase: ', user);
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
    console.log('User data after confirmation status: ', user);
    await this.userRepository.save(user);
  }
}
