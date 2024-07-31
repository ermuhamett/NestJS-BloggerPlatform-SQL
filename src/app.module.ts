import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { appSettings } from './settings/app-settings';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { BlogsModule } from './features/modules/blogs.module';
import { TestingModule } from './features/testing/api/testing.module';
import { UserModule } from './features/users/api/user.module';
import { AuthModule } from './features/auth/api/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IsUniqueConstraint } from './common/decorators/validate/uniqueInDatabase';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogExistConstraint } from './common/decorators/validate/blogIdValidate';
import { SecurityModule } from './features/security/api/security.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  // Регистрация модулей
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      // Импортируем ConfigModule для доступа к ConfigService
      imports: [ConfigModule],
      // Используем фабричную функцию для создания конфигурации TypeORM
      useFactory: (configService: ConfigService) => ({
        // Указываем тип базы данных
        type: 'postgres',
        // Получаем значения из переменных окружения с помощью ConfigService
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        // Не загружать автоматически сущности
        autoLoadEntities: true,
        // Не синхронизировать автоматически структуру базы данных
        synchronize: true,
      }),
      // Инжектируем сервис ConfigService, чтобы он был доступен в useFactory
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: seconds(10), // Время в миллисекундах, за которое считается количество запросов
        limit: 5, // Максимальное количество запросов за указанный период времени
      },
    ]),
    BlogsModule,
    TestingModule,
    UserModule,
    SecurityModule,
    AuthModule,
  ],
  // Регистрация провайдеров
  providers: [IsUniqueConstraint, BlogExistConstraint],
})
export class AppModule implements NestModule {
  // https://docs.nestjs.com/middleware#applying-middleware
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
