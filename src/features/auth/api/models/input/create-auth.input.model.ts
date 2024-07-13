import {
  IsOptionalEmail,
  IsOptionalString,
  IsStringLength,
} from '../../../../../common/decorators/validate/is-optional-email';
import { Matches } from 'class-validator';

export class LoginInputDto {
  @IsOptionalString() //custom декораторы
  loginOrEmail: string;

  @IsOptionalString()
  password: string;
}

export class PasswordRecoveryDto {
  @IsOptionalEmail()
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
}

export class RegistrationEmailResendingDto {
  @IsOptionalEmail()
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  //@IsUnique('email')
  email: string;
}

export class NewPasswordDto {
  @IsStringLength(6, 20)
  newPassword: string;

  @IsOptionalString()
  recoveryCode: string;
}

export class ConfirmationCodeDto {
  @IsOptionalString()
  code: string;
}
