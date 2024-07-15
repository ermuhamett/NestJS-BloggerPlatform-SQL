import { Injectable, NotFoundException } from '@nestjs/common';
import { SecurityMapper } from '../api/models/output/security.output.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SecurityQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getDevices(userId: string) {
    const result = await this.dataSource.query(
      `SELECT * FROM "Sessions" WHERE "userId" = $1`,
      [userId],
    );
    console.log('Auth session in getDevices: ', result);
    if (result.length === 0) {
      throw new NotFoundException('Session not found');
    }
    return result.map(SecurityMapper.toView);
  }
  /*constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}

  async getDevices(userId: string) {
    const authSessions = await this.sessionModel.find({ userId });
    console.log('Auth session in getDevices: ', authSessions);
    if (!authSessions) {
      throw new NotFoundException('Session not found');
    }
    return authSessions.map(SecurityMapper.toView);
  }*/
}
