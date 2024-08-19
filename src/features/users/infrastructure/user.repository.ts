import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.orm.entity';
import { EmailConfirmation } from '../domain/email-confirmation.orm.entity';

@Injectable()
export class UserRepositorySql {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(EmailConfirmation)
    private readonly emailConfirmationRepo: Repository<EmailConfirmation>,
  ) {}
  async insertUser(user: Partial<User>) {
    try {
      // Создаем EmailConfirmation и сохраняем его
      const emailConfirmation = this.emailConfirmationRepo.create(
        user.emailConfirmation,
      );
      const savedEmailConfirmation = await this.emailConfirmationRepo.save(
        emailConfirmation,
      );

      // Создаем User и связываем его с сохраненным EmailConfirmation
      user.emailConfirmation = savedEmailConfirmation;
      const newUser = this.userRepo.create(user);
      const savedUser = await this.userRepo.save(newUser);

      return savedUser.userId;
    } catch (error) {
      console.error(`Failed to create user with error: ${error}`);
      return false;
    }
  }
  async find(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { userId },
      relations: ['emailConfirmation'],
    });
    if (!user) {
      return null;
    }
    //console.log('Found user object inside user repo: ', user);
    return user;
  }
  async save(user: User): Promise<User> {
    return this.userRepo.save(user);
  }
  async findUserByConfirmationCode(
    confirmationCode: string,
  ): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: {
        emailConfirmation: {
          confirmationCode: confirmationCode,
        },
      },
      relations: ['emailConfirmation'],
    });

    if (!user) {
      return null;
    }
    return user;
  }
  async findUserByRecoveryCode(recoveryCode: string) {
    const user = await this.userRepo.findOne({
      where: {
        emailConfirmation: {
          passwordRecoveryCode: recoveryCode,
        },
      },
      relations: ['emailConfirmation'],
    });
    if (!user) {
      return null;
    }
    return user;
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: [{ email: loginOrEmail }, { login: loginOrEmail }],
      relations: ['emailConfirmation'],
    });
    if (!user) {
      return null;
    }
    return user;
  }
  async deleteUserById(userId: string): Promise<boolean> {
    try {
      const result = await this.userRepo.delete(userId);
      return result.affected > 0; // Возвращаем true, если удаление успешно
    } catch (error) {
      console.error(`Failed to delete user with error: ${error}`);
      return false;
    }
  }
}
