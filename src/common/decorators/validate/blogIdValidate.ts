import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogRepository } from '../../../features/modules/blogs/infrastructure/blog.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class BlogExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogRepository: BlogRepository) {
    console.log('BlogExistValidator initialized');
    console.log('BlogRepository:', this.blogRepository);
  }
  async validate(value: any, args: ValidationArguments) {
    const blog = await this.blogRepository.blogExist(value);
    return !!blog; // возвращаем true, если блог существует
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property} with value ${validationArguments?.value} does not exist`;
  }
}

export function IsBlogIdExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: BlogExistConstraint,
    });
  };
}
