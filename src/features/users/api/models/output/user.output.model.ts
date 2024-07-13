import { UserDocument } from '../../../domain/user.entity';

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
  public static toView(user: UserDocument): UserOutputDto {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
