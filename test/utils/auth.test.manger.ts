import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserCreateDto } from '../../src/features/users/api/models/input/create-user.input.model';
import request from 'supertest';
import {
  ConfirmationCodeDto,
  LoginInputDto,
  NewPasswordDto,
  PasswordRecoveryDto,
  RegistrationEmailResendingDto,
} from '../../src/features/auth/api/models/input/create-auth.input.model';

export class AuthTestManger {
  constructor(protected readonly app: INestApplication) {}
  // можно выносить некоторые проверки в отдельные методы для лучшей читаемости тестов

  async registerUser(inputModelDto: UserCreateDto, httpServer: any) {
    return request(httpServer)
      .post('/api/auth/registration')
      .send(inputModelDto)
      .expect(HttpStatus.NO_CONTENT);
  }

  async login(dto: LoginInputDto, httpServer: any) {
    const response = await request(httpServer)
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
  async passwordRecovery(dto: PasswordRecoveryDto, httpServer: any) {
    return request(httpServer)
      .post('/api/auth/password-recovery')
      .send(dto)
      .expect(HttpStatus.NO_CONTENT);
  }

  async newPassword(dto: NewPasswordDto, httpServer: any) {
    return request(httpServer)
      .post('/api/auth/password-recovery')
      .send(dto)
      .expect(HttpStatus.NO_CONTENT);
  }

  async registrationConfirmation(dto: ConfirmationCodeDto, httpServer: any) {
    return request(httpServer)
      .post('/api/auth/registration-confirmation')
      .send(dto)
      .expect(HttpStatus.NO_CONTENT);
  }

  async registrationEmailResending(
    dto: RegistrationEmailResendingDto,
    httpServer: any,
  ) {
    return request(httpServer)
      .post('/api/auth/registration-email-resending')
      .send(dto)
      .expect(HttpStatus.NO_CONTENT);
  }

  async refreshToken(refreshToken: string, httpServer: any) {
    const response = await request(httpServer)
      .post('/api/auth/refresh-token')
      .set('Cookie', [`refreshToken=${refreshToken}`])
      .expect(HttpStatus.OK);
    return {
      accessToken: response.body.accessToken,
      refreshToken: response.headers['set-cookie'][0]
        .split('=')[1]
        .split(';')[0],
    };
  }
  async logout(refreshToken: string, httpServer: any) {
    return request(httpServer)
      .post('/api/auth/logout')
      .set('Cookie', [`refreshToken=${refreshToken}`])
      .expect(HttpStatus.NO_CONTENT);
  }

  async getCurrentUser(accessToken: string, httpServer: any) {
    const response = await request(httpServer)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
    return response.body;
  }
}
