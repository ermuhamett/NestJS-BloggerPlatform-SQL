import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMapper } from '../api/models/output/user.output.model';
import { User } from '../domain/user.entity';
import { EmailConfirmation } from '../domain/email-confirmation.entity';

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
  /*constructor(@InjectDataSource() private dataSource: DataSource) {}
  async insertUser(user: Partial<User>) {
    const queryRunner = this.dataSource.createQueryRunner(); //создаем экземпляр запроса
    //await queryRunner.connect();
    await queryRunner.startTransaction(); //начинаем транзакцию

    try {
      const emailConfirmationResult = await queryRunner.query(
        `
          INSERT INTO "EmailConfirmations" 
          ("isConfirmed", "confirmationCode", "confirmationCodeExpirationDate", "passwordRecoveryCode", "passwordRecoveryCodeExpirationDate", "isPasswordRecoveryConfirmed")
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING "emailId"
        `,
        [
          user.emailConfirmation.isConfirmed,
          user.emailConfirmation.confirmationCode,
          user.emailConfirmation.confirmationCodeExpirationDate,
          user.emailConfirmation.passwordRecoveryCode,
          user.emailConfirmation.passwordRecoveryCodeExpirationDate,
          user.emailConfirmation.isPasswordRecoveryConfirmed,
        ],
      );
      const emailConfirmationId = emailConfirmationResult[0].emailId;
      const userResult = await queryRunner.query(
        `
          INSERT INTO "Users" 
          ("login", "email", "passwordHash", "createdAt", "emailConfirmationId")
          VALUES ($1, $2, $3, $4, $5)
          RETURNING "userId"
        `,
        [
          user.login,
          user.email,
          user.passwordHash,
          user.createdAt,
          emailConfirmationId,
        ],
      );

      await queryRunner.commitTransaction();
      user.userId = userResult[0].userId; // Сохранение идентификатора пользователя в объекте User
      return user.userId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new NotFoundException();
    } finally {
      await queryRunner.release();
    }
  }

  async find(userId: string): Promise<User> {
    const result = await this.dataSource.query(
      `
          SELECT u.*, e.*
          FROM "Users" u
          LEFT JOIN "EmailConfirmations" e ON u."emailConfirmationId" = e."emailId"
          WHERE u."userId" = $1
        `,
      [userId],
    );
    if (result.length === 0) {
      //Тут говорят лучше вернуть null а не ошибку, то есть ошибки должны быть в сервисе
      return null; // Возвращаем null, если пользователь не найден
    }
    return UserMapper.toDomain(result[0]);
  }

  async findUserByConfirmationCode(
    confirmationCode: string,
  ): Promise<User | null> {
    const result = await this.dataSource.query(
      `
      SELECT u.*, e.*
      FROM "Users" u
      LEFT JOIN "EmailConfirmations" e ON u."emailConfirmationId" = e."emailId"
      WHERE e."confirmationCode" = $1
    `,
      [confirmationCode],
    );
    console.log('Result query in db: ', result[0]);
    if (result.length === 0) {
      return null; // Возвращаем null, если пользователь не найден
    }
    return UserMapper.toDomain(result[0]);
  }

  async findUserByRecoveryCode(recoveryCode: string): Promise<User | null> {
    const result = await this.dataSource.query(
      `
      SELECT u.*, e.*
      FROM "Users" u
      LEFT JOIN "EmailConfirmations" e ON u."emailConfirmationId" = e."emailId"
      WHERE e."passwordRecoveryCode" = $1
    `,
      [recoveryCode],
    );
    if (result.length === 0) {
      return null; // Возвращаем null, если пользователь не найден
    }
    return UserMapper.toDomain(result[0]);
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    try {
      const result = await this.dataSource.query(
        `
        SELECT u.*, e.*
        FROM "Users" u
        LEFT JOIN "EmailConfirmations" e ON u."emailConfirmationId" = e."emailId"
        WHERE u.email = $1 OR u.login = $1
      `,
        [loginOrEmail],
      );

      if (result.length === 0) {
        return null; // Возвращаем null, если пользователь не найден
      }

      return UserMapper.toDomain(result[0]);
    } catch (e) {
      console.error('Error finding user by login or email:', e);
      return null;
    }
  }
  async deleteUserById(userId: string): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.query(
        `
        DELETE FROM "Users"
        WHERE "userId" = $1
        RETURNING "userId"
      `,
        [userId],
      );

      await queryRunner.commitTransaction();
      return result.length > 0; // Возвращаем true, если удаление успешно
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(`Failed to delete user with error: ${error}`);
      return false;
    } finally {
      await queryRunner.release();
    }
  }*/
}
