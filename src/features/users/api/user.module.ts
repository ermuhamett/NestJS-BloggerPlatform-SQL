import { Module } from '@nestjs/common';
import { BcryptModule } from '../../../base/adapters/auth/bcrypt.module';
import { UsersService } from '../application/users.service';
import { UserRepositorySql } from '../infrastructure/user.repository';
import { UserQueryRepositorySql } from '../infrastructure/user.query.repository';
import { UserController } from './user.controller';
import { BasicStrategy } from '../../../common/strategies/basic.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../domain/user.orm.entity';
import { EmailConfirmation } from '../domain/email-confirmation.orm.entity';

@Module({
  imports: [BcryptModule, TypeOrmModule.forFeature([User, EmailConfirmation])],
  providers: [
    BasicStrategy,
    UsersService,
    UserRepositorySql,
    UserQueryRepositorySql,
  ],
  controllers: [UserController],
  exports: [UsersService, UserRepositorySql, UserQueryRepositorySql],
  //когда будем импортировать модули будут работать только те провайдеры которые мы экспортировали
})
export class UserModule {}
