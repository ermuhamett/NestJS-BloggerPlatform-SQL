import { UserCreateDto } from '../../../users/api/models/input/create-user.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../users/infrastructure/user.repository';
import { EmailService } from '../../../../base/adapters/email/email.service';
import { UsersService } from '../../../users/application/users.service';
import { InternalServerErrorException } from '@nestjs/common';

export class RegisterCommand {
  constructor(public readonly dto: UserCreateDto) {}
}

@CommandHandler(RegisterCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly userService: UsersService,
  ) {}
  async execute(command: RegisterCommand) {
    const { dto } = command;
    try {
      const userId = await this.userService.create(dto);
      const createdUser = await this.userRepository.find(userId);
      await this.emailService.sendRegistrationEmail(
        createdUser.email,
        createdUser.emailConfirmation.confirmationCode,
      );
      return userId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('User registration failed');
    }
  }
}
