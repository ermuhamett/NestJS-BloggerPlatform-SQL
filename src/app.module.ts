import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { appSettings } from './settings/app-settings';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { BlogsModule } from './features/modules/blogs.module';
import { TestingModule } from './features/testing/api/testing.module';
import { UserModule } from './features/users/api/user.module';
import { AuthModule } from './features/auth/api/auth.module';
import { ConfigModule } from '@nestjs/config';
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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'alacrity02',
      database: 'BloggerPlatform',
      autoLoadEntities: false,
      synchronize: false,
    }),
    MongooseModule.forRoot(appSettings.api.MONGO_CONNECTION_URI),
    ConfigModule.forRoot({ isGlobal: true }),
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
  providers: [
    IsUniqueConstraint,
    BlogExistConstraint,
    // Регистрация с помощью useFactory (необходимы зависимости из ioc, подбор провайдера, ...)
    /* {
                provide: UsersService,
                useFactory: (repo: UserRepository) => {
                    return new UsersService(repo);
                },
                inject: [UserRepository]
            }*/
  ],
  // Регистрация контроллеров
  //controllers: [UserController],
  //exports:[IsUniqueConstraint]
})
export class AppModule implements NestModule {
  // https://docs.nestjs.com/middleware#applying-middleware
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
