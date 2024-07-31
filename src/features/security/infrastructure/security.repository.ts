import { Injectable } from '@nestjs/common';
//import { Session, SessionDocument } from '../domain/security.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../domain/security.entity';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}
  async createSession(session: Session): Promise<string> {
    console.log('Session object in security repo:', session);
    // Сохраняем сессию и получаем сохраненный объект
    const savedSession = await this.sessionRepo.save(session);
    console.log('Session after insert to db: ', savedSession);
    // Возвращаем идентификатор устройства
    return savedSession.deviceId;
  }
  async findSession(
    userId: string,
    deviceId: string,
    createdAt: number,
  ): Promise<Session | null> {
    const session = await this.sessionRepo.findOne({
      where: {
        user: { userId },
        deviceId,
        createdAt,
      },
      relations: ['user'], // Убедитесь, что связь с пользователем загружена
    });

    return session || null;
  }
  async findSessionByDeviceId(deviceId: string): Promise<Session | null> {
    const session = await this.sessionRepo.findOne({
      where: { deviceId },
    });
    return session || null;
  }
  async terminateAllOtherSessions(
    userId: string,
    currentDeviceId: string,
  ): Promise<number> {
    try {
      const result = await this.sessionRepo
        .createQueryBuilder()
        .delete()
        .from(Session)
        .where('user.id = :userId', { userId })
        .andWhere('deviceId != :currentDeviceId', { currentDeviceId })
        .execute();

      return result.affected || 0;
    } catch (error) {
      console.error('Error deleting other sessions:', error);
      throw new Error('Error deleting other sessions');
    }
  }
  async terminateSessionById(deviceId: string): Promise<boolean> {
    try {
      // Удаляем сессию по идентификатору устройства
      const result = await this.sessionRepo.delete({ deviceId });
      // Проверяем, было ли удаление успешным
      return result.affected > 0;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Error deleting session');
    }
  }
  /*constructor(@InjectDataSource() private dataSource: DataSource) {}
  async createSession(session: Session): Promise<string> {
    console.log('Session object in security repo:', session);
    const result = await this.dataSource.query(
      `
      INSERT INTO "Sessions" (
        "ip", 
        "deviceId", 
        "deviceName", 
        "userIdFk", 
        "createdAt", 
        "expirationDate"
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING "deviceId"
      `,
      [
        session.ip,
        session.deviceId,
        session.deviceName,
        session.userIdFk,
        session.createdAt,
        session.expirationDate,
      ],
    );
    console.log('Session after insert to db: ', result[0]);
    return result[0].deviceId;
  }
  async findSession(
    userId: string,
    deviceId: string,
    createdAt: number,
  ): Promise<Session | null> {
    const params = [userId, deviceId, createdAt];
    const query = `
      SELECT *
      FROM "Sessions"
      WHERE "userIdFk" = $1 AND "deviceId" = $2 AND "createdAt" = $3
    `;

    const result = await this.dataSource.query(query, params);
    return result.length ? result[0] : null;
  }
  async findSessionByDeviceId(deviceId: string): Promise<Session | null> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Sessions" WHERE "deviceId" = $1`,
      [deviceId],
    );
    return result.length ? result[0] : null;
  }
  async terminateAllOtherSessions(userId: string, currentDeviceId: string) {
    try {
      const result = await this.dataSource.query(
        `DELETE FROM "Sessions" WHERE "userIdFk" = $1 AND "deviceId" != $2`,
        [userId, currentDeviceId],
      );
      return result.rowCount;
    } catch (error) {
      console.error('Error deleting other sessions:', error);
      throw new InternalServerErrorException('Error deleting other sessions');
    }
  }
  async terminateSessionById(deviceId: string) {
    try {
      const result = await this.dataSource.query(
        `DELETE FROM "Sessions" WHERE "deviceId" = $1`,
        [deviceId],
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new InternalServerErrorException('Error deleting session');
    }
  }
  async save(session: Partial<Session>) {
    const { deviceId, ip, deviceName, userIdFk, createdAt, expirationDate } =
      session;
    try {
      await this.dataSource.query(
        `
        UPDATE "Sessions"
        SET
          "ip" = COALESCE($1, "ip"),
          "deviceName" = COALESCE($2, "deviceName"),
          "userIdFk" = COALESCE($3, "userIdFk"),
          "createdAt" = COALESCE($4, "createdAt"),
          "expirationDate" = COALESCE($5, "expirationDate")
        WHERE "deviceId" = $6
        `,
        [ip, deviceName, userIdFk, createdAt, expirationDate, deviceId],
      );
    } catch (error) {
      console.error('Error saving session:', error);
      throw new InternalServerErrorException('Error saving session');
    }
  }*/
}
