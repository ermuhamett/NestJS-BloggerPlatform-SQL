import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async deleteAllData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      // Получаем все таблицы в текущей базе данных
      const tableNames = await queryRunner.query(`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname='public'
      `);
      // Отключаем временно проверки внешних ключей
      await queryRunner.query('SET session_replication_role = replica');
      // Трогаем все таблицы
      for (const { tablename } of tableNames) {
        await queryRunner.query(`TRUNCATE TABLE "${tablename}" CASCADE`);
      }
      // Возвращаем проверки внешних ключей обратно
      await queryRunner.query('SET session_replication_role = DEFAULT');
      await queryRunner.commitTransaction();
      console.log('All tables truncated successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Failed to truncate tables', error.message);
      throw new Error('Failed to truncate tables');
    } finally {
      await queryRunner.release();
    }
  }
}
