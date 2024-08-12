import { UserCreateDto } from '../src/features/users/api/models/input/create-user.input.model';
import { LoginInputDto } from '../src/features/auth/api/models/input/create-auth.input.model';
import { INestApplication } from '@nestjs/common';
import { AuthTestManger } from './utils/auth.test.manger';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { EmailService } from '../src/base/adapters/email/email.service';
import { applyAppSettings } from '../src/settings/apply-app-setting';
import { useContainer } from 'class-validator';
import request from 'supertest';
import { initSettings } from './utils/init-testings';

describe('Auth Service test', () => {
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
    /*const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();*/
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
      await authTestManager.registerUser(user);
    });
    it('should login register user', async () => {
      const loginUser: LoginInputDto = {
        loginOrEmail: 'Ezekiel07',
        password: '123456',
      };
      const responseLogin = await authTestManager.login(loginUser);
      expect(responseLogin).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });
  });
});
