import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentRepository } from '../../features/modules/comments/infrastructure/comment.repository';

//Guard для проверки существования комментарии
@Injectable()
export class CommentExistenceGuard implements CanActivate {
  constructor(private readonly commentRepository: CommentRepository) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest(); //Извлекаем request из пайплайна
    const commentId = request.params.commentId;
    const comment = await this.commentRepository.find(commentId);
    if (!comment) {
      throw new NotFoundException();
    }
    request.comment = comment;
    return true;
  }
}
