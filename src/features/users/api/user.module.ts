import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../domain/user.entity';
import { BcryptModule } from '../../../base/adapters/auth/bcrypt.module';
import { UsersService } from '../application/users.service';
import { UserRepositorySql } from '../infrastructure/user.repository';
import { UserQueryRepositorySql } from '../infrastructure/user.query.repository';
import { UserController } from './user.controller';
import { BasicStrategy } from '../../../common/strategies/basic.strategy';

@Module({
  imports: [
    //MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    BcryptModule,
  ],
  providers: [BasicStrategy, UsersService, UserRepositorySql, UserQueryRepositorySql],
  controllers: [UserController],
  exports: [UsersService, UserRepositorySql, UserQueryRepositorySql],
  //когда будем импортировать модули будут работать только те провайдеры которые мы экспортировали
})
export class UserModule {}
