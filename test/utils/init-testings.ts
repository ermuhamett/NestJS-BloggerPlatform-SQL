import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { applyAppSettings } from '../../src/settings/apply-app-setting';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

export const initSettings = async (
  //передаем callback, который получает ModuleBuilder,
  // если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });
  //.overrideProvider(UsersService)
  //.useValue(UserServiceMockObject); Вот это используется только для мока сервиса

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();

  applyAppSettings(app);

  await app.init();

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer();
  //const userTestManger = new UsersTestManager(app);

  //чистим БД
  await deleteAllData(databaseConnection);

  return {
    app,
    databaseConnection,
    httpServer,
  };
};
