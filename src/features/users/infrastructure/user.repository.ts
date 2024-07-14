import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmailConfirmation, User } from '../domain/user.sql.entity';
import { UserMapper } from '../api/models/output/user.output.model';

@Injectable()
export class UserRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  /*private mapToUser(userRow: any): User {
    const emailConfirmation = new EmailConfirmation();
    emailConfirmation.initEmailConfirmationData(userRow);
    const user = new User(
      {
        login: userRow.login,
        email: userRow.email,
      },
      userRow.password_hash,
    );
    user.createdAt = userRow.created_at;
    user.emailConfirmation = emailConfirmation;
    user.userId = userRow.id; // Сохранение идентификатора пользователя в объекте User

    return user;
  }*/
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
          RETURNING id
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
      const emailConfirmationId = emailConfirmationResult[0].id;
      const userResult = await queryRunner.query(
        `
          INSERT INTO "Users" 
          ("login", "email", "passwordHash", "createdAt", "emailConfirmationId")
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
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
      user.userId = userResult[0].id; // Сохранение идентификатора пользователя в объекте User
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
          LEFT JOIN "EmailConfirmations" e ON u."emailConfirmationId" = e.id
          WHERE u.id = $1
        `,
      [userId],
    );
    if (result.length === 0) {
      //Тут говорят лучше вернуть null а не ошибку, то есть ошибки должны быть в сервисе
      return null; // Возвращаем null, если пользователь не найден
    }
    return UserMapper.toDomain(result[0]);
    /*emailConfirmation.isConfirmed = userRow.is_confirmed;
    emailConfirmation.confirmationCode = userRow.confirmation_code;
    emailConfirmation.confirmationCodeExpirationDate =
      userRow.confirmation_code_expiration_date;
    emailConfirmation.passwordRecoveryCode = userRow.password_recovery_code;
    emailConfirmation.passwordRecoveryCodeExpirationDate =
      userRow.password_recovery_code_expiration_date;
    emailConfirmation.isPasswordRecoveryConfirmed =
      userRow.is_password_recovery_confirmed;*/
  }
  async save(user: User): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    //await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `
        UPDATE "EmailConfirmations"
        SET "isConfirmed" = $1,
            "confirmationCode" = $2,
            "confirmationCodeExpirationDate" = $3,
            "passwordRecoveryCode" = $4,
            "passwordRecoveryCodeExpirationDate" = $5,
            "isPasswordRecoveryConfirmed" = $6
        WHERE id = $7
      `,
        [
          user.emailConfirmation.isConfirmed,
          user.emailConfirmation.confirmationCode,
          user.emailConfirmation.confirmationCodeExpirationDate,
          user.emailConfirmation.passwordRecoveryCode,
          user.emailConfirmation.passwordRecoveryCodeExpirationDate,
          user.emailConfirmation.isPasswordRecoveryConfirmed,
          user.emailConfirmation.id,
        ],
      );

      await queryRunner.query(
        `
        UPDATE "Users"
        SET login = $1,
            email = $2,
            "passwordHash" = $3,
            "createdAt" = $4,
            "emailConfirmationId" = $5
        WHERE id = $6
      `,
        [
          user.login,
          user.email,
          user.passwordHash,
          user.createdAt,
          user.emailConfirmation.id,
          user.userId,
        ],
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new NotFoundException('User save failed');
    } finally {
      await queryRunner.release();
    }
  }

  async findUserByConfirmationCode(
    confirmationCode: string,
  ): Promise<User | null> {
    const result = await this.dataSource.query(
      `
      SELECT u.*, e.*
      FROM "Users" u
      LEFT JOIN "EmailConfirmations" e ON u."emailConfirmationId" = e.id
      WHERE e."confirmationCode" = $1
    `,
      [confirmationCode],
    );
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
      LEFT JOIN "EmailConfirmations" e ON u."emailConfirmationId" = e.id
      WHERE e.passwordRecoveryCode = $1
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
        LEFT JOIN "EmailConfirmations" e ON u."emailConfirmationId" = e.id
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
        WHERE id = $1
        RETURNING id
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
  }
  /*constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

    async insertUser(user: Partial<User>) {
      const result: UserDocument = await this.userModel.create(user);
      return result.id;
    }

    async find(userId: string): Promise<UserDocument> {
      return this.userModel.findById(userId).exec();
    }

    async findUserByConfirmationCode(
      confirmationCode: string,
    ): Promise<UserDocument> {
      return await this.userModel
        .findOne({ 'emailConfirmation.confirmationCode': confirmationCode })
        .exec();
    }
    async findUserByRecoveryCode(recoveryCode: string): Promise<UserDocument> {
      return await this.userModel
        .findOne({ 'emailConfirmation.passwordRecoveryCode': recoveryCode })
        .exec();
    }
    async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument> {
      try {
        return await this.userModel.findOne({
          $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
        });
      } catch (e) {
        console.error('Error finding user by login or email:', e);
        return null;
      }
    }

    async deleteUserById(userId: string) {
      try {
        const result = await this.userModel.findOneAndDelete({ _id: userId });
        return result.$isDeleted();
      } catch (error) {
        throw new Error(`Failed to delete blog with error ${error}`);
      }
    }*/
}
