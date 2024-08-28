import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { AppDataSource } from './typeorm.config';

@Module({
  // Регистрация модулей
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => AppDataSource.options,
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
