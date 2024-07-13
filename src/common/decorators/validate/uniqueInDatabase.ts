import { Inject, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserRepository } from '../../../features/users/infrastructure/user.repository';

// Обязательна регистрация в ioc
@ValidatorConstraint({ name: 'IsUnique', async: true })
//: Декоратор @ValidatorConstraint
// используется для определения кастомного валидатора. Он принимает объект с
// настройками, в данном случае, указывается имя валидатора (UniqIsExist)
// и устанавливается асинхронный режим валидации.
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly userRepository: UserRepository) {
    console.log('IsUniqueConstraint initialized');
    console.log('UserRepository:', this.userRepository);
  }
  async validate(value: any, args: ValidationArguments) {
    const [property] = args.constraints;
    const user = await this.userRepository.findByLoginOrEmail(value);
    return !user;
    /*const count = await this.userModel.countDocuments({ [property]: value });
        return count === 0;*/
  }

  defaultMessage(args: ValidationArguments) {
    return `${args?.property} ${args?.value} already exist`;
    //const [property] = args.constraints;
    //return `${property} already exists`;
  }
}
//Это фабричная функция, которая создает декоратор для использования кастомного
// валидатора. Она регистрирует кастомный валидатор с помощью registerDecorator
// из class-validator, указывая целевой объект, свойство, опции валидации и сам
// кастомный валидатор IsUniqueConstraint.
export function IsUnique(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsUniqueConstraint,
    });
  };
}
