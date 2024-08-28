import { Injectable, NotFoundException } from '@nestjs/common';
import { SecurityMapper } from '../api/models/output/security.output.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../domain/security.orm.entity';

@Injectable()
export class SecurityQueryRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async getDevices(userId: string) {
    // Получаем все сессии для указанного пользователя
    const sessions = await this.sessionRepo.find({
      where: { user: { userId } },
    });
    // Если сессии не найдены, выбрасываем исключение NotFoundException
    if (sessions.length === 0) {
      throw new NotFoundException('Session not found');
    }
    // Преобразуем найденные сессии в нужный формат с помощью SecurityMapper
    return sessions.map(SecurityMapper.toView);
  }
  /*constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getDevices(userId: string) {
    //console.log('UserId in getDevices: ', userId);
    const result = await this.dataSource.query(
      `SELECT * FROM "Sessions" WHERE "userIdFk" = $1`,
      [userId],
    );
    //console.log('Auth session in getDevices: ', result);
    if (result.length === 0) {
      throw new NotFoundException('Session not found');
    }
    return result.map(SecurityMapper.toView);
  }*/
}
