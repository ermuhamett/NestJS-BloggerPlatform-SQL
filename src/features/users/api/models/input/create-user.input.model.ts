import { Matches } from 'class-validator';
import {
  IsOptionalEmail,
  IsStringLength,
} from '../../../../../common/decorators/validate/is-optional-email';
import { IsUnique } from '../../../../../common/decorators/validate/uniqueInDatabase';

export class UserCreateDto {
  @IsStringLength(3, 10)
  @Matches('^[a-zA-Z0-9_-]*$')
  @IsUnique('login')
  login: string;

  @IsStringLength(6, 20)
  password: string;

  @IsOptionalEmail()
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @IsUnique('email')
  email: string;
}
