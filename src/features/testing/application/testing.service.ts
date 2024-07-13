import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class TestingService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async deleteAllData() {
    if (!this.connection.readyState) {
      throw new Error('Database connection is not established');
    }
    try {
      await this.connection.dropDatabase();
      console.log('Database dropped successfully');
    } catch (e) {
      console.log('DB dropping failed', e.message);
      throw new Error('DB dropping is failed');
    }
  }
}
