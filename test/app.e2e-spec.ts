import { UserCreateDto } from '../src/features/users/api/models/input/create-user.input.model';
import {
  ConfirmationCodeDto,
  LoginInputDto,
  NewPasswordDto,
  PasswordRecoveryDto,
  RegistrationEmailResendingDto,
} from '../src/features/auth/api/models/input/create-auth.input.model';
import { INestApplication } from '@nestjs/common';
import { AuthTestManger } from './utils/auth.test.manger';
import { AppModule } from '../src/app.module';
import { EmailService } from '../src/base/adapters/email/email.service';
import { useContainer } from 'class-validator';
import request from 'supertest';
import { initSettings } from './utils/init-testings';

describe('Auth e2e test', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManger;
  let httpServer: string;

  const mockEmailService = {
    sendRegistrationEmail: jest.fn().mockResolvedValue(null),
  };

  //Мокаем только то что затягивает или то что выполнится 100 процентно.
  // В нашем случае это EmailService так как отправка писем это долгая работа и ждать его ненадо
  beforeAll(async () => {
    const { app: initializedApp, httpServer: initializedHttpServer } =
      await initSettings({
        addSettingsToModuleBuilder: (moduleBuilder) => {
          moduleBuilder
            .overrideProvider(EmailService)
            .useValue(mockEmailService); // Применяем моки к тестовому модулю
        },
      });
    app = initializedApp;
    httpServer = initializedHttpServer;
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    // Инициализируем тестовый менеджер
    authTestManager = new AuthTestManger(app);
    const response = await request(httpServer).delete('/api/testing/all-data');
    console.log(response.status);
  });

  afterAll(async () => {
    await app.close(); //Закрываем приложение
  });

  describe('Register and login user', () => {
    it('should register new user', async () => {
      const user: UserCreateDto = {
        login: 'Ezekiel07',
        password: '123456',
        email: 'fixit_montrey@gmail.com',
      };
      await authTestManager.registerUser(user, httpServer);
    });
    it('should login register user', async () => {
      const loginUser: LoginInputDto = {
        loginOrEmail: 'Ezekiel07',
        password: '123456',
      };
      const responseLogin = await authTestManager.login(loginUser, httpServer);
      expect(responseLogin).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });
  });
  describe('Password recovery', () => {
    it('should initiate password recovery', async () => {
      const passwordRecoveryDto: PasswordRecoveryDto = {
        email: 'fixit_montrey@gmail.com',
      };
      await authTestManager.passwordRecovery(passwordRecoveryDto, httpServer);
    });
  });
  describe('New Password', () => {
    it('should set a new password', async () => {
      const newPasswordDto: NewPasswordDto = {
        newPassword: 'newpassword123',
        recoveryCode: 'validRecoveryCode',
      };
      await authTestManager.newPassword(newPasswordDto, httpServer);
    });

    it('should return 400 for an invalid recovery code', async () => {
      const newPasswordDto: NewPasswordDto = {
        newPassword: 'newpassword123',
        recoveryCode: 'invalidRecoveryCode',
      };
      await request(httpServer)
        .post('/api/auth/new-password')
        .send(newPasswordDto)
        .expect(400);
    });
  });
  describe('Registration Confirmation', () => {
    it('should confirm user registration', async () => {
      const confirmationDto: ConfirmationCodeDto = {
        code: 'validConfirmationCode',
      };
      await authTestManager.registrationConfirmation(
        confirmationDto,
        httpServer,
      );
    });
  });
  describe('Registration Email Resending', () => {
    it('should resend registration email', async () => {
      const resendingDto: RegistrationEmailResendingDto = {
        email: 'fixit_montrey@gmail.com',
      };
      await authTestManager.registrationEmailResending(
        resendingDto,
        httpServer,
      );
    });
  });
  describe('Token Management', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const loginUser: LoginInputDto = {
        loginOrEmail: 'Ezekiel07',
        password: '123456',
      };
      const responseLogin = await authTestManager.login(loginUser, httpServer);
      refreshToken = responseLogin.refreshToken;
    });

    it('should refresh tokens', async () => {
      const response = await authTestManager.refreshToken(
        refreshToken,
        httpServer,
      );
      expect(response).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it('should logout user', async () => {
      await authTestManager.logout(refreshToken, httpServer);
    });
  });

  describe('Get Current User', () => {
    it('should return current user data', async () => {
      const loginUser: LoginInputDto = {
        loginOrEmail: 'Ezekiel07',
        password: '123456',
      };
      const responseLogin = await authTestManager.login(loginUser, httpServer);
      const accessToken = responseLogin.accessToken;

      const response = await authTestManager.getCurrentUser(
        accessToken,
        httpServer,
      );
      expect(response).toMatchObject({
        email: 'fixit_montrey@gmail.com',
        login: 'Ezekiel07',
        userId: expect.any(String),
      });
    });
  });
});
