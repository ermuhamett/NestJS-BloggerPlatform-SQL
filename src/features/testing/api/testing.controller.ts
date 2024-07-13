import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TestingService } from '../application/testing.service';

@ApiTags('Testing')
@Controller('testing')
export class TestingController {
  constructor(private testingService: TestingService) {}

  @Delete('/all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    return await this.testingService.deleteAllData();
  }
}
