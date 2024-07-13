import { SessionDocument } from '../../../domain/security.entity';

export class SecurityOutputDto {
  constructor(
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public deviceId: string,
  ) {}
}

export class SecurityMapper {
  public static toView(session: SessionDocument): SecurityOutputDto {
    console.log('session.createdAt:', session.createdAt);
    return {
      ip: session.ip,
      title: session.deviceName,
      lastActiveDate: new Date(session.createdAt * 1000).toISOString(), // умножаем на 1000, чтобы получить миллисекунды
      deviceId: session.deviceId,
    };
  }
}
