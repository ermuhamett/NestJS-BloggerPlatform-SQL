import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CommentRepository } from '../../features/modules/comments/infrastructure/comment.repository';

@Injectable()
export class CommentOwnershipGuard implements CanActivate {
  constructor(private readonly commentRepository: CommentRepository) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Изменено с request.userId на request.user
    const comment = request.comment;
    if (!user || !comment) {
      throw new ForbiddenException();
    }
    const userId = user.userId; // user.userId вместо userId
    if (comment.commentatorInfo.userId !== userId.toString()) {
      throw new ForbiddenException();
    }
    return true;
  }
}
