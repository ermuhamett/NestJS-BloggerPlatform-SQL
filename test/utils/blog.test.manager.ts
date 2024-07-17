import { HttpStatus, INestApplication } from '@nestjs/common';
import { BlogCreateDto } from '../../src/features/modules/blogs/api/models/input/blog.input.model';
import request from 'supertest';

export class BlogTestManager {
  constructor(protected readonly app: INestApplication) {}

  async createBlog(inputModelDto: BlogCreateDto) {
    return request(this.app.getHttpServer())
      .post('/api/auth/registration')
      .send(inputModelDto)
      .expect(HttpStatus.CREATED);
  }
}
