import { IsStringLength } from '../../../../../../common/decorators/validate/is-optional-email';
import { Matches } from 'class-validator';

export class BlogCreateDto {
  @IsStringLength(1, 15)
  name: string;

  @IsStringLength(1, 500)
  description: string;

  @IsStringLength(1, 100)
  @Matches(
    '^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$',
  )
  websiteUrl: string;
}
