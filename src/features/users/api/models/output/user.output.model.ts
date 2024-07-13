import { UserDocument } from '../../../domain/user.entity';
import { EmailConfirmation, User } from '../../../domain/user.sql.entity';

export class UserOutputDto {
  constructor(
    readonly id: string,
    readonly login: string,
    readonly email: string,
    readonly createdAt: string,
  ) {}

  /*id: string;
    name: string
    email: string*/
}

// MAPPERS

/*export const UserOutputModelMapper = (user: UserDocument): UserOutputDto => {
    const outputModel = new UserOutputDto();

    outputModel.id = user.id;
    outputModel.name = user.name;
    outputModel.email = user.email;

    return outputModel;
};*/

export class UserMapper {
  public static toView(user: User): UserOutputDto {
    return {
      id: user.userId,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
  public static toDomain(userRow: any): User {
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
  }
}
