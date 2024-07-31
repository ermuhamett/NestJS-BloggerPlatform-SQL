import { Injectable, NotFoundException } from '@nestjs/common';
import { SecurityMapper } from '../api/models/output/security.output.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SecurityQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

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
  }
}
