import { LikesInfo } from '../../../../../likes/api/models/likes.info.model';
import { Comment } from '../../../domain/comment.orm.entity';

export interface ICommentatorInfo {
  userId: string;
  userLogin: string;
}
export class CommentOutputDto {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: ICommentatorInfo,
    public createdAt: string,
    public likesInfo: LikesInfo,
  ) {}
}

export class CommentMapper {
  public static toView(comment: Comment, likes: LikesInfo): CommentOutputDto {
    return {
      id: comment.commentId.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.user.login,
      },
      createdAt: comment.createdAt,
      likesInfo: likes,
    };
  }
}
