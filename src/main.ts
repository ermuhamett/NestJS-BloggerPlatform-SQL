import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './settings/app-settings';
import { applyAppSettings } from './settings/apply-app-setting';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  applyAppSettings(app);
  //Добавление useContainer(app.select(AppModule), { fallbackOnErrors: true })
  // связывает контейнер NestJS с class-validator, позволяя последнему использовать все преимущества инжекции зависимостей NestJS.
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(appSettings.api.APP_PORT, () => {
    console.log('App starting listen port: ', appSettings.api.APP_PORT);
    console.log('ENV: ', appSettings.env.getEnv());
  });
}

bootstrap();
