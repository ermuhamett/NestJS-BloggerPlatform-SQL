import { IsStringLength } from '../../../../../../common/decorators/validate/is-optional-email';

export class CommentCreateDto {
  @IsStringLength(20, 300)
  content: string;
}
