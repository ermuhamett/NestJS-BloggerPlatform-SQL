import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { TestingService } from '../application/testing.service';

@Module({
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
