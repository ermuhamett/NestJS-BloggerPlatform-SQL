export class Session {
  ip: string;
  deviceId: string;
  deviceName: string;
  userIdFk: string;
  createdAt: number;
  expirationDate: number;
  constructor(dto: Partial<Session>) {
    this.ip = dto.ip;
    this.deviceId = dto.deviceId;
    this.deviceName = dto.deviceName;
    this.userIdFk = dto.userIdFk; // Добавьте это
    this.createdAt = dto.createdAt;
    this.expirationDate = dto.expirationDate;
  }
}
