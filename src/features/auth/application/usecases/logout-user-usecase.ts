import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityService } from '../../../security/application/security.service';

export class LogoutCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
    public readonly createdAt: number,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(private readonly securityService: SecurityService) {}

  async execute(command: LogoutCommand) {
    const { userId, deviceId, createdAt } = command;
    await this.securityService.revokeAuthSession(userId, deviceId, createdAt);
  }
}
