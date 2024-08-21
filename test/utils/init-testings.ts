import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { applyAppSettings } from '../../src/settings/apply-app-setting';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

type SettingsOptions = {
  // Функция для добавления мока
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void;
};
export const initSettings = async (
  //передаем callback, который получает ModuleBuilder,
  // если хотим изменить настройку тестового модуля
  options: SettingsOptions = {},
) => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });
  //.overrideProvider(UsersService)
  //.useValue(UserServiceMockObject); Вот это используется только для мока сервиса

  // Применяем пользовательские настройки для мока
  if (options.addSettingsToModuleBuilder) {
    options.addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();
  const app = testingAppModule.createNestApplication();
  applyAppSettings(app);
  await app.init();

  //const databaseConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer();

  //чистим БД
  //await deleteAllData(databaseConnection);

  return {
    app,
    ///databaseConnection,
    httpServer,
  };
};
