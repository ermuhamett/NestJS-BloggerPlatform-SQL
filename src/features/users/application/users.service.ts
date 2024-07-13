import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from '../infrastructure/user.repository';
import { UserCreateDto } from '../api/models/input/create-user.input.model';
import { BcryptService } from '../../../base/adapters/auth/bcrypt.service';
import { User } from '../domain/user.sql.entity';

// Для провайдера всегда необходимо применять декоратор @Injectable() и регистрировать в модуле
@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UserRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async create(userDto: UserCreateDto) {
    // email send message
    // this.emailAdapter.send(message);
    //const {login, email, password}=userDto
    const passwordHash = await this.bcryptService.generateHash(
      userDto.password,
    );
    const user = new User(userDto, passwordHash);
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
