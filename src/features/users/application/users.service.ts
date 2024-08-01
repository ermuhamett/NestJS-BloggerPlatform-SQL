import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserRepositorySql } from '../infrastructure/user.repository';
import { UserCreateDto } from '../api/models/input/create-user.input.model';
import { BcryptService } from '../../../base/adapters/auth/bcrypt.service';
import { User } from '../domain/user.orm.entity';
//import { User } from '../domain/user.sql.entity';

// Для провайдера всегда необходимо применять декоратор @Injectable() и регистрировать в модуле
@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UserRepositorySql,
    private readonly bcryptService: BcryptService,
  ) {}

  async create(userDto: UserCreateDto) {
    const passwordHash = await this.bcryptService.generateHash(
      userDto.password,
    );
    const user = User.create(userDto, passwordHash);
    const newUserId = await this.usersRepository.insertUser(user);
    if (!newUserId) {
      throw new InternalServerErrorException('User cant created');
    }
    return newUserId;
  }
  async deleteUserById(userId: string) {
    return await this.usersRepository.deleteUserById(userId);
  }
}
