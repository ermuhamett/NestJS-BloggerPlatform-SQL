import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserCreateDto } from '../../src/features/users/api/models/input/create-user.input.model';
import request from 'supertest';
import { LoginInputDto } from '../../src/features/auth/api/models/input/create-auth.input.model';

export class AuthTestManger {
  constructor(protected readonly app: INestApplication) {}
  // можно выносить некоторые проверки в отдельные методы для лучшей читаемости тестов

  async registerUser(inputModelDto: UserCreateDto) {
    return request(this.app.getHttpServer())
      .post('/api/auth/registration')
      .send(inputModelDto)
      .expect(HttpStatus.NO_CONTENT);
  }

  async login(dto: LoginInputDto) {
    const response = await request(this.app.getHttpServer())
      .post('/api/auth/login')
      .send(dto)
      .expect(HttpStatus.OK);
    return {
      accessToken: response.body.accessToken,
      refreshToken: response.headers['set-cookie'][0]
        .split('=')[1]
        .split(';')[0],
    };
  }
}
