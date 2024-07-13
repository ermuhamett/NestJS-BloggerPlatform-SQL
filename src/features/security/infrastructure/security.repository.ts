import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from '../domain/security.entity';
import { Model } from 'mongoose';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}
  async createSession(session: Session) {
    const result: SessionDocument = await this.sessionModel.create(session);
    return result.id;
  }

  async findSession(
    userId: string,
    deviceId: string,
    createdAt?: number,
  ): Promise<SessionDocument> {
    //console.log({ userId, deviceId, createdAt });
    return this.sessionModel.findOne({ userId, deviceId, createdAt }); //All done work well
  }
  async findSessionByDeviceId(deviceId: string): Promise<SessionDocument> {
    return this.sessionModel.findOne({ deviceId });
  }
  async findDeviceIds(userId: string) {
    try {
      // Ищем все сессии пользователя по userId
      const userSessionsCursor = await this.sessionModel
        .find({ userId })
        .exec();
      const userDeviceIds = new Set<string>();
      // Проходим по всем найденным сессиям
      userSessionsCursor.forEach((session: Session) => {
        // Добавляем идентификатор устройства в набор
        userDeviceIds.add(session.deviceId);
      });
      return userDeviceIds;
    } catch (error) {
      console.error('Error getting device ids:', error);
      throw new InternalServerErrorException('Error getting device ids');
    }
  }
  async terminateAllOtherSessions(userId: string, currentDeviceId: string) {
    try {
      // Удаляем все сессии пользователя, кроме текущей
      const result = await this.sessionModel.deleteMany({
        userId,
        deviceId: { $ne: currentDeviceId },
      });
      return result.deletedCount;
    } catch (error) {
      console.error('Error deleting other sessions:', error);
      throw new InternalServerErrorException('Error deleting other sessions');
    }
  }

  async terminateSessionById(deviceId: string) {
    try {
      const result = await this.sessionModel.deleteOne({ deviceId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting other sessions:', error);
      throw new InternalServerErrorException('Error deleting other sessions');
    }
  }
  async deleteAuthSession(userId: string, deviceId: string, createdAt: number) {
    await this.sessionModel.findOneAndDelete({ userId, deviceId, createdAt });
  }
}
