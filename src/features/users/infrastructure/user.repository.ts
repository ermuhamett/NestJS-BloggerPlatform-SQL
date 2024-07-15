import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
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

  async save(user: User): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    console.log('User data in save method: ', user);
    try {
      const existingUser = await this.find(user.userId);
      console.log('User object in save method: ', user);
      console.log('User object from database: ', existingUser);
      await this.updateEmailConfirmations(queryRunner, user, existingUser);
      await this.updateUsers(queryRunner, user, existingUser);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new NotFoundException('User save failed');
    } finally {
      await queryRunner.release();
    }
  }

  private async updateEmailConfirmations(
    queryRunner: QueryRunner,
    user: User,
    existingUser: User,
  ): Promise<void> {
    const emailConfirmationFields = [
      'isConfirmed',
      'confirmationCode',
      'confirmationCodeExpirationDate',
      'isPasswordRecoveryConfirmed',
      'passwordRecoveryCode',
      'passwordRecoveryCodeExpirationDate',
    ];
    const fieldsToUpdate = this.getFieldsToUpdateForTable(
      user.emailConfirmation,
      existingUser.emailConfirmation,
      emailConfirmationFields,
    );
    console.log('Fields to update for EmailConfirmations: ', fieldsToUpdate);
    if (fieldsToUpdate.length > 0) {
      const setClauses = fieldsToUpdate.map(
        (field, index) => `"${field}" = $${index + 1}`,
      );
      const values = fieldsToUpdate.map(
        (field) => user.emailConfirmation[field],
      );
      values.push(user.emailConfirmationId);

      await queryRunner.query(
        `UPDATE "EmailConfirmations"
                SET ${setClauses.join(', ')}
                WHERE "emailId" = $${fieldsToUpdate.length + 1}`,
        values,
      );
    }
  }

  private async updateUsers(
    queryRunner: QueryRunner,
    user: User,
    existingUser: User,
  ): Promise<void> {
    const userFields = ['login', 'email', 'passwordHash', 'createdAt'];
    const fieldsToUpdate = this.getFieldsToUpdateForTable(
      user,
      existingUser,
      userFields,
    );
    console.log('Fields to update for Users: ', fieldsToUpdate);
    if (fieldsToUpdate.length > 0) {
      const setClauses = fieldsToUpdate.map(
        (field, index) => `"${field}" = $${index + 1}`,
      );
      const values = fieldsToUpdate.map((field) => user[field]);
      values.push(user.userId);

      await queryRunner.query(
        `UPDATE "Users"
                SET ${setClauses.join(', ')}
                WHERE "userId" = $${fieldsToUpdate.length + 1}`,
        values,
      );
    }
  }

  private getFieldsToUpdateForTable(
    obj1: any,
    obj2: any,
    fields: string[],
  ): string[] {
    const fieldsToUpdate: string[] = [];
    for (const key of fields) {
      if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {
        if (obj1[key] instanceof Date && obj2[key] instanceof Date) {
          if (obj1[key].getTime() !== obj2[key].getTime()) {
            fieldsToUpdate.push(key);
          }
        } else if (obj1[key] !== obj2[key]) {
          fieldsToUpdate.push(key);
        }
      }
    }
    return fieldsToUpdate;
  }

  /*async save(user: User): Promise<void> {
    //console.log('User data in save method: ', user);
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
        WHERE "emailId" = $7
      `,
        [
          user.emailConfirmation.isConfirmed,
          user.emailConfirmation.confirmationCode,
          user.emailConfirmation.confirmationCodeExpirationDate,
          user.emailConfirmation.passwordRecoveryCode,
          user.emailConfirmation.passwordRecoveryCodeExpirationDate,
          user.emailConfirmation.isPasswordRecoveryConfirmed,
          user.emailConfirmationId,
        ],
      );

      await queryRunner.query(
        `
        UPDATE "Users"
        SET login = $1,
            email = $2,
            "passwordHash" = $3,
            "createdAt" = $4
        WHERE "userId" = $5
      `,
        [
          user.login,
          user.email,
          user.passwordHash,
          user.createdAt,
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
  }*/

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
